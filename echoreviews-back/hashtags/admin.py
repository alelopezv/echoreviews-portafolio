from django.contrib import admin
from .models import Hashtag, HashtagSuggestion

@admin.register(Hashtag)
class HashtagAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "status", "created_at")
    list_filter = ("status", "created_at")  # 🔥 agregado
    search_fields = ("name",)
    readonly_fields = ("created_at",)
    list_editable = ("status",)  # 🔥 puedes moderar directo
    

@admin.register(HashtagSuggestion)
class HashtagSuggestionAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_by", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("name",)
    list_editable = ("status",)