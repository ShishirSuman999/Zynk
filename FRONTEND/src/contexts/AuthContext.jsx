import axios from "axios"
import { createContext, useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import httpStatus from "http-status"

export const AuthContext = createContext({})
export default AuthContext

const client = axios.create({
  baseURL: "http://localhost:3000/api/v1/users",
})

export const AuthProvider = ({ children }) => {
  const authContext = useContext(AuthContext)

  const [userData, setUserData] = useState(authContext)

  const router = useNavigate()

  const handleRegister = async (name, username, password) => {
    try {
      let request = await client.post("/register", {
        name: name,
        username: username,
        password: password,
      })

      if (request.status === httpStatus.CREATED) return request.data.message
    } catch (err) {
      throw err
    }
  }

  const handleLogin = async (username, password) => {
    try {
      let request = await client.post("/login", {
        username: username,
        password: password,
      })

      if (request.status === httpStatus.OK) {
        localStorage.setItem("token", request.data.token)
      }
    } catch (err) {
      throw err
    }
  }

  let getUserHistory = async () => {
    try {
      let request = await client.get("/get_all_activity", {
        params: {
          token: localStorage.getItem("token"),
        },
      })
      return request.data
    } catch (error) {
      throw error
    }
  }

  const addToUserHistory = async (meetingCode) => {
    try {
      let request = await client.post("/add_to_activity", {
        token: localStorage.getItem("token"),
        meeting_code: meetingCode,
      })
      return request.status
    } catch (error) {
      throw error
    }
  }

  const data = {
    userData, setUserData, handleRegister, handleLogin, getUserHistory, addToUserHistory
  }

  return (
    <AuthContext.Provider value={data}>
      {children}
    </AuthContext.Provider>
  )
}
