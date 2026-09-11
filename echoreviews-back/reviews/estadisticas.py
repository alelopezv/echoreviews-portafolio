"""Las tres cifras de la portada.

Existen como endpoint propio por una razón concreta: antes la portada las
deducía de la lista de reseñas que acababa de pedir —contaba los elementos,
los autores distintos y las etiquetas distintas—. Eso funcionaba solo mientras
`/api/reviews/` devolviera el listado entero, y se rompió en cuanto hubo
paginación: con cinco por página, el sitio habría anunciado «5 reseñas
publicadas» para siempre, y los autores serían los de esas cinco.

Un agregado no se deduce de una página de datos. Se pregunta.

Las tres consultas son `COUNT`, así que la respuesta es barata aunque la base
crezca.
"""
from django.db.models import Count, Q
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from hashtags.models import Hashtag
from .models import Review


class EstadisticasView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        aprobadas = Review.objects.filter(status="approved")

        # Etiquetas que de verdad se usan. El catálogo puede tener etiquetas
        # aprobadas que nadie aplicó todavía, y anunciarlas infla el número con
        # enlaces que llevan a una página vacía.
        etiquetas_en_uso = (
            Hashtag.objects.filter(status="approved")
            .annotate(usos=Count("review", filter=Q(review__status="approved")))
            .filter(usos__gt=0)
            .count()
        )

        return Response(
            {
                "reviews": aprobadas.count(),
                # Autores distintos con al menos una reseña publicada. Quien
                # escribió tres cuenta una vez, y quien solo tiene borradores
                # pendientes no cuenta: "escritores activos" son los que se
                # leen en el sitio, no los que abrieron una cuenta.
                "writers": aprobadas.values("user").distinct().count(),
                "hashtags": etiquetas_en_uso,
            },
            status=status.HTTP_200_OK,
        )
