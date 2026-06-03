import { useState } from "react";
import { X } from "lucide-react";
import { useApp } from "../context/AppContext";
import * as api from "../api";
import type { Category } from "../types";
import { formatNumberDisplay, parseNumber } from "../utils/format";

interface Props {
  onClose: () => void;
  defaultType?: "income" | "expense";
}

export default function AddTransactionModal({ onClose, defaultType = "expense" }: Props) {
  const { user, accounts, categories, refreshAccounts, refreshTransactions, showSuccess, showError } = useApp();
  const [type, setType]         = useState<"income" | "expense">(defaultType);
  const [displayAmt, setDisplay] = useState(""); // ko'rsatish uchun "1 500 000"
  const [categoryId, setCatId]  = useState("");
  const [note, setNote]         = useState("");
  const [date, setDate]         = useState(new Date().toISOString().split("T")[0] ?? "");
  const [loading, setLoading]   = useState(false);

  const defaultAccountId = accounts[0]?.id;
  const filteredCats = categories.filter((c: Category) => c.type === type);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, ""); // faqat raqam
    setDisplay(raw ? formatNumberDisplay(raw) : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseNumber(displayAmt);
    if (!user || !amount || !defaultAccountId) return;
    setLoading(true);
    try {
      await api.createTransaction({
        user_id: user.id,
        account_id: defaultAccountId,
        category_id: categoryId ? Number(categoryId) : null,
        type,
        amount,
        note: note || null,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
      });
      await Promise.all([refreshAccounts(), refreshTransactions()]);
      showSuccess(type === "income" ? "Kirim qo'shildi ✅" : "Chiqim qo'shildi ✅");
      onClose();
    } catch (err) {
      console.error(err);
      showError("Saqlashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        <div className="modal-head">
          <div className="modal-title">Yangi tranzaksiya</div>
          <button className="modal-close" onClick={onClose} aria-label="Yopish">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={e => { void handleSubmit(e); }}>
          <div className="modal-body">
            {/* Type switcher */}
            <div className="type-switch">
              <button
                type="button"
                className={`type-btn ${type === "expense" ? "active-out" : ""}`}
                onClick={() => { setType("expense"); setCatId(""); }}
              >
                💸 Chiqim
              </button>
              <button
                type="button"
                className={`type-btn ${type === "income" ? "active-in" : ""}`}
                onClick={() => { setType("income"); setCatId(""); }}
              >
                💰 Kirim
              </button>
            </div>

            {/* Amount */}
            <div className="amount-wrap">
              <div className="amount-label">Summa</div>
              <div className="amount-input-row">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={displayAmt}
                  onChange={handleAmountChange}
                  className="amount-input"
                  required
                  autoFocus
                />
                <span className="amount-currency">UZS</span>
              </div>
            </div>

            {/* Category */}
            <div className="field">
              <div className="field-label">Kategoriya</div>
              <div className="cat-chips">
                {filteredCats.map((cat: Category) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`cat-chip ${categoryId === cat.id.toString() ? "on" : ""}`}
                    onClick={() => setCatId(cat.id.toString())}
                  >
                    <span className="chip-icon">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="field">
              <div className="field-label">Izoh (ixtiyoriy)</div>
              <input
                type="text"
                placeholder="Izoh qo'shing..."
                value={note}
                onChange={e => setNote(e.target.value)}
                className="field-input"
              />
            </div>

            {/* Date */}
            <div className="field">
              <div className="field-label">Sana</div>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="field-input"
              />
            </div>

            <button
              type="submit"
              className={`submit-btn ${type === "income" ? "s-in" : "s-out"}`}
              disabled={loading || !parseNumber(displayAmt)}
            >
              {loading ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
