FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# El entrypoint se instala FUERA de /app a propósito.
#
# docker-compose.yml monta el código con `volumes: - .:/app`, así que en
# tiempo de ejecución /app es la carpeta del host, no lo que quedó en la
# imagen. Si el script viviera en /app, ese montaje taparía la copia limpia
# y el contenedor terminaría ejecutando el archivo del host — con los
# finales de línea que tenga esa máquina.
#
# El `sed` elimina cualquier retorno de carro por si el archivo llegó con
# CRLF desde Windows: sin eso, el shebang queda como "#!/bin/sh\r" y Docker
# falla con "exec /app/entrypoint.sh: no such file or directory", que suena
# a archivo faltante pero en realidad es el intérprete el que no existe.
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh \
    && chmod +x /usr/local/bin/entrypoint.sh

COPY . .

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
