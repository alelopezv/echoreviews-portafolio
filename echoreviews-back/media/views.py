from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone

from reviews.models import Review
from .models import Media, MediaSuggestion
from .serializers import MediaSerializer


# Ver todo el contenido (público)
class MediaListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        media = Media.objects.filter(status="approved")
        # context={'request': ...} es lo que hace que DRF devuelva la URL
        # ABSOLUTA de la imagen. Sin él manda solo la ruta relativa y el
        # frontend tiene que pegarle el host a mano, con una IP fija que
        # impide desplegar. Así queda igual que ReviewSerializer.
        serializer = MediaSerializer(media, many=True, context={'request': request})

        return Response(serializer.data, status=status.HTTP_200_OK)


# Ver, editar y eliminar un Media
class MediaDetailView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            return Media.objects.get(pk=pk)
        except Media.DoesNotExist:
            return None

    # 🔍 Ver uno
    def get(self, request, pk):
        media = self.get_object(pk)
        if not media:
            return Response({"detail": "No encontrado"}, status=status.HTTP_404_NOT_FOUND)

        serializer = MediaSerializer(media, context={'request': request})
        return Response(serializer.data)

    # ✏️ Editar (solo admin)
    def patch(self, request, pk):
        media = self.get_object(pk)
        if not media:
            return Response({"detail": "No encontrado"}, status=status.HTTP_404_NOT_FOUND)

        if not request.user.is_staff:
            return Response({"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)
        
        if media.status != "approved":
            return Response({"detail": "Media no aprobado"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = MediaSerializer(media, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "message": "Media actualizado",
            "media": serializer.data
        })

    # 🗑 Eliminar (solo admin)
    def delete(self, request, pk):
        media = self.get_object(pk)
        if not media:
            return Response({"detail": "No encontrado"}, status=status.HTTP_404_NOT_FOUND)

        if not request.user.is_staff:
            return Response({"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)
        
        if media.review_set.exists():
            return Response(
                {"detail": "No se puede eliminar, tiene reviews asociadas"},
                status=status.HTTP_400_BAD_REQUEST
            )

        media.delete()
        return Response({"message": "Media eliminado"}, status=status.HTTP_204_NO_CONTENT)


def aprobar_sugerencia(suggestion):
    """Convierte una propuesta en obra del catálogo y reengancha sus reseñas.

    Vive fuera de la vista a propósito: el admin de Django necesita ejecutar
    exactamente esta lógica. Cuando solo existía dentro de la vista, cambiar
    el estado a "approved" desde el admin escribía el campo y nada más — no
    se creaba la Media ni se reenganchaban las reseñas, así que la aprobación
    parecía funcionar y en realidad no hacía nada.

    Devuelve (media, error). Si error no es None, no se modificó nada.
    """
    # La señal real de "ya está aprobada" es tener una Media detrás, no el
    # campo status.
    #
    # No se comprueba status == "approved" a propósito: el desplegable que
    # antes tenía el admin dejaba propuestas marcadas como aprobadas SIN Media
    # creada. Bloquearlas por el status dejaba ese estado imposible de reparar
    # — la propuesta decía "aprobada", el catálogo seguía vacío, y volver a
    # aprobarla no hacía nada. Ahora esas se pueden completar.
    if suggestion.approved_media:
        return None, "Ya vinculada a un media"

    if suggestion.status == "rejected":
        return None, "No se puede aprobar una sugerencia rechazada"

    # ✅ NORMALIZAR TÍTULO (strip antes de todo)
    title = suggestion.title.strip()

    existing_media = Media.objects.filter(title__iexact=title).first()

    if existing_media:
        media = existing_media
    else:
        # La obra oficial se arma con ESTA propuesta: es la que el admin
        # eligió, con su portada y su descripción.
        media = Media.objects.create(
            title=title,
            type=suggestion.type,
            description=suggestion.description,
            status="approved",
            image=suggestion.image,
            crop_x=suggestion.crop_x,
            crop_y=suggestion.crop_y,
            crop_width=suggestion.crop_width,
            crop_height=suggestion.crop_height,
        )

    # Propuestas que competían por la misma obra: la elegida y las demás.
    # Todas se resuelven de una vez, porque después de crear la Media ya
    # no tiene sentido dejarlas esperando: la obra existe.
    #
    # Los IDs se materializan en una lista AHORA, antes de cambiarles el
    # estado. Un queryset de Django es perezoso: si más abajo filtráramos
    # por él después de marcarlas como aprobadas, la consulta se volvería a
    # ejecutar con `status="pending"` y no devolvería ninguna.
    # Se filtra por approved_media__isnull, no por status="pending": la propuesta
    # que estamos aprobando puede venir marcada como "approved" sin Media detrás
    # (herencia del desplegable viejo). Si filtráramos por status, quedaría fuera
    # de su propio reenganche y su reseña seguiría huérfana.
    hermanas_ids = list(
        MediaSuggestion.objects
        .filter(title__iexact=title, approved_media__isnull=True)
        .exclude(status="rejected")
        .values_list("id", flat=True)
    )

    for hermana in MediaSuggestion.objects.filter(id__in=hermanas_ids):
        # Se marcan como aprobadas, no rechazadas: sus autores no hicieron
        # nada mal. Simplemente no se eligió su portada, y su reseña se
        # publica igual.
        hermana.status = "approved"
        hermana.approved_media = media
        hermana.approved_at = timezone.now()
        hermana.save()

    # 🔗 Reenganchar las reseñas de TODAS las propuestas, no solo de la
    # elegida. Si no, las de Bruno quedarían huérfanas para siempre.
    reviews = Review.objects.filter(media_suggestion_id__in=hermanas_ids)

    for review in reviews:
        review.media = media
        review.media_suggestion = None  # 🔥 limpiar el andamio
        review.save()

    return media, None


# ✅ Aprobar sugerencia de media (admin)
class ApproveMediaSuggestionView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            suggestion = MediaSuggestion.objects.get(pk=pk)
        except MediaSuggestion.DoesNotExist:
            return Response({"detail": "No encontrada"}, status=status.HTTP_404_NOT_FOUND)

        media, error = aprobar_sugerencia(suggestion)

        if error:
            return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "message": "Sugerencia aprobada",
            "media_id": media.id
        }, status=status.HTTP_200_OK)


class CreateMediaSuggestionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        title = (request.data.get("title") or "").strip()
        type_ = request.data.get("type")
        description = (request.data.get("description") or "").strip()
        image = request.FILES.get("image")

        # Mismas exigencias que al crear una reseña con obra nueva: una obra
        # sin portada o sin descripción llega incompleta al catálogo y ya no
        # hay forma de completarla desde este flujo.
        faltantes = [
            nombre
            for nombre, valor in (
                ("title", title),
                ("type", type_),
                ("description", description),
                ("image", image),
            )
            if not valor
        ]

        if faltantes:
            return Response(
                {campo: "Este campo es requerido." for campo in faltantes},
                status=status.HTTP_400_BAD_REQUEST
            )

        suggestion = MediaSuggestion.objects.create(
            title=title,
            type=type_,
            description=description,
            image=image,
            created_by=request.user,
            crop_x=request.data.get("crop_x", 0),
            crop_y=request.data.get("crop_y", 0),
            crop_width=request.data.get("crop_width", 100),
            crop_height=request.data.get("crop_height", 150),
        )

        return Response({
            "message": "Sugerencia enviada",
            "suggestion_id": suggestion.id
        }, status=status.HTTP_201_CREATED)