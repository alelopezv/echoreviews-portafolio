from django.db import models
from django.conf import settings


TYPE_CHOICES = [
    ('anime', 'Anime'),
    ('music', 'Música'),
    ('game', 'Videojuego'),
]

class Media(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
    ]

    title = models.CharField(max_length=255, db_index=True, unique=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="media/", null=True, blank=True)
    crop_x = models.IntegerField(default=0)
    crop_y = models.IntegerField(default=0)
    crop_width = models.IntegerField(default=100)
    crop_height = models.IntegerField(default=150)

    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='approved')

    def __str__(self):
        return f"{self.title} ({self.type})"
    
class MediaSuggestion(models.Model):
    title = models.CharField(max_length=255, db_index=True, unique=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)  # anime, album, etc.
    image = models.ImageField(
        upload_to="media/",
        null=True,
        blank=True
    )

    crop_x = models.IntegerField(default=0)
    crop_y = models.IntegerField(default=0)
    crop_width = models.IntegerField(default=100)
    crop_height = models.IntegerField(default=150)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=10,
        choices=[("pending", "Pendiente"), ("approved", "Aprobado"), ("rejected", "Rechazado")],
        default="pending"
    )
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