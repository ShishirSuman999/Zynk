import * as React from 'react'
import "../styles/VideoMeet.css"

const server_url = "http://localhost:3000"

var connections = {}

const peerConfigConnections = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302", },
  ],
}

export default function VideoMeet() {

  var socketRef = React.useRef()
  let socketIdRef = React.useRef()
  let localVideoRef = React.useRef()

  let [videoAvailable, setVideoAvailable] = React.useState(true)

  let [audioAvailable, setAudioAvailable] = React.useState(true)

  let [video, setVideo] = React.useState()

  let [audio, setAudio] = React.useState()

  let [screen, setScreen] = React.useState()

  let [showModal, setShowModal] = React.useState()

  let [screenAvailable, setScreenAvailable] = React.useState()

  let [messages, setMessages] = React.useState()

  let [message, setMessage] = React.useState("")

  let [newMessages, setNewMessages] = React.useState(0)

  let [askForUsername, setAskForUsername] = React.useState(true)

  let [userName, setUsername] = React.useState("")

  const videoRef = React.useRef([])

  let [videos, setVideos] = React.useState([])

  // TODO
  if (!isChrome()) {}

  return (
    <div>
      {askForUsername === true ? 
        <div>
          
        </div> : <></>
      }
    </div>
  )
}
