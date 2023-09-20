from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.conf import settings
from .models import Restaurant
import requests
import json
from hackerton.settings import get_secret


def map_link(request):
    latitude = request.GET.get('latitude')
    longitude = request.GET.get('longitude')
    name = request.GET.get('name')

    link = f"https://map.kakao.com/link/map/{name},{latitude},{longitude}"
    return JsonResponse({'link': link})


def route_link(request):
    latitude = request.GET.get('latitude')
    longitude = request.GET.get('longitude')
    name = request.GET.get('name')

    link = f"https://map.kakao.com/link/to/{name},{latitude},{longitude}"
    return JsonResponse({'link': link})


def roadview_link(request):
    latitude = request.GET.get('latitude')
    longitude = request.GET.get('longitude')

    link = f"https://map.kakao.com/link/roadview/{latitude},{longitude}"
    return JsonResponse({'link': link})


def search_link(request):
    query = request.GET.get('query')

    link = f"https://map.kakao.com/link/search/{query}"
    return JsonResponse({'link': link})


def add_restaurant(request):
    if request.method == "POST":
        name = request.POST.get('name')
        menu = request.POST.get('menu')
        price = request.POST.get('price')
        address = request.POST.get('address')

        # 위도와 경도 얻기
        api_key = get_secret("api_key")
        url = f"https://dapi.kakao.com/v2/local/search/address.json?query={address}"
        headers = {"Authorization": f"KakaoAK {api_key}"}
        response = requests.get(url, headers=headers)
        data = response.json()

        latitude = None
        longitude = None
        if data['documents']:
            latitude = float(data['documents'][0]['y'])
            longitude = float(data['documents'][0]['x'])

        restaurant = Restaurant(
            name=name, menu=menu, price=price, address=address,
            latitude=latitude, longitude=longitude
        )
        restaurant.save()

        return redirect('map_test')

    return render(request, 'map_test.html')

def get_all_restaurants(request):
    restaurants = Restaurant.objects.all()
    data = [
        {
            "name": restaurant.name,
            "menu": restaurant.menu,
            "price": restaurant.price,
            "address": restaurant.address,
            "latitude": restaurant.latitude,
            "longitude": restaurant.longitude
        }
        for restaurant in restaurants if restaurant.latitude and restaurant.longitude
    ]
    return JsonResponse({'restaurants': data})


def geocode_address(request):
    address = request.GET.get('address')

    # Use Naver's Geocoding API
    url = 'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode'
    headers = {
        'X-NCP-APIGW-API-KEY-ID': settings.NAVER_API_KEY_ID,
        'X-NCP-APIGW-API-KEY': settings.NAVER_API_KEY_SECRET
    }
    params = {'query': address}

    response = requests.get(url, headers=headers, params=params)
    data = response.json()

    if data['addresses']:
        latitude = data['addresses'][0]['y']
        longitude = data['addresses'][0]['x']
        return JsonResponse({"latitude": latitude, "longitude": longitude})
    else:
        return JsonResponse({"error": "Cannot find address"}, status=400)

def secret(request):
    js_key = get_secret("js_key")
    return render(request, 'map_test.html', {'js_key': js_key})


def get_naver_directions(request):
    # 사용자의 위치와 목적지 위치를 요청에서 가져옵니다.
    start_lat = request.GET.get('start_lat')
    start_lng = request.GET.get('start_lng')
    end_lat = request.GET.get('end_lat')
    end_lng = request.GET.get('end_lng')

    # 네이버 지도 API endpoint
    url = f"https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start={start_lng},{start_lat}&goal={end_lng},{end_lat}&option=trafast"

    headers = {
        "X-NCP-APIGW-API-KEY-ID": get_secret("NAVER_CLIENT_ID"),
        "X-NCP-APIGW-API-KEY": get_secret("NAVER_CLIENT_SECRET")
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        data = response.json()
        return JsonResponse(data)
    else:
        return JsonResponse({"error": "Unable to fetch directions"}, status=400)