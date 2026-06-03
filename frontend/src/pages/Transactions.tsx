import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { useApp } from "../context/AppContext";
import AddTransactionModal from "../components/AddTransactionModal";
import { formatMoney, formatDate } from "../utils/format";
import * as api from "../api";
import type { Transaction } from "../types";

export default function Transactions() {
  const { transactions, refreshAccounts, refreshTransactions, showError, showSuccess } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter]       = useState<"all" | "income" | "expense">("all");
  const [deleting, setDeleting]   = useState<number | null>(null);

  const filtered = transactions.filter((t: Transaction) =>
    filter === "all" ? true : t.type === filter
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Bu tranzaksiyani o'chirmoqchimisiz?")) return;
    setDeleting(id);
    try {
      await api.deleteTransaction(id);
      await Promise.all([refreshAccounts(), refreshTransactions()]);
      showSuccess("Tranzaksiya o'chirildi");
    } catch {
      showError("O'chirishda xatolik yuz berdi");
    } finally {
      setDeleting(null);
    }
  };

  // Group by day
  const grouped: Record<string, Transaction[]> = {};
  filtered.forEach((tx: Transaction) => {
    const key = new Date(tx.date).toDateString();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(tx);
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Harakatlar</h1>
        <button className="icon-btn" onClick={() => setShowModal(true)} aria-label="Qo'shish">
          <Plus size={18} />
        </button>
      </div>

      {/* Filter pills */}
      <div className="filter-row">
        {(["all", "income", "expense"] as const).map((f) => (
          <button
            key={f}
            className={`pill ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "Barchasi" : f === "income" ? "Kirim" : "Chiqim"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-wrap">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">Tranzaksiyalar topilmadi</div>
          <div className="empty-sub">Filtrni o'zgartiring yoki yangi qo'shing</div>
        </div>
      ) : (
        <>
          {Object.entries(grouped).map(([dateKey, txs]) => (
            <div key={dateKey}>
              <div className="date-label">{formatDate(txs[0]!.date)}</div>
              <div className="tx-surface">
                {txs.map((tx: Transaction) => (
                  <div key={tx.id} className="tx-item">
                    <div className="tx-emoji-wrap">
                      {tx.category_icon ?? (tx.type === "income" ? "💰" : "💸")}
                    </div>
                    <div className="tx-body">
                      <div className="tx-name">
                        {tx.category_name ?? (tx.type === "income" ? "Kirim" : "Chiqim")}
                      </div>
                      <div className="tx-sub">
                        {tx.account_name}
                        {tx.note && ` · ${tx.note}`}
                      </div>
                    </div>
                    <div className="tx-right">
                      <div className={`tx-amt ${tx.type === "income" ? "in" : "out"}`}>
                        {tx.type === "income" ? "+" : "−"}
                        {formatMoney(Number(tx.amount), tx.currency ?? "UZS")}
                      </div>
                      <button
                        className="del-btn"
                        onClick={() => { void handleDelete(tx.id); }}
                        disabled={deleting === tx.id}
                        aria-label="O'chirish"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      <button className="fab" onClick={() => setShowModal(true)}>
        <Plus size={26} />
      </button>

      {showModal && (
        <AddTransactionModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
