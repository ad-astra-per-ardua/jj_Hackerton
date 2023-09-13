from django.db import models

class Restaurant(models.Model):
    name = models.CharField(max_length=100)
    menu = models.CharField(max_length=100)
    price = models.IntegerField()
    address = models.CharField(max_length=200)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

    def __str__(self):
        return self.name

