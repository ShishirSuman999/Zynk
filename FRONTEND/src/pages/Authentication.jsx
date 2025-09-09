import * as React from "react"
import Avatar from "@mui/material/Avatar"
import Button from "@mui/material/Button"
import CssBaseline from "@mui/material/CssBaseline"
import TextField from "@mui/material/TextField"
import Paper from "@mui/material/Paper"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import Typography from "@mui/material/Typography"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { AuthContext } from "../contexts/AuthContext.jsx"
import { Snackbar } from "@mui/material"

const defaultTheme = createTheme()

export default function Authentication() {
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [name, setName] = React.useState("")
  const [error, setError] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [formState, setFormState] = React.useState(0) // 0 = Sign In, 1 = Sign Up
  const [open, setOpen] = React.useState(false)

  const wallpapers = [
    "/wallpaper1.jpg",
    "/wallpaper2.jpg",
    "/wallpaper3.jpg",
    "/wallpaper4.jpg",
  ]
  const randomWallpaper =
    wallpapers[Math.floor(Math.random() * wallpapers.length)]

  const { handleRegister, handleLogin } = React.useContext(AuthContext)

  let handleAuth = async () => {
    try {
      if (formState === 0) {
        await handleLogin(username, password)
      } else {
        let result = await handleRegister(name, username, password)
        setUsername("")
        setPassword("")
        setMessage(result)
        setError("")
        setFormState(0)
        setOpen(true)
      }
    } catch (err) {
      let message = err?.response?.data?.message || "Something went wrong"
      setError(message)
    }
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        {/* Wallpaper on the right */}
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url("${randomWallpaper}")`,
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
            t.palette.mode === "light"
            ? t.palette.grey[50]
            : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}

        />
        {/* Card on the left */}
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "85%",
              maxWidth: 500, // 🔑 lock card width
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>

            {/* Toggle buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 2,
              }}
            >
              <Button
                sx={{ maxWidth: 120 }}
                variant={formState === 0 ? "contained" : "outlined"}
                onClick={() => setFormState(0)}
              >
                Sign In
              </Button>
              <Button
                sx={{ maxWidth: 200 }}
                variant={formState === 1 ? "contained" : "outlined"}
                onClick={() => setFormState(1)}
              >
                Sign Up
              </Button>
            </Box>

            {/* Form */}
            <Box component="form" noValidate sx={{ mt: 1, width: "100%" }}>
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="fullname"
                  label="Full Name"
                  name="fullname"
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                id="password"
              />

              {error && <Typography color="error">{error}</Typography>}

              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 2, mb: 2 }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Login" : "Register"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Snackbar open={open} autoHideDuration={4000} message={message} />
    </ThemeProvider>
  )
}
