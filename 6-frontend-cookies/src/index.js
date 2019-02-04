import ReactDOM from "react-dom"
import "./main.css"
import { connect, Provider } from "react-redux"
import { createStore } from "redux"
import React, { Component } from "react"

// 1. Upon successful login, instead of setting the session id in the store, place information in the  store to indicate that the user has successfully logged in
//    1. Update the reducer
// 1. Since there is no longer a session id in the store, you'll need to update your App component
// 2. You no longer need to send the session id in the request body of any of your fetches

class UnconnectedChat extends Component {
  constructor(props) {
    super(props)
    this.state = {
      message: ""
    }
    this.handleMessageChange = this.handleMessageChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  componentDidMount() {
    let updater = () => {
      fetch("http://localhost:4000/messages")
        .then(function(x) {
          return x.text()
        })
        .then(responseBody => {
          console.log("response from messages", responseBody)
          let parsed = JSON.parse(responseBody)
          console.log("parsed", parsed)
          this.props.dispatch({ type: "set-messages", messages: parsed })
        })
    }
    setInterval(updater, 500)
  }
  handleMessageChange(event) {
    console.log("new message", event.target.value)
    this.setState({ message: event.target.value })
  }
  handleSubmit(event) {
    event.preventDefault()
    console.log("form submitted")
    let b = JSON.stringify({
      msg: this.state.message,
      sessionId: this.props.sid
    })
    console.log("request body", b)
    fetch("http://localhost:4000/newmessage", {
      method: "POST",
      body: b,
      credentials: "include"
    })
  }
  render() {
    let msgToElement = function(e) {
      return (
        <li>
          {e.username}:{e.message}
        </li>
      )
    }
    let msgs = this.props.messages
    if (msgs === undefined) {
      msgs = []
    }
    return (
      <div>
        <ul>{msgs.map(msgToElement)}</ul>
        <form onSubmit={this.handleSubmit}>
          <input onChange={this.handleMessageChange} type="text" />
          <input type="submit" />
        </form>
      </div>
    )
  }
}

let Chat = connect(function(state) {
  return {
    sid: state.sessionId,
    messages: state.msgs
  }
})(UnconnectedChat)

// * Create a component for signing up
//    * Use fetch to send an HTTP request to the signup endpoint of the backend
//    * Test your component and read the output from the backend
class Signup extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: "",
      password: ""
    }
    this.handleUsernameChange = this.handleUsernameChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  handleUsernameChange(event) {
    console.log("new username", event.target.value)
    this.setState({ username: event.target.value })
  }
  handlePasswordChange(event) {
    console.log("new password", event.target.value)
    this.setState({ password: event.target.value })
  }
  handleSubmit(evt) {
    evt.preventDefault()
    console.log("signup form submitted")
    let b = JSON.stringify({
      username: this.state.username,
      password: this.state.password
    })
    console.log("what im sending to the server", b)
    fetch("http://localhost:4000/signup", { method: "POST", body: b })
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        Username
        <input type="text" onChange={this.handleUsernameChange} />
        Password
        <input type="text" onChange={this.handlePasswordChange} />
        <input type="submit" />
      </form>
    )
  }
}

// * Create a component for login
//    * In case you need it
//       * Form reference
//    * Connect it to the store so that it can dispatch to the reducer
//    * Upon successful login, update the store with the session id
//       * You'll need to modify the reducer
//    * Check in react developer tools that the session id is actually placed in the store
//    * Test your component and read the output from the backend

class UnconnectedLogin extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: "",
      password: ""
    }
    this.handleUsernameChange = this.handleUsernameChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  handleUsernameChange(event) {
    console.log("new username", event.target.value)
    this.setState({ username: event.target.value })
  }
  handlePasswordChange(event) {
    console.log("new password", event.target.value)
    this.setState({ password: event.target.value })
  }
  handleSubmit(evt) {
    evt.preventDefault()
    console.log("login form submitted")
    let b = JSON.stringify({
      username: this.state.username,
      password: this.state.password
    })
    console.log("what im sending to the server", b)
    fetch("http://localhost:4000/login", {
      method: "POST",
      body: b,
      credentials: "include"
    })
      .then(function(x) {
        return x.text()
      })
      .then(responseBody => {
        console.log("responseBody from login", responseBody)
        let body = JSON.parse(responseBody)
        console.log("parsed body", body)
        if (!body.success) {
          alert("login failed")
          return
        }
        this.props.dispatch({
          type: "login-success"
        })
      })
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        Username
        <input type="text" onChange={this.handleUsernameChange} />
        Password
        <input type="text" onChange={this.handlePasswordChange} />
        <input type="submit" />
      </form>
    )
  }
}

let Login = connect()(UnconnectedLogin)

// * Create a top level component. Let's assume you called it App
class UnconnectedApp extends Component {
  render() {
    if (this.props.lgin) {
      return <Chat />
    }
    return (
      <div>
        <h1> signup</h1>
        <Signup />
        <h1> login</h1>
        <Login />
      </div>
    )
  }
}

let App = connect(function(state) {
  return { lgin: state.loggedIn }
})(UnconnectedApp)

let reducer = function(state, action) {
  if (action.type === "login-success") {
    return { ...state, loggedIn: true }
  }
  if (action.type === "set-messages") {
    return { ...state, msgs: action.messages }
  }
  return state // Needed because react-redux calls your reducer with an @@init action
}

const store = createStore(
  reducer,
  {}, // initial state
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
)
