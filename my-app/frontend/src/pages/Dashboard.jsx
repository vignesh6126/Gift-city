import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/fd_logo.png";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Container,
  Chip,
} from "@mui/material";

const options = [
  {
    id: "empanelment",
    title: "EMPANELMENT",
    color: "#6C63FF",
    bgColor: "#F0EFFE",
    borderColor: "#6C63FF",
    description: "Manage and view all empaneled partners and associates.",
    details: ["Total Empaneled: 284", "Active Partners: 241", "Pending Approvals: 43"],
  },
  {
    id: "invested",
    title: "INVESTED",
    color: "#00A67E",
    bgColor: "#E6F9F4",
    borderColor: "#00A67E",
    description: "Track all customers who have invested in various products.",
    details: ["Total Customers: 1,847", "This Month: 142", "Total Value: ₹48.6 Cr"],
  },
  {
    id: "interested",
    title: "INTERESTED",
    color: "#E67E22",
    bgColor: "#FEF5E8",
    borderColor: "#E67E22",
    description: "Follow up with potential customers showing interest.",
    details: ["Total Leads: 532", "Hot Leads: 87", "Follow-ups Due: 145"],
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [selected, setSelected] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const active = options.find((o) => o.id === selected);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8F9FA", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>

      {/* ── Header ── */}
      <AppBar position="static" elevation={0}
        sx={{ bgcolor: "#fff", borderBottom: "1px solid #E9ECEF", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <Toolbar sx={{ minHeight: { xs: "auto", sm: "64px" }, py: { xs: 1, sm: 0 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}>
            <Box component="img" src={logo} alt="Finance Doctor"
              sx={{ height: "45px", width: "auto", borderRadius: 1, p: 0.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#2C3E50" }}>
              Finance Doctor
            </Typography>
          </Box>
          <Button onClick={handleLogout} variant="outlined"
            sx={{ color: "#E67E22", borderColor: "#E67E22", textTransform: "none", fontWeight: 600,
              "&:hover": { borderColor: "#E67E22", bgcolor: "rgba(230,126,34,0.04)" } }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* ── Main ── */}
      <Container maxWidth="lg" sx={{ flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", px: { xs: 2, sm: 3, md: 4 },
          pt: selected ? { xs: 2, sm: 3 } : { xs: 4, sm: 6 },
          pb: { xs: 4, sm: 6 } }}>

        {/* Welcome — hidden once a section is selected */}
        {!selected && (
          <Box sx={{ textAlign: "center", mb: 6, animation: "fadeUp 0.5s ease both" }}>
            <Typography variant="h4"
              sx={{ color: "#2C3E50", fontWeight: 700, mb: 0.5, fontSize: { xs: "1.75rem", sm: "2rem" } }}>
              Welcome back, {user.name || "User"}! 👋
            </Typography>
            <Typography variant="body1" sx={{ color: "#6C757D" }}>
              Select an option to view details
            </Typography>
          </Box>
        )}

        {/* ── CARD VIEW (no selection) ── */}
        {!selected && (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 4,
              flexWrap: "wrap", width: "100%",
              animation: "fadeUp 0.5s ease 0.1s both" }}>
            {options.map((opt) => (
              <Card key={opt.id} onClick={() => setSelected(opt.id)}
                sx={{ width: 280, bgcolor: "#fff", borderRadius: 3,
                  border: `2px solid ${opt.borderColor}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease", cursor: "pointer",
                  "&:hover": { transform: "translateY(-8px)",
                    boxShadow: `0 12px 28px ${opt.color}25` } }}>
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="h5"
                    sx={{ color: opt.color, fontWeight: 800, letterSpacing: 1, mb: 2 }}>
                    {opt.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6C757D", lineHeight: 1.7, mb: 2 }}>
                    {opt.description}
                  </Typography>
                  <Chip label="Click to view details" size="small"
                    sx={{ bgcolor: opt.bgColor, color: opt.color, fontWeight: 600 }} />
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* ── TAB + CONTENT VIEW (after selection) ── */}
        {selected && (
          <Box sx={{ width: "100%", animation: "fadeUp 0.4s ease both" }}>

            {/* Top Tab Row — compact, close to top */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: { xs: 1, sm: 2 },
                flexWrap: "wrap", mb: 3 }}>
              {options.map((opt) => {
                const isActive = selected === opt.id;
                return (
                  <Box key={opt.id} onClick={() => setSelected(opt.id)}
                    sx={{ cursor: "pointer",
                      px: { xs: 2.5, sm: 4 }, py: { xs: 0.9, sm: 1.2 },
                      borderRadius: "50px",
                      border: `2px solid ${isActive ? opt.color : "#D0D5DD"}`,
                      bgcolor: isActive ? opt.color : "#fff",
                      color: isActive ? "#fff" : opt.color,
                      fontWeight: 700,
                      fontSize: { xs: "0.78rem", sm: "0.88rem" },
                      letterSpacing: "0.06em",
                      transition: "all 0.3s cubic-bezier(0.34,1.4,0.64,1)",
                      boxShadow: isActive ? `0 3px 10px ${opt.color}44` : "0 1px 3px rgba(0,0,0,0.07)",
                      userSelect: "none",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: `0 5px 14px ${opt.color}33`,
                        borderColor: opt.color,
                        bgcolor: isActive ? opt.color : opt.bgColor,
                      },
                    }}>
                    {opt.title}
                  </Box>
                );
              })}
            </Box>

            {/* Content Panel */}
            {active && (
              <Box key={active.id}
                sx={{ width: "100%", maxWidth: 820, mx: "auto",
                  bgcolor: "#fff", borderRadius: 4,
                  border: `2px solid ${active.borderColor}`,
                  boxShadow: `0 6px 32px ${active.color}18`,
                  overflow: "hidden",
                  animation: "slideIn 0.38s cubic-bezier(0.34,1.2,0.64,1) both" }}>

                {/* Coloured header band */}
                <Box sx={{ bgcolor: active.bgColor, px: 4, py: 2.5,
                    borderBottom: `1px solid ${active.borderColor}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h5"
                    sx={{ color: active.color, fontWeight: 800, letterSpacing: 1 }}>
                    {active.title}
                  </Typography>
                  <Button onClick={() => setSelected(null)} variant="outlined" size="small"
                    sx={{ color: active.color, borderColor: active.color,
                      textTransform: "none", fontWeight: 600, borderRadius: "20px",
                      "&:hover": { bgcolor: `${active.color}12`, borderColor: active.color } }}>
                    ← Back to Dashboard
                  </Button>
                </Box>

                <CardContent sx={{ p: 4 }}>
                  <Typography variant="body1"
                    sx={{ color: "#495057", fontSize: "1.05rem", lineHeight: 1.7, mb: 3 }}>
                    {active.description}
                  </Typography>

                  {/* Key Metrics */}
                  <Box sx={{ bgcolor: active.bgColor, p: 3, borderRadius: 2 }}>
                    <Typography variant="subtitle2"
                      sx={{ color: active.color, fontWeight: 700, mb: 2,
                        textTransform: "uppercase", letterSpacing: 1 }}>
                      Key Metrics
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {active.details.map((line, i) => (
                        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: active.color, flexShrink: 0 }} />
                          <Typography variant="body1" sx={{ color: "#2C3E50", fontWeight: 500 }}>
                            {line}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
                    <Button variant="contained"
                      sx={{ bgcolor: active.color, textTransform: "none", borderRadius: "8px",
                        boxShadow: `0 4px 12px ${active.color}44`,
                        "&:hover": { bgcolor: active.color, opacity: 0.9 } }}>
                      View All {active.title.charAt(0) + active.title.slice(1).toLowerCase()}
                    </Button>
                    <Button variant="outlined" onClick={() => setSelected(null)}
                      sx={{ borderColor: active.color, color: active.color,
                        textTransform: "none", borderRadius: "8px",
                        "&:hover": { bgcolor: active.bgColor } }}>
                      Back
                    </Button>
                  </Box>
                </CardContent>
              </Box>
            )}
          </Box>
        )}
      </Container>

      {/* Footer */}
      <Box sx={{ textAlign: "center", py: 3, borderTop: "1px solid #E9ECEF", mt: "auto" }}>
        <Typography variant="body2" sx={{ color: "#6C757D" }}>
          © 2024 Finance Doctor Wealth Management System
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;