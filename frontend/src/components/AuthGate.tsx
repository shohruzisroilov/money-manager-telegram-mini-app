import { useApp } from "../context/AppContext";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, user, authError } = useApp();

  if (loading) {
    return (
      <div className="auth-screen">
        <div className="auth-logo">💰</div>
        <div className="auth-title">Money Manager</div>
        <div className="spinner" style={{ marginTop: 24 }} />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="auth-screen">
        <div className="auth-logo">🔒</div>
        <div className="auth-title">Kirish mumkin emas</div>
        <div className="auth-desc">{authError}</div>
        <div className="auth-hint">
          Dasturni <strong>Telegram</strong> orqali oching
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-screen">
        <div className="auth-logo">💰</div>
        <div className="auth-title">Money Manager</div>
        <div className="auth-desc">Foydalanuvchi aniqlanmadi</div>
      </div>
    );
  }

  return <>{children}</>;
}
