# chat/consumers.py
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth import get_user_model
import json
from . models import Message


User = get_user_model()
class ChatConsumer(WebsocketConsumer):

    def fetch_messages(self,data):
        print('inside fetch')
        messages = Message.last_30_msgs()
        print('FETCH :',messages[:3])
        content = {
            'command':'messages',
            'messages': self.messages_to_json(messages)
        }
        self.send_message(content)

    def new_message(self, data):
        print('NEW MESSAGE')
        author = data['from']               
        message = Message.objects.create(
            author=author,
            content=data['message'])
        content={
            'command': 'new_message',
            'messages': self.message_to_json(message)
        }
        return self.send_chat_message(content)

    commands = {
        'fetch_messages': fetch_messages,
        'new_message': new_message,
    }

    def messages_to_json(self, messages):
        result = []
        for message in messages:
                result.append(self.message_to_json(message))
        return result

    def message_to_json(self, message):
        return{
            'id': message.id,
            'author': message.author,
            'content': message.content,
            'timestamp': str(message.timestamp)
        }

    def connect(self):
        print('WEBSOCKET IS CONNECTED CONSUMERS.PY 9')
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chatapp_%s' % self.room_name

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        print('WEBSOCKET IS DISCONNECTED CONSUMERS.PY ')
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        print("recieving messages from websocket consumers.py ")
        data = json.loads(text_data)
        print(text_data,'recieved data')
        self.commands[data['command']](self, data)

    def send_chat_message(self, message):
        # Send message to room group
        print('SENDING MESSAGES TO ROOM GROUP CONSUMERS.PY')
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )


    def send_message(self,message):
        print("the final for fetch : ",message)
        self.send(text_data = json.dumps(message))

    # Receive message from room group
    def chat_message(self, event):
        print("recieving messages from group consumers.py ")
        print('this is the data from backend after entering new message :',event['message'])
        command = event['message']['command']
        # Send message to WebSocket
        self.send(text_data=json.dumps(event['message']))