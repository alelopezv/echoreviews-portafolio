from django import forms
from django.contrib import admin
from django.utils import timezone

from .models import Review


class ReviewAdminForm(forms.ModelForm):
    """Las mismas reglas que exige la API, también en el admin.

    `PATCH /api/reviews/<id>/reject/` devuelve un 400 si no se manda un motivo,
    porque un rechazo sin explicación no le sirve de nada al autor: no sabe qué
    corregir para volver a enviarla. El admin no tenía esa exigencia, así que la
    misma regla se cumplía o no según por dónde entraras.
    """

    class Meta:
        model = Review
        fields = "__all__"

    def clean(self):
        datos = super().clean()

        if datos.get("status") == "rejected" and not (datos.get("rejection_reason") or "").strip():
            raise forms.ValidationError({
                "rejection_reason": "Hace falta un motivo para rechazar la reseña.",
            })

        return datos


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    form = ReviewAdminForm

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
    #
    # `approved_by` y `approved_at` van acá porque son el REGISTRO de una
    # acción, no una decisión que se toma. Mientras approved_by fue editable,
    # el admin mostraba un desplegable con todos los usuarios del sitio: se
    # podía firmar la aprobación a nombre de cualquiera, incluso de alguien sin
    # permiso para aprobar nada. Y si no se elegía a nadie, aprobar desde el
    # admin no dejaba ningún rastro de quién lo hizo.
    #
    # Es el mismo error que ya nos costó las propuestas de obras y las de
    # hashtags: un campo que se escribe a mano donde debería haber una
    # consecuencia automática de lo que se hizo.
    readonly_fields = (
        "user",
        "title",
        "content",
        "rating",
        "created_at",
        "updated_at",
        "approved_by",
        "approved_at",
        "media_suggestion",
    )

    # Las etiquetas sí son editoriales: el autor escribe la reseña, la redacción
    # decide bajo qué temas se archiva. Es el reparto de una revista.
    filter_horizontal = ("hashtags",)

    def save_model(self, request, obj, form, change):
        """Quien aprueba es quien está usando el admin.

        Lo mismo que hace ApproveReviewView con el usuario del token, pero con
        el de la sesión. Antes el admin cambiaba el estado y nada más: la reseña
        quedaba publicada sin registro de quién la aprobó ni cuándo, y los dos
        caminos de moderación —la API y el admin— dejaban la base en estados
        distintos.
        """
        if obj.status == "approved":
            # Solo la primera vez: volver a guardar una reseña ya aprobada no
            # debería reasignarle la aprobación a quien pasó por ahí después.
            if obj.approved_at is None:
                obj.approved_by = request.user
                obj.approved_at = timezone.now()

            # Si venía rechazada, el motivo ya no aplica.
            obj.rejection_reason = ""
        else:
            obj.approved_by = None
            obj.approved_at = None

        super().save_model(request, obj, form, change)

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
