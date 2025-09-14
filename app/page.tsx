"use client";

import React, { useEffect, useState } from "react";
import TransactionForm from "./components/TransactionForm";
import { Transaction, NewTransaction } from "../types/Transaction";
import TransactionList from "./components/TransactionList";
import SpendingCharts from "./components/SpendingCharts";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      const res = await fetch("/api/transactions", { cache: "no-store" });
      if (!res.ok) throw new Error(`GET /api/transactions failed`);
      const data: Transaction[] = await res.json();
      setTransactions(data);
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddTransaction = async (t: NewTransaction) => {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t),
      });
      if (!res.ok) throw new Error(`POST /api/transactions failed`);
      const created: Transaction = await res.json();
      setTransactions((prev) => [created, ...prev]);
    } catch {
      alert("Failed to add");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } else {
      const { error } = await res.json().catch(() => ({ error: "Delete failed" }));
      alert(error);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Navbar */}
      <nav className="bg-white shadow p-4 rounded mb-6">
        <h1 className="text-2xl text-black font-bold">Personal Finance Dashboard</h1>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-black">Add Transaction</h2>
          <TransactionForm onAdd={handleAddTransaction} />
        </div>

        {/* List */}
        <div className="md:col-span-2 bg-white p-4 rounded shadow flex flex-col gap-4">
          <h2 className="text-xl text-black font-semibold">Transactions</h2>
          {error && <p className="text-red-600">Error: {error}</p>}
          {loading ? (
            <p>Loading…</p>
          ) : (
            <TransactionList transactions={transactions} onDelete={handleDelete} />
          )}
        </div>
      </div>
      {/* Charts */}
      <div className="mt-6">
        <SpendingCharts transactions={transactions} />
      </div>

    </div>
  );
}
