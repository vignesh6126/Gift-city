import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, AppBar, Toolbar, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, Chip, CircularProgress,
  Snackbar, Alert, Tooltip,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const API = import.meta.env.VITE_API_URL;

const theme = createTheme({
  palette: {
    mode: "light",
    background: { default: "#F3F0FF", paper: "#FFFFFF" },
    text: { primary: "#1A2B3C", secondary: "#5A7A99" },
  },
  typography: { fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
  shape: { borderRadius: 4 },
  components: {
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.04em" },
      },
    },
  },
});

const PURPLE = {
  main: "#6C63FF",
  light: "#F0EFFE",
  mid: "#E0DCFF",
  border: "#C4BFFF",
  text: "#3D35A0",
};

const GREEN = {
  main: "#43A047",
  light: "#E8F5E9",
  hover: "#2E7D32",
};

const TABS = [
  { id: "completed", label: "Empanelment Completed" },
  { id: "pending",   label: "Empanelment Pending" },
];

const COMPLETED_COLS = [
  { key: "AMC_name",         label: "AMC Name",         type: "text"   },
  { key: "products",         label: "Products",          type: "number" },
  { key: "Empanelment_date", label: "Empanelment Date",  type: "date"   },
  { key: "boardings",        label: "Boardings",         type: "number" },
];

const PENDING_COLS = [
  { key: "AMC_name",        label: "AMC Name",        type: "text"   },
  { key: "products",        label: "Products",         type: "number" },
  { key: "submission_date", label: "Submission Date",  type: "date"   },
  { key: "status",          label: "Status",           type: "text"   },
];

const AUTO_FILLED_KEYS = new Set(["AMC_name", "products"]);
const MANUAL_KEYS      = new Set(["Empanelment_date", "boardings"]);

const pendingToCompletedForm = (pendingRow) => ({
  AMC_name:         pendingRow.AMC_name || "",
  products:         pendingRow.products || "",
  Empanelment_date: "",
  boardings:        "",
});

// ── Icons ──────────────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const DeleteIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="5"  y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const ShareIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <circle cx="18" cy="5"  r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="6"  cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="8.59"  y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="15.41" y1="6.51"  x2="8.59"  y2="10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const BackIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const emptyCompleted = () => ({ AMC_name: "", products: "", Empanelment_date: "", boardings: "" });
const emptyPending   = () => ({ AMC_name: "", products: "", submission_date: "", status: "" });

function FieldInput({ col, value, onChange, highlight = false }) {
  const highlightSx = highlight
    ? { "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#FFA726", borderWidth: 2 } } }
    : {};

  if (col.type === "select") {
    return (
      <FormControl fullWidth size="small"
        sx={highlight ? { "& .MuiOutlinedInput-notchedOutline": { borderColor: "#FFA726", borderWidth: 2 } } : {}}>
        <InputLabel>{col.label}</InputLabel>
        <Select value={value || ""} label={col.label} onChange={(e) => onChange(col.key, e.target.value)}>
          {col.options.map((o) => (
            <MenuItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }
  return (
    <TextField
      fullWidth size="small" label={col.label}
      type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
      value={value || ""}
      onChange={(e) => onChange(col.key, e.target.value)}
      InputLabelProps={col.type === "date" ? { shrink: true } : undefined}
      sx={highlightSx}
    />
  );
}

// ── onDataChange prop added ────────────────────────────────────────────────────
export default function Empanelment({ inline = false, onDataChange }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("completed");
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow]       = useState(null);
  const [formData, setFormData]     = useState({});

  const [deleteId, setDeleteId]       = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [promoteOpen, setPromoteOpen]         = useState(false);
  const [promoteSourceId, setPromoteSourceId] = useState(null);
  const [promoteForm, setPromoteForm]         = useState({});
  const [promoteLoading, setPromoteLoading]   = useState(false);

  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  const cols = activeTab === "completed" ? COMPLETED_COLS : PENDING_COLS;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/empanelment/${activeTab}`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      showSnack("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showSnack = (msg, severity = "success") => setSnack({ open: true, msg, severity });

  // ── Add / Edit ──
  const openAdd     = () => { setEditRow(null); setFormData(activeTab === "completed" ? emptyCompleted() : emptyPending()); setDialogOpen(true); };
  const openEdit    = (row) => { setEditRow(row); setFormData({ ...row }); setDialogOpen(true); };
  const closeDialog = () => setDialogOpen(false);
  const handleField = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    const url    = editRow ? `${API}/empanelment/${activeTab}/${editRow.id}` : `${API}/empanelment/${activeTab}`;
    const method = editRow ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error();
      showSnack(editRow ? "Record updated!" : "Record added!");
      closeDialog();
      fetchData();
      if (onDataChange) onDataChange(); // ← notify Dashboard
    } catch {
      showSnack("Save failed", "error");
    }
  };

  // ── Delete ──
  const askDelete    = (id) => { setDeleteId(id); setConfirmOpen(true); };
  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/empanelment/${activeTab}/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showSnack("Record deleted");
      setConfirmOpen(false);
      fetchData();
      if (onDataChange) onDataChange(); // ← notify Dashboard
    } catch {
      showSnack("Delete failed", "error");
    }
  };

  // ── Promote pending → completed ──
  const openPromote       = (row) => { setPromoteSourceId(row.id); setPromoteForm(pendingToCompletedForm(row)); setPromoteOpen(true); };
  const closePromote      = () => { setPromoteOpen(false); setPromoteSourceId(null); setPromoteForm({}); };
  const handlePromoteField = (key, val) => setPromoteForm((prev) => ({ ...prev, [key]: val }));

  const handlePromoteSave = async () => {
    setPromoteLoading(true);
    try {
      const addRes = await fetch(`${API}/empanelment/completed`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(promoteForm),
      });
      if (!addRes.ok) throw new Error("Failed to add to completed");

      const delRes = await fetch(`${API}/empanelment/pending/${promoteSourceId}`, { method: "DELETE" });
      if (!delRes.ok) throw new Error("Failed to remove from pending");

      showSnack("✓ Moved to Empanelment Completed!", "success");
      closePromote();
      fetchData();
      if (onDataChange) onDataChange(); // ← notify Dashboard
    } catch (e) {
      showSnack(e.message || "Operation failed", "error");
    } finally {
      setPromoteLoading(false);
    }
  };

  const content = (
    <>
      {!inline && (
        <AppBar position="static" elevation={0}
          sx={{ bgcolor: "#fff", borderBottom: `1px solid ${PURPLE.border}` }}>
          <Toolbar>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: PURPLE.main, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="caption" fontWeight={900} color="#fff" fontSize="0.68rem">FD</Typography>
              </Box>
              <Typography variant="h6" fontWeight={800} color="text.primary">Finance Doctor</Typography>
            </Box>
            <Button onClick={() => navigate("/dashboard")} startIcon={<BackIcon />} variant="outlined" size="small"
              sx={{ color: PURPLE.text, borderColor: PURPLE.border, textTransform: "none", mr: 1, "&:hover": { borderColor: PURPLE.main, bgcolor: PURPLE.light } }}>
              Dashboard
            </Button>
            <Button onClick={() => { localStorage.removeItem("user"); navigate("/login"); }} variant="outlined" size="small"
              sx={{ color: PURPLE.main, borderColor: PURPLE.border, textTransform: "none", "&:hover": { bgcolor: PURPLE.light } }}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
      )}

      <Box sx={{ minHeight: inline ? "unset" : "calc(100vh - 64px)", bgcolor: inline ? "transparent" : "#F3F0FF", px: inline ? 0 : { xs: 2, md: 4 }, py: inline ? 0 : 3 }}>
        {!inline && (
          <Typography variant="h5" fontWeight={800} color={PURPLE.text} sx={{ mb: 3 }}>Empanelment</Typography>
        )}

        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Box key={tab.id} onClick={() => setActiveTab(tab.id)}
                sx={{
                  cursor: "pointer", px: 3, py: 1, borderRadius: "50px",
                  border: `2px solid ${isActive ? PURPLE.main : PURPLE.border}`,
                  bgcolor: isActive ? PURPLE.main : "#fff",
                  color: isActive ? "#fff" : PURPLE.text,
                  fontWeight: 700, fontSize: "0.85rem", transition: "all 0.25s ease",
                  boxShadow: isActive ? `0 3px 10px ${PURPLE.main}44` : "0 1px 3px rgba(0,0,0,0.07)",
                  userSelect: "none",
                  "&:hover": { transform: "translateY(-2px)", boxShadow: `0 5px 14px ${PURPLE.main}33`, borderColor: PURPLE.main, bgcolor: isActive ? PURPLE.main : PURPLE.light },
                }}>
                {tab.label}
              </Box>
            );
          })}
        </Box>

        <Paper elevation={0} sx={{ border: `1.5px solid ${PURPLE.border}`, borderRadius: 2, overflow: "hidden" }}>
          <Box sx={{ px: 3, py: 2, bgcolor: PURPLE.light, borderBottom: `1px solid ${PURPLE.mid}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography fontWeight={700} sx={{ color: PURPLE.text, fontSize: "0.95rem" }}>
              {TABS.find((t) => t.id === activeTab)?.label}
              {!loading && (
                <Chip label={`${rows.length} records`} size="small"
                  sx={{ ml: 1.5, bgcolor: PURPLE.mid, color: PURPLE.text, fontWeight: 700, fontSize: "0.7rem", height: 20 }} />
              )}
            </Typography>
            <Button onClick={openAdd} startIcon={<PlusIcon />} variant="contained" size="small"
              sx={{ bgcolor: PURPLE.main, boxShadow: "none", textTransform: "none", fontWeight: 600, borderRadius: "6px", "&:hover": { bgcolor: "#5A52D5", boxShadow: "none" } }}>
              Add Row
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: PURPLE.main }} />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: PURPLE.light }}>
                    <TableCell sx={{ color: PURPLE.text, width: 50 }}>#</TableCell>
                    {cols.map((col) => <TableCell key={col.key} sx={{ color: PURPLE.text }}>{col.label}</TableCell>)}
                    <TableCell align="center" sx={{ color: PURPLE.text, width: activeTab === "pending" ? 120 : 90 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={cols.length + 2} align="center" sx={{ py: 6, color: "text.secondary", fontStyle: "italic" }}>
                        No records found. Click "Add Row" to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row, idx) => (
                      <TableRow key={row.id} sx={{ "&:hover": { bgcolor: PURPLE.light }, "&:last-child td": { borderBottom: 0 } }}>
                        <TableCell sx={{ color: "text.secondary", fontSize: "0.78rem" }}>{idx + 1}</TableCell>
                        {cols.map((col) => (
                          <TableCell key={col.key} sx={{ fontSize: "0.88rem", color: "text.primary" }}>
                            {col.type === "date" ? formatDate(row[col.key]) : row[col.key] ?? "—"}
                          </TableCell>
                        ))}
                        <TableCell align="center">
                          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                            <Tooltip title="Edit" arrow>
                              <IconButton size="small" onClick={() => openEdit(row)}
                                sx={{ color: PURPLE.text, bgcolor: PURPLE.mid, borderRadius: "6px", width: 28, height: 28, "&:hover": { bgcolor: PURPLE.main, color: "#fff" } }}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            {activeTab === "pending" && (
                              <Tooltip title="Move to Completed" arrow>
                                <IconButton size="small" onClick={() => openPromote(row)}
                                  sx={{ color: GREEN.main, bgcolor: GREEN.light, borderRadius: "6px", width: 28, height: 28, "&:hover": { bgcolor: GREEN.main, color: "#fff" } }}>
                                  <ShareIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Delete" arrow>
                              <IconButton size="small" onClick={() => askDelete(row.id)}
                                sx={{ color: "#E53935", bgcolor: "#FFEBEE", borderRadius: "6px", width: 28, height: 28, "&:hover": { bgcolor: "#E53935", color: "#fff" } }}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth
        PaperProps={{ elevation: 0, sx: { border: `1.5px solid ${PURPLE.border}`, borderRadius: 2 } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Box sx={{ width: 4, height: 22, borderRadius: 1, bgcolor: PURPLE.main }} />
          <Typography fontWeight={700}>{editRow ? "Edit Record" : "Add New Record"}</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {cols.map((col) => <FieldInput key={col.key} col={col} value={formData[col.key]} onChange={handleField} />)}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeDialog} variant="outlined" size="small"
            sx={{ borderColor: PURPLE.border, color: PURPLE.text, textTransform: "none", borderRadius: "6px", "&:hover": { borderColor: PURPLE.main, bgcolor: PURPLE.light } }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" size="small"
            sx={{ bgcolor: PURPLE.main, boxShadow: "none", textTransform: "none", fontWeight: 700, borderRadius: "6px", "&:hover": { bgcolor: "#5A52D5", boxShadow: "none" } }}>
            {editRow ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Promote Dialog ── */}
      <Dialog open={promoteOpen} onClose={closePromote} maxWidth="sm" fullWidth
        PaperProps={{ elevation: 0, sx: { border: `1.5px solid ${GREEN.main}55`, borderRadius: 2 } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Box sx={{ width: 4, height: 22, borderRadius: 1, bgcolor: GREEN.main }} />
          <Box>
            <Typography fontWeight={700}>Move to Empanelment Completed</Typography>
            <Typography variant="caption" color="text.secondary">Fields highlighted in orange require manual entry</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {COMPLETED_COLS.map((col) => (
              <Box key={col.key}>
                <FieldInput col={col} value={promoteForm[col.key]} onChange={handlePromoteField} highlight={MANUAL_KEYS.has(col.key)} />
                {MANUAL_KEYS.has(col.key) && (
                  <Typography variant="caption" sx={{ color: "#FFA726", ml: 0.5 }}>⚠ No matching field in pending — please fill manually</Typography>
                )}
                {AUTO_FILLED_KEYS.has(col.key) && (
                  <Typography variant="caption" sx={{ color: GREEN.main, ml: 0.5 }}>✓ Auto-filled from pending record</Typography>
                )}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={closePromote} variant="outlined" size="small" disabled={promoteLoading}
            sx={{ borderColor: PURPLE.border, color: PURPLE.text, textTransform: "none", borderRadius: "6px", "&:hover": { borderColor: PURPLE.main, bgcolor: PURPLE.light } }}>
            Cancel
          </Button>
          <Button onClick={handlePromoteSave} variant="contained" size="small" disabled={promoteLoading}
            sx={{ bgcolor: GREEN.main, boxShadow: "none", textTransform: "none", fontWeight: 700, borderRadius: "6px", "&:hover": { bgcolor: GREEN.hover, boxShadow: "none" } }}>
            {promoteLoading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Save & Move to Completed"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ elevation: 0, sx: { border: "1.5px solid #FFCDD2", borderRadius: 2 } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 4, height: 22, borderRadius: 1, bgcolor: "#E53935" }} />
          <Typography fontWeight={700}>Confirm Delete</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">Are you sure you want to delete this record? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined" size="small"
            sx={{ borderColor: PURPLE.border, color: PURPLE.text, textTransform: "none", borderRadius: "6px" }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" size="small"
            sx={{ bgcolor: "#E53935", boxShadow: "none", textTransform: "none", fontWeight: 700, borderRadius: "6px", "&:hover": { bgcolor: "#C62828", boxShadow: "none" } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.severity} variant="filled" sx={{ fontWeight: 600 }}>{snack.msg}</Alert>
      </Snackbar>
    </>
  );

  if (inline) return <ThemeProvider theme={theme}>{content}</ThemeProvider>;
  return <ThemeProvider theme={theme}><CssBaseline />{content}</ThemeProvider>;
}