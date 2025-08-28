"use client";

import React, { useState } from "react";
import Button from "@mui/material/Button";
import { Transaction } from "../../types/Transaction";

interface TransactionFormProps {
    onAdd: (transaction: Transaction) => void;
}

export default function TransactionForm({ onAdd }: TransactionFormProps) {
    const [form, setForm] = useState({
        amount: "",
        category: "",
        date: "",
        notes: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newTransaction: Transaction = {
            id: Date.now(),
            amount: Number(form.amount),
            category: form.category,
            date: form.date,
            notes: form.notes,
        };
        onAdd(newTransaction);
        setForm({ amount: "", category: "", date: "", notes: "" });
    };

    return (
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={form.amount}
                onChange={handleChange}
                className="border p-2 rounded"
            />
            <input
                type="text"
                name="category"
                placeholder="Category"
                value={form.category}
                onChange={handleChange}
                className="border p-2 rounded"
            />
            <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="border p-2 rounded"
            />
            <textarea
                name="notes"
                value={form.notes}
                placeholder="Notes"
                onChange={handleChange}
                className="border p-2 rounded"
            />
            <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!form.amount || !form.category || !form.date || !form.notes}
            >
                Add
            </Button>
        </form>
    );
}
