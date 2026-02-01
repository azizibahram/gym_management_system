"""
URL configuration for gymsystem project.

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
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from django.views.static import serve
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from gym.views import AthleteViewSet, ShelfViewSet, DashboardStatsView, ChangePasswordView
from pathlib import Path

router = DefaultRouter()
router.register(r'athletes', AthleteViewSet)
router.register(r'shelves', ShelfViewSet)

def index_view(request):
    index_path = Path(settings.BASE_DIR).parent / 'frontend' / 'dist' / 'index.html'
    with open(index_path, 'r', encoding='utf-8') as f:
        return HttpResponse(f.read())

urlpatterns = [
    path("", index_view),
    path("admin/", admin.site.urls),
    path('api/', include(router.urls)),
    path('api/dashboard/', DashboardStatsView.as_view(), name='dashboard'),
    path('api/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += [re_path(r'^(?P<path>.+)$', serve, {'document_root': settings.STATIC_ROOT})]
urlpatterns += [re_path(r'^.*$', index_view)]
