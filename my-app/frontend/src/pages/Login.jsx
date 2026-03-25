import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Add error state

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError(""); // Clear previous errors

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
        // ✅ Store user data
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // ✅ Directly navigate to dashboard WITHOUT alert
        navigate("/dashboard");
      } else {
        // Show error message for failed login
        setError(data.message);
      }
    } catch (error) {
      console.error(error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "98vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
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

          {/* Error Message */}
          {error && (
            <Typography
              color="error"
              variant="body2"
              align="center"
              sx={{ mb: 2, mt: 1 }}
            >
              {error}
            </Typography>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              error={!!error}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              error={!!error}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
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
              disabled={loading}
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
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;