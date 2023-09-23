from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import Restaurant
import secrets
import requests,logging
import json
from hackerton.settings import get_secret
from django.views.decorators.csrf import csrf_exempt
import urllib.request

logger = logging.getLogger(__name__)


@csrf_exempt
def create_naver_directions_link(request):
    try:
        naverapi = get_secret("NAVER_API_KEY_ID")
        naverpass = get_secret("NAVER_API_KEY_SECRET")
        start_latitude = request.GET.get('start_latitude')
        start_longitude = request.GET.get('start_longitude')
        end_latitude = request.GET.get('end_latitude')
        end_longitude = request.GET.get('end_longitude')

        start = (start_latitude, start_longitude)
        goal = (end_latitude, end_longitude)

        client_id = naverapi
        client_secret = naverpass

        url = f"https://naveropenapi.apigw.ntruss.com/map-direction-15/v1/driving?start={start[1]},{start[0]}&goal={goal[1]},{goal[0]}"

        request = urllib.request.Request(url)
        request.add_header('X-NCP-APIGW-API-KEY-ID', client_id)
        request.add_header('X-NCP-APIGW-API-KEY', client_secret)

        response = urllib.request.urlopen(request)
        response_body = response.read().decode('utf-8')
        logger.info(f"API Response: {response_body}")
        data = json.loads(response_body)
        # final_url = data.get('route', {}).get('traoptimal', {}).get('summary', {}).get('route_url', '')
        logger.debug(f"API Response: {data}")

        return JsonResponse({'result': 'success', 'data': data})

    except Exception as e:
        return JsonResponse({'result': 'error', 'message': str(e)})

@csrf_exempt
def route_link(request):
    try:
        start_x = request.GET.get('start_x', None)
        start_y = request.GET.get('start_y', None)
        end_x = request.GET.get('end_x', None)
        end_y = request.GET.get('end_y', None)

        url = "https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving"

        headers = {
            'X-NCP-APIGW-API-KEY-ID': get_secret("NAVER_API_KEY_ID"),
            'X-NCP-APIGW-API-KEY': get_secret("NAVER_API_KEY_SECRET"),
        }

        params = {
            'start': f"{start_x},{start_y}",
            'goal': f"{end_x},{end_y}",
        }

        final_url = f"https://map.naver.com/p/directions/-/-/-/transit?c={end_y},{end_x},0,0,dh"
        logger.debug(f"Final URL: {final_url}")

        return JsonResponse({'result': 'success', 'route_url': final_url})

    except Exception as e:
        return JsonResponse({'result': 'error', 'message': str(e)})

def get_all_restaurants(request):
    restaurants = Restaurant.objects.all()
    data = [
        {
            "image": restaurant.image.url if restaurant.image else None,
            "name": restaurant.name,
            "menu": restaurant.menu.split("', '")[0].lstrip("'["),
            "address": restaurant.address,
            "latitude": restaurant.latitude,
            "longitude": restaurant.longitude,
            "phone": restaurant.phone if restaurant.image else None
        }
        for restaurant in restaurants if restaurant.latitude and restaurant.longitude
    ]
    return JsonResponse({'restaurants': data})


def geocode_address(address):
    naverapi = get_secret("NAVER_API_KEY_ID")
    naverpass = get_secret("NAVER_API_KEY_SECRET")
    # Use Naver's Geocoding API
    url = 'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode'


    headers = {
        'X-NCP-APIGW-API-KEY-ID': naverapi,
        'X-NCP-APIGW-API-KEY': naverpass
    }
    params = {'query': address}

    response = requests.get(url, headers=headers, params=params)
    data = response.json()

    if 'addresses' in data and len(data['addresses']) > 0:
        latitude = data['addresses'][0]['y']
        longitude = data['addresses'][0]['x']
        return float(latitude), float(longitude)
    else:
        return None, None

def secret(request):
    NAVER_API_KEY_ID = get_secret("NAVER_API_KEY_ID")
    return render(request, 'index.html', {'NAVER_API_KEY_ID': NAVER_API_KEY_ID})


def get_naver_directions(request):
    start_latitude = request.GET.get('start_latitude')
    start_longitude = request.GET.get('start_longitude')
    end_latitude = request.GET.get('end_latitude')
    end_longitude = request.GET.get('end_longitude')
    start_name = request.GET.get('start_name', '내 위치')
    end_name = request.GET.get('end_name')

    link = f"https://map.naver.com/v5/directions/{start_latitude},{start_longitude},{start_name}/{end_latitude},{end_longitude},{end_name}/"
    return JsonResponse({'link': link})


