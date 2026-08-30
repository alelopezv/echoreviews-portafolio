from django.contrib import admin
from .models import Media, MediaSuggestion

@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "type", "created_at")
    list_filter = ("type", "created_at")
    search_fields = ("title",)
    readonly_fields = ("created_at",)
    
@admin.register(MediaSuggestion)
class MediaSuggestionAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "type", "created_by", "status", "created_at")
    list_filter = ("status", "type", "created_at")
    search_fields = ("title",)
    list_editable = ("status",)
    readonly_fields = ("created_by", "created_at", "approved_at")