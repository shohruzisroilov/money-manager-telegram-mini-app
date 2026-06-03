import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import AuthGate from "./components/AuthGate";
import BottomNav from "./components/BottomNav";
import { ToastContainer } from "./components/Toast";
import Home from "./pages/Home";
import Transactions from "./pages/Transactions";
import StatsPage from "./pages/Stats";
import Settings from "./pages/Settings";

function AppContent() {
  const { toasts, closeToast } = useApp();
  return (
    <>
      <ToastContainer toasts={toasts} onClose={closeToast} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app">
          <AuthGate>
            <AppContent />
          </AuthGate>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
