import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/fd_logo.png";
import {
  Box, Card, CardContent, Typography, Button,
  AppBar, Toolbar, Container, Chip, CircularProgress,
} from "@mui/material";
import Invested from "./Invested";
import Interested from "./Interested";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const OPTIONS_CONFIG = [
  {
    id: "empanelment",
    title: "EMPANELMENT",
    color: "#6C63FF",
    bgColor: "#F0EFFE",
    borderColor: "#6C63FF",
    description: "Manage and view all empaneled partners and associates.",
  },
  {
    id: "invested",
    title: "INVESTED",
    color: "#00A67E",
    bgColor: "#E6F9F4",
    borderColor: "#00A67E",
    description: "Track all customers who have invested in various products.",
  },
  {
    id: "interested",
    title: "INTERESTED",
    color: "#E67E22",
    bgColor: "#FEF5E8",
    borderColor: "#E67E22",
    description: "Follow up with potential customers showing interest.",
  },
];

function formatStats(id, data) {
  if (!data) return ["No data available"];
  if (id === "invested") {
    const crore = ((data.totalValue || 0) / 10000000).toFixed(1);
    return [
      `Total Customers: ${(data.total || 0).toLocaleString()}`,
      `This Month: ${data.thisMonth || 0}`,
      `Total Value: ₹${crore} Cr`,
    ];
  }
  if (id === "empanelment") {
    return [`Total Empaneled: ${(data.total || 0).toLocaleString()}`];
  }
  if (id === "interested") {
    return [`Total Leads: ${(data.total || 0).toLocaleString()}`];
  }
  return [];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState({});

  const handleLogout = () => { localStorage.removeItem("user"); navigate("/login"); };

  useEffect(() => {
    ["invested", "empanelment", "interested"].forEach(async (id) => {
      try {
        const res = await fetch(`${API}/stats/${id}`);
        const data = await res.json();
        setStats((prev) => ({ ...prev, [id]: data }));
      } catch {
        setStats((prev) => ({ ...prev, [id]: null }));
      }
    });
  }, []);

  const options = OPTIONS_CONFIG.map((opt) => ({
    ...opt,
    details: formatStats(opt.id, stats[opt.id]),
  }));

  const handleCardClick = (opt) => setSelected(opt.id);
  const active = options.find((o) => o.id === selected);

  const renderContent = () => {
    if (!active) return null;
    if (active.id === "invested")    return <Invested inline />;
    if (active.id === "interested")  return <Interested inline />;
    if (active.id === "empanelment") return <Empanelment inline />;
    return null;
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8F9FA", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes slideIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
      `}</style>

      {/* AppBar */}
      <AppBar position="static" elevation={0}
        sx={{ bgcolor: "#fff", borderBottom: "1px solid #E9ECEF", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <Toolbar sx={{ minHeight: { xs: "auto", sm: "64px" }, py: { xs: 1, sm: 0 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}>
            <Box component="img" src={logo} alt="Finance Doctor"
              sx={{ height: "45px", width: "auto", borderRadius: 1, p: 0.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#2C3E50" }}>Finance Doctor</Typography>
          </Box>
          <Button onClick={handleLogout} variant="outlined"
            sx={{ color: "#E67E22", borderColor: "#E67E22", textTransform: "none", fontWeight: 600,
              "&:hover": { borderColor: "#E67E22", bgcolor: "rgba(230,126,34,0.04)" } }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main */}
      <Container maxWidth="lg" sx={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        px: { xs: 2, sm: 3, md: 4 },
        pt: selected ? { xs: 2, sm: 3 } : { xs: 4, sm: 6 },
        pb: { xs: 4, sm: 6 },
      }}>

        {/* Welcome */}
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

        {/* Cards */}
        {!selected && (
          <Box sx={{
            display: "flex", justifyContent: "center", gap: 4,
            flexWrap: "wrap", width: "100%", animation: "fadeUp 0.5s ease 0.1s both",
          }}>
            {options.map((opt) => (
              <Card key={opt.id} onClick={() => handleCardClick(opt)}
                sx={{
                  width: 280, bgcolor: "#fff", borderRadius: 3,
                  border: `2px solid ${opt.borderColor}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease", cursor: "pointer",
                  "&:hover": { transform: "translateY(-8px)", boxShadow: `0 12px 28px ${opt.color}25` },
                }}>
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="h5"
                    sx={{ color: opt.color, fontWeight: 800, letterSpacing: 1, mb: 2 }}>
                    {opt.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6C757D", lineHeight: 1.7, mb: 2 }}>
                    {opt.description}
                  </Typography>
                  {stats[opt.id] === undefined ? (
                    <CircularProgress size={16} sx={{ color: opt.color, mb: 1 }} />
                  ) : (
                    <Box sx={{ mb: 2 }}>
                      {opt.details.map((line, i) => (
                        <Typography key={i} variant="caption"
                          sx={{ display: "block", color: opt.color, fontWeight: 600, lineHeight: 1.8 }}>
                          {line}
                        </Typography>
                      ))}
                    </Box>
                  )}
                  <Chip label="Click to view details" size="small"
                    sx={{ bgcolor: opt.bgColor, color: opt.color, fontWeight: 600 }} />
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Selected view */}
        {selected && (
          <Box sx={{ width: "100%", animation: "fadeUp 0.4s ease both" }}>

            {/* Sub-tabs */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: { xs: 1, sm: 2 }, flexWrap: "wrap", mb: 3 }}>
              {options.map((opt) => {
                const isActive = selected === opt.id;
                return (
                  <Box key={opt.id} onClick={() => setSelected(opt.id)}
                    sx={{
                      cursor: "pointer",
                      px: { xs: 2.5, sm: 4 }, py: { xs: 0.9, sm: 1.2 },
                      borderRadius: "50px",
                      border: `2px solid ${isActive ? opt.color : "#D0D5DD"}`,
                      bgcolor: isActive ? opt.color : "#fff",
                      color: isActive ? "#fff" : opt.color,
                      fontWeight: 700, fontSize: { xs: "0.78rem", sm: "0.88rem" }, letterSpacing: "0.06em",
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

            {/* Content — each section renders its own inline component */}
            <Box key={active?.id} sx={{ width: "100%", animation: "slideIn 0.38s cubic-bezier(0.34,1.2,0.64,1) both" }}>
              {renderContent()}
            </Box>

          </Box>
        )}
      </Container>

      <Box sx={{ textAlign: "center", py: 3, borderTop: "1px solid #E9ECEF", mt: "auto" }}>
        <Typography variant="body2" sx={{ color: "#6C757D" }}>
          © 2024 Finance Doctor Wealth Management System
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;