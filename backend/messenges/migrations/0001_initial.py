# Generated by Django 5.1 on 2024-08-20 12:07

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='EmailAccount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('password', models.CharField(max_length=128)),
                ('service', models.CharField(choices=[('yandex', 'YANDEX'), ('mail.ru', 'MAIL.RU'), ('google', 'GOOGLE')], max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('subject', models.CharField(max_length=255)),
                ('sent_date', models.DateTimeField()),
                ('received_date', models.DateTimeField()),
                ('text', models.TextField()),
                ('files', models.JSONField(blank=True, default=list)),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='messenges.emailaccount')),
            ],
        ),
    ]
