import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // ✅ Add Link import
import logo from "../assets/fd_logo.png";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = () => {
  const navigate = useNavigate(); // ✅ Move useNavigate inside component
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.status === "success") {
        alert("Login Successful 🚀");
        console.log(data.user);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #2c3e50, #4ca1af)",
      }}
    >
      <Card
        sx={{
          width: 400,
          p: 3,
          borderRadius: 3,
          boxShadow: 6,
        }}
      >
        <CardContent>
          {/* LOGO */}
          <Box display="flex" justifyContent="center" mb={2}>
            <Box
              component="img"
              src={logo}
              alt="Finance Doctor"
              sx={{
                width: "240px",
                height: "auto",
                p: 1,
                backgroundColor: "#fff",
              }}
            />
          </Box>

          {/* TITLE */}
          <Typography
            variant="h6"
            align="center"
            sx={{ fontWeight: 600 }}
          >
            Finance Doctor
          </Typography>

          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            mb={2}
          >
            Wealth Management
          </Typography>

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                py: 1.3,
                fontSize: "16px",
                borderRadius: 2,
                backgroundColor: "#2c3e50",
                "&:hover": {
                  backgroundColor: "#1a252f",
                },
              }}
            >
              Login
            </Button>
          </form>

          {/* ✅ Register Link - Moved outside the form but inside CardContent */}
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Link
                to="/register"  // ✅ Use 'to' instead of onClick with navigate
                style={{
                  textDecoration: "none",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                onMouseLeave={(e) => e.target.style.textDecoration = "none"}
              >
                Register here
              </Link>
            </Typography>
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;