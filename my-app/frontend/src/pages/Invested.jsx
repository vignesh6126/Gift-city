import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, Chip, CircularProgress,
  Snackbar, Alert, Tooltip, useMediaQuery,
} from "@mui/material";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const API = import.meta.env.VITE_API_URL;

const C = {
  main: "#4ECDC4", glow: "#4ECDC444", bg: "rgba(78,205,196,0.09)",
  border: "rgba(78,205,196,0.22)", green: "#4ECDC4", greenBg: "rgba(78,205,196,0.10)",
  red: "#FF5A5F", redBg: "rgba(255,90,95,0.10)", warn: "#FFB347",
  glass: "rgba(255,255,255,0.04)", glassBorder: "rgba(255,255,255,0.10)",
};

const theme = createTheme({
  palette: { mode: "dark", background: { default: "#080B1A", paper: "#0D1330" }, text: { primary: "#E8EEFF", secondary: "#8B9CC8" } },
  typography: { fontFamily: "'Outfit', -apple-system, sans-serif" },
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
});

const TABS = [{ id: "completed", label: "Completed" }, { id: "pending", label: "Pending" }];

const COMPLETED_COLS = [
  { key: "client_name", label: "Client", type: "text" },
  { key: "first_investment", label: "First Inv.", type: "date" },
  { key: "amount", label: "Amount", type: "number" },
  { key: "amc_name", label: "AMC", type: "text" },
  { key: "scheme", label: "Scheme", type: "text" },
  { key: "bank", label: "Bank", type: "select", options: ["gift", "savings", "both"] },
];
const PENDING_COLS = [
  { key: "client_name", label: "Client", type: "text" },
  { key: "amount_tobe_invested", label: "Amount (Inv.)", type: "number" },
  { key: "amc_name", label: "AMC", type: "text" },
  { key: "scheme", label: "Scheme", type: "text" },
  { key: "bank", label: "Bank", type: "select", options: ["gift", "savings", "both"] },
  { key: "submission_date", label: "Sub. Date", type: "date" },
  { key: "status", label: "Status", type: "text" },
];

const autoFilledKeys = new Set(["client_name", "amount", "amc_name", "scheme", "bank"]);
const manualKeys = new Set(["first_investment"]);
const formatDate = (d) => !d ? "—" : new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const emptyCompleted = () => ({ client_name: "", first_investment: "", amount: "", scheme: "", amc_name: "", bank: "savings" });
const emptyPending = () => ({ client_name: "", amount_tobe_invested: "", scheme: "", amc_name: "", bank: "savings", submission_date: "", status: "" });
const pendingToCompletedForm = (r) => ({ client_name: r.client_name || "", amount: r.amount_tobe_invested || "", amc_name: r.amc_name || "", scheme: r.scheme || "", bank: r.bank || "savings", first_investment: "" });

const EditIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const DeleteIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const PlusIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>;
const ShareIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2"/><circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="2"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="2"/></svg>;
const BackIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;

const inputSx = (highlight = false) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px", background: "rgba(255,255,255,0.04)", transition: "all 0.25s ease",
    "& fieldset": { borderColor: highlight ? "#FFB347" : "rgba(255,255,255,0.12)", borderWidth: highlight ? 2 : 1, transition: "all 0.25s ease" },
    "&:hover fieldset": { borderColor: highlight ? "#FFB347" : C.main },
    "&.Mui-focused fieldset": { borderColor: highlight ? "#FFB347" : C.main, boxShadow: `0 0 0 3px ${highlight ? "#FFB347" : C.main}22` },
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.45)", "&.Mui-focused": { color: highlight ? "#FFB347" : C.main } },
  "& .MuiInputBase-input": { color: "#E8EEFF" },
});

function FieldInput({ col, value, onChange, highlight = false }) {
  if (col.type === "select") {
    return (
      <FormControl fullWidth size="small" sx={inputSx(highlight)}>
        <InputLabel>{col.label}</InputLabel>
        <Select value={value || ""} label={col.label} onChange={(e) => onChange(col.key, e.target.value)}
          MenuProps={{ PaperProps: { sx: { bgcolor: "#0D1330", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" } } }}>
          {col.options?.map((o) => <MenuItem key={o} value={o} sx={{ "&:hover": { bgcolor: C.bg } }}>{o.charAt(0).toUpperCase() + o.slice(1)}</MenuItem>)}
        </Select>
      </FormControl>
    );
  }
  return (
    <TextField fullWidth size="small" label={col.label}
      type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
      value={value || ""} onChange={(e) => onChange(col.key, e.target.value)}
      InputLabelProps={col.type === "date" ? { shrink: true } : undefined}
      sx={inputSx(highlight)} />
  );
}

function ActionBtn({ title, onClick, color, bgColor, children }) {
  return (
    <Tooltip title={title} arrow>
      <IconButton size="small" onClick={onClick} sx={{
        width: 28, height: 28, borderRadius: "8px", bgcolor: bgColor, color,
        transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        "&:hover": { transform: "scale(1.18)", bgcolor: color, color: "#fff", boxShadow: `0 4px 12px ${color}55` },
      }}>{children}</IconButton>
    </Tooltip>
  );
}

function GlassCard({ children, sx = {} }) {
  return (
    <Box sx={{
      background: "linear-gradient(135deg, rgba(13,19,48,0.92), rgba(8,11,26,0.96))",
      border: `1px solid ${C.glassBorder}`, borderRadius: "20px",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      overflow: "hidden", transition: "all 0.35s ease", ...sx,
    }}>{children}</Box>
  );
}

const dialogSx = {
  bgcolor: "#080B1A", border: `1px solid ${C.border}`, borderRadius: "24px",
  backdropFilter: "blur(40px)", boxShadow: `0 32px 80px rgba(0,0,0,0.6)`,
};

export default function Invested({ inline = false, onDataChange }) {
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const [activeTab, setActiveTab] = useState("completed");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [promoteSourceId, setPromoteSourceId] = useState(null);
  const [promoteForm, setPromoteForm] = useState({});
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  const cols = activeTab === "completed" ? COMPLETED_COLS : PENDING_COLS;
  const visibleCols = isMobile ? cols.slice(0, 2) : cols;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/invested/${activeTab}`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch { showSnack("Failed to load", "error"); }
    finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showSnack = (msg, severity = "success") => setSnack({ open: true, msg, severity });
  const openAdd = () => { setEditRow(null); setFormData(activeTab === "completed" ? emptyCompleted() : emptyPending()); setDialogOpen(true); };
  const openEdit = (row) => { setEditRow(row); setFormData({ ...row }); setDialogOpen(true); };
  const handleField = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    const url = editRow ? `${API}/invested/${activeTab}/${editRow.id}` : `${API}/invested/${activeTab}`;
    const method = editRow ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error();
      showSnack(editRow ? "Updated!" : "Added!"); setDialogOpen(false); fetchData(); onDataChange?.();
    } catch { showSnack("Save failed", "error"); }
  };

  const askDelete = (id) => { setDeleteId(id); setConfirmOpen(true); };
  const handleDelete = async () => {
    try {
      await fetch(`${API}/invested/${activeTab}/${deleteId}`, { method: "DELETE" });
      showSnack("Deleted"); setConfirmOpen(false); fetchData(); onDataChange?.();
    } catch { showSnack("Delete failed", "error"); }
  };

  const openPromote = (row) => { setPromoteSourceId(row.id); setPromoteForm(pendingToCompletedForm(row)); setPromoteOpen(true); };
  const closePromote = () => { setPromoteOpen(false); setPromoteSourceId(null); setPromoteForm({}); };
  const handlePromoteField = (key, val) => setPromoteForm(p => ({ ...p, [key]: val }));

  const handlePromoteSave = async () => {
    setPromoteLoading(true);
    try {
      const a = await fetch(`${API}/invested/completed`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(promoteForm) });
      if (!a.ok) throw new Error("Failed to add");
      const d = await fetch(`${API}/invested/pending/${promoteSourceId}`, { method: "DELETE" });
      if (!d.ok) throw new Error("Failed to remove");
      showSnack("✓ Moved to Completed!"); closePromote(); fetchData(); onDataChange?.();
    } catch (e) { showSnack(e.message || "Failed", "error"); }
    finally { setPromoteLoading(false); }
  };

  const content = (
    <>
      {!inline && (
        <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 1.5, md: 2 }, display: "flex", alignItems: "center", gap: 2, background: "rgba(8,11,26,0.72)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${C.glassBorder}`, position: "sticky", top: 0, zIndex: 100 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "12px", background: `linear-gradient(135deg, ${C.main}, #7FF2EC)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${C.glow}` }}>
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 900, color: "#fff" }}>FD</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#fff", lineHeight: 1.1 }}>FINANCE DOCTOR</Typography>
              <Typography sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)" }}>Clients</Typography>
            </Box>
          </Box>
          <Button onClick={() => navigate("/dashboard")} startIcon={<BackIcon />}
            sx={{ color: C.main, border: `1px solid ${C.border}`, bgcolor: C.bg, textTransform: "none", borderRadius: "12px", fontWeight: 600, fontSize: "0.8rem", px: 2, "&:hover": { bgcolor: `${C.main}20`, transform: "translateY(-1px)" }, transition: "all 0.25s ease", display: { xs: "none", sm: "flex" } }}>
            Dashboard
          </Button>
          <IconButton onClick={() => navigate("/dashboard")} sx={{ display: { xs: "flex", sm: "none" }, color: C.main, bgcolor: C.bg, borderRadius: "12px", border: `1px solid ${C.border}`, width: 36, height: 36 }}><BackIcon /></IconButton>
        </Box>
      )}

      <Box sx={{ px: { xs: 1.5, sm: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
        {!inline && (
          <Typography sx={{ fontWeight: 900, fontSize: { xs: "1.4rem", md: "1.8rem" }, color: "#fff", mb: 3, letterSpacing: "-0.02em" }}>
            Clients <Box component="span" sx={{ color: C.main, fontWeight: 700, fontSize: "0.7em" }}>/ Records</Box>
          </Typography>
        )}

        {/* Tab Pills */}
        <Box sx={{ display: "flex", gap: 1, mb: { xs: 2, md: 3 }, p: "5px", bgcolor: "rgba(255,255,255,0.04)", borderRadius: "16px", border: `1px solid ${C.glassBorder}`, width: "fit-content" }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <Box key={tab.id} onClick={() => setActiveTab(tab.id)} sx={{
                px: { xs: 2.5, md: 3 }, py: { xs: 0.8, md: 1 }, borderRadius: "12px", cursor: "pointer",
                background: isActive ? `linear-gradient(135deg, ${C.main}33, ${C.main}18)` : "transparent",
                border: isActive ? `1px solid ${C.border}` : "1px solid transparent",
                color: isActive ? C.main : "rgba(255,255,255,0.45)",
                fontWeight: isActive ? 700 : 500, fontSize: { xs: "0.8rem", md: "0.85rem" },
                transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                boxShadow: isActive ? `0 4px 14px ${C.glow}` : "none",
                transform: isActive ? "scale(1.02)" : "scale(1)", userSelect: "none",
              }}>{tab.label}</Box>
            );
          })}
        </Box>

        <GlassCard>
          <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 1.8, md: 2 }, borderBottom: `1px solid ${C.glassBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 4, height: 22, borderRadius: "4px", background: `linear-gradient(180deg, ${C.main}, #7FF2EC)` }} />
              <Typography sx={{ fontWeight: 700, color: C.main, fontSize: { xs: "0.78rem", md: "0.88rem" }, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {TABS.find(t => t.id === activeTab)?.label}
              </Typography>
              <Chip label={rows.length} size="small" sx={{ bgcolor: C.bg, color: C.main, fontWeight: 700, fontSize: "0.68rem", border: `1px solid ${C.border}`, height: 20 }} />
            </Box>
            {activeTab === "pending" && (
              <Button onClick={openAdd} startIcon={<PlusIcon />}
                sx={{ bgcolor: C.main, color: "#fff", textTransform: "none", fontWeight: 700, borderRadius: "12px", fontSize: "0.8rem", px: 2, py: 0.8, boxShadow: `0 4px 14px ${C.glow}`, "&:hover": { bgcolor: `${C.main}CC`, transform: "translateY(-2px)" }, transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
                Add Row
              </Button>
            )}
          </Box>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress sx={{ color: C.main }} /></Box>
          ) : (
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "rgba(255,255,255,0.02)" }}>
                    <TableCell sx={{ color: "rgba(255,255,255,0.3)", fontSize: { xs: "0.6rem", md: "0.68rem" }, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: `1px solid ${C.glassBorder}`, py: 1.5, px: { xs: 1.5, md: 2 } }}>#</TableCell>
                    {visibleCols.map(col => (
                      <TableCell key={col.key} sx={{ color: "rgba(255,255,255,0.3)", fontSize: { xs: "0.6rem", md: "0.68rem" }, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: `1px solid ${C.glassBorder}`, py: 1.5, px: { xs: 1.5, md: 2 } }}>
                        {col.label}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ color: "rgba(255,255,255,0.3)", fontSize: { xs: "0.6rem", md: "0.68rem" }, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: `1px solid ${C.glassBorder}`, py: 1.5, px: { xs: 1, md: 2 } }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow><TableCell colSpan={visibleCols.length + 2} align="center" sx={{ py: 6, color: "rgba(255,255,255,0.2)", fontStyle: "italic", borderBottom: "none" }}>No records found</TableCell></TableRow>
                  ) : rows.map((row, idx) => (
                    <TableRow key={row.id} sx={{ transition: "background 0.2s ease", "&:hover": { bgcolor: `${C.main}08` }, "&:last-child td": { borderBottom: "none" } }}>
                      <TableCell sx={{ color: "rgba(255,255,255,0.28)", fontSize: "0.75rem", borderBottom: `1px solid rgba(255,255,255,0.04)`, py: { xs: 1.2, md: 1.5 }, px: { xs: 1.5, md: 2 } }}>{idx + 1}</TableCell>
                      {visibleCols.map(col => (
                        <TableCell key={col.key} sx={{ color: "rgba(255,255,255,0.85)", fontSize: { xs: "0.76rem", md: "0.84rem" }, borderBottom: `1px solid rgba(255,255,255,0.04)`, py: { xs: 1.2, md: 1.5 }, px: { xs: 1.5, md: 2 }, maxWidth: { xs: 110, sm: "none" }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {col.type === "date" ? formatDate(row[col.key]) : col.key === "amount" && !isMobile ? `₹ ${Number(row[col.key] || 0).toLocaleString("en-IN")}` : row[col.key] ?? "—"}
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ borderBottom: `1px solid rgba(255,255,255,0.04)`, py: { xs: 1, md: 1.5 }, px: { xs: 0.5, md: 2 } }}>
                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                          <ActionBtn title="Edit" onClick={() => openEdit(row)} color={C.main} bgColor={C.bg}><EditIcon /></ActionBtn>
                          {activeTab === "pending" && <ActionBtn title="Move to Completed" onClick={() => openPromote(row)} color={C.green} bgColor={C.greenBg}><ShareIcon /></ActionBtn>}
                          <ActionBtn title="Delete" onClick={() => askDelete(row.id)} color={C.red} bgColor={C.redBg}><DeleteIcon /></ActionBtn>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </GlassCard>
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { ...dialogSx, mx: { xs: 2, sm: "auto" } } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1, pt: 3, px: 3 }}>
          <Box sx={{ width: 4, height: 22, borderRadius: "4px", background: `linear-gradient(180deg, ${C.main}, #7FF2EC)` }} />
          <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "1.05rem" }}>{editRow ? "Edit Record" : "Add New Record"}</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            {cols.map(col => <FieldInput key={col.key} col={col} value={formData[col.key]} onChange={handleField} />)}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", px: 2.5 }}>Cancel</Button>
          <Button onClick={handleSave} sx={{ bgcolor: C.main, color: "#fff", textTransform: "none", fontWeight: 700, borderRadius: "12px", px: 3, boxShadow: `0 4px 14px ${C.glow}`, "&:hover": { bgcolor: `${C.main}CC`, transform: "translateY(-2px)" }, transition: "all 0.25s ease" }}>{editRow ? "Update" : "Save"}</Button>
        </DialogActions>
      </Dialog>

      {/* Promote Dialog */}
      <Dialog open={promoteOpen} onClose={closePromote} maxWidth="sm" fullWidth PaperProps={{ sx: { ...dialogSx, border: `1px solid ${C.green}44`, mx: { xs: 2, sm: "auto" } } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1, pt: 3, px: 3 }}>
          <Box sx={{ width: 4, height: 22, borderRadius: "4px", background: `linear-gradient(180deg, ${C.green}, #7FF2EC)` }} />
          <Box>
            <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "1.05rem" }}>Move to Completed</Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>Orange fields require manual entry</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            {COMPLETED_COLS.map(col => (
              <Box key={col.key}>
                <FieldInput col={col} value={promoteForm[col.key]} onChange={handlePromoteField} highlight={manualKeys.has(col.key)} />
                {manualKeys.has(col.key) && <Typography sx={{ fontSize: "0.7rem", color: C.warn, mt: 0.5, ml: 0.5 }}>⚠ Fill manually</Typography>}
                {autoFilledKeys.has(col.key) && <Typography sx={{ fontSize: "0.7rem", color: C.green, mt: 0.5, ml: 0.5 }}>✓ Auto-filled</Typography>}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={closePromote} disabled={promoteLoading} sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", px: 2.5 }}>Cancel</Button>
          <Button onClick={handlePromoteSave} disabled={promoteLoading} sx={{ bgcolor: C.green, color: "#fff", textTransform: "none", fontWeight: 700, borderRadius: "12px", px: 3, "&:hover": { bgcolor: "#3DBDB5", transform: "translateY(-2px)" }, transition: "all 0.25s ease" }}>
            {promoteLoading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Save & Move"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { ...dialogSx, border: `1px solid ${C.red}44`, mx: { xs: 2, sm: "auto" } } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pt: 3, px: 3 }}>
          <Box sx={{ width: 4, height: 22, borderRadius: "4px", bgcolor: C.red }} />
          <Typography sx={{ fontWeight: 700, color: "#fff" }}>Confirm Delete</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}><Typography sx={{ color: "rgba(255,255,255,0.55)" }}>This action cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setConfirmOpen(false)} sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", px: 2.5 }}>Cancel</Button>
          <Button onClick={handleDelete} sx={{ bgcolor: C.red, color: "#fff", textTransform: "none", fontWeight: 700, borderRadius: "12px", px: 3, "&:hover": { bgcolor: "#E04448", transform: "translateY(-2px)" }, transition: "all 0.25s ease" }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.severity} variant="filled" sx={{ fontWeight: 600, borderRadius: "12px" }}>{snack.msg}</Alert>
      </Snackbar>
    </>
  );

  if (inline) return <ThemeProvider theme={theme}>{content}</ThemeProvider>;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", background: "radial-gradient(ellipse at 20% 40%, #0D1B4B 0%, #080B1A 55%, #0A0512 100%)", fontFamily: "'Outfit', sans-serif" }}>
        {content}
      </Box>
    </ThemeProvider>
  );
}