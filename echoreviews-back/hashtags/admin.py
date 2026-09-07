from django.contrib import admin

from .models import Hashtag, HashtagSuggestion
from .views import aprobar_sugerencia_hashtag


@admin.register(Hashtag)
class HashtagAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("name",)
    readonly_fields = ("created_at",)

    # Acá `list_editable` sí es seguro: cambiar el estado de un hashtag no
    # dispara ningún otro trabajo, solo decide si aparece en la lista pública.
    list_editable = ("status",)


@admin.register(HashtagSuggestion)
class HashtagSuggestionAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_by", "status", "approved_hashtag", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("name",)
    readonly_fields = ("approved_hashtag", "approved_at")
    actions = ("aprobar_sugerencias",)

    # Ojo con lo que NO está acá: `list_editable = ("status",)`.
    #
    # Escribir "approved" en ese desplegable guardaba el campo y nada más: no
    # se creaba el hashtag ni se etiquetaban las reseñas que lo pidieron. La
    # sugerencia quedaba marcada como resuelta sin que se hubiera hecho el
    # trabajo. Es el mismo error que ya nos costó las propuestas de obras.
    #
    # Aprobar es una acción con consecuencias, no un campo que se escribe.

    @admin.action(description="Aprobar las sugerencias seleccionadas")
    def aprobar_sugerencias(self, request, queryset):
        aprobadas, fallidas = 0, []

        for suggestion in queryset:
            _, error = aprobar_sugerencia_hashtag(suggestion)
            if error:
                fallidas.append(f"#{suggestion.name}: {error}")
            else:
                aprobadas += 1

        if aprobadas:
            self.message_user(
                request,
                f"{aprobadas} sugerencia(s) aprobadas: se publicó el hashtag y "
                f"se etiquetaron las reseñas que lo pedían."
            )

        for mensaje in fallidas:
            self.message_user(request, mensaje, level="ERROR")
