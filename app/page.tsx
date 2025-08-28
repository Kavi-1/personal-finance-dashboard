"use client";

import React, { useState } from "react";
import TransactionForm from "./components/TransactionForm";
import { Transaction } from "../types/Transaction";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Handler to add a transaction
  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions([transaction, ...transactions]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Navbar */}
      <nav className="bg-white shadow p-4 rounded mb-6">
        <h1 className="text-2xl font-bold">Personal Finance Dashboard</h1>
      </nav>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Transaction Form */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-black">Add Transaction</h2>
          <TransactionForm onAdd={handleAddTransaction} />
        </div>

        {/* Placeholder for Transactions List */}
        <div className="md:col-span-2 bg-white p-4 rounded shadow flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Transactions</h2>
          {transactions.length === 0 ? (
            <p>No transactions yet.</p>
          ) : (
            <ul>
              {transactions.map((t) => (
                <li key={t.id}>
                  {t.category}: ${t.amount} on {t.date} | {t.notes}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
