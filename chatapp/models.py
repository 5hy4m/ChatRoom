from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Message(models.Model):
    author = models.TextField()
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.author

    def last_30_msgs():
        msgs =  Message.objects.order_by('-timestamp').all()[:30]
        return msgs