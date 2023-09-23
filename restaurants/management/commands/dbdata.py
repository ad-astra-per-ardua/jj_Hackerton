from django.core.management.base import BaseCommand
from restaurants.models import Restaurant
import csv, requests, os, tempfile, shutil
import pandas as pd
from restaurants.views import geocode_address
from django.core.files import File

class Command(BaseCommand):
    help = 'Load data from csv file into Restaurant model'

    def handle(self, *args, **kwargs):
        df = pd.read_csv('착한업소 크롤링.csv', encoding='utf-8')

        for idx, row in df.iterrows():
            name = row[1]  # 레스토랑 이름
            menu = row[4]  # 메뉴
            address = row[2]  # 주소
            phone = row[3]  # 전화번호
            image_url = row[0]  # 이미지 URL
            type = '카페' if '아메리카노' in menu else '음식점'

            response = requests.get(image_url, stream=True)
            temp_filename = f"temp_{name}.jpg"
            with open(temp_filename, 'wb') as img_temp:
                if response.status_code == 200:
                    for chunk in response.iter_content(1024):
                        img_temp.write(chunk)
            restaurant, created = Restaurant.objects.get_or_create(
                name=name,
                defaults={
                    'menu': menu,
                    'address': address,
                    'type': type,
                    'phone': phone,
                }
            )

            if os.path.exists(temp_filename):
                with open(temp_filename, 'rb') as img_temp:
                    restaurant.image.save(f"{name}.jpg", File(img_temp))
                os.remove(temp_filename)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Successfully created {name}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'{name} already exists, skipped'))

            records_without_geolocation = Restaurant.objects.filter(latitude__isnull=True, longitude__isnull=True)

            for record in records_without_geolocation:
                address = record.address
                latitude, longitude = geocode_address(address)

                if latitude is not None and longitude is not None or phone == '정보 없음':
                    record.latitude = latitude
                    record.longitude = longitude
                    record.save()
