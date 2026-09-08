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
    search_fields = ("title", "content", "user__username")

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

    # Las etiquetas sí son editoriales: el autor escribe la reseña, la redacción
    # decide bajo qué temas se archiva. Es el reparto de una revista.
    filter_horizontal = ("hashtags",)

    def has_add_permission(self, request):
        """Un admin no escribe reseñas ajenas, así que tampoco las crea.

        Las reseñas nacen en la aplicación, firmadas por quien las escribe.
        Sin esto el admin ofrecía un formulario de creación con todos los
        campos en solo lectura —usuario, título, contenido y puntuación
        aparecían como un guion— porque `readonly_fields` también se aplica
        al alta. Un formulario que no se puede rellenar es peor que no
        ofrecerlo: parece roto.

        Si algún día hiciera falta cargar reseñas a mano, lo coherente sería
        devolver True acá y usar get_readonly_fields() para proteger solo la
        edición, no el alta.
        """
        return False
