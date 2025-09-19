import './App.css'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Authentication from './pages/Authentication.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import VideoMeet from './pages/VideoMeet.jsx'
import Home from './pages/Home.jsx'
import History from './pages/History.jsx'

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path = "/" element = {<Landing />} />
            <Route path = "/auth" element = {<Authentication />} />
            <Route path='/home' element = {<Home />} />
            <Route path='/history' element = {<History />} />
            <Route path = "/:url" element = {<VideoMeet />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
