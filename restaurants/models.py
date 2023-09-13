from django.db import models

class Restaurant(models.Model):
    name = models.CharField(max_length=200)
    menu = models.TextField()
    price = models.IntegerField()
    address = models.TextField()
    latitude = models.IntegerField()
    longitude = models.IntegerField()

    def __str__(self):
        return self.name

