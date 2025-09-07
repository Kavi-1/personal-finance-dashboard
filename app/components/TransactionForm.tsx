"use client";

import React, { useState } from "react";
import Button from "@mui/material/Button";
import { NewTransaction } from "../../types/Transaction";

interface TransactionFormProps {
    onAdd: (transaction: NewTransaction) => void; // no id here
}

export default function TransactionForm({ onAdd }: TransactionFormProps) {
    const [form, setForm] = useState({
        amount: "",
        category: "",
        date: "",
        notes: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newTransaction: NewTransaction = {
            amount: Number(form.amount),
            category: form.category.trim(),
            date: form.date,
            notes: form.notes.trim(),
        };

        onAdd(newTransaction);                 // let server generate id
        setForm({ amount: "", category: "", date: "", notes: "" });
    };

    const disabled =
        !form.amount || !form.category || !form.date || !form.notes;

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
            <Button type="submit" variant="contained" color="primary" disabled={disabled}>
                Add
            </Button>
        </form>
    );
}
