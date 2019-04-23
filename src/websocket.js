class WebSocketService {
  static instance = null
  callbacks = {};

  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }
  constructor(){
    this.socketRef = null;
  }

  connect(){
    const path = 'ws://127.0.0.1:8000/ws/chatapp/google/';
    console.log('PATH :' +path);
    this.socketRef = new WebSocket(path);
    this.socketRef.onopen = () => { // this function calls when the socket is opened
      console.log("WebSocket open");
    };

    this.socketNewMessage(JSON.stringify({
      command:'fetch_messages'
    }))

    this.socketRef.onmessage = e => { // that is called when a message is received from the server
      console.log(e.data+' this is from onmessage');
      this.socketNewMessage(e.data);
    };
    this.socketRef.onerror = e => { // this is called when error
      console.log(e.message);
    };
    this.socketRef.onclose = () => { // this is called when it is closed
      console.log("WebSocket closed let's reopen");
      this.connect();
    };
  }

  socketNewMessage(data) {
    const parsedData = JSON.parse(data);
        
    const command = parsedData.command;
    if (Object.keys(this.callbacks).length === 0) {
      return;
    }
    if (command === "messages") {
      // console.log('this will call set message'); 
      this.callbacks[command](parsedData.messages);//this is calling the setmessages in app.js
        }
    if (command === "new_message") {
      console.log('new message');
      this.callbacks[command](parsedData.messages);
    }
  }

  fetchMessages(username) {
    this.sendMessage({
      command: "fetch_messages",
      username: username,
    });
  }

  newChatMessage(message) {
    this.sendMessage({
      command: "new_message",
      from: message.from,
      message: message.content,
    });
  }

  addCallbacks(messagesCallback, newMessageCallback) {
    console.log('addcallbacks are done :'+messagesCallback+ newMessageCallback)
    this.callbacks["messages"] = messagesCallback;
    this.callbacks["new_message"] = newMessageCallback;
  }



  sendMessage(data) {
    console.log("this is from Final send message"+JSON.stringify({ ...data }))
    try { 
      this.socketRef.send(JSON.stringify({ ...data }));
    } catch (err) {
      console.log(err.message);
    }
  }

  state() {
    return this.socketRef.readyState;
  }

  waitForSocketConnection(callback) {
    const socket = this.socketRef;
    const recursion = this.waitForSocketConnection;
    setTimeout(
      function () {
        console.log(socket.readyState);
        if (socket.readyState === 1) {
          console.log('Connection is secure');
          if (callback != null) {
            callback();
          }
          return;
        } else {
          console.log('waiting for connection...');
          recursion(callback);
        }
      }, 1);
  }


}

const WebSocketInstance = WebSocketService.getInstance();

export default WebSocketInstance;
