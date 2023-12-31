
from django.contrib import admin
from django.conf.urls.static import static
from django.conf import settings
from django.urls import path
from restaurants import views
from django.views.generic import *
from restaurants.views import home_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.secret, name='index'),
    path('route_link/',views.route_link,name='route_link'),
    path('api/geocode/', views.geocode_address, name='geocode_address'),
    path('api/get_all_restaurants/', views.get_all_restaurants, name='get_all_restaurants'),
    path('api/naver_directions/', views.get_naver_directions, name='naver_directions'),
    path('create_naver_directions_link/',views.create_naver_directions_link,name='create_naver_directions_link'),
    path('detail/', views.show_detail, name='show_detail'),
    path('detail/<str:restaurant_name>/', views.restaurant_detail, name='restaurant_detail'),
    path('plan/',views.show_plan,name='show_plan'),
    path('api/save_plan/', views.save_plan, name='save_plan'),
    path('sorting/', views.sorting, name='sorting'),
    path('api/get_travel_plans/',views.get_travel_plans,name='get_travel_plans'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)