import * as React from "react"
import { io } from "socket.io-client"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import VideocamIcon from "@mui/icons-material/Videocam"
import VideocamOffIcon from "@mui/icons-material/VideocamOff"
import MicIcon from "@mui/icons-material/Mic"
import MicOffIcon from "@mui/icons-material/MicOff"
import ScreenShareIcon from "@mui/icons-material/ScreenShare"
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare"
import SendIcon from "@mui/icons-material/Send"
import CallEndIcon from "@mui/icons-material/CallEnd"
import Badge from "@mui/material/Badge"
import ChatIcon from "@mui/icons-material/Chat"
import styles from "../styles/VideoMeet.module.css"

const server_url = "http://localhost:3000"

var connections = {}

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
}

export default function VideoMeet() {
  var socketRef = React.useRef()
  let socketIdRef = React.useRef()
  let localVideoRef = React.useRef()

  let [videoAvailable, setVideoAvailable] = React.useState(true)

  let [audioAvailable, setAudioAvailable] = React.useState(true)

  let [video, setVideo] = React.useState([])

  let [audio, setAudio] = React.useState()

  let [screen, setScreen] = React.useState()

  let [showModal, setShowModal] = React.useState(true)

  let [screenAvailable, setScreenAvailable] = React.useState()

  let [messages, setMessages] = React.useState()

  let [message, setMessage] = React.useState("")

  let [newMessages, setNewMessages] = React.useState(3)

  let [askForUsername, setAskForUsername] = React.useState(true)

  let [userName, setUsername] = React.useState("")

  const videoRef = React.useRef([])

  let [videos, setVideos] = React.useState([])

  // TODO
  // if (!isChrome()) {}

  const getPermissions = async () => {
    try {
      const videoPermissions = await navigator.mediaDevices.getUserMedia({
        video: true,
      })
      if (videoPermissions) setVideoAvailable(true)
      else setVideoAvailable(false)

      const audioPermissions = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
      if (audioPermissions) setAudioAvailable(true)
      else setAudioAvailable(false)

      if (navigator.mediaDevices.getDisplayMedia) setScreenAvailable(true)
      else setScreenAvailable(false)

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current)
            localVideoRef.current.srcObject = userMediaStream;
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  React.useEffect(() => {
    getPermissions()
  }, [])

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop())
    } catch (error) {
      console.log(error)
    }
    window.localStream = stream
    if (localVideoRef.current) localVideoRef.current.srcObject = stream

    for (let id in connections) {
      if (id === socketIdRef.current) continue
      connections[id].addStream(window.localStream)
      connections[id].createOffer()
      .then((description) => {
        connections[id].setLocalDescription(description)
        socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
      }).catch(e => console.log(e))
    }
    stream.getTracks().forEach(track => track.onended = () => {
      setVideo(false)
      setAudio(false)
      try {
        let tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      } catch (error) {
        console.log(error)
      }

      // TODO BlackSilence
      let blackSilence = (...args) => new MediaStream([black(...args), silence()])
      window.localStream = blackSilence()
      localVideoRef.current.srcObject = window.localStream

      for (let id in connections) {
        connections[id].addStream(window.localStream)
        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
          }).catch(e => console.log(e))
        })
      }
    })
  }

  let silence = () => {
    let ctx = new AudioContext()
    let oscillator = ctx.createOscillator()
    let dst = oscillator.connect(ctx.createMediaStreamDestination())
    oscillator.start()
    ctx.resume()
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
  }

  let black = ({width = 640, height = 480} = {}) => {
    let canvas = Object.assign(document.createElement('canvas'), {width, height})
    canvas.getContext('2d').fillRect(0, 0, width, height)
    let stream = canvas.captureStream()
    return Object.assign(stream.getVideoTracks()[0], { enabled: false })
  }

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (error) {}
    }
  }

  React.useEffect(() => {
    if (video !== undefined && audio !== undefined) getUserMedia()
  }, [video, audio])

  // TODO
  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message)
    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (signal.sdp.type === "offer") {
            connections[fromId].createAnswer()
            .then((description) => {
              connections[fromId].setLocalDescription(description)
              .then(() => {
                socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }))
              }).catch(err => console.log(err))
            }).catch(err => console.log(err))
          }
        }).catch(err => console.log(err))
      }
      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
      }
    }
  }

  // TODO addMessage
  let addMessage = () => {}

  let connectToSocketServer = () => {
    socketRef.current = io(server_url, { secure: false })
    socketRef.current.on("signal", gotMessageFromServer)
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href)
      socketIdRef.current = socketRef.current.id
      socketRef.current.on("chat-message", addMessage)
      socketRef.current.on("user-left", (id) => {
        setVideo((videos) => videos.filter((video) => video.socketId !== id))
      })
      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          )
          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate !== null)
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              )
          }
          connections[socketListId].onaddstream = (event) => {
            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId
            )
            if (videoExists) {
              setVideos((videos) => {
                const updateVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video
                );
                videoRef.current = updateVideos
                return updateVideos
              })
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                playsinline: true,
              }
              setVideos((videos) => {
                const updateVideos = [...videos, newVideo]
                videoRef.current = updateVideos
                return updateVideos
              })
            }
          }

          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream)
          } else {
            // TODO blackSilence
            // let blackSilence
            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            connections[socketListId].addStream(window.localStream)
          }
        })
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue
            try {
              connections[id2].addStream(window.localStream)
            } catch (error) {}
            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description)
              .then(() => {
                socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }))
              })
              .catch(err => console.log(err))
            })
          }
        }
      })
    })
  }

  let getMedia = () => {
    setVideo(videoAvailable)
    setAudio(audioAvailable)
    connectToSocketServer()
  }

  let connect = () => {
    setAskForUsername(false)
    getMedia()
  }

  let handleVideo = () => {
    setVideo(!video)
  }

  let handleAudio = () => {
    setAudio(!audio)
  }

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop())
    } catch (error) {
      console.log(error)
    }
    window.localStream = stream
    localVideoRef.current.srcObject = stream
    for (let id in connections) {
      if (id === socketIdRef.current) continue
      connections[id].addStream(window.localStream)
      connections[id].createOffer()
      .then((description) => {
        connections[id].setLocalDescription(description)
        socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
      })
      .catch(err => console.log(err))
    }
    stream.getTracks().forEach(track => track.onended = () => {
      setScreen(false)
      try {
        let tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      } catch (error) {
        console.log(error)
      }
      let blackSilence = (...args) => new MediaStream([black(...args), silence()])
      window.localStream = blackSilence()
      localVideoRef.current.srcObject = window.localStream

      getUserMedia()
    })
  }

  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        .then(getDisplayMediaSuccess)
        .then((stream) => {
        })
        .catch(err => console.log(err))
      }
    }
  }

  React.useEffect(() => {
    if (screen !== undefined) getDisplayMedia()
  }, [screen])

  let handleScreen = () => {
    setScreen(!screen)
  }

  let sendMessage = () => {
    
  }

  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2>Enter into Lobby</h2>
          <TextField id="standard-basic" label="Username" value={userName} variant="standard" onChange={(e) => setUsername(e.target.value)} />
          <Button variant="contained" onClick={connect}>
            Connect
          </Button>
          <div>
            <video ref={localVideoRef} autoPlay muted></video>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.meetVideoContainer}>
            {showModal ? <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Chat</h1>
                <div className={styles.chattingArea}>
                  <TextField id="standard-basic" label="Enter your Chat" variant="standard" onClick={sendMessage} />
                  <Button variant="contained">Send</Button>
                </div>
              </div>
            </div> : 
            <></>}
            <div className={styles.buttonContainers}>
              <IconButton onClick={handleVideo} style={{ color: "white" }}>
                {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
              <IconButton style={{ color: "red" }}>
                <CallEndIcon />
              </IconButton>
              <IconButton onClick={handleAudio} style={{ color: "white" }}>
                {(audio === true) ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
              {(screenAvailable === true) ? 
                <IconButton onClick={handleScreen} style={{ color: "white" }}>
                  {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                </IconButton> : <></>
              }
              <Badge badgeContent={newMessages} max={99} color="primary">
                <IconButton onClick={() => setShowModal(!showModal)} style={{color: "white"}}>
                  <ChatIcon />
                </IconButton>
              </Badge>
            </div>
            <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video>
            <div className={styles.conferenceView}>
              {videos.map((video) => (
                <div key={video.socketId}>
                  <video data-socket={video.socketId} ref={ref => {
                    if (ref && video.stream) ref.srcObject = video.stream
                  }} autoPlay></video>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
