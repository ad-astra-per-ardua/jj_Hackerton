from django.db import models

class tourism(models.Model):
    id = models.AutoField(primary_key=True)
    theme = models.CharField(max_length=20)
    name = models.CharField(unique=True,null=False,max_length=200)
    address = models.CharField(max_length=200)
    tel = models.CharField(max_length=20)
    price = models.IntegerField()
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)


    def __str__(self):
        return self.name
