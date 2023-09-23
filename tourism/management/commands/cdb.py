from django.core.management.base import BaseCommand
from tourism.models import tourism
import csv, requests, os, tempfile, shutil
import pandas as pd
from restaurants.views import geocode_address
from django.core.files import File

class Command(BaseCommand):
    help = 'Load data from csv file into Restaurant model'

    def handle(self, *args, **kwargs):
        df = pd.read_csv('관광지 데이터.csv', encoding='utf-8')

        for idx, row in df.iterrows():
            name = row[1]
            price = row[5]
            address = row[2]
            theme = row[0]
            tel = row[3]
            created = tourism.objects.get_or_create(
                name=name,
                defaults={
                    'theme':theme,
                    'name' : name,
                    'address': address,
                    'tel': tel,
                    'price': price
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Successfully created {name}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'{name} already exists, skipped'))

            records_without_geolocation = tourism.objects.filter(latitude__isnull=True, longitude__isnull=True)

            for record in records_without_geolocation:
                address = record.address
                latitude, longitude = geocode_address(address)

                if latitude is not None and longitude is not None and name is not None:
                    record.latitude = latitude
                    record.longitude = longitude
                    record.save()