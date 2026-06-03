import { useState } from "react";
import { TrendingDown, TrendingUp, Plus } from "lucide-react";
import { useApp } from "../context/AppContext";
import AddTransactionModal from "../components/AddTransactionModal";
import { formatMoney, formatShortDate } from "../utils/format";
import type { Transaction } from "../types";

export default function Home() {
  const { user, accounts, transactions } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"income" | "expense">("expense");

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  const now = new Date();
  const thisMonthTx = transactions.filter((t: Transaction) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthIncome  = thisMonthTx.filter((t: Transaction) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const monthExpense = thisMonthTx.filter((t: Transaction) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const recentTx     = transactions.slice(0, 8);

  const openModal = (type: "income" | "expense") => {
    setModalType(type);
    setShowModal(true);
  };

  return (
    <div className="page">
      {/* Top bar */}
      <div className="home-top">
        <div>
          <div className="home-greeting">
            Salom, <span>{user?.first_name ?? "Foydalanuvchi"}</span> 👋
          </div>
          <div className="home-sub">Bugungi moliyaviy holat</div>
        </div>
        <div className="avatar-circle">
          {(user?.first_name ?? "U").charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Balance hero */}
      <div className="hero-card">
        <div className="hero-label">Umumiy balans</div>
        <div className="hero-amount">{formatMoney(totalBalance)}</div>
        <div className="hero-row">
          <div className="hero-stat">
            <div className="hero-stat-icon in">
              <TrendingUp size={16} color="white" />
            </div>
            <div>
              <div className="hero-stat-label">Bu oy kirim</div>
              <div className="hero-stat-val">+{formatMoney(monthIncome)}</div>
            </div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-icon out">
              <TrendingDown size={16} color="white" />
            </div>
            <div>
              <div className="hero-stat-label">Bu oy chiqim</div>
              <div className="hero-stat-val">-{formatMoney(monthExpense)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="quick-row">
        <button className="quick-btn in" onClick={() => openModal("income")}>
          <TrendingUp size={16} />
          Kirim qo'shish
        </button>
        <button className="quick-btn out" onClick={() => openModal("expense")}>
          <TrendingDown size={16} />
          Chiqim qo'shish
        </button>
      </div>

      {/* Recent transactions */}
      <div className="section">
        <div className="section-head">
          <div className="section-title">So'nggi harakatlar</div>
        </div>

        {recentTx.length === 0 ? (
          <div className="empty-wrap">
            <div className="empty-icon">💸</div>
            <div className="empty-title">Hali tranzaksiyalar yo'q</div>
            <div className="empty-sub">Birinchi kirim yoki chiqimni qo'shing</div>
          </div>
        ) : (
          <div className="tx-surface">
            {recentTx.map((tx: Transaction) => (
              <div key={tx.id} className="tx-item">
                <div className="tx-emoji-wrap">
                  {tx.category_icon ?? (tx.type === "income" ? "💰" : "💸")}
                </div>
                <div className="tx-body">
                  <div className="tx-name">
                    {tx.category_name ?? (tx.type === "income" ? "Kirim" : "Chiqim")}
                  </div>
                  <div className="tx-sub">
                    {tx.note ? `${tx.note} · ` : ""}
                    {formatShortDate(tx.date)}
                  </div>
                </div>
                <div className={`tx-amt ${tx.type === "income" ? "in" : "out"}`}>
                  {tx.type === "income" ? "+" : "−"}
                  {formatMoney(Number(tx.amount), tx.currency ?? "UZS")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => openModal("expense")}>
        <Plus size={26} />
      </button>

      {showModal && (
        <AddTransactionModal
          onClose={() => setShowModal(false)}
          defaultType={modalType}
        />
      )}
    </div>
  );
}
