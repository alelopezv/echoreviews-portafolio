"""
URL configuration for echoreviews project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path, include

from django.conf import settings
from django.views.static import serve as servir_estatico
from django.contrib.staticfiles.views import serve as servir_estatico_admin
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Documentación de la API, generada leyendo las vistas y los serializers.
    # /api/schema/ devuelve el OpenAPI en bruto —que sirve para generar
    # clientes— y /api/docs/ es la página que se puede leer y probar.
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),

    path("api/reviews/", include("reviews.urls")),
    path("api/hashtags/", include("hashtags.urls")),
    path("api/media/", include("media.urls")),
    path("api/users/", include("users.urls")),

    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

# django.conf.urls.static.static() trae, adentro suyo, un `if not DEBUG:
# return []` — no registra nada cuando DEBUG está apagado, sin importar
# cómo se la llame. Es a propósito: espera que en producción haya un
# servidor de archivos de verdad delante. Acá no lo hay —nginx reenvía
# /media/ a este mismo backend, ver nginx.conf— así que Django tiene que
# poder servirlas igual, con DEBUG en cualquier estado. Por eso se usa
# la vista de Django directamente en vez de ese atajo.
urlpatterns += [
    re_path(r"^media/(?P<path>.*)$", servir_estatico, {"document_root": settings.MEDIA_ROOT}),
]

# Mismo problema, ahora con el CSS/JS del admin de Django: la vista de
# django.contrib.staticfiles también se niega a servir nada con DEBUG
# apagado, salvo que se le pase insecure=True a propósito —el nombre lo
# dice: para un sitio con tráfico real conviene WhiteNoise o un servidor
# de archivos de verdad. Para esta VM, de bajo tráfico, alcanza con esto.
urlpatterns += [
    re_path(r"^static/(?P<path>.*)$", servir_estatico_admin, kwargs={"insecure": True}),
]
