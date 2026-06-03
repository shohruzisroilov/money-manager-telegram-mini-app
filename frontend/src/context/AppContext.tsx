import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import type { Account, Category, Transaction, TelegramUser } from "../types";
import * as api from "../api";
import { useToast } from "../components/Toast";
import type { ToastData } from "../components/Toast";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

interface AppContextType {
  user: TelegramUser | null;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  loading: boolean;
  authError: string | null;
  refreshAccounts: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  toasts: ToastData[];
  closeToast: (id: number) => void;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser]               = useState<TelegramUser | null>(null);
  const [accounts, setAccounts]       = useState<Account[]>([]);
  const [categories, setCategories]   = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]         = useState(true);
  const [authError, setAuthError]     = useState<string | null>(null);
  const { toasts, close: closeToast, success: showSuccess, error: showError } = useToast();

  const refreshAccounts = useCallback(async () => {
    if (!user) return;
    const data = await api.getAccounts(user.id);
    setAccounts(data);
  }, [user]);

  const refreshCategories = useCallback(async () => {
    if (!user) return;
    const data = await api.getCategories(user.id);
    setCategories(data);
  }, [user]);

  const refreshTransactions = useCallback(async () => {
    if (!user) return;
    const data = await api.getTransactions(user.id, { limit: 100 });
    setTransactions(data);
  }, [user]);

  useEffect(() => {
    const init = async () => {
      try {
        const tg = window.Telegram?.WebApp;

        // Telegram WebApp ichida ekanligini tekshirish
        if (tg && tg.initData && tg.initData.length > 0) {
          // Real Telegram user — initData orqali verify qilamiz
          tg.ready();
          tg.expand();

          const res = await fetch(`${BASE_URL}/api/auth/telegram`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData: tg.initData }),
          });

          if (!res.ok) {
            const err = await res.json() as { error: string };
            setAuthError(err.error ?? "Autentifikatsiya xatolik");
            return;
          }

          const registeredUser = await res.json() as TelegramUser;
          setUser(registeredUser);
        } else if (import.meta.env.DEV) {
          // Development rejimi — test user bilan ishlaymiz
          const res = await fetch(`${BASE_URL}/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: 123456789,
              first_name: "Test",
              last_name: "User",
              username: "testuser",
            }),
          });
          const devUser = await res.json() as TelegramUser;
          setUser(devUser);
        } else {
          // Production da Telegram ichida emas — xato ko'rsatamiz
          setAuthError("Bu dastur faqat Telegram ichida ishlaydi");
        }
      } catch (err) {
        console.error("Auth xatolik:", err);
        setAuthError("Serverga ulanib bo'lmadi");
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, []);

  useEffect(() => {
    if (user) {
      void Promise.all([
        refreshAccounts(),
        refreshCategories(),
        refreshTransactions(),
      ]);
    }
  }, [user, refreshAccounts, refreshCategories, refreshTransactions]);

  return (
    <AppContext.Provider
      value={{
        user,
        accounts,
        categories,
        transactions,
        loading,
        authError,
        refreshAccounts,
        refreshTransactions,
        refreshCategories,
        toasts,
        closeToast,
        showSuccess,
        showError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
