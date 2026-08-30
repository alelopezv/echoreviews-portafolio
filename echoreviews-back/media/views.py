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
        serializer = MediaSerializer(media, many=True)

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

        serializer = MediaSerializer(media)
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

        serializer = MediaSerializer(media, data=request.data, partial=True)
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


# ✅ Aprobar sugerencia de media (admin)
class ApproveMediaSuggestionView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            suggestion = MediaSuggestion.objects.get(pk=pk)
        except MediaSuggestion.DoesNotExist:
            return Response({"detail": "No encontrada"}, status=status.HTTP_404_NOT_FOUND)
        
        # ❗ NUEVO (punto 3)
        if suggestion.approved_media:
            return Response(
                {"detail": "Ya vinculada a un media"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ❗ Evitar doble aprobación
        if suggestion.status == "approved":
            return Response(
                {"detail": "Ya aprobada"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ❗ NUEVO: evitar aprobar si ya fue rechazada
        if suggestion.status == "rejected":
            return Response(
                {"detail": "No se puede aprobar una sugerencia rechazada"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ NORMALIZAR TÍTULO (strip antes de todo)
        title = suggestion.title.strip()
        normalized_title = title.lower()

        existing_media = Media.objects.filter(title__iexact=normalized_title).first()

        if existing_media:
            media = existing_media
        else:
            media = Media.objects.create(
                title=title,
                type=suggestion.type,
                status="approved",
                image=suggestion.image,
                crop_x=suggestion.crop_x,
                crop_y=suggestion.crop_y,
                crop_width=suggestion.crop_width,
                crop_height=suggestion.crop_height,

            )

        suggestion.status = "approved"
        suggestion.approved_media = media
        suggestion.approved_at = timezone.now()
        suggestion.save()
        
        # 🔗 conectar SOLO las reviews de ESTA suggestion

        reviews = Review.objects.filter(
            media_suggestion=suggestion
        )

        for review in reviews:
            review.media = media
            review.media_suggestion = None  # 🔥 limpiar
            review.save()

        return Response({
            "message": "Sugerencia aprobada",
            "media_id": media.id
        }, status=status.HTTP_200_OK)
        
        
        
class CreateMediaSuggestionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        title = request.data.get("title")
        type_ = request.data.get("type")

        if not title or not type_:
            return Response(
                {"detail": "title y type son requeridos"},
                status=status.HTTP_400_BAD_REQUEST
            )

        suggestion = MediaSuggestion.objects.create(
            title=title.strip(),
            type=type_,
            created_by=request.user
        )

        return Response({
            "message": "Sugerencia enviada",
            "suggestion_id": suggestion.id
        }, status=status.HTTP_201_CREATED)