from django.db import models
from django.conf import settings
from media.models import Media
from hashtags.models import Hashtag
from django.core.validators import MinValueValidator, MaxValueValidator



class Review(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
    ]

    # Relación con usuario (IMPORTANTE: custom user)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # Relación con contenido (anime, disco, etc.)
    media = models.ForeignKey(Media, null=True, blank=True, on_delete=models.CASCADE)
    
    media_suggestion = models.ForeignKey(
        "media.MediaSuggestion",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    # Contenido de la review
    title = models.CharField(max_length=255)
    content = models.TextField()
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )

    # Hashtags
    hashtags = models.ManyToManyField(Hashtag, blank=True)

    # Moderación
    # Usa STATUS_CHOICES en vez de una lista escrita a mano acá: la de arriba
    # ya incluye "rejected", y tenerla duplicada hacía que el estado de rechazo
    # existiera en la constante pero no en el campo, o sea, no existiera.
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="pending"
    )

    # Motivo del rechazo. Rechazar sin explicar no le sirve de nada al autor:
    # no sabe qué corregir para volver a enviar la reseña.
    rejection_reason = models.TextField(blank=True, default="")

    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='approved_reviews'
    )

    approved_at = models.DateTimeField(null=True, blank=True)

    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.user} ({self.status})"