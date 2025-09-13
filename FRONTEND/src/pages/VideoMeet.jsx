import * as React from "react"
import "../styles/VideoMeet.css"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"

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
        socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription()}))
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
            socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription()}))
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
            .then((desription) => {
              connections[fromId].setLocalDescription(description)
              .then(() => {
                socketIdRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }))
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
      socketRef.current.on("user-join", (id, clients) => {
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
    // connectToSocketServer()
  }

  let connect = () => {
    setAskForUsername(false)
    getMedia()
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
          <video ref={localVideoRef} autoPlay muted></video>
          {videos.map((video) => {
            <div key={video.socketId}></div>
          })}
        </>
      )}
    </div>
  );
}
