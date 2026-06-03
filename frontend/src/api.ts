import axios from "axios";
import type { Account, Category, Transaction, Stats, TelegramUser } from "./types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const api = axios.create({ baseURL: BASE_URL });

// Users
export const registerUser = (user: TelegramUser) =>
  api.post<TelegramUser>("/api/users", user).then((r) => r.data);

// Accounts
export const getAccounts = (user_id: number) =>
  api.get<Account[]>("/api/accounts", { params: { user_id } }).then((r) => r.data);

export const createAccount = (data: Omit<Account, "id">) =>
  api.post<Account>("/api/accounts", data).then((r) => r.data);

export const updateAccount = (id: number, data: Partial<Account>) =>
  api.put<Account>(`/api/accounts/${id}`, data).then((r) => r.data);

export const deleteAccount = (id: number) =>
  api.delete(`/api/accounts/${id}`).then((r) => r.data);

// Categories
export const getCategories = (user_id: number, type?: "income" | "expense") =>
  api
    .get<Category[]>("/api/categories", { params: { user_id, type } })
    .then((r) => r.data);

export const createCategory = (data: Omit<Category, "id">) =>
  api.post<Category>("/api/categories", data).then((r) => r.data);

export const deleteCategory = (id: number) =>
  api.delete(`/api/categories/${id}`).then((r) => r.data);

// Transactions
export const getTransactions = (
  user_id: number,
  params?: {
    type?: string;
    account_id?: number;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }
) =>
  api
    .get<Transaction[]>("/api/transactions", { params: { user_id, ...params } })
    .then((r) => r.data);

export const getStats = (user_id: number, year?: number, month?: number) =>
  api
    .get<Stats>("/api/transactions/stats", { params: { user_id, year, month } })
    .then((r) => r.data);

export const createTransaction = (
  data: Omit<Transaction, "id" | "account_name" | "currency" | "category_name" | "category_icon">
) =>
  api.post<Transaction>("/api/transactions", data).then((r) => r.data);

export const deleteTransaction = (id: number) =>
  api.delete(`/api/transactions/${id}`).then((r) => r.data);
