from django.db import migrations


def limpiar_recortes(apps, schema_editor):
    """Pone a cero los recortes de las obras anteriores a esta funcionalidad.

    Hasta la migración 0006, crop_width y crop_height tenían como valor por
    defecto 100 y 150. Cualquier obra publicada sin pasar por el editor quedó
    con esos números guardados, y nunca se recortó nada: el recorte no se
    aplicaba en ninguna parte.

    Desde ahora, un ancho distinto de cero significa "a esta imagen se le
    cortó este rectángulo". Dejar los valores viejos rompería esa regla el
    primer día: dirían que hubo un recorte que no existió.
    """
    for modelo in ("Media", "MediaSuggestion"):
        apps.get_model("media", modelo).objects.filter(
            crop_width=100, crop_height=150
        ).update(crop_x=0, crop_y=0, crop_width=0, crop_height=0)


def sin_vuelta_atras(apps, schema_editor):
    """No se puede deshacer, y no hace falta.

    Reponer 100 y 150 solo devolvería el dato incorrecto. Se define para que
    la migración pueda revertirse sin error, no para restaurar nada.
    """


class Migration(migrations.Migration):

    dependencies = [
        ("media", "0006_alter_media_crop_height_alter_media_crop_width_and_more"),
    ]

    operations = [
        migrations.RunPython(limpiar_recortes, sin_vuelta_atras),
    ]
