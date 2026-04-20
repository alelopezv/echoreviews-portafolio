from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from django.utils import timezone
from .models import Hashtag, HashtagSuggestion
from .serializers import HashtagSerializer


# Ver todos los hashtags (público)
class HashtagListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        hashtags = Hashtag.objects.all()
        serializer = HashtagSerializer(hashtags, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


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
            return Response({
                "detail": "Hashtag ya existe",
                "hashtag": HashtagSerializer(existing).data
            }, status=status.HTTP_200_OK)

        serializer = HashtagSerializer(data={"name": name})
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
        hashtags = Hashtag.objects.filter(status="approved")  # 🔥 importante
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

        if suggestion.status == "approved":
            return Response({"detail": "Ya aprobada"}, status=status.HTTP_400_BAD_REQUEST)

        if suggestion.status == "rejected":
            return Response({"detail": "No se puede aprobar una sugerencia rechazada"}, status=status.HTTP_400_BAD_REQUEST)

        name = suggestion.name.strip().lower()

        # 🔥 evitar duplicados
        existing = Hashtag.objects.filter(name__iexact=name).first()

        if existing:
            hashtag = existing
        else:
            hashtag = Hashtag.objects.create(
                name=name,
                status="approved"
            )
            
        # conectar hashtag aprobado a las reviews relacionadas
        for review in suggestion.reviews.all():
            review.hashtags.add(hashtag)

        suggestion.status = "approved"
        suggestion.approved_hashtag = hashtag
        suggestion.approved_at = timezone.now()
        suggestion.save()
        
        
        return Response({
            "message": "Sugerencia aprobada",
            "hashtag_id": hashtag.id
        }, status=status.HTTP_200_OK)