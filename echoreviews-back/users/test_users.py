"""El alta de cuentas.

Un endpoint público que crea usuarios es la puerta de entrada del sitio y
también su punto más expuesto: es el único sitio donde alguien sin sesión
escribe en la base de datos.
"""
import pytest
from django.contrib.auth.models import User


REGISTRO = "/api/users/register/"


@pytest.mark.django_db
def test_registrarse_crea_la_cuenta_y_deja_la_sesion_iniciada(api):
    respuesta = api.post(REGISTRO, {
        "username": "lucia",
        "email": "lucia@ejemplo.cl",
        "password": "cielo-de-jupiter-77",
    }, format="json")

    assert respuesta.status_code == 201

    cuerpo = respuesta.json()
    assert cuerpo["user"]["username"] == "lucia"

    # La contraseña no vuelve por ningún lado, ni siquiera cifrada.
    assert "password" not in cuerpo["user"]
    assert "cielo-de-jupiter-77" not in respuesta.content.decode()

    # Y queda guardada con hash, no en claro.
    usuario = User.objects.get(username="lucia")
    assert usuario.password != "cielo-de-jupiter-77"
    assert usuario.check_password("cielo-de-jupiter-77")

    # El token que devuelve sirve de verdad: con él se entra a /me/.
    api.credentials(HTTP_AUTHORIZATION=f"Bearer {cuerpo['access']}")
    perfil = api.get("/api/users/me/")
    assert perfil.status_code == 200
    assert perfil.json()["username"] == "lucia"


@pytest.mark.django_db
def test_se_puede_volver_al_dia_siguiente_e_iniciar_sesion(api):
    """El ciclo que hace cualquier usuario real: registrarse hoy, volver mañana.

    El test de arriba usa el token que devuelve el registro, y ese token lo
    fabrica SimpleJWT a partir del usuario: funciona aunque la contraseña se
    hubiera guardado mal. Esta prueba es la otra mitad — entrar con lo que la
    persona escribió— y es la única que recorre /api/token/.
    """
    api.post(REGISTRO, {
        "username": "tomas", "email": "tomas@ejemplo.cl",
        "password": "bosque-de-niebla-42",
    }, format="json")

    sesion = api.post("/api/token/", {
        "username": "tomas", "password": "bosque-de-niebla-42",
    }, format="json")

    assert sesion.status_code == 200
    tokens = sesion.json()

    api.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    assert api.get("/api/users/me/").json()["username"] == "tomas"

    # Y cuando el acceso venza, el token de refresco da uno nuevo sin volver
    # a pedir la contraseña. Es de lo que depende el interceptor del frontend.
    api.credentials()
    renovado = api.post("/api/token/refresh/", {"refresh": tokens["refresh"]}, format="json")
    assert renovado.status_code == 200

    api.credentials(HTTP_AUTHORIZATION=f"Bearer {renovado.json()['access']}")
    assert api.get("/api/users/me/").json()["username"] == "tomas"


@pytest.mark.django_db
def test_una_contrasena_equivocada_no_abre_sesion(api, usuario):
    """`usuario` es la fixture "ana", creada con "clave-de-prueba"."""
    fallido = api.post("/api/token/", {
        "username": "ana", "password": "la-que-no-es",
    }, format="json")

    assert fallido.status_code == 401
    assert "access" not in fallido.json()


@pytest.mark.django_db
def test_un_token_invalido_no_es_lo_mismo_que_tener_permiso(api, resena_aprobada):
    """SoftJWTAuthentication devuelve None en vez de lanzar 401, y eso importa.

    Existe para que un token vencido no rompa las páginas públicas: el listado
    de reseñas debe seguir respondiendo aunque el navegador mande basura en la
    cabecera. Lo que NO puede pasar es que esa indulgencia se contagie a lo
    privado: un token inválido tiene que valer lo mismo que no tener ninguno,
    ni un poco más.
    """
    api.credentials(HTTP_AUTHORIZATION="Bearer esto-no-es-un-token")

    # Lo público sigue funcionando, que es para lo que se escribió la clase.
    publico = api.get("/api/reviews/")
    assert publico.status_code == 200
    assert publico.json()["count"] == 1

    # Y lo privado sigue cerrado.
    assert api.get("/api/users/me/").status_code == 401
    assert api.post("/api/reviews/create/", {"title": "x"}).status_code == 401


@pytest.mark.django_db
def test_sin_cabecera_de_autorizacion_el_perfil_pide_sesion(api):
    assert api.get("/api/users/me/").status_code == 401


@pytest.mark.django_db
def test_el_nombre_es_opcional_y_alimenta_full_name(api):
    """Con nombre, las reseñas se firman con él; sin nombre, con el usuario.

    full_name existía en la API desde antes que el registro, así que había un
    campo que solo se podía rellenar desde el admin de Django: quien se daba
    de alta en el sitio quedaba firmando con su nombre de usuario y sin forma
    de cambiarlo.
    """
    con_nombre = api.post(REGISTRO, {
        "username": "mlopez",
        "first_name": "Martina López",
        "password": "cielo-de-jupiter-77",
    }, format="json")
    assert con_nombre.json()["user"]["full_name"] == "Martina López"

    sin_nombre = api.post(REGISTRO, {
        "username": "sinnombre",
        "password": "cielo-de-jupiter-77",
    }, format="json")
    assert sin_nombre.json()["user"]["full_name"] == "sinnombre"


@pytest.mark.django_db
def test_la_contrasena_tampoco_puede_parecerse_al_nombre(api):
    """El validador de similitud mira el nombre, no solo el usuario.

    Solo funciona si first_name llega al User que se le pasa a
    validate_password. Sin eso, alguien llamado "Quetzalcoatl" podría usar su
    propio nombre de contraseña mientras el usuario fuera otro.
    """
    respuesta = api.post(REGISTRO, {
        "username": "usuario-cualquiera",
        "first_name": "Quetzalcoatl",
        "password": "quetzalcoatl4",
    }, format="json")

    assert respuesta.status_code == 400
    assert "password" in respuesta.json()


@pytest.mark.django_db
def test_nadie_puede_registrarse_como_administrador(api):
    """Los permisos no son un campo del formulario.

    El serializer declara solo username, email y password. Si fuera un
    ModelSerializer sobre User, estas dos claves se habrían guardado y
    cualquiera tendría el panel de administración con un POST.
    """
    api.post(REGISTRO, {
        "username": "colado",
        "password": "cielo-de-jupiter-77",
        "is_staff": True,
        "is_superuser": True,
    }, format="json")

    usuario = User.objects.get(username="colado")
    assert usuario.is_staff is False
    assert usuario.is_superuser is False


@pytest.mark.django_db
def test_el_nombre_de_usuario_no_se_repite_ni_cambiando_mayusculas(api, usuario):
    """`usuario` es la fixture que crea "ana".

    Django distingue mayúsculas en el username, así que sin la comprobación
    con __iexact existirían "ana" y "Ana" como cuentas distintas. En un sitio
    donde el nombre firma cada reseña, eso alcanza para hacerse pasar por
    otra persona.
    """
    respuesta = api.post(REGISTRO, {
        "username": "ANA",
        "password": "cielo-de-jupiter-77",
    }, format="json")

    assert respuesta.status_code == 400
    assert "username" in respuesta.json()
    assert User.objects.filter(username__iexact="ana").count() == 1


@pytest.mark.django_db
@pytest.mark.parametrize("clave, por_que", [
    ("123456", "demasiado común y solo números"),
    ("abc", "demasiado corta"),
    ("12345678", "solo números"),
])
def test_una_contrasena_debil_se_rechaza_diciendo_por_que(api, clave, por_que):
    respuesta = api.post(REGISTRO, {
        "username": "nuevo",
        "password": clave,
    }, format="json")

    assert respuesta.status_code == 400, f"debería rechazarse por ser {por_que}"
    assert "password" in respuesta.json()
    assert User.objects.count() == 0


@pytest.mark.django_db
def test_la_contrasena_no_puede_parecerse_al_nombre_de_usuario(api):
    """Aísla a UserAttributeSimilarityValidator, y solo a él.

    Ese validador compara la contraseña contra el nombre y el correo, y para
    hacerlo necesita el objeto usuario. Por eso la validación vive en
    validate() y no en validate_password().

    La contraseña está elegida a propósito para que ningún otro validador la
    rechace: tiene 14 caracteres (pasa el de longitud), no es solo números, y
    no está en la lista de contraseñas comunes de Django. Si el test pasara
    con cualquier clave parecida al nombre, podría estar aprobando por el
    motivo equivocado y no nos enteraríamos.
    """
    respuesta = api.post(REGISTRO, {
        "username": "quetzalcoatl",
        "password": "quetzalcoatl4",
    }, format="json")

    assert respuesta.status_code == 400
    assert "password" in respuesta.json()
    assert not User.objects.filter(username="quetzalcoatl").exists()
