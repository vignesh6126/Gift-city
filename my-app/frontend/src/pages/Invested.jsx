import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, AppBar, Toolbar, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, Chip, CircularProgress,
  Snackbar, Alert, Tooltip,
} from "@mui/material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const theme = createTheme({
  palette: {
    mode: "light",
    background: { default: "#F0F7FF", paper: "#FFFFFF" },
    text: { primary: "#1A2B3C", secondary: "#5A7A99" },
  },
  typography: { fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
  shape: { borderRadius: 10 },
  components: {
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.04em" },
      },
    },
  },
});

// Single light-blue color for everything
const BLUE = {
  main:   "#2196F3",
  light:  "#E3F2FD",
  mid:    "#BBDEFB",
  border: "#90CAF9",
  text:   "#1565C0",
};

const TABS = [
  { id: "completed", label: "Customers Completed" },
  { id: "pending",   label: "Customers Pending"   },
];

const COMPLETED_COLS = [
  { key: "client_name",      label: "Client Name",      type: "text"   },
  { key: "first_investment", label: "First Investment",  type: "text"   },
  { key: "amount",           label: "Amount",            type: "number" },
  { key: "scheme",           label: "Scheme",            type: "text"   },
  { key: "bank",             label: "Bank",              type: "select", options: ["gift", "savings", "both"] },
];

const PENDING_COLS = [
  { key: "client_name",          label: "Client Name",          type: "text"   },
  { key: "amount_tobe_invested", label: "Amount to be Invested", type: "number" },
  { key: "scheme",               label: "Scheme",               type: "text"   },
  { key: "bank",                 label: "Bank",                  type: "select", options: ["gift", "savings", "both"] },
  { key: "submission_date",      label: "Submission Date",       type: "date"   },
  { key: "status",               label: "Status",                type: "text"   },
];

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const emptyCompleted = () => ({ client_name: "", first_investment: "", amount: "", scheme: "", bank: "savings" });
const emptyPending   = () => ({ client_name: "", amount_tobe_invested: "", scheme: "", bank: "savings", submission_date: "", status: "" });

function FieldInput({ col, value, onChange }) {
  if (col.type === "select") {
    return (
      <FormControl fullWidth size="small">
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
    />
  );
}

export default function Invested({ inline = false }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]     = useState("completed");
  const [rows, setRows]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [editRow, setEditRow]         = useState(null);
  const [formData, setFormData]       = useState({});
  const [deleteId, setDeleteId]       = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snack, setSnack]             = useState({ open: false, msg: "", severity: "success" });

  const cols = activeTab === "completed" ? COMPLETED_COLS : PENDING_COLS;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/invested/${activeTab}`);
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

  const openAdd = () => {
    setEditRow(null);
    setFormData(activeTab === "completed" ? emptyCompleted() : emptyPending());
    setDialogOpen(true);
  };
  const openEdit = (row) => { setEditRow(row); setFormData({ ...row }); setDialogOpen(true); };
  const closeDialog = () => setDialogOpen(false);
  const handleField = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    const url    = editRow ? `${API}/invested/${activeTab}/${editRow.id}` : `${API}/invested/${activeTab}`;
    const method = editRow ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      showSnack(editRow ? "Record updated!" : "Record added!");
      closeDialog();
      fetchData();
    } catch {
      showSnack("Save failed", "error");
    }
  };

  const askDelete = (id) => { setDeleteId(id); setConfirmOpen(true); };
  const handleDelete = async () => {
    try {
      await fetch(`${API}/invested/${activeTab}/${deleteId}`, { method: "DELETE" });
      showSnack("Record deleted");
      setConfirmOpen(false);
      fetchData();
    } catch {
      showSnack("Delete failed", "error");
    }
  };

  const content = (
    <>
      {/* AppBar — standalone only */}
      {!inline && (
        <AppBar position="static" elevation={0}
          sx={{ bgcolor: "#fff", borderBottom: "1px solid #BBDEFB" }}>
          <Toolbar>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: BLUE.main,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="caption" fontWeight={900} color="#fff" fontSize="0.68rem">FD</Typography>
              </Box>
              <Typography variant="h6" fontWeight={800} color="text.primary">Finance Doctor</Typography>
            </Box>
            <Button onClick={() => navigate("/dashboard")} startIcon={<BackIcon />}
              variant="outlined" size="small"
              sx={{ color: BLUE.text, borderColor: BLUE.border, textTransform: "none", mr: 1,
                "&:hover": { borderColor: BLUE.main, bgcolor: BLUE.light } }}>
              Dashboard
            </Button>
            <Button onClick={() => { localStorage.removeItem("user"); navigate("/login"); }}
              variant="outlined" size="small"
              sx={{ color: BLUE.main, borderColor: BLUE.border, textTransform: "none",
                "&:hover": { bgcolor: BLUE.light } }}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
      )}

      {/* Body */}
      <Box sx={{
        minHeight: inline ? "unset" : "calc(100vh - 64px)",
        bgcolor: inline ? "transparent" : "#F0F7FF",
        px: inline ? 0 : { xs: 2, md: 4 },
        py: inline ? 0 : 3,
      }}>
        {!inline && (
          <Typography variant="h5" fontWeight={800} color={BLUE.text} sx={{ mb: 3 }}>
            Invested Customers
          </Typography>
        )}

        {/* Sub-tabs — both same light blue */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Box key={tab.id} onClick={() => setActiveTab(tab.id)}
                sx={{
                  cursor: "pointer", px: 3, py: 1, borderRadius: "50px",
                  border: `2px solid ${isActive ? BLUE.main : BLUE.border}`,
                  bgcolor: isActive ? BLUE.main : "#fff",
                  color: isActive ? "#fff" : BLUE.text,
                  fontWeight: 700, fontSize: "0.85rem",
                  transition: "all 0.25s ease",
                  boxShadow: isActive ? `0 3px 10px ${BLUE.main}44` : "0 1px 3px rgba(0,0,0,0.07)",
                  userSelect: "none",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 5px 14px ${BLUE.main}33`,
                    borderColor: BLUE.main,
                    bgcolor: isActive ? BLUE.main : BLUE.light,
                  },
                }}>
                {tab.label}
              </Box>
            );
          })}
        </Box>

        {/* Table card */}
        <Paper elevation={0}
          sx={{ border: `1.5px solid ${BLUE.border}`, borderRadius: 3, overflow: "hidden" }}>

          {/* Card header */}
          <Box sx={{
            px: 3, py: 2, bgcolor: BLUE.light,
            borderBottom: `1px solid ${BLUE.mid}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <Typography fontWeight={700} sx={{ color: BLUE.text, fontSize: "0.95rem" }}>
              {TABS.find((t) => t.id === activeTab).label}
              {!loading && (
                <Chip label={`${rows.length} records`} size="small"
                  sx={{ ml: 1.5, bgcolor: BLUE.mid, color: BLUE.text,
                    fontWeight: 700, fontSize: "0.7rem", height: 20 }} />
              )}
            </Typography>
            <Button onClick={openAdd} startIcon={<PlusIcon />} variant="contained" size="small"
              sx={{ bgcolor: BLUE.main, boxShadow: "none", textTransform: "none", fontWeight: 600,
                borderRadius: "8px", "&:hover": { bgcolor: BLUE.main, opacity: 0.88, boxShadow: "none" } }}>
              Add Row
            </Button>
          </Box>

          {/* Table */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: BLUE.main }} />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(BLUE.main, 0.04) }}>
                    <TableCell sx={{ color: "text.secondary", width: 50 }}>#</TableCell>
                    {cols.map((col) => (
                      <TableCell key={col.key} sx={{ color: BLUE.text }}>{col.label}</TableCell>
                    ))}
                    {/* ── Actions column removed ── */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={cols.length + 1} align="center"
                        sx={{ py: 6, color: "text.secondary", fontStyle: "italic" }}>
                        No records found. Click "Add Row" to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row, idx) => (
                      <TableRow key={row.id}
                        sx={{
                          "&:hover": { bgcolor: BLUE.light },
                          "&:last-child td": { borderBottom: 0 },
                        }}>
                        <TableCell sx={{ color: "text.secondary", fontSize: "0.78rem" }}>{idx + 1}</TableCell>
                        {cols.map((col) => (
                          <TableCell key={col.key} sx={{ fontSize: "0.88rem", color: "text.primary" }}>
                            {/* All cells plain text — no colored chips */}
                            {row[col.key] ?? "—"}
                          </TableCell>
                        ))}
                        {/* ── No Actions cell ── */}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth
        PaperProps={{ elevation: 0, sx: { border: `1.5px solid ${BLUE.border}`, borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Box sx={{ width: 4, height: 22, borderRadius: 2, bgcolor: BLUE.main }} />
          <Typography fontWeight={700}>{editRow ? "Edit Record" : "Add New Record"}</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {cols.map((col) => (
              <FieldInput key={col.key} col={col} value={formData[col.key]} onChange={handleField} />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeDialog} variant="outlined" size="small"
            sx={{ borderColor: BLUE.border, color: BLUE.text, textTransform: "none",
              "&:hover": { borderColor: BLUE.main, bgcolor: BLUE.light } }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" size="small"
            sx={{ bgcolor: BLUE.main, boxShadow: "none", textTransform: "none", fontWeight: 700,
              "&:hover": { bgcolor: BLUE.main, opacity: 0.88, boxShadow: "none" } }}>
            {editRow ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ elevation: 0, sx: { border: `1.5px solid ${BLUE.border}`, borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to delete this record? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined" size="small"
            sx={{ borderColor: BLUE.border, color: BLUE.text, textTransform: "none" }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" size="small"
            sx={{ bgcolor: BLUE.main, boxShadow: "none", textTransform: "none", fontWeight: 700,
              "&:hover": { bgcolor: "#1565C0", boxShadow: "none" } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.severity} variant="filled" sx={{ fontWeight: 600 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );

  if (inline) return <ThemeProvider theme={theme}>{content}</ThemeProvider>;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {content}
    </ThemeProvider>
  );
}