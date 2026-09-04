from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions  # ✅ quitado "request" que pisaba el parámetro
from django.utils import timezone
from .models import Review
from media.models import Media, MediaSuggestion
from hashtags.models import Hashtag, HashtagSuggestion
from .serializers import ReviewSerializer, ReviewCreateSerializer


# 🔍 Ver reviews aprobadas (público)
class ApprovedReviewsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        reviews = Review.objects.filter(status="approved")
        serializer = ReviewSerializer(reviews, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


# 📝 Crear review
class CreateReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        # Ahora sí vienen de validated_data: el serializer los declara como
        # write_only y ya validó que estén completos si no se eligió una obra.
        media_obj = data.get("media")
        media_title = (data.get("media_title") or "").strip()

        media_suggestion = None

        if not media_obj and media_title:
            # ¿La obra ya está en el catálogo aprobado? Entonces se usa esa y
            # no hace falta proponer nada.
            existing_media = Media.objects.filter(title__iexact=media_title).first()

            if existing_media:
                data["media"] = existing_media
            else:
                # Obra nueva: se crea una propuesta propia de este usuario.
                #
                # Ojo: NO se reutiliza la propuesta pendiente de otra persona.
                # Si Ana y Bruno proponen la misma obra, cada uno aporta su
                # portada y su descripción, y un admin decide cuál queda. Antes
                # esto era imposible porque MediaSuggestion.title era único y el
                # segundo en proponer recibía un IntegrityError.
                media_suggestion = MediaSuggestion.objects.create(
                    title=media_title,
                    type=data["media_type"],
                    description=data["media_description"],
                    created_by=request.user,
                    image=data["image"],
                    crop_x=data.get("crop_x", 0),
                    crop_y=data.get("crop_y", 0),
                    crop_width=data.get("crop_width", 100),
                    crop_height=data.get("crop_height", 150),
                )
                data["media"] = None

        # 🔥 Manejar hashtags
        hashtag_ids = data.get("hashtags", [])
        hashtag_names = data.get("hashtag_suggestions", [])

        final_hashtags = list(hashtag_ids)
        new_hashtag_suggestions = []

        for name in hashtag_names:
            clean_name = name.strip().lower()
            existing = Hashtag.objects.filter(name__iexact=clean_name).first()
            if existing:
                final_hashtags.append(existing)
            else:
                hs = HashtagSuggestion.objects.create(
                    name=clean_name,
                    created_by=request.user
                )
                new_hashtag_suggestions.append(hs)

        data["hashtags"] = final_hashtags

        # ✅ Guardar review una sola vez
        review = serializer.save(
            user=request.user,
            status="pending",
            approved_by=None,
        )

        # Vincular media_suggestion si se creó
        if media_suggestion:
            review.media_suggestion = media_suggestion
            review.save()

        # Vincular hashtag suggestions
        for hs in new_hashtag_suggestions:
            hs.reviews.add(review)

        return Response({
            "message": "Review creada correctamente",
            "review": ReviewSerializer(review, context={"request": request}).data
        }, status=status.HTTP_201_CREATED)


# 👤 Ver mis reviews
class MyReviewsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        reviews = Review.objects.filter(user=request.user)
        serializer = ReviewSerializer(reviews, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


# 🛠 Aprobar review (admin)
class ApproveReviewView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return Response({"detail": "Review no encontrada"}, status=status.HTTP_404_NOT_FOUND)

        review.status = "approved"
        review.approved_by = request.user
        review.approved_at = timezone.now()
        review.rejection_reason = ""   # si venía rechazada, el motivo ya no aplica
        review.save()

        return Response({
            "message": "Review aprobada",
            "review": ReviewSerializer(review, context={"request": request}).data
        }, status=status.HTTP_200_OK)


# 🛠 Rechazar review (admin)
class RejectReviewView(APIView):
    """Devuelve la reseña a su autor con un motivo, en vez de reescribirla.

    Antes un admin podía editar el contenido de cualquier reseña y publicarla
    sin dejar rastro, o sea, cambiar la opinión de otra persona y dejarla
    firmada con su nombre. Moderar es decidir si algo se publica; escribir la
    reseña le corresponde solo a su autor.
    """
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return Response({"detail": "Review no encontrada"}, status=status.HTTP_404_NOT_FOUND)

        reason = (request.data.get("reason") or "").strip()

        # Sin motivo el rechazo no sirve: el autor no sabría qué corregir.
        if not reason:
            return Response(
                {"reason": "Se requiere un motivo para rechazar la reseña."},
                status=status.HTTP_400_BAD_REQUEST
            )

        review.status = "rejected"
        review.rejection_reason = reason
        review.approved_by = None
        review.approved_at = None
        review.save()

        return Response({
            "message": "Review rechazada",
            "review": ReviewSerializer(review, context={"request": request}).data
        }, status=status.HTTP_200_OK)


class ReviewDetailView(APIView):
    # Leer es público, escribir no. Antes toda la vista exigía sesión, así que
    # el listado /api/reviews/ mostraba las reseñas a cualquiera pero al entrar
    # a una salía 401 y la página quedaba en "Cargando reseña…" para siempre.
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            return Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return None

    def get(self, request, pk):
        review = self.get_object(pk)
        if not review:
            return Response({"detail": "No encontrada"}, status=status.HTTP_404_NOT_FOUND)

        # Una reseña que todavía no se aprueba solo la ve su autor o un admin.
        # Sin esto, el detalle sería una puerta trasera para leer lo que el
        # listado público filtra.
        if review.status != "approved":
            usuario = request.user
            es_suya = usuario.is_authenticated and review.user_id == usuario.id
            if not es_suya and not usuario.is_staff:
                return Response({"detail": "No encontrada"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReviewSerializer(review, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        review = self.get_object(pk)
        if not review:
            return Response({"detail": "No encontrada"}, status=status.HTTP_404_NOT_FOUND)

        # Solo el autor edita su propia reseña. Un admin modera cambiando el
        # estado (aprobar / rechazar con motivo), no reescribiendo el texto:
        # la opinión es de quien la firma.
        if review.user != request.user:
            return Response({"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)

        serializer = ReviewCreateSerializer(review, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Corregir una reseña rechazada la devuelve a la cola de moderación.
        # Es un reenvío, no una publicación directa.
        if review.status == "rejected":
            review.status = "pending"
            review.rejection_reason = ""
            review.save()

        return Response({
            "message": "Review actualizada",
            "review": ReviewSerializer(review, context={"request": request}).data
        }, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        review = self.get_object(pk)
        if not review:
            return Response({"detail": "No encontrada"}, status=status.HTTP_404_NOT_FOUND)

        if review.user != request.user and not request.user.is_staff:
            return Response({"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)

        review.delete()
        return Response({"message": "Review eliminada"}, status=status.HTTP_204_NO_CONTENT)