import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import * as api from "../api";
import type { Category } from "../types";

const CAT_ICONS = ["🛒", "🚗", "🏠", "👗", "💊", "🎮", "📚", "✈️", "🍔", "☕", "🎁", "💼", "📈", "🎓", "🏥", "⚽"];

export default function Settings() {
  const { user, categories, refreshCategories, showSuccess, showError } = useApp();

  const [showAddCat, setShowAddCat] = useState(false);
  const [catName, setCatName]       = useState("");
  const [catIcon, setCatIcon]       = useState("🛒");
  const [catType, setCatType]       = useState<"income" | "expense">("expense");

  const handleAddCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !catName) return;
    try {
      await api.createCategory({ user_id: user.id, name: catName, icon: catIcon, type: catType });
      await refreshCategories();
      setCatName(""); setShowAddCat(false);
      showSuccess("Kategoriya qo'shildi ✅");
    } catch { showError("Kategoriya qo'shishda xatolik"); }
  };

  const handleDelCat = async (id: number) => {
    if (!confirm("Kategoriyani o'chirmoqchimisiz?")) return;
    try {
      await api.deleteCategory(id);
      await refreshCategories();
      showSuccess("Kategoriya o'chirildi");
    } catch { showError("Kategoriyani o'chirishda xatolik"); }
  };

  return (
    <div className="page">
      <div className="page-header"><h1>Sozlamalar</h1></div>

      {/* Profile */}
      <div className="profile-banner">
        <div className="profile-avatar">
          {(user?.first_name ?? "U").charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="profile-name">{user?.first_name} {user?.last_name ?? ""}</div>
          {user?.username && <div className="profile-handle">@{user.username}</div>}
        </div>
      </div>

      {/* Categories */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-title">Kategoriyalar</div>
          <button className="icon-btn" onClick={() => setShowAddCat(v => !v)} aria-label="Qo'shish">
            <Plus size={16} />
          </button>
        </div>

        {showAddCat && (
          <form onSubmit={(e) => { void handleAddCat(e); }} className="add-panel">
            <div className="type-switch">
              <button type="button" className={`type-btn ${catType === "expense" ? "active-out" : ""}`} onClick={() => setCatType("expense")}>
                Chiqim
              </button>
              <button type="button" className={`type-btn ${catType === "income" ? "active-in" : ""}`} onClick={() => setCatType("income")}>
                Kirim
              </button>
            </div>
            <div className="icon-grid">
              {CAT_ICONS.map(ic => (
                <button key={ic} type="button" className={`icon-opt ${catIcon === ic ? "on" : ""}`} onClick={() => setCatIcon(ic)}>
                  {ic}
                </button>
              ))}
            </div>
            <input
              className="field-input"
              placeholder="Kategoriya nomi"
              value={catName}
              onChange={e => setCatName(e.target.value)}
              required
            />
            <button type="submit" className="submit-btn s-default">Saqlash</button>
          </form>
        )}

        <div className="settings-list">
          {categories.map((cat: Category) => (
            <div key={cat.id} className="settings-row">
              <div className="settings-emoji">{cat.icon}</div>
              <div className="settings-info">
                <div className="settings-name">{cat.name}</div>
                <div className={`settings-sub ${cat.type === "income" ? "income-text" : "expense-text"}`}>
                  {cat.type === "income" ? "Kirim" : "Chiqim"}
                </div>
              </div>
              <button className="del-btn" onClick={() => { void handleDelCat(cat.id); }} aria-label="O'chirish">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
