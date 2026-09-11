from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from django.db.models import Count, Q
from django.utils import timezone
from .models import Hashtag, HashtagSuggestion
from .serializers import HashtagSerializer


def aprobar_sugerencia_hashtag(suggestion):
    """Publica una sugerencia de hashtag y etiqueta las reseñas que la pidieron.

    Vive fuera de la vista a propósito, para que el admin de Django ejecute
    exactamente este código y no una versión a medias. Devuelve
    (hashtag, error): el error es un texto cuando no se pudo aprobar.

    Es idempotente: volver a aprobar una sugerencia ya aprobada no rompe nada
    y sirve para reparar las que quedaron marcadas sin que se hiciera el
    trabajo. Por eso no hay un "ya está aprobada, no hago nada": ese guardia
    es justamente lo que dejaba el destrozo sin arreglo posible.
    """
    if suggestion.status == "rejected":
        return None, "No se puede aprobar una sugerencia rechazada."

    nombre = suggestion.name.strip().lower()

    hashtag = Hashtag.objects.filter(name__iexact=nombre).first()
    if hashtag is None:
        hashtag = Hashtag.objects.create(name=nombre, status="approved")
    elif hashtag.status != "approved":
        # Existía pero no estaba publicado. Alguien lo está pidiendo para una
        # reseña real, así que ahora sale a la luz.
        hashtag.status = "approved"
        hashtag.save()

    # Las reseñas que propusieron este hashtag quedan etiquetadas con él.
    for review in suggestion.reviews.all():
        review.hashtags.add(hashtag)

    suggestion.status = "approved"
    suggestion.approved_hashtag = hashtag
    suggestion.approved_at = timezone.now()
    suggestion.save()

    return hashtag, None


# Crear hashtag (admin)
class CreateHashtagView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        name = request.data.get("name", "").strip().lower()

        if not name:
            return Response({"detail": "Nombre requerido"}, status=status.HTTP_400_BAD_REQUEST)

        # 🔥 Evitar duplicados
        existing = Hashtag.objects.filter(name__iexact=name).first()
        if existing:
            # Si estaba pendiente, que un admin lo cree de nuevo equivale a
            # aprobarlo: no tendría sentido pedirlo y que siguiera invisible.
            if existing.status != "approved":
                existing.status = "approved"
                existing.save()

            return Response({
                "detail": "Hashtag ya existe",
                "hashtag": HashtagSerializer(existing).data
            }, status=status.HTTP_200_OK)

        # status="approved" explícito: el modelo nace "pending" y la lista
        # pública solo muestra los aprobados, así que sin esta línea un
        # hashtag creado por un admin no aparecía en ninguna parte.
        serializer = HashtagSerializer(data={"name": name, "status": "approved"})
        serializer.is_valid(raise_exception=True)

        hashtag = serializer.save()

        return Response({
            "message": "Hashtag creado",
            "hashtag": HashtagSerializer(hashtag).data
        }, status=status.HTTP_201_CREATED)

# Editar hashtag (admin)
class UpdateHashtagView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def put(self, request, pk):
        try:
            hashtag = Hashtag.objects.get(pk=pk)
        except Hashtag.DoesNotExist:
            return Response({"detail": "Hashtag no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        name = request.data.get("name", "").strip().lower()

        if not name:
            return Response({"detail": "Nombre requerido"}, status=status.HTTP_400_BAD_REQUEST)

        # 🔥 Evitar duplicados en edición
        existing = Hashtag.objects.filter(name__iexact=name).exclude(pk=pk).first()
        if existing:
            return Response({
                "detail": "Ya existe otro hashtag con ese nombre"
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = HashtagSerializer(hashtag, data={"name": name})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "message": "Hashtag actualizado",
            "hashtag": serializer.data
        }, status=status.HTTP_200_OK)


class DeleteHashtagView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, pk):
        try:
            hashtag = Hashtag.objects.get(pk=pk)
        except Hashtag.DoesNotExist:
            return Response({"detail": "Hashtag no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        # 🔥 evitar borrar si está en uso
        if hashtag.review_set.exists():
            return Response(
                {"detail": "No se puede eliminar, está en uso en reviews"},
                status=status.HTTP_400_BAD_REQUEST
            )

        hashtag.delete()

        return Response({
            "message": "Hashtag eliminado"
        }, status=status.HTTP_204_NO_CONTENT)


class HashtagListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # El conteo lo hace la base con un solo SELECT, no el navegador
        # pidiendo todas las reseñas para recorrerlas.
        #
        # El `filter=` del Count es lo importante: sin él contaría también las
        # reseñas pendientes y rechazadas, y la página de etiquetas prometería
        # reseñas que nadie puede ver. Es el mismo criterio del listado
        # público, escrito una vez más donde toca.
        hashtags = (
            Hashtag.objects.filter(status="approved")  # 🔥 importante
            # "review" en singular: Review.hashtags no declara related_name, así
            # que Django nombra la relación inversa con el modelo en minúsculas.
            .annotate(
                reviews_count=Count("review", filter=Q(review__status="approved"))
            )
            .order_by("name")
        )
        serializer = HashtagSerializer(hashtags, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
    
# 📝 Crear sugerencia (usuario)
class CreateHashtagSuggestionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        name = request.data.get("name", "").strip()

        if not name:
            return Response({"detail": "Nombre requerido"}, status=status.HTTP_400_BAD_REQUEST)

        suggestion = HashtagSuggestion.objects.create(
            name=name,
            created_by=request.user
        )

        return Response({
            "message": "Sugerencia enviada",
            "id": suggestion.id
        }, status=status.HTTP_201_CREATED)


# ✅ Aprobar sugerencia (admin)
class ApproveHashtagSuggestionView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            suggestion = HashtagSuggestion.objects.get(pk=pk)
        except HashtagSuggestion.DoesNotExist:
            return Response({"detail": "No encontrada"}, status=status.HTTP_404_NOT_FOUND)

        hashtag, error = aprobar_sugerencia_hashtag(suggestion)

        if error:
            return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "message": "Sugerencia aprobada",
            "hashtag_id": hashtag.id
        }, status=status.HTTP_200_OK)