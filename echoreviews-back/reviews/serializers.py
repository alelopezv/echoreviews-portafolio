from rest_framework import serializers

from media.models import MediaSuggestion, TYPE_CHOICES
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
    
    def get_media_image(self, origen):
        """URL absoluta de la portada.

        Recibe la fuente (una Media o una MediaSuggestion) en vez de la reseña,
        porque las dos tienen un campo `image` y sirve para ambas.
        """
        if not origen or not origen.image:
            return None

        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(origen.image.url)
        return origen.image.url

    def get_media(self, obj):
        # De dónde salen los datos de la obra:
        #   - si la reseña ya tiene Media aprobada, de ahí;
        #   - si todavía espera moderación, de su propuesta.
        # Así el frontend nunca recibe null y siempre puede pintar la portada.
        if obj.media:
            origen, pendiente = obj.media, False
        elif obj.media_suggestion:
            origen, pendiente = obj.media_suggestion, True
        else:
            # Solo alcanzable con datos inválidos anteriores a la validación
            # que ahora exige obra al crear una reseña.
            return None

        # Un diccionario de Python se convierte en un objeto JSON.
        return {
            "title": origen.title,
            "type": origen.type,
            "description": origen.description,
            "image": self.get_media_image(origen),
            # Los cuatro valores de recorte agrupados, porque pertenecen juntos.
            "crop": {
                "x": origen.crop_x,
                "y": origen.crop_y,
                "width": origen.crop_width,
                "height": origen.crop_height,
            },
            # Le dice al frontend si esta obra todavía espera aprobación,
            # para poder marcarla sin tener que adivinarlo.
            "pending": pendiente,
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
            "rejection_reason",
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

    # Datos de una obra nueva, cuando el usuario reseña algo que no está en el
    # catálogo. No son campos de Review, así que se declaran write_only y se
    # sacan de validated_data antes de guardar.
    media_title = serializers.CharField(required=False, write_only=True)
    media_type = serializers.ChoiceField(
        choices=TYPE_CHOICES, required=False, write_only=True
    )
    media_description = serializers.CharField(required=False, write_only=True)
    image = serializers.ImageField(required=False, write_only=True)
    crop_x = serializers.IntegerField(required=False, write_only=True)
    crop_y = serializers.IntegerField(required=False, write_only=True)
    crop_width = serializers.IntegerField(required=False, write_only=True)
    crop_height = serializers.IntegerField(required=False, write_only=True)

    class Meta:
        model = Review
        fields = [
            "media", "title", "content", "rating", "hashtags",
            "media_suggestion", "hashtag_suggestions",
            "media_title", "media_type", "media_description",
            "image", "crop_x", "crop_y", "crop_width", "crop_height",
        ]

    def validate(self, attrs):
        """Toda reseña habla de una obra, y toda obra tiene portada y descripción.

        O se elige una del catálogo, o se propone una nueva completa. A medias
        no: así es como se colaban reseñas sin obra a las que después la API no
        les podía dar título ni imagen.
        """
        # En una edición parcial (PATCH) solo se validan los campos enviados.
        if self.instance is not None:
            return attrs

        if attrs.get("media"):
            return attrs

        faltantes = [
            nombre
            for nombre, valor in (
                ("media_title", attrs.get("media_title")),
                ("media_type", attrs.get("media_type")),
                ("media_description", attrs.get("media_description")),
                ("image", attrs.get("image")),
            )
            if not valor
        ]

        if not attrs.get("media_title") and not faltantes:
            faltantes = ["media_title"]

        if faltantes:
            raise serializers.ValidationError({
                campo: "Requerido para proponer una obra nueva."
                for campo in faltantes
            })

        return attrs

    def create(self, validated_data):
        """Saca del diccionario todo lo que no es un campo de Review.

        Sin esto, DRF le pasa esas claves a Review.objects.create() y revienta
        con `TypeError: Review() got unexpected keyword arguments`.
        """
        for campo in (
            "hashtag_suggestions", "media_title", "media_type",
            "media_description", "image",
            "crop_x", "crop_y", "crop_width", "crop_height",
        ):
            validated_data.pop(campo, None)

        hashtags = validated_data.pop("hashtags", [])
        review = Review.objects.create(**validated_data)
        review.hashtags.set(hashtags)
        return review

    def update(self, instance, validated_data):
        """Misma limpieza que en create, porque ReviewDetailView.patch
        usa este mismo serializer para editar."""
        for campo in (
            "hashtag_suggestions", "media_title", "media_type",
            "media_description", "image",
            "crop_x", "crop_y", "crop_width", "crop_height",
        ):
            validated_data.pop(campo, None)

        return super().update(instance, validated_data)