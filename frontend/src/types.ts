export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface Account {
  id: number;
  user_id: number;
  name: string;
  balance: number;
  currency: string;
  icon: string;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  icon: string;
  type: "income" | "expense";
}

export interface Transaction {
  id: number;
  user_id: number;
  account_id: number;
  category_id: number | null;
  type: "income" | "expense" | "transfer";
  amount: number;
  note: string | null;
  date: string;
  account_name?: string;
  currency?: string;
  category_name?: string;
  category_icon?: string;
}

export interface Stats {
  summary: {
    total_income: number;
    total_expense: number;
    total_transactions: number;
  };
  by_category: {
    name: string;
    icon: string;
    total: number;
  }[];
  trend: {
    year: number;
    month: number;
    income: number;
    expense: number;
  }[];
}
