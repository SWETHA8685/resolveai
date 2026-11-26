import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertCircle, AlertTriangle, ArrowDownRight, ArrowUpRight,
  Bell, CheckCircle2, ChevronDown, Clock3, Database, FileSearch,
  LayoutDashboard, LoaderCircle, Plus, RefreshCw, Search, Server,
  ShieldCheck, Sparkles, Trash2, X, Zap
} from "lucide-react";
import {
  analyzeIncident, deleteIncident, getIncidents,
  updateIncidentStatus
} from "./api";

import type { Incident } from "./api";

type Severity = "Critical" | "High" | "Medium" | "Low";

const severityClass = (value?: string | null) =>
  (value || "unknown").toLowerCase();

function readableDate(value: string | null) {
  if (!value) return "Just now";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [form, setForm] = useState({
    title: "",
    service: "",
    error_log: ""
  });

  async function loadIncidents(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getIncidents();
      setIncidents(data);
      setError("");
    } catch {
      setError("Could not load incidents. Check that the FastAPI backend is running at http://127.0.0.1:8000.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadIncidents();
  }, []);

  const stats = useMemo(() => ({
    total: incidents.length,
    critical: incidents.filter(i => i.severity?.toLowerCase() === "critical").length,
    open: incidents.filter(i => i.status === "Open").length,
    resolved: incidents.filter(i => i.status === "Resolved").length
  }), [incidents]);

  const filtered = useMemo(() => incidents.filter(item => {
    const term = search.toLowerCase();
    const matchesSearch = [item.title, item.service, item.category, item.root_cause]
      .some(value => (value || "").toLowerCase().includes(term));
    const matchesSeverity = severityFilter === "All" || item.severity === severityFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  }), [incidents, search, severityFilter, statusFilter]);

  async function submitIncident(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const created = await analyzeIncident(form);
      setIncidents(previous => [created, ...previous]);
      setForm({ title: "", service: "", error_log: "" });
      setShowForm(false);
      setSelected(created);
      setSuccess("Incident analyzed and saved successfully.");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === "string" && detail.includes("503")) {
        setError("Gemini is temporarily unavailable (503 high demand). Your incident was not saved. Please retry in a few minutes.");
      } else {
        setError(detail || "Incident analysis failed. Check the backend and Gemini API configuration.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function changeStatus(item: Incident, status: string) {
    try {
      await updateIncidentStatus(item.id, status);
      setIncidents(prev => prev.map(i => i.id === item.id ? { ...i, status } : i));
      if (selected?.id === item.id) setSelected({ ...item, status });
      setSuccess(`Incident #${item.id} moved to ${status}.`);
      setError("");
    } catch {
      setError("Could not update the incident status. Please try again.");
    }
  }

  async function removeIncident(item: Incident) {
    if (!window.confirm(`Delete incident #${item.id}? This cannot be undone.`)) return;
    try {
      await deleteIncident(item.id);
      setIncidents(prev => prev.filter(i => i.id !== item.id));
      if (selected?.id === item.id) setSelected(null);
      setSuccess(`Incident #${item.id} deleted.`);
      setError("");
    } catch {
      setError("Could not delete this incident.");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Activity size={21} /></div>
          <div><strong>Resolve<span>AI</span></strong><small>INCIDENT INTELLIGENCE</small></div>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          <button className="nav-item active"><LayoutDashboard size={18} /> Overview</button>
          <button className="nav-item" onClick={() => setShowForm(true)}><FileSearch size={18} /> Analyze logs</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="system-card">
            <div className="system-heading"><span className="live-dot" /> SYSTEM STATUS</div>
            <div className="system-row"><span>API service</span><b>Connected</b></div>
            <div className="system-row"><span>Incident store</span><b>SQLite</b></div>
            <div className="system-row"><span>AI engine</span><b className="muted-status">Gemini</b></div>
          </div>
          <div className="sidebar-footer"><ShieldCheck size={15} /> Human-reviewed recommendations</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <b>Overview</b></div>
          <div className="top-actions">
            <div className="environment"><span className="live-dot" /> LOCAL ENVIRONMENT</div>
            <button className="icon-button" aria-label="Refresh incidents" onClick={() => void loadIncidents(true)}><RefreshCw size={17} className={refreshing ? "spin" : ""} /></button>
            <div className="avatar">S</div>
          </div>
        </header>

        <section className="page-heading">
          <div>
            <div className="eyebrow"><Sparkles size={14} /> AI-POWERED OPERATIONS</div>
            <h1>Incident command center</h1>
            <p>Understand issues faster. Investigate root causes. Restore service with confidence.</p>
          </div>
          <button className="primary-button" onClick={() => { setShowForm(true); setError(""); setSuccess(""); }}>
            <Plus size={18} /> Analyze new incident
          </button>
        </section>

        {error && <div className="alert error-alert"><AlertCircle size={18} /><span>{error}</span><button onClick={() => setError("")}><X size={16} /></button></div>}
        {success && <div className="alert success-alert"><CheckCircle2 size={18} /><span>{success}</span><button onClick={() => setSuccess("")}><X size={16} /></button></div>}

        <section className="stats-grid">
          <StatCard label="Total incidents" value={stats.total} icon={<Activity />} tone="violet" note="Across all services" />
          <StatCard label="Critical incidents" value={stats.critical} icon={<AlertTriangle />} tone="red" note="Require immediate review" />
          <StatCard label="Open incidents" value={stats.open} icon={<Clock3 />} tone="amber" note="Awaiting investigation" />
          <StatCard label="Resolved incidents" value={stats.resolved} icon={<CheckCircle2 />} tone="green" note="Marked as resolved" />
        </section>

        <section className="content-panel">
          <div className="panel-heading">
            <div><h2>Incident activity</h2><p>Review, search and manage analyzed incidents.</p></div>
            <div className="activity-chip"><span className="live-dot" /> LIVE DATA</div>
          </div>
          <div className="toolbar">
            <div className="search-box"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search incidents, services..." /></div>
            <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} aria-label="Filter by severity">
              <option value="All">All severities</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filter by status">
              <option value="All">All statuses</option><option>Open</option><option>In Progress</option><option>Resolved</option>
            </select>
          </div>

          {loading ? <div className="empty-state"><LoaderCircle className="spin" size={28} /><p>Loading incidents...</p></div> :
            filtered.length === 0 ? <div className="empty-state"><div className="empty-icon"><Database size={25} /></div><h3>{incidents.length ? "No matching incidents" : "No incidents yet"}</h3><p>{incidents.length ? "Try changing your search or filters." : "Submit an error log to let ResolveAI investigate your first incident."}</p>{!incidents.length && <button className="secondary-button" onClick={() => setShowForm(true)}><Plus size={16} /> Analyze first incident</button>}</div> :
            <div className="table-wrap"><table>
              <thead><tr><th>INCIDENT</th><th>SERVICE</th><th>SEVERITY</th><th>CATEGORY</th><th>STATUS</th><th>CREATED</th><th></th></tr></thead>
              <tbody>{filtered.map(item => <tr key={item.id}>
                <td><button className="incident-link" onClick={() => setSelected(item)}><span className="incident-id">#{item.id}</span><strong>{item.title}</strong></button></td>
                <td><span className="service-name"><Server size={14} />{item.service}</span></td>
                <td><span className={`severity-pill ${severityClass(item.severity)}`}>{item.severity || "Unknown"}</span></td>
                <td>{item.category || "—"}</td>
                <td><select className={`status-select ${item.status.toLowerCase().replace(" ", "-")}`} value={item.status} onChange={e => void changeStatus(item, e.target.value)}><option>Open</option><option>In Progress</option><option>Resolved</option></select></td>
                <td className="date-cell">{readableDate(item.created_at)}</td>
                <td><button className="row-icon danger-hover" aria-label="Delete incident" onClick={() => void removeIncident(item)}><Trash2 size={16} /></button></td>
              </tr>)}</tbody>
            </table></div>}
          <div className="panel-footer"><span>Showing {filtered.length} of {incidents.length} incidents</span><span>Powered by FastAPI <i /> SQLite</span></div>
        </section>
        <footer className="page-footer">ResolveAI <span>•</span> AI-assisted incident analysis <span>•</span> Review recommendations before taking action</footer>
      </main>

      {showForm && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget && !submitting) setShowForm(false); }}>
        <section className="modal-card">
          <div className="modal-heading"><div><div className="eyebrow"><Zap size={14} /> INCIDENT ANALYSIS</div><h2>Analyze an error log</h2><p>Provide context and a log excerpt for AI-assisted investigation.</p></div><button className="icon-button" onClick={() => setShowForm(false)} disabled={submitting}><X size={18} /></button></div>
          <form onSubmit={submitIncident}>
            <label>Incident title<input required minLength={3} maxLength={200} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Database connection failure" /></label>
            <label>Service name<input required minLength={2} maxLength={100} value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} placeholder="e.g. Payment API" /></label>
            <label>Error log<textarea required minLength={5} rows={7} value={form.error_log} onChange={e => setForm({ ...form, error_log: e.target.value })} placeholder="Paste the relevant error message, stack trace or log excerpt..." /></label>
            <div className="form-note"><ShieldCheck size={16} /> AI output is an estimate. Verify the root cause before making production changes.</div>
            <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)} disabled={submitting}>Cancel</button><button type="submit" className="primary-button" disabled={submitting}>{submitting ? <><LoaderCircle size={17} className="spin" /> Analyzing...</> : <><Sparkles size={17} /> Analyze with AI</>}</button></div>
          </form>
        </section>
      </div>}

      {selected && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}>
        <section className="modal-card detail-modal">
          <div className="modal-heading"><div><div className="eyebrow">INCIDENT #{selected.id}</div><h2>{selected.title}</h2><p>{selected.service} · {readableDate(selected.created_at)}</p></div><button className="icon-button" onClick={() => setSelected(null)}><X size={18} /></button></div>
          <div className="detail-tags"><span className={`severity-pill ${severityClass(selected.severity)}`}>{selected.severity || "Unknown"}</span><span className="category-pill">{selected.category || "Uncategorized"}</span><span className="category-pill">{selected.status}</span></div>
          <div className="detail-section"><h3><FileSearch size={16} /> Possible root cause</h3><p>{selected.root_cause || "No root cause analysis is available."}</p></div>
          <div className="detail-section"><h3><CheckCircle2 size={16} /> Recommended actions</h3><div className="recommendations">{(selected.recommendations || "No recommendations available.").split("\n").map((line, i) => <p key={i}>{line}</p>)}</div></div>
          <div className="detail-section"><h3><Database size={16} /> Original error log</h3><pre>{selected.error_log}</pre></div>
          <div className="modal-actions"><button className="secondary-button" onClick={() => setSelected(null)}>Close</button><select className="status-select" value={selected.status} onChange={e => void changeStatus(selected, e.target.value)}><option>Open</option><option>In Progress</option><option>Resolved</option></select></div>
        </section>
      </div>}
    </div>
  );
}

function StatCard({ label, value, icon, tone, note }: { label: string; value: number; icon: React.ReactNode; tone: string; note: string }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></article>;
}

export default App;