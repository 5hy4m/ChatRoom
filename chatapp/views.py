# chat/views.py
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.utils.safestring import mark_safe
import json
from django.core import serializers
from django.http import JsonResponse
from chatapp.serializing import LazyEncoder

def index(request):
    return render(request, 'chat/index.html', {})


def room(request, room_name):
    print(mark_safe(json.dumps(room_name)))
    return render(request, 'chat/room.html',{
        'room_name_json': mark_safe(json.dumps(room_name)),
        'username': mark_safe(json.dumps(request.user.username)),
    })
