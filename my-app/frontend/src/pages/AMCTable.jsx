import React, { useState, useEffect, useCallback, useRef } from "react";

const API = import.meta.env.VITE_API_URL;

/* ─── Icons ─── */
const IcoRefresh = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <polyline points="23 4 23 10 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="1 20 1 14 7 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IcoClose = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
);
const IcoChevron = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IcoFilter = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IcoX = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
);

/* ─── Helpers ─── */
function formatAUM(val) {
  if (!val && val !== 0) return "—";
  const n = Number(val);
  if (isNaN(n)) return "—";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000)     return "$" + (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return "$" + n.toLocaleString("en-US");
}

function formatDate(val) {
    if (!val) return "—";
    const d = new Date(val);
    if (isNaN(d)) return val;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function Avatar({ name, color = "linear-gradient(135deg,#2050c8,#6622bb)" }) {
    return (
        <div style={{
            width: 28, height: 28, borderRadius: "50%", background: color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: ".7rem", fontWeight: 700, color: "#fff", flexShrink: 0,
            boxShadow: "0 0 10px rgba(79,142,247,0.4)",
        }}>
            {(name || "?").charAt(0).toUpperCase()}
        </div>
    );
}

/* ─── Custom Dropdown ─── */
function FilterDropdown({ label, value, options, onChange, accent = "#4F8EF7", accentRgb = "79,142,247", theme = "dark" }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const isActive = value !== "all";
    const selectedLabel = options.find(o => o.value === value)?.label || label;

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "7px 12px 7px 10px",
                    borderRadius: 10,
                    border: isActive
                        ? `1px solid rgba(${accentRgb},0.65)`
                        : theme === "light" ? "1px solid rgba(0,0,0,0.22)" : "1px solid rgba(79,142,247,0.22)",
                    background: isActive
                        ? `rgba(${accentRgb},0.15)`
                        : theme === "light" ? "rgba(255,255,255,0.55)" : "rgba(10,16,60,0.5)",
                    color: isActive ? accent : theme === "light" ? "rgba(0,0,0,0.65)" : "rgba(180,210,255,0.75)",
                    fontSize: ".74rem", fontWeight: 700,
                    cursor: "pointer", whiteSpace: "nowrap",
                    transition: "all .2s",
                    backdropFilter: "blur(8px)",
                    boxShadow: isActive ? `0 0 12px rgba(${accentRgb},0.2)` : "none",
                    fontFamily: "var(--fb,'Exo 2',sans-serif)",
                    letterSpacing: ".03em",
                }}
            >
                {isActive && (
                    <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: accent,
                        boxShadow: `0 0 6px ${accent}`,
                        flexShrink: 0,
                    }} />
                )}
                <span style={{ maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {isActive ? selectedLabel : label}
                </span>
                <span style={{
                    display: "inline-flex", transition: "transform .2s",
                    transform: open ? "rotate(180deg)" : "none",
                    opacity: 0.6, flexShrink: 0,
                }}>
                    <IcoChevron />
                </span>
                {isActive && (
                    <span
                        onClick={(e) => { e.stopPropagation(); onChange("all"); }}
                        style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 16, height: 16, borderRadius: "50%",
                            background: `rgba(${accentRgb},0.25)`,
                            color: accent, flexShrink: 0,
                            transition: "background .15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = `rgba(${accentRgb},0.45)`}
                        onMouseLeave={e => e.currentTarget.style.background = `rgba(${accentRgb},0.25)`}
                    >
                        <IcoX />
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0,
                    minWidth: 180, maxHeight: 260, overflowY: "auto",
                    background: theme === "light" ? "rgba(255,255,255,0.97)" : "rgba(7,10,38,0.97)",
                    border: `1px solid rgba(${accentRgb},0.35)`,
                    borderRadius: 12, zIndex: 999,
                    boxShadow: theme === "light" ? `0 8px 32px rgba(0,0,0,0.18), 0 0 0 1px rgba(${accentRgb},0.1)` : `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(${accentRgb},0.1)`,
                    backdropFilter: "blur(20px)",
                    animation: "ddIn .15s ease",
                    scrollbarWidth: "thin",
                }}>
                    {options.map((opt) => {
                        const isSelected = value === opt.value;
                        return (
                            <button
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    width: "100%", padding: "9px 14px",
                                    background: isSelected ? `rgba(${accentRgb},0.18)` : "transparent",
                                    border: "none", cursor: "pointer",
                                    color: isSelected ? accent : theme === "light" ? "rgba(0,0,0,0.7)" : "rgba(180,210,255,0.75)",
                                    fontSize: ".76rem", fontWeight: isSelected ? 700 : 500,
                                    textAlign: "left", transition: "all .15s",
                                    fontFamily: "var(--fb,'Exo 2',sans-serif)",
                                    borderBottom: theme === "light" ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(79,142,247,0.06)",
                                }}
                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = `rgba(${accentRgb},0.1)`; e.currentTarget.style.color = theme === "light" ? "#000" : "#fff"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = isSelected ? `rgba(${accentRgb},0.18)` : "transparent"; e.currentTarget.style.color = isSelected ? accent : theme === "light" ? "rgba(0,0,0,0.7)" : "rgba(180,210,255,0.75)"; }}
                            >
                                {isSelected && (
                                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: accent, flexShrink: 0 }} />
                                )}
                                <span style={{ marginLeft: isSelected ? 0 : 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {opt.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ─── Reusable Modal Shell ─── */
function Modal({ title, subtitle, barColor = "#4F8EF7", onClose, children }) {
    useEffect(() => {
        const h = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [onClose]);

    return (
        <div className="dlg-ov" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="dlg-box" style={{ maxWidth: 660, width: "100%" }}>
                <div className="dlg-hdr" style={{ justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <div className="dlg-bar" style={{ background: barColor }} />
                        <div>
                            <div className="dlg-ttl">{title}</div>
                            <div className="dlg-sub">{subtitle}</div>
                        </div>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}><IcoClose /></button>
                </div>
                <div style={{ maxHeight: "58vh", overflowY: "auto" }}>
                    {children}
                </div>
                <div className="dlg-foot">
                    <button className="btn-cancel" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   1. CLIENTS MODAL
   ══════════════════════════════════════════ */
function ClientsModal({ amcName, clients, onClose }) {
    const totalAUM = clients.reduce((s, c) => s + (Number(c.amount) || 0), 0);
    return (
        <Modal
            title={`Clients — ${amcName}`}
            subtitle={`${clients.length} client${clients.length !== 1 ? "s" : ""} · Total AUM ${formatAUM(totalAUM)}`}
            barColor="linear-gradient(180deg,#4F8EF7,#7B5FFF)"
            onClose={onClose}
        >
            {clients.length === 0 ? (
                <div className="modal-empty">No completed clients for this AMC.</div>
            ) : (
                <div className="tbl-wrap">
                    <table className="fd-tbl">
                        <thead>
                            <tr>
                                <th style={{ width: 36 }}>#</th>
                                <th>Client Name</th>
                                <th>First Investment</th>
                                <th>Amount</th>
                                <th>Scheme</th>
                                <th>Bank</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((c, i) => (
                                <tr key={c.id ?? i}>
                                    <td className="fd-num">{i + 1}</td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <Avatar name={c.client_name} />
                                            <span style={{ color: "#e8f0ff", fontWeight: 600 }}>{c.client_name || "—"}</span>
                                        </div>
                                    </td>
                                    <td><span style={{ color: "rgba(180,210,255,0.7)", fontSize: ".78rem" }}>{formatDate(c.first_investment)}</span></td>
                                    <td><span style={{ color: "#4F8EF7", fontWeight: 700, fontFamily: "var(--fh,'Orbitron',sans-serif)", fontSize: ".78rem" }}>{c.amount != null ? formatAUM(c.amount) : "—"}</span></td>
                                    <td>{c.scheme ? <span className="modal-chip modal-chip-purple">{c.scheme}</span> : <span className="modal-dash">—</span>}</td>
                                    <td>{c.bank ? <span className="modal-chip modal-chip-teal">{c.bank}</span> : <span className="modal-dash">—</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Modal>
    );
}

/* ══════════════════════════════════════════
   2. CLIENTS PENDING MODAL
   ══════════════════════════════════════════ */
function PendingModal({ amcName, clients, onClose }) {
    return (
        <Modal
            title={`Clients Pending — ${amcName}`}
            subtitle={`${clients.length} pending client${clients.length !== 1 ? "s" : ""}`}
            barColor="linear-gradient(180deg,#F59E0B,#D97706)"
            onClose={onClose}
        >
            {clients.length === 0 ? (
                <div className="modal-empty">No pending clients for this AMC.</div>
            ) : (
                <div className="tbl-wrap">
                    <table className="fd-tbl">
                        <thead>
                            <tr>
                                <th style={{ width: 36 }}>#</th>
                                <th>Client Name</th>
                                <th>Amt. to Invest</th>
                                <th>Scheme</th>
                                <th>Bank</th>
                                <th>Submission</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((c, i) => (
                                <tr key={c.id ?? i}>
                                    <td className="fd-num">{i + 1}</td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <Avatar name={c.client_name} color="linear-gradient(135deg,#b45309,#d97706)" />
                                            <span style={{ color: "#e8f0ff", fontWeight: 600 }}>{c.client_name || "—"}</span>
                                        </div>
                                    </td>
                                    <td><span style={{ color: "#F59E0B", fontWeight: 700, fontFamily: "var(--fh,'Orbitron',sans-serif)", fontSize: ".78rem" }}>{c.amount_tobe_invested != null ? formatAUM(c.amount_tobe_invested) : "—"}</span></td>
                                    <td>{c.scheme ? <span className="modal-chip modal-chip-purple">{c.scheme}</span> : <span className="modal-dash">—</span>}</td>
                                    <td>{c.bank ? <span className="modal-chip modal-chip-teal">{c.bank}</span> : <span className="modal-dash">—</span>}</td>
                                    <td><span style={{ color: "rgba(180,210,255,0.7)", fontSize: ".78rem" }}>{formatDate(c.submission_date)}</span></td>
                                    <td>{c.status ? <span className="modal-chip modal-chip-orange">{c.status}</span> : <span className="modal-dash">—</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Modal>
    );
}

/* ══════════════════════════════════════════
   3. PRODUCTS MODAL
   ══════════════════════════════════════════ */
function ProductsModal({ amcName, products, onClose }) {
    return (
        <Modal
            title={`Products — ${amcName}`}
            subtitle={`${products.length} product${products.length !== 1 ? "s" : ""}`}
            barColor="linear-gradient(180deg,#A78BFA,#7C3AED)"
            onClose={onClose}
        >
            {products.length === 0 ? (
                <div className="modal-empty">No products found for this AMC.</div>
            ) : (
                <div className="tbl-wrap">
                    <table className="fd-tbl">
                        <thead>
                            <tr>
                                <th style={{ width: 36 }}>#</th>
                                <th>Product Name</th>
                                <th>Min Investment</th>
                                <th>Onboarding</th>
                                <th>Structure</th>
                                <th>Lock-in</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p, i) => (
                                <tr key={p.id ?? i}>
                                    <td className="fd-num">{i + 1}</td>
                                    <td><span style={{ color: "#e8f0ff", fontWeight: 600 }}>{p.product_name || "—"}</span></td>
                                    <td><span style={{ color: "#A78BFA", fontWeight: 700, fontFamily: "var(--fh,'Orbitron',sans-serif)", fontSize: ".78rem" }}>{p.min_investment != null ? formatAUM(p.min_investment) : "—"}</span></td>
                                    <td>{p.onboarding_process ? <span className={`modal-chip ${p.onboarding_process === "online" ? "modal-chip-green" : "modal-chip-teal"}`}>{p.onboarding_process}</span> : <span className="modal-dash">—</span>}</td>
                                    <td>{p.structure ? <span className="modal-chip modal-chip-blue" style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block" }}>{p.structure}</span> : <span className="modal-dash">—</span>}</td>
                                    <td>{p.lock_in ? <span className="modal-chip modal-chip-orange">{p.lock_in}</span> : <span className="modal-dash">—</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Modal>
    );
}

/* ══════════════════════════════════════════
   MAIN AMCTable
   ══════════════════════════════════════════ */
export default function AMCTable({ onDataChange, theme = "dark" }) {
    const [rows,        setRows]        = useState([]);
    const [loading,     setLoading]     = useState(false);
    const [error,       setError]       = useState(null);

    const [custCompMap, setCustCompMap] = useState({});
    const [custPendMap, setCustPendMap] = useState({});
    const [productsMap, setProductsMap] = useState({});

    // Filters
    const [filterAMC,     setFilterAMC]     = useState("all");
    const [filterStatus,  setFilterStatus]  = useState("all");
    const [filterProducts,setFilterProducts]= useState("all");
    const [filterClients, setFilterClients] = useState("all");

    // modal
    const [modal, setModal] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [empComp, empPend, custComp, custPend, products] = await Promise.all([
                fetch(`${API}/empanelment/completed`).then(r => r.json()),
                fetch(`${API}/empanelment/pending`).then(r => r.json()),
                fetch(`${API}/invested/completed`).then(r => r.json()),
                fetch(`${API}/invested/pending`).then(r => r.json()),
                fetch(`${API}/products`).then(r => r.json()),
            ]);

            const ccMap = {}, cpMap = {}, prMap = {};
            (Array.isArray(custComp) ? custComp : []).forEach(r => {
                const k = (r.amc_name || "").toLowerCase().trim();
                if (!k) return;
                (ccMap[k] = ccMap[k] || []).push(r);
            });
            (Array.isArray(custPend) ? custPend : []).forEach(r => {
                const k = (r.amc_name || "").toLowerCase().trim();
                if (!k) return;
                (cpMap[k] = cpMap[k] || []).push(r);
            });
            (Array.isArray(products) ? products : []).forEach(r => {
                const k = (r.amc_name || "").toLowerCase().trim();
                if (!k) return;
                (prMap[k] = prMap[k] || []).push(r);
            });
            setCustCompMap(ccMap);
            setCustPendMap(cpMap);
            setProductsMap(prMap);

            const completedSet = new Set(
                (Array.isArray(empComp) ? empComp : []).map(r => (r.AMC_name || "").toLowerCase().trim())
            );
            const amcMap = new Map();
            (Array.isArray(empComp) ? empComp : []).forEach(r => {
                if (r.AMC_name) amcMap.set(r.AMC_name.toLowerCase().trim(), r.AMC_name);
            });
            (Array.isArray(empPend) ? empPend : []).forEach(r => {
                if (r.AMC_name && !amcMap.has(r.AMC_name.toLowerCase().trim()))
                    amcMap.set(r.AMC_name.toLowerCase().trim(), r.AMC_name);
            });

            const aumMap = new Map(), clientsMap = new Map(), pendingMap = new Map(), prodMap = new Map();
            (Array.isArray(custComp) ? custComp : []).forEach(r => {
                const k = (r.amc_name || "").toLowerCase().trim(); if (!k) return;
                aumMap.set(k, (aumMap.get(k) || 0) + (Number(r.amount) || 0));
                clientsMap.set(k, (clientsMap.get(k) || 0) + 1);
            });
            (Array.isArray(custPend) ? custPend : []).forEach(r => {
                const k = (r.amc_name || "").toLowerCase().trim(); if (!k) return;
                pendingMap.set(k, (pendingMap.get(k) || 0) + 1);
            });
            (Array.isArray(products) ? products : []).forEach(r => {
                const k = (r.amc_name || "").toLowerCase().trim(); if (!k) return;
                prodMap.set(k, (prodMap.get(k) || 0) + 1);
            });

            const tableRows = Array.from(amcMap.entries()).map(([normKey, displayName]) => ({
                amc: displayName, normKey,
                status:         completedSet.has(normKey) ? "completed" : "pending",
                aum:            aumMap.get(normKey)     || 0,
                clients:        clientsMap.get(normKey) || 0,
                clientsPending: pendingMap.get(normKey) || 0,
                products:       prodMap.get(normKey)    || 0,
            }));
            tableRows.sort((a, b) => {
                if (a.status !== b.status) return a.status === "completed" ? -1 : 1;
                return a.amc.localeCompare(b.amc);
            });
            setRows(tableRows);
        } catch {
            setError("Failed to load AMC data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // ── Build filter options from rows ──
    const amcOptions = [
        { value: "all", label: "All AMCs" },
        ...rows.map(r => ({ value: r.normKey, label: r.amc })),
    ];

    const statusOptions = [
        { value: "all",       label: "All Statuses" },
        { value: "completed", label: "Active"        },
        { value: "pending",   label: "Inactive"      },
    ];

    // Products: unique product names across all AMCs
    const allProductNames = [...new Set(
        Object.values(productsMap).flat().map(p => p.product_name).filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));

    const productsOptions = [
        { value: "all", label: "All Products" },
        ...allProductNames.map(name => ({ value: name, label: name })),
    ];

    // Clients: unique client names from BOTH completed AND pending
    const allClientNames = [...new Set([
        ...Object.values(custCompMap).flat().map(c => c.client_name),
        ...Object.values(custPendMap).flat().map(c => c.client_name),
    ].filter(Boolean))].sort((a, b) => a.localeCompare(b));

    const clientsOptions = [
        { value: "all", label: "All Clients" },
        ...allClientNames.map(name => ({ value: name, label: name })),
    ];

    // ── Apply filters ──
    const filteredRows = rows.filter(row => {
        if (filterAMC !== "all" && row.normKey !== filterAMC) return false;
        if (filterStatus !== "all" && row.status !== filterStatus) return false;
        if (filterProducts !== "all") {
            // keep row only if it has a product with that name
            const rowProducts = productsMap[row.normKey] || [];
            if (!rowProducts.some(p => p.product_name === filterProducts)) return false;
        }
        if (filterClients !== "all") {
            // keep row if the client appears in completed OR pending
            const rowCompClients = custCompMap[row.normKey] || [];
            const rowPendClients = custPendMap[row.normKey] || [];
            const found = rowCompClients.some(c => c.client_name === filterClients) ||
                          rowPendClients.some(c => c.client_name === filterClients);
            if (!found) return false;
        }
        return true;
    });

    const hasActiveFilters = filterAMC !== "all" || filterStatus !== "all" || filterProducts !== "all" || filterClients !== "all";

    const clearAllFilters = () => {
        setFilterAMC("all");
        setFilterStatus("all");
        setFilterProducts("all");
        setFilterClients("all");
    };

    const completedCount = rows.filter(r => r.status === "completed").length;
    const pendingCount   = rows.filter(r => r.status === "pending").length;
    const totalAUM       = rows.reduce((s, r) => s + r.aum, 0);

    return (
        <div className="amc-wrap">
            <style>{theme === "light" ? AMC_CSS_LIGHT : AMC_CSS_DARK}</style>

            {/* ── Header ── */}
            <div className="amc-hdr">
                <div className="amc-hdr-left">
                    <span className="amc-title">AMC Overview</span>
                    <div className="amc-badges">
                        <span className="amc-badge amc-badge-done"><span className="amc-dot amc-dot-done" />{completedCount} Active</span>
                        <span className="amc-badge amc-badge-pend"><span className="amc-dot amc-dot-pend" />{pendingCount} Inactive</span>
                        <span className="amc-badge amc-badge-aum">AUM {formatAUM(totalAUM)}</span>
                    </div>
                </div>
                <button className="amc-refresh" onClick={load} title="Refresh" disabled={loading}>
                    <span style={{ display: "inline-flex", animation: loading ? "spin .8s linear infinite" : "none" }}><IcoRefresh /></span>
                    Refresh
                </button>
            </div>

            {/* ── Filter Bar ── */}
            <div className="amc-filter-bar">
                <div className="amc-filter-label">
                    <IcoFilter />
                    <span>Filters</span>
                </div>

                <div className="amc-filter-dropdowns">
                    <FilterDropdown
                        label="AMC"
                        value={filterAMC}
                        options={amcOptions}
                        onChange={setFilterAMC}
                        accent="#4F8EF7"
                        accentRgb="79,142,247"
                        theme={theme}
                    />
                    <FilterDropdown
                        label="Status"
                        value={filterStatus}
                        options={statusOptions}
                        onChange={setFilterStatus}
                        accent="#34D399"
                        accentRgb="52,211,153"
                        theme={theme}
                    />
                    <FilterDropdown
                        label="Products"
                        value={filterProducts}
                        options={productsOptions}
                        onChange={setFilterProducts}
                        accent="#A78BFA"
                        accentRgb="167,139,250"
                        theme={theme}
                    />
                    <FilterDropdown
                        label="Clients"
                        value={filterClients}
                        options={clientsOptions}
                        onChange={setFilterClients}
                        accent="#F59E0B"
                        accentRgb="245,158,11"
                        theme={theme}
                    />
                </div>

                <div className="amc-filter-right">
                    {/* Result count */}
                    <span className="amc-filter-count">
                        {hasActiveFilters
                            ? <>{filteredRows.length} <span style={{ opacity: 0.5 }}>of {rows.length}</span></>
                            : <>{rows.length} AMCs</>
                        }
                    </span>

                    {/* Clear all */}
                    {hasActiveFilters && (
                        <button className="amc-clear-btn" onClick={clearAllFilters}>
                            <IcoX /> Clear all
                        </button>
                    )}
                </div>
            </div>

            {/* ── Table ── */}
            {loading ? (
                <div className="fd-spin"><div className="spinner" style={{ borderTopColor: "#4F8EF7" }} /></div>
            ) : error ? (
                <div className="amc-error">{error}</div>
            ) : filteredRows.length === 0 ? (
                <div className="fd-empty" style={{ padding: "56px 20px", textAlign: "center" }}>
                    {hasActiveFilters ? "No AMCs match the current filters." : "No AMC data found."}
                </div>
            ) : (
                <div className="tbl-wrap">
                    <table className="fd-tbl">
                        <thead>
                            <tr>
                                <th style={{ width: 42 }}>#</th>
                                <th>AMC Name</th>
                                <th>Status</th>
                                <th>AUM</th>
                                <th style={{ textAlign: "center" }}>Clients</th>
                                <th style={{ textAlign: "center" }}>Clients Pending</th>
                                <th style={{ textAlign: "center" }}>Products</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.map((row, i) => (
                                <tr key={row.amc}>
                                    <td className="fd-num">{i + 1}</td>
                                    <td><span className="amc-name">{row.amc}</span></td>
                                    <td>
                                        {row.status === "completed"
                                            ? <span className="amc-chip amc-chip-done"><span className="chip-dot" style={{ background: "#34D399" }} />Active</span>
                                            : <span className="amc-chip amc-chip-pend"><span className="chip-dot" style={{ background: "#F59E0B" }} />Inactive</span>}
                                    </td>
                                    <td><span className="amc-aum">{formatAUM(row.aum)}</span></td>

                                    <td style={{ textAlign: "center" }}>
                                        <button
                                            className={`amc-count amc-count-blue${row.clients > 0 ? " amc-click amc-click-blue" : ""}`}
                                            onClick={() => row.clients > 0 && setModal({ type: "clients", amcName: row.amc, normKey: row.normKey })}
                                            style={{ cursor: row.clients > 0 ? "pointer" : "default" }}
                                            title={row.clients > 0 ? `View ${row.clients} client(s) for ${row.amc}` : undefined}
                                        >
                                            {row.clients}
                                        </button>
                                    </td>

                                    <td style={{ textAlign: "center" }}>
                                        {row.clientsPending > 0 ? (
                                            <button
                                                className="amc-count amc-count-orange amc-click amc-click-orange"
                                                onClick={() => setModal({ type: "pending", amcName: row.amc, normKey: row.normKey })}
                                                style={{ cursor: "pointer" }}
                                                title={`View ${row.clientsPending} pending client(s) for ${row.amc}`}
                                            >
                                                {row.clientsPending}
                                            </button>
                                        ) : (
                                            <span className="amc-zero">&mdash;</span>
                                        )}
                                    </td>

                                    <td style={{ textAlign: "center" }}>
                                        <button
                                            className={`amc-count amc-count-purple${row.products > 0 ? " amc-click amc-click-purple" : ""}`}
                                            onClick={() => row.products > 0 && setModal({ type: "products", amcName: row.amc, normKey: row.normKey })}
                                            style={{ cursor: row.products > 0 ? "pointer" : "default" }}
                                            title={row.products > 0 ? `View ${row.products} product(s) for ${row.amc}` : undefined}
                                        >
                                            {row.products}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Modals ── */}
            {modal?.type === "clients" && (
                <ClientsModal amcName={modal.amcName} clients={custCompMap[modal.normKey] || []} onClose={() => setModal(null)} />
            )}
            {modal?.type === "pending" && (
                <PendingModal amcName={modal.amcName} clients={custPendMap[modal.normKey] || []} onClose={() => setModal(null)} />
            )}
            {modal?.type === "products" && (
                <ProductsModal amcName={modal.amcName} products={productsMap[modal.normKey] || []} onClose={() => setModal(null)} />
            )}
        </div>
    );
}

/* ─── Styles ─── */
const AMC_CSS_DARK = `
  @keyframes ddIn {
    from { opacity:0; transform:translateY(-6px) scale(.97); }
    to   { opacity:1; transform:none; }
  }

  .amc-wrap {
    background:transparent; border:1px solid rgba(79,142,247,0.28);
    border-radius:18px; overflow:visible; margin:0 4px 4px;
    animation:pIn .38s cubic-bezier(0.34,1.56,0.64,1) both;
    position:relative;
  }
  .amc-hdr {
    display:flex; align-items:center; justify-content:space-between;
    flex-wrap:wrap; gap:10px; padding:14px 20px;
    border-bottom:1px solid rgba(79,142,247,0.15);
  }
  .amc-hdr-left { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
  .amc-title { font-family:var(--fh,'Orbitron',sans-serif); font-weight:700; font-size:1rem; color:#fff; letter-spacing:.06em; }
  .amc-badges { display:flex; gap:7px; flex-wrap:wrap; }
  .amc-badge {
    display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px;
    font-size:.68rem; font-weight:700; font-family:var(--fb,'Exo 2',sans-serif);
  }
  .amc-badge-done { background:rgba(52,211,153,0.12); color:#34D399; border:1px solid rgba(52,211,153,0.24); }
  .amc-badge-pend { background:rgba(245,158,11,0.12); color:#F59E0B; border:1px solid rgba(245,158,11,0.24); }
  .amc-badge-aum  { background:rgba(79,142,247,0.12); color:#4F8EF7; border:1px solid rgba(79,142,247,0.24); }
  .amc-dot { width:7px; height:7px; border-radius:50%; display:inline-block; }
  .amc-dot-done { background:#34D399; box-shadow:0 0 5px #34D399; }
  .amc-dot-pend { background:#F59E0B; box-shadow:0 0 5px #F59E0B; }
  .amc-refresh {
    display:inline-flex; align-items:center; gap:6px; padding:6px 14px;
    border-radius:9px; border:1px solid rgba(79,142,247,0.3);
    background:rgba(79,142,247,0.08); color:rgba(180,210,255,0.8);
    font-size:.75rem; font-weight:600; cursor:pointer; transition:all .22s;
    font-family:var(--fb,'Exo 2',sans-serif);
  }
  .amc-refresh:hover:not(:disabled){ background:rgba(79,142,247,0.18); color:#fff; border-color:rgba(79,142,247,0.55); }
  .amc-refresh:disabled { opacity:.5; cursor:not-allowed; }

  /* ── Filter Bar ── */
  .amc-filter-bar {
    display:flex; align-items:center; gap:10px; flex-wrap:wrap;
    padding:10px 20px;
    border-bottom:1px solid rgba(79,142,247,0.12);
    background:rgba(79,142,247,0.03);
  }
  .amc-filter-label {
    display:inline-flex; align-items:center; gap:5px;
    font-size:.68rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase;
    color:rgba(160,190,255,0.5); font-family:var(--fb,'Exo 2',sans-serif);
    flex-shrink:0;
  }
  .amc-filter-dropdowns {
    display:flex; align-items:center; gap:6px; flex-wrap:wrap; flex:1;
  }
  .amc-filter-right {
    display:flex; align-items:center; gap:8px; margin-left:auto; flex-shrink:0;
  }
  .amc-filter-count {
    font-size:.72rem; font-weight:700;
    color:rgba(180,210,255,0.6);
    font-family:var(--fh,'Orbitron',sans-serif);
    letter-spacing:.04em;
    white-space:nowrap;
  }
  .amc-clear-btn {
    display:inline-flex; align-items:center; gap:5px;
    padding:5px 11px; border-radius:8px;
    border:1px solid rgba(248,113,113,0.3);
    background:rgba(248,113,113,0.08);
    color:rgba(248,113,113,0.8);
    font-size:.69rem; font-weight:700; cursor:pointer;
    transition:all .18s;
    font-family:var(--fb,'Exo 2',sans-serif);
    letter-spacing:.03em;
  }
  .amc-clear-btn:hover {
    background:rgba(248,113,113,0.18);
    border-color:rgba(248,113,113,0.55);
    color:#F87171;
  }

  .amc-name { font-weight:600; color:#e8f0ff; font-size:.87rem; }
  .amc-chip { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px; font-size:.71rem; font-weight:700; }
  .amc-chip-done { background:rgba(52,211,153,0.12); color:#34D399; border:1px solid rgba(52,211,153,0.22); }
  .amc-chip-pend { background:rgba(245,158,11,0.12); color:#F59E0B; border:1px solid rgba(245,158,11,0.22); }
  .chip-dot { width:6px; height:6px; border-radius:50%; display:inline-block; flex-shrink:0; }
  .amc-aum { font-weight:700; color:#4F8EF7; font-size:.86rem; }

  .amc-count {
    display:inline-flex; align-items:center; justify-content:center;
    min-width:28px; height:24px; padding:0 8px; border-radius:8px;
    font-size:.78rem; font-weight:700;
    font-family:var(--fb,'Exo 2',sans-serif);
    transition:all .22s cubic-bezier(0.34,1.56,0.64,1);
    border:none; background:transparent;
  }
  .amc-count-blue   { background:rgba(79,142,247,0.14);  color:#4F8EF7; border:1px solid rgba(79,142,247,0.22);  }
  .amc-count-orange { background:rgba(245,158,11,0.14);  color:#F59E0B; border:1px solid rgba(245,158,11,0.22);  }
  .amc-count-purple { background:rgba(167,139,250,0.14); color:#A78BFA; border:1px solid rgba(167,139,250,0.22); }

  .amc-click { position:relative; }
  .amc-click::after { content:''; position:absolute; inset:-3px; border-radius:10px; opacity:0; transition:opacity .2s; }
  .amc-click-blue:hover   { background:rgba(79,142,247,0.35)!important; border-color:rgba(79,142,247,0.7)!important; color:#fff!important; transform:scale(1.18) translateY(-1px); box-shadow:0 4px 16px rgba(79,142,247,0.5); }
  .amc-click-orange:hover { background:rgba(245,158,11,0.35)!important; border-color:rgba(245,158,11,0.7)!important; color:#fff!important; transform:scale(1.18) translateY(-1px); box-shadow:0 4px 16px rgba(245,158,11,0.45); }
  .amc-click-purple:hover { background:rgba(167,139,250,0.35)!important; border-color:rgba(167,139,250,0.7)!important; color:#fff!important; transform:scale(1.18) translateY(-1px); box-shadow:0 4px 16px rgba(167,139,250,0.45); }

  .amc-zero  { color:rgba(160,190,255,0.3); font-size:.82rem; }
  .amc-error { text-align:center; padding:40px; color:#F87171; font-size:.84rem; }

  .modal-close-btn {
    background:rgba(79,142,247,0.1); border:1px solid rgba(79,142,247,0.28);
    border-radius:8px; color:rgba(180,210,255,0.8); cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    width:30px; height:30px; flex-shrink:0; transition:all .2s;
  }
  .modal-close-btn:hover { background:rgba(239,68,68,0.18); color:#F87171; border-color:rgba(239,68,68,0.35); }

  .modal-chip {
    display:inline-block; padding:2px 9px; border-radius:20px;
    font-size:.7rem; font-weight:600; white-space:nowrap;
  }
  .modal-chip-purple { background:rgba(167,139,250,0.13); color:#A78BFA; border:1px solid rgba(167,139,250,0.22); }
  .modal-chip-teal   { background:rgba(20,184,166,0.13);  color:#2dd4bf; border:1px solid rgba(20,184,166,0.22);  }
  .modal-chip-orange { background:rgba(245,158,11,0.13);  color:#F59E0B; border:1px solid rgba(245,158,11,0.22);  }
  .modal-chip-green  { background:rgba(52,211,153,0.13);  color:#34D399; border:1px solid rgba(52,211,153,0.22);  }
  .modal-chip-blue   { background:rgba(79,142,247,0.13);  color:#4F8EF7; border:1px solid rgba(79,142,247,0.22);  }
  .modal-dash  { color:rgba(160,190,255,0.3); font-size:.8rem; }
  .modal-empty { padding:44px 20px; text-align:center; color:rgba(160,190,255,0.5); font-size:.84rem; font-style:italic; }

  @media(max-width:600px) {
    .amc-filter-bar { gap:8px; padding:10px 12px; }
    .amc-filter-right { width:100%; justify-content:space-between; }
  }
`;

/* ─── Light Theme Styles ─── */
const AMC_CSS_LIGHT = `
  @keyframes ddIn {
    from { opacity:0; transform:translateY(-6px) scale(.97); }
    to   { opacity:1; transform:none; }
  }

  .amc-wrap {
    background: transparent;
    border: 1.5px solid rgba(0,0,0,0.22);
    border-radius: 18px; overflow: visible; margin: 0 4px 4px;
    animation: pIn .38s cubic-bezier(0.34,1.56,0.64,1) both;
    position: relative;
  }
  .amc-hdr {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 10px; padding: 14px 20px;
    border-bottom: 1.5px solid rgba(0,0,0,0.15);
  }
  .amc-hdr-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .amc-title { font-weight: 800; font-size: 1rem; color: #111827; letter-spacing: .06em; }
  .amc-badges { display: flex; gap: 7px; flex-wrap: wrap; }
  .amc-badge {
    display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px;
    border-radius: 20px; font-size: .68rem; font-weight: 700;
  }
  .amc-badge-done { background: rgba(15,158,110,0.12); color: #076642; border: 1.5px solid rgba(15,158,110,0.35); }
  .amc-badge-pend { background: rgba(201,124,8,0.12);  color: #845004; border: 1.5px solid rgba(201,124,8,0.35); }
  .amc-badge-aum  { background: rgba(42,109,217,0.10); color: #1a50b5; border: 1.5px solid rgba(42,109,217,0.3); }
  .amc-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
  .amc-dot-done { background: #0f9e6e; }
  .amc-dot-pend { background: #c97c08; }

  .amc-refresh {
    display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px;
    border-radius: 9px; border: 1.5px solid rgba(0,0,0,0.22);
    background: rgba(255,255,255,0.5); color: rgba(0,0,0,0.65);
    font-size: .75rem; font-weight: 600; cursor: pointer;
    transition: all .22s; backdrop-filter: blur(8px);
  }
  .amc-refresh:hover:not(:disabled) {
    background: rgba(42,109,217,0.1); color: #1a50b5;
    border-color: rgba(42,109,217,0.45);
  }
  .amc-refresh:disabled { opacity: .5; cursor: not-allowed; }

  /* ── Filter Bar ── */
  .amc-filter-bar {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    padding: 10px 20px;
    border-bottom: 1.5px solid rgba(0,0,0,0.15);
    background: rgba(0,0,0,0.03);
  }
  .amc-filter-label {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: .68rem; font-weight: 700; letter-spacing: .08em;
    text-transform: uppercase; color: rgba(0,0,0,0.5); flex-shrink: 0;
  }
  .amc-filter-dropdowns { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; flex: 1; }
  .amc-filter-right { display: flex; align-items: center; gap: 8px; margin-left: auto; flex-shrink: 0; }
  .amc-filter-count {
    font-size: .72rem; font-weight: 700; color: rgba(0,0,0,0.5);
    letter-spacing: .04em; white-space: nowrap;
  }
  .amc-clear-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 11px; border-radius: 8px;
    border: 1.5px solid rgba(180,50,50,0.4);
    background: rgba(180,50,50,0.07); color: rgba(160,30,30,0.8);
    font-size: .69rem; font-weight: 700; cursor: pointer; transition: all .18s;
  }
  .amc-clear-btn:hover { background: rgba(180,50,50,0.15); border-color: rgba(180,50,50,0.6); color: #b02020; }

  /* ── Table ── */
  .amc-wrap .fd-tbl td  { color: #111827; border-bottom: 1px solid rgba(0,0,0,0.1); }
  .amc-wrap .fd-tbl th  { color: rgba(0,0,0,0.65); border-bottom: 1.5px solid rgba(0,0,0,0.2); }
  .amc-wrap .fd-tbl thead tr { background: rgba(0,0,0,0.05); }
  .amc-wrap .fd-tbl tbody tr:nth-child(even) { background: rgba(0,0,0,0.03); }
  .amc-wrap .fd-tbl tbody tr:hover { background: rgba(42,109,217,0.06) !important; }

  .amc-name  { font-weight: 700; color: #111827; font-size: .87rem; }
  .amc-aum   { font-weight: 700; color: #1a50b5; font-size: .86rem; }
  .amc-zero  { color: rgba(0,0,0,0.3); font-size: .82rem; }
  .amc-error { text-align: center; padding: 40px; color: #b02020; font-size: .84rem; }

  .amc-chip { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: .71rem; font-weight: 700; }
  .amc-chip-done { background: rgba(15,158,110,0.12); color: #076642; border: 1.5px solid rgba(15,158,110,0.3); }
  .amc-chip-pend { background: rgba(201,124,8,0.12);  color: #845004; border: 1.5px solid rgba(201,124,8,0.3); }
  .chip-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; flex-shrink: 0; }

  .amc-count {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 28px; height: 24px; padding: 0 8px; border-radius: 8px;
    font-size: .78rem; font-weight: 700;
    transition: all .22s cubic-bezier(0.34,1.56,0.64,1);
    border: none; background: transparent;
  }
  .amc-count-blue   { background: rgba(42,109,217,0.12);  color: #1a50b5; border: 1.5px solid rgba(42,109,217,0.35); }
  .amc-count-orange { background: rgba(201,124,8,0.12);   color: #845004; border: 1.5px solid rgba(201,124,8,0.35); }
  .amc-count-purple { background: rgba(107,78,198,0.12);  color: #4e30a0; border: 1.5px solid rgba(107,78,198,0.35); }

  .amc-click { position: relative; }
  .amc-click-blue:hover   { background: rgba(42,109,217,0.28) !important; border-color: rgba(42,109,217,0.7) !important; color: #fff !important; transform: scale(1.18) translateY(-1px); box-shadow: 0 4px 14px rgba(42,109,217,0.4); }
  .amc-click-orange:hover { background: rgba(201,124,8,0.28)  !important; border-color: rgba(201,124,8,0.7)  !important; color: #fff !important; transform: scale(1.18) translateY(-1px); box-shadow: 0 4px 14px rgba(201,124,8,0.4); }
  .amc-click-purple:hover { background: rgba(107,78,198,0.28) !important; border-color: rgba(107,78,198,0.7) !important; color: #fff !important; transform: scale(1.18) translateY(-1px); box-shadow: 0 4px 14px rgba(107,78,198,0.4); }

  /* ── Modal overrides ── */
  .modal-close-btn {
    background: rgba(0,0,0,0.06); border: 1.5px solid rgba(0,0,0,0.2);
    border-radius: 8px; color: rgba(0,0,0,0.55); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; flex-shrink: 0; transition: all .2s;
  }
  .modal-close-btn:hover { background: rgba(180,50,50,0.12); color: #b02020; border-color: rgba(180,50,50,0.35); }

  .modal-chip { display: inline-block; padding: 2px 9px; border-radius: 20px; font-size: .7rem; font-weight: 600; white-space: nowrap; }
  .modal-chip-purple { background: rgba(107,78,198,0.12); color: #4e30a0; border: 1px solid rgba(107,78,198,0.28); }
  .modal-chip-teal   { background: rgba(15,158,110,0.12); color: #076642; border: 1px solid rgba(15,158,110,0.28); }
  .modal-chip-orange { background: rgba(201,124,8,0.12);  color: #845004; border: 1px solid rgba(201,124,8,0.28); }
  .modal-chip-green  { background: rgba(15,158,110,0.12); color: #076642; border: 1px solid rgba(15,158,110,0.28); }
  .modal-chip-blue   { background: rgba(42,109,217,0.12); color: #1a50b5; border: 1px solid rgba(42,109,217,0.28); }
  .modal-dash  { color: rgba(0,0,0,0.3); font-size: .8rem; }
  .modal-empty { padding: 44px 20px; text-align: center; color: rgba(0,0,0,0.45); font-size: .84rem; font-style: italic; }

  @media(max-width:600px) {
    .amc-filter-bar { gap: 8px; padding: 10px 12px; }
    .amc-filter-right { width: 100%; justify-content: space-between; }
  }
`;