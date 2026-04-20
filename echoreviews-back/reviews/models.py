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
    status = models.CharField(
        max_length=10,
        choices=[("pending", "Pendiente"), ("approved", "Aprobado")],
        default="pending"  # 🔥 importante
    )

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