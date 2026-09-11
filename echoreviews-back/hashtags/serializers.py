from rest_framework import serializers
from .models import Hashtag


class HashtagSerializer(serializers.ModelSerializer):
    # Cuántas reseñas aprobadas usan esta etiqueta. Lo calcula la base con un
    # annotate(); acá solo se declara para que salga en el JSON.
    #
    # Antes el frontend lo contaba solo: pedía TODAS las reseñas, recorría sus
    # etiquetas y armaba el conteo en el navegador. Funcionaba mientras el
    # listado viniera completo, y se rompió en cuanto hubo paginación —contaría
    # sobre cinco reseñas y diría que todo tiene una o cero—. Contar filas es
    # trabajo de la base de datos.
    #
    # `required=False` porque las vistas que devuelven un hashtag suelto (crear,
    # actualizar) no anotan nada: ahí el campo simplemente no aparece.
    reviews_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Hashtag
        fields = "__all__"