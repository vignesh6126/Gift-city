import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/image.png";
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Snackbar, Alert, Drawer, useMediaQuery,
} from "@mui/material";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Invested from "./Invested";
import Interested from "./Interested";
import Empanelment from "./Empanelment";
import GiftCity from "./GiftCity";

const API = import.meta.env.VITE_API_URL;

// ── Theme ─────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#080B1A", paper: "#0D1330" },
    text: { primary: "#E8EEFF", secondary: "#8B9CC8" },
  },
  typography: { fontFamily: "'Outfit', 'Segoe UI', sans-serif" },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
});

// ── Colors ────────────────────────────────────────────────────────────────────
const COLORS = {
  empanelment: { main: "#6C8FFF", glow: "#6C8FFF44", bg: "rgba(108,143,255,0.08)", border: "rgba(108,143,255,0.25)" },
  invested:    { main: "#4ECDC4", glow: "#4ECDC444", bg: "rgba(78,205,196,0.08)",   border: "rgba(78,205,196,0.25)" },
  interested:  { main: "#F5A623", glow: "#F5A62344", bg: "rgba(245,166,35,0.08)",   border: "rgba(245,166,35,0.25)" },
  giftcity:    { main: "#FF6B9D", glow: "#FF6B9D44", bg: "rgba(255,107,157,0.08)",  border: "rgba(255,107,157,0.25)" },
};

const NAV_ITEMS = [
  { id: null,          label: "Dashboard",     icon: "⊞" },
  { id: "empanelment", label: "Empanelment",   icon: "✓" },
  { id: "invested",    label: "Clients",        icon: "👤" },
  { id: "interested",  label: "Prospects",      icon: "◎" },
  { id: "giftcity",    label: "Gift City A/C",  icon: "🎁" },
];

const STAT_CARDS = [
  { key: "empanelment_done",     label: "Empanelment Done",     section: "empanelment", color: COLORS.empanelment },
  { key: "customers_onboarding", label: "Customers Onboarding", section: "invested",    color: COLORS.invested    },
  { key: "gift_city_ac_active",  label: "Gift City A/C",        section: "giftcity",    color: COLORS.interested  },
  { key: "prospects",            label: "Prospects",             section: "interested",  color: COLORS.giftcity    },
];

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const EditIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const DeleteIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const DownloadIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const MoveIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2"/><circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="2"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="2"/></svg>;
const SearchIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const MenuIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const LogoutIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ config, data, loading, onClick }) {
  const c = config.color;
  const completed = data?.completed ?? 0;
  const total     = data?.total     ?? 0;
  const extra     = data?.extra     ?? null;

  return (
    <Box onClick={onClick} sx={{
      flex: { xs: "1 1 calc(50% - 8px)", sm: "1 1 calc(50% - 8px)", md: 1 },
      minWidth: { xs: "calc(50% - 8px)", sm: 160, md: 160 },
      maxWidth: { xs: "calc(50% - 8px)", md: "none" },
      cursor: "pointer",
      background: `linear-gradient(135deg, ${c.bg}, rgba(13,19,48,0.6))`,
      border: `1px solid ${c.border}`,
      borderRadius: "16px",
      p: { xs: 1.5, sm: 2, md: 2.5 },
      backdropFilter: "blur(12px)",
      transition: "all 0.3s ease",
      position: "relative", overflow: "hidden",
      "&:hover": { transform: "translateY(-4px)", boxShadow: `0 12px 32px ${c.glow}`, borderColor: c.main },
      "&::before": {
        content: '""', position: "absolute", top: -40, right: -40,
        width: 100, height: 100, borderRadius: "50%",
        background: `radial-gradient(circle, ${c.main}22, transparent 70%)`,
      },
    }}>
      <Typography sx={{ fontSize: { xs: "0.62rem", sm: "0.68rem", md: "0.72rem" }, fontWeight: 700, color: c.main, letterSpacing: "0.08em", textTransform: "uppercase", mb: 1 }}>
        {config.label}
      </Typography>
      {loading ? (
        <CircularProgress size={20} sx={{ color: c.main }} />
      ) : (
        <>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mb: 0.5, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" }, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.03em" }}>
              {completed}
            </Typography>
            <Typography sx={{ fontSize: { xs: "0.85rem", md: "1rem" }, color: c.main, fontWeight: 700 }}>
              / {total}
            </Typography>
          </Box>
          {extra && (
            <Typography sx={{ fontSize: { xs: "0.62rem", md: "0.72rem" }, color: "rgba(255,255,255,0.45)", mt: 0.5 }}>
              {extra}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}

// ── Overview Table ────────────────────────────────────────────────────────────
function OverviewTable({ rows, cols, color, onEdit, onDelete, onPromote, showPromote, loading, title }) {
  const c = color;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // On mobile, show fewer columns
  const visibleCols = isMobile ? cols.slice(0, 2) : cols;

  return (
    <Box sx={{
      background: "linear-gradient(135deg, rgba(13,19,48,0.9), rgba(8,11,26,0.95))",
      border: `1px solid ${c.border}`,
      borderRadius: "16px", overflow: "hidden",
    }}>
      <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 1.5, md: 2 }, borderBottom: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
        <Typography sx={{ fontWeight: 700, color: c.main, fontSize: { xs: "0.75rem", md: "0.9rem" }, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {title}
        </Typography>
        <Chip label={`${rows.length} records`} size="small"
          sx={{ bgcolor: c.bg, color: c.main, fontWeight: 700, fontSize: "0.68rem", border: `1px solid ${c.border}` }} />
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: c.main }} />
        </Box>
      ) : (
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: { xs: 0, sm: 400 } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "rgba(255,255,255,0.35)", fontSize: { xs: "0.6rem", md: "0.7rem" }, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: `1px solid ${c.border}`, py: { xs: 1, md: 1.5 }, px: { xs: 1, md: 2 } }}>#</TableCell>
                {visibleCols.map(col => (
                  <TableCell key={col.key} sx={{ color: "rgba(255,255,255,0.35)", fontSize: { xs: "0.6rem", md: "0.7rem" }, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: `1px solid ${c.border}`, py: { xs: 1, md: 1.5 }, px: { xs: 1, md: 2 } }}>
                    {col.label}
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ color: "rgba(255,255,255,0.35)", fontSize: { xs: "0.6rem", md: "0.7rem" }, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: `1px solid ${c.border}`, py: { xs: 1, md: 1.5 }, px: { xs: 1, md: 2 } }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleCols.length + 2} align="center"
                    sx={{ py: 5, color: "rgba(255,255,255,0.25)", fontStyle: "italic", borderBottom: "none", fontSize: "0.85rem" }}>
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                rows.slice(0, 5).map((row, idx) => (
                  <TableRow key={row.id} sx={{
                    "&:hover": { bgcolor: `${c.main}08` },
                    "&:last-child td": { borderBottom: "none" },
                  }}>
                    <TableCell sx={{ color: "rgba(255,255,255,0.3)", fontSize: { xs: "0.7rem", md: "0.78rem" }, borderBottom: `1px solid rgba(255,255,255,0.04)`, py: { xs: 1, md: 1.5 }, px: { xs: 1, md: 2 } }}>
                      {idx + 1}
                    </TableCell>
                    {visibleCols.map(col => (
                      <TableCell key={col.key} sx={{ color: "rgba(255,255,255,0.85)", fontSize: { xs: "0.72rem", md: "0.83rem" }, borderBottom: `1px solid rgba(255,255,255,0.04)`, py: { xs: 1, md: 1.5 }, px: { xs: 1, md: 2 }, maxWidth: { xs: 100, sm: "none" }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {col.key === "esops_rsu" ? (
                          <Chip label={row[col.key] === "yes" ? "Yes" : "No"} size="small"
                            sx={{ bgcolor: row[col.key] === "yes" ? "rgba(78,205,196,0.15)" : "rgba(255,107,107,0.15)", color: row[col.key] === "yes" ? "#4ECDC4" : "#FF6B6B", fontWeight: 700, fontSize: "0.65rem", height: 18 }} />
                        ) : col.type === "date" ? formatDate(row[col.key])
                          : row[col.key] ?? "—"}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ borderBottom: `1px solid rgba(255,255,255,0.04)`, py: { xs: 1, md: 1.5 }, px: { xs: 0.5, md: 2 } }}>
                      <Box sx={{ display: "flex", gap: { xs: 0.3, md: 0.5 }, justifyContent: "center", flexWrap: "nowrap" }}>
                        <Tooltip title="Delete" arrow>
                          <IconButton size="small" onClick={() => onDelete(row.id)}
                            sx={{ width: { xs: 22, md: 26 }, height: { xs: 22, md: 26 }, bgcolor: "rgba(255,59,59,0.12)", color: "#FF6B6B", borderRadius: "6px", "&:hover": { bgcolor: "rgba(255,59,59,0.25)" } }}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit" arrow>
                          <IconButton size="small" onClick={() => onEdit(row)}
                            sx={{ width: { xs: 22, md: 26 }, height: { xs: 22, md: 26 }, bgcolor: `${c.bg}`, color: c.main, borderRadius: "6px", "&:hover": { bgcolor: `${c.main}25` } }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        {!isMobile && (
                          <Tooltip title="Export" arrow>
                            <IconButton size="small"
                              sx={{ width: 26, height: 26, bgcolor: "rgba(245,166,35,0.1)", color: "#F5A623", borderRadius: "6px", "&:hover": { bgcolor: "rgba(245,166,35,0.2)" } }}>
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {showPromote && (
                          <Tooltip title="Move to Completed" arrow>
                            <IconButton size="small" onClick={() => onPromote && onPromote(row)}
                              sx={{ width: { xs: 22, md: 26 }, height: { xs: 22, md: 26 }, bgcolor: "rgba(255,107,157,0.1)", color: "#FF6B9D", borderRadius: "6px", "&:hover": { bgcolor: "rgba(255,107,157,0.2)" } }}>
                              <MoveIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {!isMobile && (
                          <Tooltip title="View Details" arrow>
                            <IconButton size="small"
                              sx={{ width: 26, height: 26, bgcolor: "rgba(108,143,255,0.1)", color: "#6C8FFF", borderRadius: "6px", "&:hover": { bgcolor: "rgba(108,143,255,0.2)" } }}>
                              <SearchIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

// ── Sidebar Content ───────────────────────────────────────────────────────────
function SidebarContent({ selected, setSelected, sidebarOpen, handleLogout, onNavClick }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <Box sx={{ p: 2.5, borderBottom: "1px solid rgba(108,143,255,0.1)", display: "flex", alignItems: "center", gap: 1.5, minHeight: 72 }}>
        <Box component="img" src={logo} alt="Finance Doctor"
          sx={{ height: 36, width: "auto", borderRadius: 1, flexShrink: 0 }} />
        {sidebarOpen && (
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#fff", lineHeight: 1.2 }}>FINANCE</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#6C8FFF", lineHeight: 1.2 }}>DOCTOR</Typography>
            <Typography sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", lineHeight: 1 }}>Est. 2002</Typography>
          </Box>
        )}
      </Box>

      {/* Nav Items */}
      <Box sx={{ flex: 1, py: 2, px: 1, overflowY: "auto" }}>
        {NAV_ITEMS.map(item => {
          const isActive = selected === item.id || (item.id === null && selected === null);
          const c = item.id ? COLORS[item.id] || COLORS.empanelment : COLORS.empanelment;
          return (
            <Box key={item.label} onClick={() => { setSelected(item.id); onNavClick && onNavClick(); }}
              sx={{
                display: "flex", alignItems: "center", gap: 1.5,
                px: 1.5, py: 1.2, borderRadius: "10px", mb: 0.5,
                cursor: "pointer", transition: "all 0.2s ease",
                bgcolor: isActive ? `${c.main}18` : "transparent",
                border: isActive ? `1px solid ${c.main}40` : "1px solid transparent",
                "&:hover": { bgcolor: `${c.main}12`, borderColor: `${c.main}30` },
              }}>
              <Typography sx={{ fontSize: "1rem", lineHeight: 1, flexShrink: 0 }}>{item.icon}</Typography>
              {sidebarOpen && (
                <Typography sx={{ fontSize: "0.85rem", fontWeight: isActive ? 700 : 500, color: isActive ? c.main : "rgba(255,255,255,0.55)", whiteSpace: "nowrap" }}>
                  {item.label}
                </Typography>
              )}
              {isActive && sidebarOpen && (
                <Box sx={{ ml: "auto", width: 6, height: 6, borderRadius: "50%", bgcolor: c.main, boxShadow: `0 0 8px ${c.main}` }} />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Logout */}
      <Box sx={{ p: 1.5, borderTop: "1px solid rgba(108,143,255,0.1)" }}>
        <Box onClick={handleLogout}
          sx={{
            display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1.2,
            borderRadius: "10px", cursor: "pointer", transition: "all 0.2s",
            "&:hover": { bgcolor: "rgba(255,107,107,0.1)" },
          }}>
          <LogoutIcon />
          {sidebarOpen && <Typography sx={{ fontSize: "0.85rem", color: "rgba(255,107,107,0.8)", fontWeight: 600 }}>Logout</Typography>}
        </Box>
      </Box>
    </Box>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [selected, setSelected]           = useState("empanelment");
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [headerCounts, setHeaderCounts]   = useState({});
  const [headerLoading, setHeaderLoading] = useState(true);
  const [refreshTick, setRefreshTick]     = useState(0);
  const [stats, setStats]                 = useState({});

  const [empRows, setEmpRows]   = useState([]);
  const [invRows, setInvRows]   = useState([]);
  const [intRows, setIntRows]   = useState([]);
  const [gcRows, setGcRows]     = useState([]);
  const [loadingMap, setLoadingMap] = useState({});

  const [snack, setSnack]           = useState({ open: false, msg: "", severity: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ section: null, id: null });

  const showSnack = (msg, severity = "success") => setSnack({ open: true, msg, severity });
  const refreshCounts = () => setRefreshTick(t => t + 1);
  const handleLogout = () => { localStorage.removeItem("user"); navigate("/login"); };

  // ── FIX: await moved outside setState callback ─────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      for (const id of ["invested", "empanelment", "interested"]) {
        try {
          const res  = await fetch(`${API}/stats/${id}`);
          const data = await res.json();                       // ← await here, not inside setState
          setStats(p => ({ ...p, [id]: data }));
        } catch {
          setStats(p => ({ ...p, [id]: null }));
        }
      }
      try {
        const res  = await fetch(`${API}/stats/giftcity`);
        const data = await res.json();
        setStats(p => ({ ...p, giftcity: data }));
      } catch {
        setStats(p => ({ ...p, giftcity: null }));
      }
    };
    fetchStats();
  }, [refreshTick]);

  // Fetch header counts
  useEffect(() => {
    const fetchCounts = async () => {
      setHeaderLoading(true);
      try {
        const res  = await fetch(`${API}/count/all`);
        const data = await res.json();
        setHeaderCounts(data);
      } catch (e) { console.error(e); }
      finally { setHeaderLoading(false); }
    };
    fetchCounts();
  }, [refreshTick]);

  const fetchSection = useCallback(async (section, url, setter) => {
    setLoadingMap(p => ({ ...p, [section]: true }));
    try {
      const res  = await fetch(url);
      const data = await res.json();
      setter(Array.isArray(data) ? data : []);
    } catch { setter([]); }
    finally { setLoadingMap(p => ({ ...p, [section]: false })); }
  }, []);

  useEffect(() => {
    fetchSection("empanelment", `${API}/empanelment/completed`, setEmpRows);
    fetchSection("invested",    `${API}/invested/completed`,    setInvRows);
    fetchSection("interested",  `${API}/interested`,            setIntRows);
    fetchSection("giftcity",    `${API}/gift-city/active`,      setGcRows);
  }, [refreshTick, fetchSection]);

  const statCardsData = {
    empanelment_done:     { completed: headerCounts?.empanelment_done?.completed ?? 0,     total: headerCounts?.empanelment_done?.total ?? 0,     extra: `+ ${empRows.length} this month` },
    customers_onboarding: { completed: headerCounts?.customers_onboarding?.completed ?? 0, total: headerCounts?.customers_onboarding?.total ?? 0, extra: `+ ${invRows.filter(r => { const d = new Date(r.first_investment); const n = new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear(); }).length} this week` },
    gift_city_ac_active:  { completed: headerCounts?.gift_city_ac_active?.completed ?? 0,  total: headerCounts?.gift_city_ac_active?.total ?? 0,  extra: `+ ${gcRows.length} prospects` },
    prospects:            { completed: intRows.length, total: intRows.length, extra: `${intRows.length} Prospects` },
  };

  const SECTION_CONFIG = {
    empanelment: {
      color: COLORS.empanelment, title: "Empanelment Overview", rows: empRows,
      cols: [
        { key: "AMC_name",         label: "AMC Name",         type: "text"   },
        { key: "products",         label: "Products",          type: "number" },
        { key: "Empanelment_date", label: "Empanelment Date",  type: "date"   },
        { key: "boardings",        label: "Boardings",         type: "number" },
      ],
      extraTables: [
        { title: "Top AMC",            rows: empRows.slice(0,3),                             cols: [{ key:"AMC_name",label:"AMC Name",type:"text"},{ key:"products",label:"Products",type:"number"}] },
        { title: "Boarding Accounts",  rows: empRows.filter(r=>r.boardings>0).slice(0,3),    cols: [{ key:"AMC_name",label:"AMC Name",type:"text"},{ key:"Empanelment_date",label:"Date",type:"date"}] },
      ],
    },
    invested: {
      color: COLORS.invested, title: "Customers Overview", rows: invRows,
      cols: [
        { key: "client_name",      label: "Client Name",      type: "text"   },
        { key: "first_investment", label: "First Investment",  type: "date"   },
        { key: "amount",           label: "Amount",            type: "number" },
        { key: "amc_name",         label: "AMC Name",          type: "text"   },
        { key: "scheme",           label: "Scheme",            type: "text"   },
      ],
      extraTables: [
        { title: "Top Clients", rows: [...invRows].sort((a,b)=>(b.amount||0)-(a.amount||0)).slice(0,3), cols: [{ key:"client_name",label:"Client",type:"text"},{ key:"amount",label:"AUM",type:"number"},{ key:"amc_name",label:"AMC",type:"text"}] },
        { title: "Top AMC",     rows: empRows.slice(0,3),                                               cols: [{ key:"AMC_name",label:"AMC Name",type:"text"},{ key:"products",label:"Products",type:"number"}] },
      ],
    },
    interested: {
      color: COLORS.interested, title: "Prospects Overview", rows: intRows,
      cols: [
        { key: "client_name",    label: "Client Name",    type: "text"   },
        { key: "esops_rsu",      label: "ESOPS/RSU",      type: "select" },
        { key: "discussion_date",label: "Discussion Date", type: "date"   },
        { key: "next_action",    label: "Next Action",    type: "text"   },
      ],
      extraTables: [],
    },
    giftcity: {
      color: COLORS.giftcity, title: "Gift City Active A/C", rows: gcRows,
      cols: [
        { key: "customer_name", label: "Customer Name", type: "text" },
        { key: "bank_name",     label: "Bank Name",     type: "text" },
        { key: "opened_date",   label: "Opened Date",   type: "date" },
      ],
      extraTables: [],
    },
  };

  const askDelete = (section, id) => { setDeleteTarget({ section, id }); setConfirmOpen(true); };

  const handleDelete = async () => {
    const { section, id } = deleteTarget;
    const urls = {
      empanelment: `${API}/empanelment/completed/${id}`,
      invested:    `${API}/invested/completed/${id}`,
      interested:  `${API}/interested/${id}`,
      giftcity:    `${API}/gift-city/active/${id}`,
    };
    try {
      await fetch(urls[section], { method: "DELETE" });
      showSnack("Record deleted");
      setConfirmOpen(false);
      refreshCounts();
    } catch { showSnack("Delete failed", "error"); }
  };

  const activeSec   = SECTION_CONFIG[selected] || SECTION_CONFIG.empanelment;
  const activeColor = activeSec.color;

  // Desktop sidebar width
  const SIDEBAR_W = sidebarOpen ? 220 : 60;

  const sidebarProps = {
    selected, setSelected, sidebarOpen, handleLogout,
    onNavClick: isMobile ? () => setMobileDrawerOpen(false) : undefined,
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: "100vh", display: "flex",
        background: "radial-gradient(ellipse at 20% 50%, #0D1B4B 0%, #080B1A 50%, #0A0512 100%)",
        fontFamily: "'Outfit', sans-serif",
        position: "relative",
        "&::before": {
          content: '""', position: "fixed", inset: 0, pointerEvents: "none",
          backgroundImage: `radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 10%, rgba(255,255,255,0.1) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.12) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 90%, rgba(255,255,255,0.08) 0%, transparent 100%)`,
          zIndex: 0,
        },
      }}>

        {/* ── Mobile Drawer ── */}
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: 220,
              background: "linear-gradient(180deg, rgba(13,27,75,0.98) 0%, rgba(8,11,26,0.99) 100%)",
              borderRight: "1px solid rgba(108,143,255,0.12)",
              backdropFilter: "blur(20px)",
            },
          }}
        >
          <SidebarContent {...sidebarProps} sidebarOpen={true} />
        </Drawer>

        {/* ── Desktop Sidebar ── */}
        <Box sx={{
          display: { xs: "none", md: "flex" },
          width: SIDEBAR_W, flexShrink: 0,
          background: "linear-gradient(180deg, rgba(13,27,75,0.95) 0%, rgba(8,11,26,0.98) 100%)",
          borderRight: "1px solid rgba(108,143,255,0.12)",
          backdropFilter: "blur(20px)",
          transition: "width 0.3s ease",
          flexDirection: "column",
          position: "sticky", top: 0, height: "100vh",
          zIndex: 10, overflow: "hidden",
        }}>
          <SidebarContent {...sidebarProps} />
        </Box>

        {/* ── Main Content ── */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", position: "relative", zIndex: 1, minWidth: 0 }}>

          {/* Top Bar */}
          <Box sx={{
            px: { xs: 1.5, sm: 2, md: 3 }, py: { xs: 1.2, md: 2 },
            display: "flex", alignItems: "center", gap: { xs: 1, md: 2 },
            background: "rgba(8,11,26,0.7)", backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(108,143,255,0.08)",
            position: "sticky", top: 0, zIndex: 5,
          }}>
            <IconButton
              onClick={() => isMobile ? setMobileDrawerOpen(o => !o) : setSidebarOpen(o => !o)}
              sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#fff" } }}>
              <MenuIcon />
            </IconButton>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.95rem", md: "1.1rem" }, color: "#fff" }}>
              Finance Doctor
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Box sx={{
              px: { xs: 1.2, md: 2 }, py: 0.8, borderRadius: "20px",
              background: "rgba(108,143,255,0.08)", border: "1px solid rgba(108,143,255,0.2)",
              display: { xs: "none", sm: "block" },
            }}>
              <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
                👋 Welcome, <span style={{ color: "#6C8FFF", fontWeight: 700 }}>{user.name || "Admin"}</span>
              </Typography>
            </Box>
            {/* Mobile: show user initial */}
            <Box sx={{
              display: { xs: "flex", sm: "none" },
              width: 32, height: 32, borderRadius: "50%",
              bgcolor: "rgba(108,143,255,0.2)", border: "1px solid rgba(108,143,255,0.4)",
              alignItems: "center", justifyContent: "center",
            }}>
              <Typography sx={{ fontSize: "0.8rem", color: "#6C8FFF", fontWeight: 700 }}>
                {(user.name || "A")[0].toUpperCase()}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, flex: 1 }}>

            {/* Stat Cards */}
            <Box sx={{ display: "flex", gap: { xs: 1, md: 2 }, mb: { xs: 2, md: 3 }, flexWrap: "wrap" }}>
              {STAT_CARDS.map(cfg => (
                <StatCard key={cfg.key} config={cfg}
                  data={statCardsData[cfg.key]}
                  loading={headerLoading}
                  onClick={() => setSelected(cfg.section)} />
              ))}
            </Box>

            {/* Section label */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: { xs: 1.5, md: 2.5 } }}>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: "0.95rem", md: "1.1rem" }, color: "#fff", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
                Overview
              </Typography>
              <Box sx={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(108,143,255,0.3), transparent)" }} />
              <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", display: { xs: "none", sm: "block" } }}>
                Showing top 5 records
              </Typography>
            </Box>

            {/* Section Nav Pills (mobile) */}
            <Box sx={{
              display: { xs: "flex", md: "none" },
              gap: 1, mb: 2, overflowX: "auto", pb: 0.5,
              "&::-webkit-scrollbar": { display: "none" },
            }}>
              {NAV_ITEMS.filter(n => n.id).map(item => {
                const isActive = selected === item.id;
                const c = COLORS[item.id] || COLORS.empanelment;
                return (
                  <Chip
                    key={item.id}
                    label={item.label}
                    onClick={() => setSelected(item.id)}
                    size="small"
                    sx={{
                      flexShrink: 0,
                      bgcolor: isActive ? c.bg : "rgba(255,255,255,0.04)",
                      color: isActive ? c.main : "rgba(255,255,255,0.45)",
                      border: `1px solid ${isActive ? c.border : "rgba(255,255,255,0.08)"}`,
                      fontWeight: isActive ? 700 : 500,
                      cursor: "pointer",
                    }}
                  />
                );
              })}
            </Box>

            {/* Main Table */}
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
              <OverviewTable
                rows={activeSec.rows}
                cols={activeSec.cols}
                color={activeColor}
                title={activeSec.title}
                loading={loadingMap[selected]}
                onEdit={(row) => {}}
                onDelete={(id) => askDelete(selected, id)}
                showPromote={false}
              />
            </Box>

            {/* View Reports Button */}
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
              <Button
                onClick={() => setSelected(selected)}
                sx={{
                  px: { xs: 2, md: 3 }, py: { xs: 0.8, md: 1 },
                  borderRadius: "20px", textTransform: "none", fontWeight: 600,
                  fontSize: { xs: "0.78rem", md: "0.82rem" },
                  color: activeColor.main, border: `1px solid ${activeColor.border}`,
                  bgcolor: activeColor.bg,
                  "&:hover": { bgcolor: `${activeColor.main}20`, borderColor: activeColor.main },
                  display: "flex", alignItems: "center", gap: 1,
                }}>
                ⊙ View Full Report
              </Button>
            </Box>

            {/* Extra Tables Row */}
            {activeSec.extraTables && activeSec.extraTables.length > 0 && (
              <Box sx={{ display: "flex", gap: { xs: 1.5, md: 2 }, flexWrap: "wrap" }}>
                {activeSec.extraTables.map((et, i) => (
                  <Box key={i} sx={{ flex: { xs: "1 1 100%", sm: 1 }, minWidth: { xs: "100%", sm: 260 } }}>
                    <Box sx={{
                      background: "linear-gradient(135deg, rgba(13,19,48,0.9), rgba(8,11,26,0.95))",
                      border: `1px solid ${activeColor.border}`,
                      borderRadius: "16px", overflow: "hidden",
                    }}>
                      <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 1.5, md: 2 }, borderBottom: `1px solid ${activeColor.border}` }}>
                        <Typography sx={{ fontWeight: 700, color: activeColor.main, fontSize: { xs: "0.75rem", md: "0.82rem" }, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                          {et.title}
                        </Typography>
                      </Box>
                      <TableContainer sx={{ overflowX: "auto" }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: `1px solid ${activeColor.border}`, py: 1.2, px: { xs: 1, md: 2 } }}>#</TableCell>
                              {et.cols.map(col => (
                                <TableCell key={col.key} sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: `1px solid ${activeColor.border}`, py: 1.2, px: { xs: 1, md: 2 } }}>
                                  {col.label}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {et.rows.length === 0 ? (
                              <TableRow><TableCell colSpan={et.cols.length+1} align="center" sx={{ py: 3, color: "rgba(255,255,255,0.2)", fontSize: "0.8rem", borderBottom: "none", fontStyle: "italic" }}>No data</TableCell></TableRow>
                            ) : et.rows.map((row, idx) => (
                              <TableRow key={row.id || idx} sx={{ "&:hover": { bgcolor: `${activeColor.main}08` }, "&:last-child td": { borderBottom: "none" } }}>
                                <TableCell sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", borderBottom: `1px solid rgba(255,255,255,0.04)`, py: 1.2, px: { xs: 1, md: 2 } }}>{idx+1}</TableCell>
                                {et.cols.map(col => (
                                  <TableCell key={col.key} sx={{ color: "rgba(255,255,255,0.8)", fontSize: { xs: "0.72rem", md: "0.8rem" }, borderBottom: `1px solid rgba(255,255,255,0.04)`, py: 1.2, px: { xs: 1, md: 2 }, maxWidth: { xs: 90, sm: "none" }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {col.type === "date" ? formatDate(row[col.key]) : col.key === "amount" ? `${((row[col.key]||0)/10000000).toFixed(1)} Cr` : row[col.key] ?? "—"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Delete Confirm Dialog ── */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth
          PaperProps={{ sx: { bgcolor: "#0D1330", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 3, mx: { xs: 2, sm: "auto" } } }}>
          <DialogTitle sx={{ color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 4, height: 20, borderRadius: 1, bgcolor: "#FF6B6B" }} />
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>Are you sure? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setConfirmOpen(false)} sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none" }}>Cancel</Button>
            <Button onClick={handleDelete} variant="contained"
              sx={{ bgcolor: "#FF6B6B", textTransform: "none", fontWeight: 700, borderRadius: "8px", "&:hover": { bgcolor: "#e05555" } }}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Snackbar ── */}
        <Snackbar open={snack.open} autoHideDuration={3000}
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
          <Alert severity={snack.severity} variant="filled" sx={{ fontWeight: 600 }}>{snack.msg}</Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;