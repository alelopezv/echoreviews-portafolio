from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "user",
        "media",
        "rating",
        "status",
        "created_at"
    )

    list_filter = ("status", "rating", "created_at")
    search_fields = ("title", "content", "user__email")

    # El contenido de la reseña es de su autor: desde el admin se modera
    # cambiando el estado, no reescribiendo el texto. Para rechazar con motivo
    # está PATCH /api/reviews/<id>/reject/.
    readonly_fields = (
        "user",
        "title",
        "content",
        "rating",
        "created_at",
        "updated_at",
        "approved_at",
        "media_suggestion",
    )

    filter_horizontal = ("hashtags",)
