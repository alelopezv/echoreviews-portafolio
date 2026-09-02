from rest_framework import serializers

from media.models import MediaSuggestion
from .models import Review
from hashtags.models import Hashtag


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    full_name = serializers.SerializerMethodField()
    hashtags = serializers.StringRelatedField(many=True)
    media = serializers.SerializerMethodField()
    
    def get_full_name(self, obj):
        first = obj.user.first_name or ""
        last = obj.user.last_name or ""

        full_name = f"{first} {last}".strip()

        return full_name if full_name else obj.user.username
    
    def get_media_image(self, obj):
        request = self.context.get("request")

        if obj.media and obj.media.image:
            if request:
                return request.build_absolute_uri(obj.media.image.url)
            return obj.media.image.url

        return None
    
    def get_media(self, obj):
        # Si la reseña no tiene obra asociada, devolvemos None.
        # La clave "media" va a existir igual en el JSON, con valor null.
        # Esta línea es todo el arreglo del bug.
        if obj.media is None:
            return None

        # Un diccionario de Python se convierte en un objeto JSON.
        return {
            "title": obj.media.title,
            "type": obj.media.type,
            # Reutilizamos el método que ya tenías: sabe armar la URL
            # absoluta y ya maneja el caso de imagen vacía.
            "image": self.get_media_image(obj),
            # Los cuatro valores de recorte agrupados, porque pertenecen juntos.
            "crop": {
                "x": obj.media.crop_x,
                "y": obj.media.crop_y,
                "width": obj.media.crop_width,
                "height": obj.media.crop_height,
            },
    }
    
    class Meta:
        model = Review
        fields = [
            "id",
            "title",
            "content",
            "rating",
            "status",
            "created_at",
            "updated_at",
            "media",          # ← reemplaza a los seis anteriores
            "hashtags",
            "username",
            "full_name",
        ]


class ReviewCreateSerializer(serializers.ModelSerializer):
    hashtags = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Hashtag.objects.all(),
        required=False
    )
    
    media_suggestion = serializers.PrimaryKeyRelatedField(
        queryset=MediaSuggestion.objects.all(),
        required=False,
        allow_null=True
    )
    hashtag_suggestions = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )

    class Meta:
        model = Review
        fields = ["media", "title", "content", "rating", "hashtags", "media_suggestion", "hashtag_suggestions"]