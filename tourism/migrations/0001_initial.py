# Generated by Django 4.2.5 on 2023-09-23 16:32

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='tourism',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('theme', models.CharField(max_length=20)),
                ('name', models.CharField(max_length=200, unique=True)),
                ('address', models.CharField(max_length=200)),
                ('tel', models.CharField(max_length=20)),
                ('temp', models.IntegerField()),
                ('price', models.IntegerField()),
                ('latitude', models.FloatField(blank=True, null=True)),
                ('longitude', models.FloatField(blank=True, null=True)),
            ],
        ),
    ]
