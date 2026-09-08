from django.db import models
from django.conf import settings


TYPE_CHOICES = [
    ('anime', 'Anime'),
    ('music', 'Música'),
    ('game', 'Videojuego'),
]

STATUS_CHOICES = [
    ('pending', 'Pendiente'),
    ('approved', 'Aprobado'),
    ('rejected', 'Rechazado'),
]


class Media(models.Model):
    """Obra del catálogo oficial: la que ven todos y a la que apuntan las reseñas."""

    # El catálogo no admite títulos repetidos: dos filas "Cowboy Bebop"
    # serían la misma obra duplicada.
    title = models.CharField(max_length=255, db_index=True, unique=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField()

    # Sin null ni blank: toda obra del catálogo tiene portada.
    image = models.ImageField(upload_to="media/")

    # Rectángulo que se recortó de la imagen subida, en píxeles del archivo
    # original. Es el registro de lo que se hizo, no una instrucción pendiente:
    # el recorte se aplica al archivo en el momento de subirlo.
    #
    # Ancho y alto valen 0 cuando no se recortó nada. Antes valían 100 y 150,
    # que parecen un recorte legítimo: cualquier obra publicada sin pasar por
    # el editor tenía guardado un rectángulo de 100×150 px que nadie leía. En
    # cuanto se empezara a leer, esas portadas se habrían cortado a una esquina.
    crop_x = models.IntegerField(default=0)
    crop_y = models.IntegerField(default=0)
    crop_width = models.IntegerField(default=0)
    crop_height = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='approved')

    def __str__(self):
        return f"{self.title} ({self.type})"


class MediaSuggestion(models.Model):
    """Propuesta de obra hecha por un usuario, a la espera de moderación.

    Es una bandeja de entrada, no un catálogo: varias personas pueden proponer
    la misma obra con portadas y descripciones distintas, y un admin elige cuál
    pasa a ser la Media oficial. Por eso el título NO es único acá — cuando lo
    era, el segundo en proponer la misma obra recibía un IntegrityError y no
    lograba publicar su reseña.
    """

    title = models.CharField(max_length=255, db_index=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    # default="" solo existe para las filas anteriores a este campo;
    # al no llevar blank=True, los formularios y serializers lo siguen exigiendo.
    description = models.TextField(default="")

    # Igual que en Media: quien propone una obra aporta su portada.
    image = models.ImageField(upload_to="media/")

    # Rectángulo que se recortó de la imagen subida, en píxeles del archivo
    # original. Es el registro de lo que se hizo, no una instrucción pendiente:
    # el recorte se aplica al archivo en el momento de subirlo.
    #
    # Ancho y alto valen 0 cuando no se recortó nada. Antes valían 100 y 150,
    # que parecen un recorte legítimo: cualquier obra publicada sin pasar por
    # el editor tenía guardado un rectángulo de 100×150 px que nadie leía. En
    # cuanto se empezara a leer, esas portadas se habrían cortado a una esquina.
    crop_x = models.IntegerField(default=0)
    crop_y = models.IntegerField(default=0)
    crop_width = models.IntegerField(default=0)
    crop_height = models.IntegerField(default=0)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="pending"
    )

    # Motivo que deja el admin al rechazar, para que el autor sepa qué corregir.
    rejection_reason = models.TextField(blank=True, default="")

    approved_media = models.ForeignKey(
        Media,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.status})"
