from django.contrib import admin, messages
from .models import Media, MediaSuggestion
from .views import aprobar_sugerencia


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "type", "status", "created_at")
    list_filter = ("type", "status", "created_at")
    search_fields = ("title",)
    readonly_fields = ("created_at",)


@admin.register(MediaSuggestion)
class MediaSuggestionAdmin(admin.ModelAdmin):
    # Ordenado por título y luego por fecha: así las propuestas que compiten
    # por la misma obra quedan juntas y se pueden comparar antes de elegir.
    list_display = ("id", "title", "type", "created_by", "status", "created_at")
    list_filter = ("status", "type", "created_at")
    search_fields = ("title",)
    ordering = ("title", "created_at")
    readonly_fields = ("created_by", "created_at", "approved_at", "approved_media")

    # OJO: aquí NO va list_editable = ("status",).
    #
    # Ese desplegable dejaba cambiar el estado a "approved" desde la lista, pero
    # eso solo escribe el campo: no crea la Media ni reengancha las reseñas.
    # La propuesta quedaba marcada como aprobada y el catálogo seguía sin la
    # obra, así que la aprobación parecía funcionar sin hacer nada.
    # Para aprobar se usa la acción de abajo, que ejecuta la lógica completa.
    actions = ["accion_aprobar"]

    @admin.action(description="Aprobar: crear la obra y reenganchar sus reseñas")
    def accion_aprobar(self, request, queryset):
        aprobadas, fallidas = 0, []

        for suggestion in queryset:
            media, error = aprobar_sugerencia(suggestion)
            if error:
                fallidas.append(f"«{suggestion.title}»: {error}")
            else:
                aprobadas += 1

        if aprobadas:
            self.message_user(
                request,
                f"{aprobadas} propuesta(s) aprobada(s). "
                f"Las obras ya están en el catálogo y sus reseñas quedaron enlazadas.",
                messages.SUCCESS,
            )

        for detalle in fallidas:
            self.message_user(request, detalle, messages.WARNING)
