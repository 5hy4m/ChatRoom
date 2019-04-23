import React from 'react';
import WebSocketInstance from '../websocket';

var styles = {
  textAlign: 'center'
};

class App extends React.Component {

  componentDidMount() {
    var author = prompt("Please enter your name:");
    if (author != null){
    sessionStorage.setItem('author',author);
    console.log('now the author is '+sessionStorage.getItem('author'));  
    WebSocketInstance.connect();
    } else {
      author = prompt("Please enter your name:");
      this.componentDidMount()
    }   
  }


  constructor(props) {
    super(props)
    this.state = {}
    this.waitForSocketConnection(() => {
      WebSocketInstance.addCallbacks(
        this.setMessages.bind(this),
        this.addMessages.bind(this));
      WebSocketInstance.fetchMessages(this.props.currentUser);
    })
  }

  addMessages(message) {
    
    this.setState({
      messages: [...this.state.messages, message]
    });
  }

  setMessages(messages) {
    // console.log('speaking form setmessage');
    
    this.setState({ 
      messages: messages.reverse() 
    });
  }

  sendMessageHandler = e =>{
    e.preventDefault();
    var messageObject = {
      from: sessionStorage.getItem('author'),
      content: this.state.message
    }
    this.setState({
      message:''
    })
    WebSocketInstance.newChatMessage(messageObject);
    console.log('this is newChatMessage working fine');
    console.log(this.state.message+' this is must nothing here');
  }

  messageChangeHandler = event =>{
    console.log('the message handler is working');
    
    this.setState({
      message: event.target.value
    })
    
  }

  waitForSocketConnection(callback) {
    const component = this;
    setTimeout(
      function () {
        if (WebSocketInstance.state() === 1) {
          console.log('Connection is secure');
          callback();
          return;
        } else {
          console.log('waiting for connection...');
          component.waitForSocketConnection(callback);
        }
      }, 100);
  }

  renderMessages = (messages) => {
    const currentUser = sessionStorage.getItem('author');
    console.log(messages);
    
    return messages.map(message => (
      <div
        key={message.id}
        className={message.author === currentUser ? 'incomming_message' : 'recieved_message'}>
        <strong>{message.author}</strong>
        <p className={message.author === currentUser ? 'incomming_color' : 'recieved_color'}>
          {message.content}
          <br />
          <small>
            {Math.round((new Date().getTime() - new Date(message.timestamp).getTime())/60000)+" Minutes ago"}
          </small>
        </p>
      </div>
    ));
  }

  render() {
    const messages = this.state.messages;
    return (
      <div className="container ">
        <div className="jumbotron" id="jumbotron">
          
          <section>
            <header>
              <h1 style={styles}>Chatroom</h1>
              <hr />
            </header>
            <div className="overflow_messages">
              {messages && this.renderMessages(messages)}
            </div>



            
              <div className="footer">
              <form onSubmit={this.sendMessageHandler}>
                  <input 
                  onChange={this.messageChangeHandler}
                  value = {this.state.message}
                  type="text" 
                  placeholder="Enter the text here"  />
                  <button id = "event" className="submit">
                    <img src="send.png" alt="" id="send_button" />
                  </button>
            </form>
            </div>
          </section>

        </div>
      </div>
    );
  }
}

export default App;
