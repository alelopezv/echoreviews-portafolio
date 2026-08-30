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

        # 🔥 Leer media_title y media_type desde request.data directamente
        # (no están en el serializer, así que validated_data no los tiene)
        media_obj = data.get("media")          # instancia de Media o None
        media_title = request.data.get("media_title", "").strip()
        media_type = request.data.get("media_type", "anime")

        media_suggestion = None

        if not media_obj:
            if media_title:
                # Buscar si ya existe una Media con ese título
                existing_media = Media.objects.filter(
                    title__iexact=media_title
                ).first()

                if existing_media:
                    # ✅ Asignar la instancia, no el ID
                    data["media"] = existing_media
                else:
                    # Crear sugerencia con imagen y crop si se adjuntaron
                    media_suggestion = MediaSuggestion.objects.create(
                        title=media_title,
                        type=media_type,
                        created_by=request.user,
                        image=request.FILES.get("image"),
                        crop_x=request.data.get("crop_x", 0),
                        crop_y=request.data.get("crop_y", 0),
                        crop_width=request.data.get("crop_width", 100),
                        crop_height=request.data.get("crop_height", 150),
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
        review.save()

        return Response({
            "message": "Review aprobada",
            "review": ReviewSerializer(review, context={"request": request}).data
        }, status=status.HTTP_200_OK)


class ReviewDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        try:
            return Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return None

    def get(self, request, pk):
        review = self.get_object(pk)
        if not review:
            return Response({"detail": "No encontrada"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReviewSerializer(review, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        review = self.get_object(pk)
        if not review:
            return Response({"detail": "No encontrada"}, status=status.HTTP_404_NOT_FOUND)

        if review.user != request.user and not request.user.is_staff:
            return Response({"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)

        serializer = ReviewCreateSerializer(review, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

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