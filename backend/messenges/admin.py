from django.contrib import admin
from .models import EmailAccount, Message


admin.site.register(EmailAccount)
admin.site.register(Message)
