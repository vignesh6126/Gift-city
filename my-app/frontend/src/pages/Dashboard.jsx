import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Grid,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  LinearProgress,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// ── Icons (inline SVGs so no extra package needed) ──────────────────────────
const PanelIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity=".9" />
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);
const InvestIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor" opacity=".15" />
    <path d="M11 7h2v6h-2V7zm0 8h2v2h-2v-2z" fill="currentColor" />
    <path d="M7 14l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);
const InterestedIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" fill="currentColor" opacity=".9" />
    <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M18 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const TrendUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M22 7l-8.5 8.5-5-5L2 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 7h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6C63FF" },
    secondary: { main: "#00D4AA" },
    warning: { main: "#FF8C42" },
    background: { default: "#0D0F1A", paper: "#161929" },
    text: { primary: "#E8EAFF", secondary: "#8891B4" },
  },
  typography: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    h4: { fontWeight: 800, letterSpacing: "-0.5px" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
  },
});

// ── Mock Data ────────────────────────────────────────────────────────────────
const empanelmentData = {
  total: 284,
  active: 241,
  pending: 43,
  progress: 84,
  trend: "+12%",
  recent: [
    { name: "Rajesh Kumar", role: "Senior Broker", date: "Mar 24", avatar: "RK", status: "Active" },
    { name: "Priya Sharma", role: "Financial Advisor", date: "Mar 23", avatar: "PS", status: "Active" },
    { name: "Amit Patel", role: "Wealth Manager", date: "Mar 22", avatar: "AP", status: "Pending" },
    { name: "Sunita Reddy", role: "Investment Consultant", date: "Mar 21", avatar: "SR", status: "Active" },
    { name: "Vikram Singh", role: "Portfolio Manager", date: "Mar 20", avatar: "VS", status: "Pending" },
  ],
};

const investedData = {
  total: 1847,
  thisMonth: 142,
  totalValue: "₹48.6 Cr",
  trend: "+8.4%",
  progress: 71,
  recent: [
    { name: "Deepa Iyer", amount: "₹12,00,000", date: "Mar 24", avatar: "DI", type: "SIP" },
    { name: "Harish Nair", amount: "₹5,50,000", date: "Mar 23", avatar: "HN", type: "Lumpsum" },
    { name: "Kavita Joshi", amount: "₹8,25,000", date: "Mar 22", avatar: "KJ", type: "SIP" },
    { name: "Suresh Babu", amount: "₹3,75,000", date: "Mar 21", avatar: "SB", type: "Lumpsum" },
    { name: "Meera Pillai", amount: "₹15,00,000", date: "Mar 20", avatar: "MP", type: "SIP" },
  ],
};

const interestedData = {
  total: 532,
  hotLeads: 87,
  followUps: 145,
  trend: "+23%",
  progress: 58,
  recent: [
    { name: "Arjun Mehta", interest: "Mutual Funds", date: "Mar 25", avatar: "AM", priority: "Hot" },
    { name: "Lakshmi Devi", interest: "Fixed Deposits", date: "Mar 24", avatar: "LD", priority: "Warm" },
    { name: "Ravi Chandran", interest: "Equity Funds", date: "Mar 24", avatar: "RC", priority: "Hot" },
    { name: "Pooja Gupta", interest: "Insurance", date: "Mar 23", avatar: "PG", priority: "Warm" },
    { name: "Kiran Kumar", interest: "NPS Scheme", date: "Mar 23", avatar: "KK", priority: "Cold" },
  ],
};

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, icon, meta, trend, progress, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${alpha(color, hovered ? 0.5 : 0.18)}`,
        background: hovered
          ? `linear-gradient(135deg, ${alpha(color, 0.13)} 0%, ${alpha("#161929", 1)} 100%)`
          : `linear-gradient(135deg, ${alpha(color, 0.07)} 0%, #161929 100%)`,
        boxShadow: hovered ? `0 0 40px ${alpha(color, 0.22)}, 0 8px 32px rgba(0,0,0,0.4)` : "0 4px 24px rgba(0,0,0,0.3)",
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hovered ? "translateY(-6px) scale(1.015)" : "none",
        cursor: "pointer",
      }}
    >
      {/* Glow blob */}
      <Box
        sx={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(color, 0.25)} 0%, transparent 70%)`,
          transition: "opacity 0.35s",
          opacity: hovered ? 1 : 0.5,
        }}
      />

      <CardActionArea onClick={onClick} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3.5 }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: alpha(color, 0.9), fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontSize: "0.68rem" }}>
                {label}
              </Typography>
              <Typography variant="h4" sx={{ color: "#E8EAFF", mt: 0.5, lineHeight: 1 }}>
                {value}
              </Typography>
            </Box>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: alpha(color, 0.18),
                color: color,
                border: `1.5px solid ${alpha(color, 0.35)}`,
              }}
            >
              {icon}
            </Avatar>
          </Box>

          {/* Progress */}
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              mb: 2,
              height: 5,
              borderRadius: 3,
              bgcolor: alpha(color, 0.12),
              "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 3 },
            }}
          />

          {/* Footer */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {meta}
            </Typography>
            <Chip
              icon={<TrendUpIcon />}
              label={trend}
              size="small"
              sx={{
                bgcolor: alpha("#00D4AA", 0.15),
                color: "#00D4AA",
                fontSize: "0.7rem",
                fontWeight: 700,
                height: 24,
                "& .MuiChip-icon": { color: "#00D4AA", ml: 0.5 },
              }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

// ── Detail Dialog ────────────────────────────────────────────────────────────
function DetailDialog({ open, onClose, type }) {
  const configs = {
    empanelment: {
      title: "Empanelment Overview",
      color: "#6C63FF",
      data: empanelmentData,
      renderItem: (item) => (
        <>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: alpha("#6C63FF", 0.2), color: "#6C63FF", fontWeight: 700, fontSize: "0.8rem" }}>{item.avatar}</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={<Typography variant="body2" fontWeight={600}>{item.name}</Typography>}
            secondary={<Typography variant="caption" color="text.secondary">{item.role} · {item.date}</Typography>}
          />
          <Chip label={item.status} size="small"
            sx={{
              bgcolor: item.status === "Active" ? alpha("#00D4AA", 0.15) : alpha("#FF8C42", 0.15),
              color: item.status === "Active" ? "#00D4AA" : "#FF8C42",
              fontWeight: 700, fontSize: "0.65rem",
            }}
          />
        </>
      ),
      stats: [
        { label: "Total Empanelled", value: empanelmentData.total },
        { label: "Active", value: empanelmentData.active },
        { label: "Pending", value: empanelmentData.pending },
      ],
    },
    invested: {
      title: "Invested Customers",
      color: "#00D4AA",
      data: investedData,
      renderItem: (item) => (
        <>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: alpha("#00D4AA", 0.2), color: "#00D4AA", fontWeight: 700, fontSize: "0.8rem" }}>{item.avatar}</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={<Typography variant="body2" fontWeight={600}>{item.name}</Typography>}
            secondary={<Typography variant="caption" color="text.secondary">{item.type} · {item.date}</Typography>}
          />
          <Typography variant="body2" fontWeight={700} color="#00D4AA">{item.amount}</Typography>
        </>
      ),
      stats: [
        { label: "Total Customers", value: investedData.total },
        { label: "This Month", value: investedData.thisMonth },
        { label: "Total Value", value: investedData.totalValue },
      ],
    },
    interested: {
      title: "Interested Customers",
      color: "#FF8C42",
      data: interestedData,
      renderItem: (item) => (
        <>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: alpha("#FF8C42", 0.2), color: "#FF8C42", fontWeight: 700, fontSize: "0.8rem" }}>{item.avatar}</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={<Typography variant="body2" fontWeight={600}>{item.name}</Typography>}
            secondary={<Typography variant="caption" color="text.secondary">{item.interest} · {item.date}</Typography>}
          />
          <Chip label={item.priority} size="small"
            sx={{
              bgcolor: item.priority === "Hot" ? alpha("#FF4D4D", 0.15) : item.priority === "Warm" ? alpha("#FF8C42", 0.15) : alpha("#8891B4", 0.15),
              color: item.priority === "Hot" ? "#FF4D4D" : item.priority === "Warm" ? "#FF8C42" : "#8891B4",
              fontWeight: 700, fontSize: "0.65rem",
            }}
          />
        </>
      ),
      stats: [
        { label: "Total Leads", value: interestedData.total },
        { label: "Hot Leads", value: interestedData.hotLeads },
        { label: "Follow-ups", value: interestedData.followUps },
      ],
    },
  };

  if (!type || !configs[type]) return null;
  const cfg = configs[type];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#161929",
          backgroundImage: "none",
          border: `1px solid ${alpha(cfg.color, 0.25)}`,
          borderRadius: 3,
          boxShadow: `0 0 60px ${alpha(cfg.color, 0.15)}`,
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 4, height: 24, borderRadius: 2, bgcolor: cfg.color }} />
          <Typography variant="h6" fontWeight={700}>{cfg.title}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Mini stats */}
        <Grid container spacing={1.5} sx={{ mb: 2.5, mt: 0.5 }}>
          {cfg.stats.map((s) => (
            <Grid item xs={4} key={s.label}>
              <Box sx={{ textAlign: "center", p: 1.5, borderRadius: 2, bgcolor: alpha(cfg.color, 0.07), border: `1px solid ${alpha(cfg.color, 0.18)}` }}>
                <Typography variant="h6" fontWeight={800} color={cfg.color}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
          Recent Activity
        </Typography>

        <List disablePadding>
          {cfg.data.recent.map((item, i) => (
            <Box key={i}>
              <ListItem disablePadding sx={{ py: 1.2, display: "flex", alignItems: "center", gap: 1 }}>
                {cfg.renderItem(item)}
              </ListItem>
              {i < cfg.data.recent.length - 1 && <Divider sx={{ borderColor: alpha("#fff", 0.05) }} />}
            </Box>
          ))}
        </List>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="outlined" size="small" sx={{ borderColor: alpha(cfg.color, 0.4), color: cfg.color, "&:hover": { borderColor: cfg.color, bgcolor: alpha(cfg.color, 0.08) } }}>
          Close
        </Button>
        <Button variant="contained" size="small" sx={{ bgcolor: cfg.color, "&:hover": { bgcolor: alpha(cfg.color, 0.85) }, fontWeight: 700 }}>
          View All
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [dialog, setDialog] = useState(null);
  
  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const cards = [
    {
      id: "empanelment",
      label: "Empanelment",
      value: "284",
      color: "#6C63FF",
      icon: <PanelIcon />,
      meta: "241 active · 43 pending",
      trend: "+12%",
      progress: 84,
    },
    {
      id: "invested",
      label: "Customers Invested",
      value: "1,847",
      color: "#00D4AA",
      icon: <InvestIcon />,
      meta: "₹48.6 Cr total value",
      trend: "+8.4%",
      progress: 71,
    },
    {
      id: "interested",
      label: "Interested Customers",
      value: "532",
      color: "#FF8C42",
      icon: <InterestedIcon />,
      meta: "87 hot leads · 145 follow-ups",
      trend: "+23%",
      progress: 58,
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Background */}
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          background: "radial-gradient(ellipse at 20% 20%, rgba(108,99,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(0,212,170,0.06) 0%, transparent 50%), #0D0F1A",
        }}
      >
        {/* AppBar with Logout */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: "transparent", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}>
          <Toolbar>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, background: "linear-gradient(135deg, #6C63FF, #00D4AA)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="caption" fontWeight={900} color="#fff">FD</Typography>
              </Box>
              <Typography variant="h6" fontWeight={800} sx={{ background: "linear-gradient(90deg, #E8EAFF, #8891B4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                FinDash Pro
              </Typography>
            </Box>
            
            {/* Logout Button */}
            <Button 
              onClick={handleLogout}
              variant="outlined" 
              size="small"
              sx={{ 
                color: "#FF8C42", 
                borderColor: "rgba(255, 140, 66, 0.3)",
                mr: 1,
                "&:hover": { 
                  borderColor: "#FF8C42",
                  bgcolor: "rgba(255, 140, 66, 0.1)"
                }
              }}
            >
              Logout
            </Button>
            
            <Chip 
              label="Live" 
              size="small" 
              sx={{ 
                bgcolor: alpha("#00D4AA", 0.15), 
                color: "#00D4AA", 
                fontWeight: 700, 
                "& .MuiChip-label": { px: 1.5 } 
              }}
              icon={
                <Box sx={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: "50%", 
                  bgcolor: "#00D4AA", 
                  animation: "pulse 1.5s infinite", 
                  "@keyframes pulse": { 
                    "0%,100%": { opacity: 1 }, 
                    "50%": { opacity: 0.4 } 
                  } 
                }} />
              }
            />
          </Toolbar>
        </AppBar>

        {/* Content */}
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
          {/* Header with Welcome Message */}
          <Box sx={{ mb: 4, mt: 1 }}>
            <Typography variant="h4" sx={{ background: "linear-gradient(90deg, #E8EAFF 60%, #6C63FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", mb: 0.5 }}>
              Welcome back, {user.name || "User"}! 👋
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Operations Dashboard · Click on any card to explore detailed insights · Last updated March 25, 2026
            </Typography>
          </Box>

          {/* Cards */}
          <Grid container spacing={3}>
            {cards.map((card) => (
              <Grid item xs={12} md={4} key={card.id}>
                <StatCard {...card} onClick={() => setDialog(card.id)} />
              </Grid>
            ))}
          </Grid>

          {/* Footer hint */}
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.5 }}>
              Click any card to view detailed records and recent activity
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Dialog */}
      <DetailDialog open={!!dialog} onClose={() => setDialog(null)} type={dialog} />
    </ThemeProvider>
  );
}