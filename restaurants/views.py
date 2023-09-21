from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import Restaurant
import requests,logging
import json
from hackerton.settings import get_secret
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)


def map_link(request):
    latitude = request.GET.get('latitude')
    longitude = request.GET.get('longitude')
    name = request.GET.get('name')

    link = f"https://map.kakao.com/link/map/{name},{latitude},{longitude}"
    return JsonResponse({'link': link})


@csrf_exempt
def route_link(request):
    try:
        start_x = request.GET.get('start_x', None)  # 출발지의 경도
        start_y = request.GET.get('start_y', None)  # 출발지의 위도
        end_x = request.GET.get('end_x', None)  # 목적지의 경도
        end_y = request.GET.get('end_y', None)  # 목적지의 위도

        # 네이버 길찾기 API URL
        url = "https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving"

        # API 호출을 위한 헤더 설정
        headers = {
            'X-NCP-APIGW-API-KEY-ID': get_secret("NAVER_API_KEY_ID"),
            'X-NCP-APIGW-API-KEY': get_secret("NAVER_API_KEY_SECRET"),
        }

        # API 호출을 위한 파라미터 설정
        params = {
            'start': f"{start_x},{start_y}",
            'goal': f"{end_x},{end_y}",
        }

        # API 호출
        final_url = f"https://map.naver.com/p/directions/-/-/-/transit?c={end_y},{end_x},0,0,dh"
        logger.debug(f"Final URL: {final_url}")

        return JsonResponse({'result': 'success', 'route_url': final_url})

    except Exception as e:
        return JsonResponse({'result': 'error', 'message': str(e)})


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
    naverapi = get_secret("NAVER_API_KEY_ID")
    naverpass = get_secret("NAVER_API_KEY_SECRET")
    # Use Naver's Geocoding API
    url = 'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode'
    headers = {
        'X-NCP-APIGW-API-KEY-ID': naverapi.NAVER_API_KEY_ID,
        'X-NCP-APIGW-API-KEY': naverpass.NAVER_API_KEY_SECRET
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
    start_latitude = request.GET.get('start_latitude')
    start_longitude = request.GET.get('start_longitude')
    end_latitude = request.GET.get('end_latitude')
    end_longitude = request.GET.get('end_longitude')
    start_name = request.GET.get('start_name', '내 위치')
    end_name = request.GET.get('end_name')

    link = f"https://map.naver.com/v5/directions/{start_latitude},{start_longitude},{start_name}/{end_latitude},{end_longitude},{end_name}/"
    return JsonResponse({'link': link})

