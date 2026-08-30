#!/bin/sh
# Arranque del contenedor de la API.
#
# Existe por una razón concreta: antes había que acordarse de correr
# `migrate` a mano después de cada `makemigrations`. Cuando se olvidaba,
# la API respondía 500 con errores del tipo
# "Unknown column 'media_media.crop_x' in 'field list'".
# Al dejarlo acá, el esquema de la base siempre queda al día al levantar.
set -e

echo "⏳ Esperando a MySQL en ${DB_HOST:-mysql}:${DB_PORT:-3306}..."
until python -c "
import os, socket, sys
s = socket.socket()
s.settimeout(2)
try:
    s.connect((os.getenv('DB_HOST', 'mysql'), int(os.getenv('DB_PORT', 3306))))
except OSError:
    sys.exit(1)
" 2>/dev/null; do
  sleep 1
done
echo "✅ MySQL respondiendo."

# Copiar las imágenes de demo a MEDIA_ROOT si todavía no están.
# Se versionan en seed_assets/ para no mezclarlas con lo que suben
# los usuarios, que vive en mediafiles/ y está en .gitignore.
if [ -d /app/seed_assets/media ]; then
  mkdir -p /app/mediafiles/media
  cp -n /app/seed_assets/media/* /app/mediafiles/media/ 2>/dev/null || true
fi

echo "🔄 Aplicando migraciones..."
python manage.py migrate --noinput

exec "$@"
