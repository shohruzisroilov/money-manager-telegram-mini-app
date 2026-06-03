import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import * as api from "../api";
import { formatMoney, MONTH_NAMES } from "../utils/format";
import type { Stats } from "../types";

const COLORS = ["#5B5FEF", "#F59E0B", "#00B96B", "#F5455C", "#8B5CF6", "#06B6D4", "#F97316", "#84CC16"];

export default function StatsPage() {
  const { user } = useApp();
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.getStats(user.id, year, month)
      .then(setStats).catch(console.error)
      .finally(() => setLoading(false));
  }, [user, year, month]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const trendData = stats?.trend.map((t) => ({
    name: (MONTH_NAMES[t.month - 1] ?? "").slice(0, 3),
    kirim: Number(t.income),
    chiqim: Number(t.expense),
  })) ?? [];

  const pieData = stats?.by_category.map((c) => ({
    name: `${c.icon} ${c.name}`,
    value: Number(c.total),
  })) ?? [];

  if (loading) {
    return (
      <div className="page">
        <div className="loading-screen">
          <div className="spinner" />
          Yuklanmoqda...
        </div>
      </div>
    );
  }

  const income  = Number(stats?.summary.total_income ?? 0);
  const expense = Number(stats?.summary.total_expense ?? 0);
  const net     = income - expense;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Statistika</h1>
      </div>

      {/* Month picker */}
      <div className="month-nav">
        <button className="month-nav-btn" onClick={prevMonth}><ChevronLeft size={16} /></button>
        <span className="month-text">{MONTH_NAMES[month - 1]} {year}</span>
        <button className="month-nav-btn" onClick={nextMonth}><ChevronRight size={16} /></button>
      </div>

      {/* Summary cards */}
      <div className="summary-row">
        <div className="sum-card in-card">
          <div className="sum-label">Kirim</div>
          <div className="sum-val">{formatMoney(income)}</div>
        </div>
        <div className="sum-card out-card">
          <div className="sum-label">Chiqim</div>
          <div className="sum-val">{formatMoney(expense)}</div>
        </div>
        <div className="sum-card net-card">
          <div className="sum-label">Balans</div>
          <div className="sum-val">{net >= 0 ? "+" : ""}{formatMoney(net)}</div>
        </div>
      </div>

      {/* Bar chart */}
      {trendData.length > 0 && (
        <div className="chart-wrap">
          <div className="chart-title">6 oylik trend</div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={trendData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAECF0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false}
                tickFormatter={(v: unknown) => `${(Number(v) / 1_000_000).toFixed(0)}M`} />
              <Tooltip
                formatter={(v: unknown) => formatMoney(Number(v))}
                contentStyle={{ borderRadius: 10, border: "1px solid #EAECF0", fontSize: 12 }}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Bar dataKey="kirim"  fill="#00B96B" radius={[5, 5, 0, 0]} />
              <Bar dataKey="chiqim" fill="#F5455C" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pie chart */}
      {pieData.length > 0 && (
        <div className="chart-wrap">
          <div className="chart-title">Chiqim kategoriyalari</div>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="44%" outerRadius={85} dataKey="value"
                label={({ percent }: { percent?: number }) =>
                  percent != null ? `${(percent * 100).toFixed(0)}%` : ""}
                labelLine={false}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend formatter={(v: string) => <span style={{ fontSize: 11, color: "#6B7280" }}>{v}</span>} />
              <Tooltip formatter={(v: unknown) => formatMoney(Number(v))}
                contentStyle={{ borderRadius: 10, border: "1px solid #EAECF0", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category breakdown */}
      {stats?.by_category && stats.by_category.length > 0 && (
        <div>
          <div className="section-head" style={{ marginBottom: 10 }}>
            <div className="section-title">Kategoriyalar</div>
          </div>
          <div className="cat-list">
            {stats.by_category.map((cat, i) => {
              const pct = expense > 0 ? (Number(cat.total) / expense) * 100 : 0;
              return (
                <div key={i} className="cat-row">
                  <div className="cat-icon-wrap">{cat.icon}</div>
                  <div className="cat-info">
                    <div className="cat-name">{cat.name}</div>
                    <div className="cat-bar-track">
                      <div className="cat-bar-fill"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                  <div className="cat-amt">{formatMoney(Number(cat.total))}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!stats?.by_category?.length && !trendData.length && (
        <div className="empty-wrap">
          <div className="empty-icon">📊</div>
          <div className="empty-title">Ma'lumot yo'q</div>
          <div className="empty-sub">Bu oyda hali tranzaksiyalar kiritilmagan</div>
        </div>
      )}
    </div>
  );
}
