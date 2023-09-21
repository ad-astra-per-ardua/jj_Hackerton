from django.core.management.base import BaseCommand
from restaurants.models import Restaurant
import csv
from restaurants.views import geocode_address


class Command(BaseCommand):
    help = 'Load data from csv file into Restaurant model'

    def handle(self, *args, **kwargs):
        with open('착한업소 크롤링.csv', 'r', encoding='utf-8') as csvfile:
            csvreader = csv.reader(csvfile)
            next(csvreader)
            for row in csvreader:
                name = row[1]
                menu = row[4]
                address = row[2]
                image_url = row[0]
                type = '카페' if '아메리카노' in menu else '음식점'
                restaurant, created = Restaurant.objects.get_or_create(
                    name=name,
                    defaults={
                        'menu': menu,
                        'address': address,
                        'type': type,
                        'image_url': image_url,
                    }
                )

                if created:
                    self.stdout.write(self.style.SUCCESS(f'Successfully created {name}'))
                else:
                    self.stdout.write(self.style.SUCCESS(f'{name} already exists, skipped'))

                records_without_geolocation = Restaurant.objects.filter(latitude__isnull=True, longitude__isnull=True)

                for record in records_without_geolocation:
                    address = record.address
                    latitude, longitude = geocode_address(address)

                    if latitude is not None and longitude is not None:
                        record.latitude = latitude
                        record.longitude = longitude
                        record.save()


