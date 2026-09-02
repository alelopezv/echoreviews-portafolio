from django.contrib import admin
from .models import Media, MediaSuggestion


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "type", "status", "created_at")
    list_filter = ("type", "status", "created_at")
    search_fields = ("title",)
    readonly_fields = ("created_at",)


@admin.register(MediaSuggestion)
class MediaSuggestionAdmin(admin.ModelAdmin):
    # Ordenado por título y luego por fecha: así las propuestas que compiten
    # por la misma obra quedan juntas y se pueden comparar de un vistazo antes
    # de elegir cuál pasa a ser la Media oficial.
    list_display = ("id", "title", "type", "created_by", "status", "created_at")
    list_filter = ("status", "type", "created_at")
    search_fields = ("title",)
    list_editable = ("status",)
    ordering = ("title", "created_at")
    readonly_fields = ("created_by", "created_at", "approved_at", "approved_media")
