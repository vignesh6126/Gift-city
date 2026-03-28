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
  main: "#FFB347", glow: "#FFB34744", bg: "rgba(255,179,71,0.09)",
  border: "rgba(255,179,71,0.22)", red: "#FF5A5F", redBg: "rgba(255,90,95,0.10)",
  glass: "rgba(255,255,255,0.04)", glassBorder: "rgba(255,255,255,0.10)",
};

const theme = createTheme({
  palette: { mode: "dark", background: { default: "#080B1A", paper: "#0D1330" }, text: { primary: "#E8EEFF", secondary: "#8B9CC8" } },
  typography: { fontFamily: "'Outfit', -apple-system, sans-serif" },
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
});

const COLS = [
  { key: "client_name", label: "Client Name", type: "text" },
  { key: "esops_rsu", label: "ESOPS/RSU", type: "select", options: ["yes", "no"] },
  { key: "discussion_date", label: "Discussion Date", type: "date" },
  { key: "next_action", label: "Next Action", type: "text" },
];

const formatDate = (d) => !d ? "—" : new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const emptyRow = () => ({ client_name: "", esops_rsu: "no", discussion_date: "", next_action: "" });

const EditIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const DeleteIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const PlusIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>;
const BackIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;

const inputSx = () => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px", background: "rgba(255,255,255,0.04)", transition: "all 0.25s ease",
    "& fieldset": { borderColor: "rgba(255,255,255,0.12)", borderWidth: 1, transition: "all 0.25s ease" },
    "&:hover fieldset": { borderColor: C.main },
    "&.Mui-focused fieldset": { borderColor: C.main, boxShadow: `0 0 0 3px ${C.main}22` },
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.45)", "&.Mui-focused": { color: C.main } },
  "& .MuiInputBase-input": { color: "#E8EEFF" },
});

function FieldInput({ col, value, onChange }) {
  if (col.type === "select") {
    return (
      <FormControl fullWidth size="small" sx={inputSx()}>
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
      type={col.type === "date" ? "date" : "text"}
      value={value || ""} onChange={(e) => onChange(col.key, e.target.value)}
      InputLabelProps={col.type === "date" ? { shrink: true } : undefined}
      sx={inputSx()} />
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

export default function Interested({ inline = false, onDataChange }) {
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  const visibleCols = isMobile ? COLS.slice(0, 2) : COLS;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/interested`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch { showSnack("Failed to load", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showSnack = (msg, severity = "success") => setSnack({ open: true, msg, severity });
  const openAdd = () => { setEditRow(null); setFormData(emptyRow()); setDialogOpen(true); };
  const openEdit = (row) => { setEditRow(row); setFormData({ ...row }); setDialogOpen(true); };
  const handleField = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    const url = editRow ? `${API}/interested/${editRow.id}` : `${API}/interested`;
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
      await fetch(`${API}/interested/${deleteId}`, { method: "DELETE" });
      showSnack("Deleted"); setConfirmOpen(false); fetchData(); onDataChange?.();
    } catch { showSnack("Delete failed", "error"); }
  };

  const content = (
    <>
      {!inline && (
        <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 1.5, md: 2 }, display: "flex", alignItems: "center", gap: 2, background: "rgba(8,11,26,0.72)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${C.glassBorder}`, position: "sticky", top: 0, zIndex: 100 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "12px", background: `linear-gradient(135deg, ${C.main}, #FFD080)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${C.glow}` }}>
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 900, color: "#fff" }}>FD</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#fff", lineHeight: 1.1 }}>FINANCE DOCTOR</Typography>
              <Typography sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)" }}>Prospects</Typography>
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
            Prospects <Box component="span" sx={{ color: C.main, fontWeight: 700, fontSize: "0.7em" }}>/ Records</Box>
          </Typography>
        )}

        <GlassCard>
          <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 1.8, md: 2 }, borderBottom: `1px solid ${C.glassBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 4, height: 22, borderRadius: "4px", background: `linear-gradient(180deg, ${C.main}, #FFD080)` }} />
              <Typography sx={{ fontWeight: 700, color: C.main, fontSize: { xs: "0.78rem", md: "0.88rem" }, letterSpacing: "0.06em", textTransform: "uppercase" }}>Prospects</Typography>
              <Chip label={rows.length} size="small" sx={{ bgcolor: C.bg, color: C.main, fontWeight: 700, fontSize: "0.68rem", border: `1px solid ${C.border}`, height: 20 }} />
            </Box>
            <Button onClick={openAdd} startIcon={<PlusIcon />}
              sx={{ bgcolor: C.main, color: "#fff", textTransform: "none", fontWeight: 700, borderRadius: "12px", fontSize: "0.8rem", px: 2, py: 0.8, boxShadow: `0 4px 14px ${C.glow}`, "&:hover": { bgcolor: `${C.main}CC`, transform: "translateY(-2px)" }, transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
              Add Row
            </Button>
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
                      <TableCell key={col.key} sx={{ color: "rgba(255,255,255,0.3)", fontSize: { xs: "0.6rem", md: "0.68rem" }, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: `1px solid ${C.glassBorder}`, py: 1.5, px: { xs: 1.5, md: 2 } }}>{col.label}</TableCell>
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
                          {col.key === "esops_rsu" ? (
                            <Chip label={row[col.key] === "yes" ? "Yes" : "No"} size="small"
                              sx={{ bgcolor: row[col.key] === "yes" ? "rgba(78,205,196,0.15)" : "rgba(255,90,95,0.15)", color: row[col.key] === "yes" ? "#4ECDC4" : "#FF5A5F", fontWeight: 700, fontSize: "0.65rem", height: 18 }} />
                          ) : col.type === "date" ? formatDate(row[col.key]) : row[col.key] ?? "—"}
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ borderBottom: `1px solid rgba(255,255,255,0.04)`, py: { xs: 1, md: 1.5 }, px: { xs: 0.5, md: 2 } }}>
                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                          <ActionBtn title="Edit" onClick={() => openEdit(row)} color={C.main} bgColor={C.bg}><EditIcon /></ActionBtn>
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
          <Box sx={{ width: 4, height: 22, borderRadius: "4px", background: `linear-gradient(180deg, ${C.main}, #FFD080)` }} />
          <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "1.05rem" }}>{editRow ? "Edit Record" : "Add New Record"}</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            {COLS.map(col => <FieldInput key={col.key} col={col} value={formData[col.key]} onChange={handleField} />)}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", px: 2.5 }}>Cancel</Button>
          <Button onClick={handleSave} sx={{ bgcolor: C.main, color: "#fff", textTransform: "none", fontWeight: 700, borderRadius: "12px", px: 3, boxShadow: `0 4px 14px ${C.glow}`, "&:hover": { bgcolor: `${C.main}CC`, transform: "translateY(-2px)" }, transition: "all 0.25s ease" }}>{editRow ? "Update" : "Save"}</Button>
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