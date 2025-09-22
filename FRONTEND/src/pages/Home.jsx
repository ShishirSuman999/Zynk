import React from "react"
import withAuth from "../utils/WithAuth"
import { useNavigate } from "react-router-dom"
import "../App.css"
import IconButton from "@mui/material/IconButton"
import RestoreIcon from "@mui/icons-material/Restore"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"

export default function Home() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = React.useState("")

  const {addToUserHistory} = useContext(AuthContext)

  let handleJoinVideoCall = async () => {
    await addToUserHistory(meetingCode)
    navigate(`/${meetingCode}`)
  }

  return (
    <div>
      <div className="navBar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2>Zynk</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={() => navigate("/history")}>
            <RestoreIcon />
          </IconButton>
          <p>History</p>
          <Button
            onClick={() => {
              localStorage.removeItem("token")
              navigate("/auth")
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="meetContainer">
        <div className="leftPanel">
          <div>
            <h2>Connect and collaborate with anyone from anywhere with Zynk</h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <TextField onChange={(e) => setMeetingCode(e.target.value)} id="standard-basic" label="Meeting Code" variant="standard" />
              <Button onClick={handleJoinVideoCall} variant="contained">Join call</Button>
            </div>
          </div>
        </div>

        <div className="rightPanel">
          <img src="/public/logo.png" alt="" />
        </div>
      </div>
    </div>
  );
}
