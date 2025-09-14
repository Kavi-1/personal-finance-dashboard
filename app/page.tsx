"use client";

import React, { useEffect, useState } from "react";
import TransactionForm from "./components/TransactionForm";
import { Transaction, NewTransaction } from "../types/Transaction";
import TransactionList from "./components/TransactionList";
import SpendingCharts from "./components/SpendingCharts";
import useSort, { type SortBy } from "./hooks/useSort";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { sorted, sortBy, setSortBy, sortDir, toggleSortDir } = useSort(transactions);

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

          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg h-14 px-3 mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900">Add Transaction</h2>
          </div>

          <TransactionForm onAdd={handleAddTransaction} />
        </div>

        {/* List */}
        <div className="md:col-span-2 bg-white p-4 rounded shadow flex flex-col gap-4">

          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg h-14 px-3">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900">Transactions</h2>
            <div className="flex items-center gap-2">
              <TextField
                select
                size="small"
                label="Sort by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="amount">Amount</MenuItem>
                <MenuItem value="category">Category</MenuItem>
              </TextField>
              <Tooltip title={sortDir === "asc" ? "Ascending" : "Descending"}>
                <IconButton color="primary" onClick={toggleSortDir} size="small" aria-label="Toggle sort direction">
                  {sortDir === "asc" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </div>
          </div>

          {error && <p className="text-red-600">Error: {error}</p>}
          {loading ? (
            <p>Loading…</p>
          ) : (
            <div className="h-65 overflow-y-auto pr-2" style={{ scrollbarGutter: "stable" }}>
              <TransactionList transactions={sorted} onDelete={handleDelete} />
            </div>
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
