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
    background: { default: "#FFF8F0", paper: "#FFFFFF" },
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

const ORANGE = {
  main:   "#E67E22",
  light:  "#FEF5E8",
  mid:    "#FDEBD0",
  border: "#F5CBA7",
  text:   "#A04000",
};

const COLS = [
  { key: "client_name",   label: "Client Name",   type: "text" },
  { key: "last_meeting",  label: "Last Meeting",   type: "date" },
  { key: "next_meeting",  label: "Next Meeting",   type: "date" },
  { key: "invested",      label: "Invested",       type: "select", options: ["yes", "no"] },
];

// ── Icons ─────────────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const DeleteIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const BackIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const emptyRow = () => ({ client_name: "", last_meeting: "", next_meeting: "", invested: "no" });

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
      type={col.type === "date" ? "date" : "text"}
      value={value || ""}
      onChange={(e) => onChange(col.key, e.target.value)}
      InputLabelProps={col.type === "date" ? { shrink: true } : undefined}
    />
  );
}

export default function Interested({ inline = false }) {
  const navigate = useNavigate();
  const [rows, setRows]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [editRow, setEditRow]         = useState(null);
  const [formData, setFormData]       = useState({});
  const [deleteId, setDeleteId]       = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snack, setSnack]             = useState({ open: false, msg: "", severity: "success" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/interested`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      showSnack("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showSnack   = (msg, severity = "success") => setSnack({ open: true, msg, severity });
  const openAdd     = () => { setEditRow(null); setFormData(emptyRow()); setDialogOpen(true); };
  const openEdit    = (row) => { setEditRow(row); setFormData({ ...row }); setDialogOpen(true); };
  const closeDialog = () => setDialogOpen(false);
  const handleField = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    const url    = editRow ? `${API}/interested/${editRow.id}` : `${API}/interested`;
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

  const askDelete    = (id) => { setDeleteId(id); setConfirmOpen(true); };
  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/interested/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showSnack("Record deleted");
      setConfirmOpen(false);
      fetchData();
    } catch {
      showSnack("Delete failed", "error");
    }
  };

  const content = (
    <>
      {/* ── AppBar — standalone only ── */}
      {!inline && (
        <AppBar position="static" elevation={0}
          sx={{ bgcolor: "#fff", borderBottom: `1px solid ${ORANGE.border}` }}>
          <Toolbar>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: ORANGE.main,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="caption" fontWeight={900} color="#fff" fontSize="0.68rem">FD</Typography>
              </Box>
              <Typography variant="h6" fontWeight={800} color="text.primary">Finance Doctor</Typography>
            </Box>
            <Button onClick={() => navigate("/dashboard")} startIcon={<BackIcon />}
              variant="outlined" size="small"
              sx={{ color: ORANGE.text, borderColor: ORANGE.border, textTransform: "none", mr: 1,
                "&:hover": { borderColor: ORANGE.main, bgcolor: ORANGE.light } }}>
              Dashboard
            </Button>
            <Button onClick={() => { localStorage.removeItem("user"); navigate("/login"); }}
              variant="outlined" size="small"
              sx={{ color: ORANGE.main, borderColor: ORANGE.border, textTransform: "none",
                "&:hover": { bgcolor: ORANGE.light } }}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
      )}

      {/* ── Body ── */}
      <Box sx={{
        minHeight: inline ? "unset" : "calc(100vh - 64px)",
        bgcolor:   inline ? "transparent" : "#FFF8F0",
        px: inline ? 0 : { xs: 2, md: 4 },
        py: inline ? 0 : 3,
      }}>
        {!inline && (
          <Typography variant="h5" fontWeight={800} color={ORANGE.text} sx={{ mb: 3 }}>
            Interested Customers
          </Typography>
        )}

        {/* ── Table card ── */}
        <Paper elevation={0}
          sx={{ border: `1.5px solid ${ORANGE.border}`, borderRadius: 2, overflow: "hidden" }}>

          {/* Card header */}
          <Box sx={{
            px: 3, py: 2, bgcolor: ORANGE.light,
            borderBottom: `1px solid ${ORANGE.mid}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <Typography fontWeight={700} sx={{ color: ORANGE.text, fontSize: "0.95rem" }}>
              Interested Customers
              {!loading && (
                <Chip label={`${rows.length} records`} size="small"
                  sx={{ ml: 1.5, bgcolor: ORANGE.mid, color: ORANGE.text,
                    fontWeight: 700, fontSize: "0.7rem", height: 20 }} />
              )}
            </Typography>
            <Button onClick={openAdd} startIcon={<PlusIcon />} variant="contained" size="small"
              sx={{ bgcolor: ORANGE.main, boxShadow: "none", textTransform: "none", fontWeight: 600,
                borderRadius: "6px", "&:hover": { bgcolor: "#CA6F1E", boxShadow: "none" } }}>
              Add Row
            </Button>
          </Box>

          {/* Table */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: ORANGE.main }} />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: ORANGE.light }}>
                    <TableCell sx={{ color: ORANGE.text, width: 50 }}>#</TableCell>
                    {COLS.map((col) => (
                      <TableCell key={col.key} sx={{ color: ORANGE.text }}>{col.label}</TableCell>
                    ))}
                    <TableCell align="center" sx={{ color: ORANGE.text, width: 90 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={COLS.length + 2} align="center"
                        sx={{ py: 6, color: "text.secondary", fontStyle: "italic" }}>
                        No records found. Click "Add Row" to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row, idx) => (
                      <TableRow key={row.id}
                        sx={{
                          "&:hover": { bgcolor: ORANGE.light },
                          "&:last-child td": { borderBottom: 0 },
                        }}>
                        <TableCell sx={{ color: "text.secondary", fontSize: "0.78rem" }}>{idx + 1}</TableCell>
                        {COLS.map((col) => (
                          <TableCell key={col.key} sx={{ fontSize: "0.88rem", color: "text.primary" }}>
                            {col.key === "invested" ? (
                              <Chip
                                label={row[col.key] === "yes" ? "Yes" : "No"}
                                size="small"
                                sx={{
                                  bgcolor: row[col.key] === "yes" ? "#E8F5E9" : "#FFEBEE",
                                  color:   row[col.key] === "yes" ? "#2E7D32" : "#C62828",
                                  fontWeight: 700, fontSize: "0.72rem", height: 20,
                                }}
                              />
                            ) : (
                              col.type === "date"
  ? formatDate(row[col.key])
  : row[col.key] ?? "—"
                            )}
                          </TableCell>
                        ))}

                        {/* ── Edit + Delete ── */}
                        <TableCell align="center">
                          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                            <Tooltip title="Edit" arrow>
                              <IconButton size="small" onClick={() => openEdit(row)}
                                sx={{
                                  color: ORANGE.text, bgcolor: ORANGE.mid,
                                  borderRadius: "6px", width: 28, height: 28,
                                  "&:hover": { bgcolor: ORANGE.main, color: "#fff" },
                                }}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete" arrow>
                              <IconButton size="small" onClick={() => askDelete(row.id)}
                                sx={{
                                  color: "#E53935", bgcolor: "#FFEBEE",
                                  borderRadius: "6px", width: 28, height: 28,
                                  "&:hover": { bgcolor: "#E53935", color: "#fff" },
                                }}>
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
        PaperProps={{ elevation: 0, sx: { border: `1.5px solid ${ORANGE.border}`, borderRadius: 2 } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Box sx={{ width: 4, height: 22, borderRadius: 1, bgcolor: ORANGE.main }} />
          <Typography fontWeight={700}>{editRow ? "Edit Record" : "Add New Record"}</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {COLS.map((col) => (
              <FieldInput key={col.key} col={col} value={formData[col.key]} onChange={handleField} />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={closeDialog} variant="outlined" size="small"
            sx={{ borderColor: ORANGE.border, color: ORANGE.text, textTransform: "none", borderRadius: "6px",
              "&:hover": { borderColor: ORANGE.main, bgcolor: ORANGE.light } }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" size="small"
            sx={{ bgcolor: ORANGE.main, boxShadow: "none", textTransform: "none", fontWeight: 700,
              borderRadius: "6px", "&:hover": { bgcolor: "#CA6F1E", boxShadow: "none" } }}>
            {editRow ? "Update" : "Save"}
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
          <Typography color="text.secondary">
            Are you sure you want to delete this record? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined" size="small"
            sx={{ borderColor: ORANGE.border, color: ORANGE.text, textTransform: "none", borderRadius: "6px" }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" size="small"
            sx={{ bgcolor: "#E53935", boxShadow: "none", textTransform: "none", fontWeight: 700,
              borderRadius: "6px", "&:hover": { bgcolor: "#C62828", boxShadow: "none" } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
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