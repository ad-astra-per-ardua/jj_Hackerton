from django.db import models


class Restaurant(models.Model):
    name = models.CharField(max_length=100, null=False)
    menu = models.CharField(max_length=200)
    address = models.CharField(max_length=200)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    type = models.CharField(max_length=20, choices=[('음식점', '음식점'), ('카페', '카페')], blank=True, null=True)
    image = models.ImageField(blank=True, null=True)
    phone = models.CharField(max_length=15, null=False, default='정보 없음')

    def __str__(self):
        return self.name


class TravelPlan(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    planned_time = models.IntegerField()

    def __str__(self):
        return f"{self.restaurant.name} - {self.planned_time}"


class Review(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    author = models.CharField(max_length=100)
    content = models.TextField()
    rating = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author} - {self.restaurant.name} - {self.rating}"
