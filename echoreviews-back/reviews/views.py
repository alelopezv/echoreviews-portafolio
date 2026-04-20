from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
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

        # 🔥 manejar media
        media_id = data.get("media")
        media_title = data.get("media_title")
        media_type = data.get("media_type")

        if not media_id and media_title:
            existing_media = Media.objects.filter(
                title__iexact=media_title.strip()
            ).first()

            if existing_media:
                # ✅ FIX IMPORTANTE: asegurar PK limpio
                data["media"] = existing_media.id
            else:
                suggestion = MediaSuggestion.objects.create(
                    title=media_title.strip(),
                    type=media_type,
                    created_by=request.user,
                    image=request.FILES.get("image")
                )

                data["media"] = None
                data["media_suggestion"] = suggestion

        # 🔥 manejar hashtags
        hashtag_ids = data.get("hashtags", [])
        hashtag_names = data.get("hashtag_suggestions", [])

        final_hashtags = list(hashtag_ids)
        new_suggestions = []

        for name in hashtag_names:
            clean_name = name.strip().lower()

            existing = Hashtag.objects.filter(name__iexact=clean_name).first()

            if existing:
                final_hashtags.append(existing)
            else:
                suggestion = HashtagSuggestion.objects.create(
                    name=clean_name,
                    created_by=request.user
                )
                new_suggestions.append(suggestion)

        data["hashtags"] = final_hashtags

        # ✅ SOLO UNA VEZ (IMPORTANTE FIX)
        review = serializer.save(
            user=request.user,
            status="pending",
            approved_by=None
        )

        # conectar media_suggestion si existe
        if "media_suggestion" in data:
            review.media_suggestion = data["media_suggestion"]
            review.save()

        # conectar hashtags sugeridos
        for suggestion in new_suggestions:
            suggestion.reviews.add(review)

        return Response({
            "message": "Review creada correctamente",
            "review": ReviewSerializer(
                review,
                context={"request": request}
            ).data
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

    # 🔍 Ver una review específica
    def get(self, request, pk):
        review = self.get_object(pk)
        if not review:
            return Response({"detail": "No encontrada"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReviewSerializer(review, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ✏️ Editar review
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

    # 🗑 Eliminar review
    def delete(self, request, pk):
        review = self.get_object(pk)
        if not review:
            return Response({"detail": "No encontrada"}, status=status.HTTP_404_NOT_FOUND)

        if review.user != request.user and not request.user.is_staff:
            return Response({"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)

        review.delete()
        return Response({"message": "Review eliminada"}, status=status.HTTP_204_NO_CONTENT)