from django.db import models
from django.conf import settings

class Hashtag(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
    ]

    name = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    
    def save(self, *args, **kwargs):
        # 🔥 Normalización clave (evita duplicados tipo "Anime", " anime ")
        self.name = self.name.strip().lower()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name
    

class HashtagSuggestion(models.Model):
    name = models.CharField(max_length=50)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # conectar con reviews
    reviews = models.ManyToManyField("reviews.Review", blank=True)

    status = models.CharField(
        max_length=10,
        choices=[
            ("pending", "Pendiente"),
            ("approved", "Aprobado"),
            ("rejected", "Rechazado")
        ],
        default="pending"
    )

    approved_hashtag = models.ForeignKey(
        Hashtag,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)