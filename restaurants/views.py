from django.http import JsonResponse
from hackerton.settings import get_secret
from django.shortcuts import render
import requests
import json


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


def geocode_address(request):
    address = request.GET.get('address')
    api_key = get_secret("api_key")
    url = f"https://dapi.kakao.com/v2/local/search/address.json?query={address}"

    headers = {
        "Authorization": f"KakaoAK {api_key}"
    }
    response = requests.get(url, headers=headers)
    data = response.json()

    if data['documents']:
        latitude = data['documents'][0]['y']
        longitude = data['documents'][0]['x']
        return JsonResponse({'latitude': latitude, 'longitude': longitude})
    else:
        return JsonResponse({'error': 'Unable to geocode address'}, status=400)

def secret(request):
    with open('secrets.json', 'r') as file:
        secrets = json.load(file)
    js_key = secrets["js_key"]

    return render(request, 'map_test.html', {'js_key': js_key})