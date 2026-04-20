from rest_framework import serializers

from media.models import MediaSuggestion
from .models import Review
from hashtags.models import Hashtag


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    full_name = serializers.SerializerMethodField()

    media_title = serializers.CharField(source="media.title", read_only=True)
    media_type = serializers.CharField(source="media.type", read_only=True)
    media_image = serializers.SerializerMethodField()
    hashtags = serializers.StringRelatedField(many=True)

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
            "media_title",
            "media_type",
            "media_image",
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