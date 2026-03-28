import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const tenderMix = [
  { method: "Card (Uniweb)", amount: 1680.50, pct: 59, color: "bg-primary" },
  { method: "Cash", amount: 820.00, pct: 29, color: "bg-status-green" },
  { method: "SGQR / PayNow", amount: 347.00, pct: 12, color: "bg-status-amber" },
];

const settlements = [
  { id: "STL-2024-001", date: "15 Jan 2024", amount: "$2,501.50", status: "settled" },
  { id: "STL-2024-002", date: "14 Jan 2024", amount: "$2,180.00", status: "settled" },
  { id: "STL-2024-003", date: "13 Jan 2024", amount: "$1,950.30", status: "settled" },
  { id: "STL-2024-004", date: "12 Jan 2024", amount: "$2,320.80", status: "pending" },
];

const exceptions = [
  { type: "Void", order: "#0041", amount: "$12.50", reason: "Customer complaint", time: "11:30 AM" },
  { type: "Refund", order: "#0038", amount: "$7.00", reason: "Wrong order", time: "10:15 AM" },
];

const AdminFinance: React.FC = () => (
  <div className="p-7">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Finance & Reconciliation</h1>
      <p className="text-[13px] text-muted-foreground mt-1">Settlement tracking and GST reporting</p>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-6">
      {[
        { label: "Today's Gross", value: "$2,847.50", stripe: "bg-status-green" },
        { label: "Cash Expected", value: "$820.00", stripe: "bg-primary" },
        { label: "GST Collected", value: "$231.45", stripe: "bg-status-amber" },
      ].map(s => (
        <div key={s.label} className="uniweb-card relative overflow-hidden p-5">
          <div className={`kpi-stripe ${s.stripe}`} />
          <div className="section-label mt-1.5 mb-2.5">{s.label}</div>
          <div className="text-[26px] font-bold text-foreground tracking-tighter leading-none">{s.value}</div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-2 gap-4 mb-6">
      {/* Tender Mix */}
      <div className="uniweb-card p-5">
        <div className="section-label mb-4">Tender Mix</div>
        <div className="space-y-3.5">
          {tenderMix.map(t => (
            <div key={t.method}>
              <div className="flex justify-between text-[13px] mb-1.5">
                <span className="text-foreground font-medium">{t.method}</span>
                <span className="text-muted-foreground font-mono text-xs">${t.amount.toFixed(2)} ({t.pct}%)</span>
              </div>
              <div className="h-1 bg-accent rounded-full overflow-hidden">
                <div className={`h-full ${t.color} rounded-full transition-all duration-600`} style={{ width: `${t.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exceptions */}
      <div className="uniweb-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-3.5 w-3.5 text-status-amber" />
          <span className="section-label">Exceptions</span>
        </div>
        <div className="space-y-3">
          {exceptions.map(e => (
            <div key={e.order} className="flex items-center gap-3 p-3 rounded-lg bg-status-amber-light border border-status-amber/20">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-foreground">{e.type}</span>
                  <span className="text-xs text-muted-foreground font-mono">{e.order}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{e.reason}</p>
              </div>
              <div className="text-right">
                <span className="text-[13px] font-bold text-status-red font-mono">{e.amount}</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">{e.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Settlements */}
    <div className="uniweb-card">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Settlement History</h2>
      </div>
      <table className="w-full">
        <thead className="table-header">
          <tr>
            <th>Settlement ID</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {settlements.map(s => (
            <tr key={s.id} className="table-row border-b border-border last:border-0 hover:bg-accent transition-colors cursor-pointer">
              <td className="font-medium text-foreground font-mono text-xs">{s.id}</td>
              <td className="text-muted-foreground">{s.date}</td>
              <td className="font-semibold text-foreground font-mono">{s.amount}</td>
              <td>
                <span className={`status-badge ${
                  s.status === "settled" ? "bg-status-green-light text-status-green" : "bg-status-amber-light text-status-amber"
                }`}>
                  <span className={`status-dot ${s.status === "settled" ? "bg-status-green" : "bg-status-amber"}`} />
                  {s.status === "settled" ? "Settled" : "Pending"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminFinance;
