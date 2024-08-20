from django.db import models

SERVICES = (
    ('yandex', 'YANDEX'),
    ('mail.ru', 'MAIL.RU'),
    ('google', 'GOOGLE'),
)


class EmailAccount(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    service = models.CharField(max_length=10, choices=SERVICES)

    def __str__(self):
        return self.email


class Message(models.Model):
    account = models.ForeignKey(EmailAccount, on_delete=models.CASCADE, related_name='messages')
    subject = models.CharField(max_length=255)
    sent_date = models.DateTimeField()
    received_date = models.DateTimeField()
    text = models.TextField()
    files = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.subject} ({self.sent_date})"