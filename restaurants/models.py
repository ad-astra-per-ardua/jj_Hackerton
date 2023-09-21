from django.db import models

class Restaurant(models.Model):
    name = models.CharField(max_length=100,primary_key=True,unique=True,null=False)
    menu = models.CharField(max_length=200)
    address = models.CharField(max_length=200)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    type = models.CharField(max_length=20,choices=[('음식점','음식점'), ('카페','카페')], blank=True,null=True)
    image_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name

