"use client";

import React, { useState } from "react";
import Button from "@mui/material/Button";
import { NewTransaction } from "../../types/Transaction";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { CATEGORIES } from "@/constants/categories";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

interface TransactionFormProps {
    onAdd: (transaction: NewTransaction) => void; // no id here
}

export default function TransactionForm({ onAdd }: TransactionFormProps) {
    const [form, setForm] = useState({ amount: "", category: "", date: "", notes: "" });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newTransaction: NewTransaction = {
            amount: Number(form.amount),
            category: form.category,
            date: form.date,
            notes: form.notes.trim(),
        };

        onAdd(newTransaction);                 // let server generate id
        setForm({ amount: "", category: "", date: "", notes: "" });
    };

    const disabled =
        !form.amount || !form.category || !form.date;

    return (
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <TextField
                fullWidth
                size="small"
                type="number"
                label="Amount"
                placeholder="0.00"
                value={form.amount}
                required
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <TextField
                select
                name="category"
                label="Category"
                value={form.category}
                required
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                size="small"
            >
                <MenuItem value="" disabled>
                    Select a category…
                </MenuItem>
                {CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>
                        {c}
                    </MenuItem>
                ))}
            </TextField>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label="Date"
                    value={form.date ? dayjs(form.date) : null}
                    onChange={(v) =>
                        setForm((f) => ({ ...f, date: v ? v.format("YYYY-MM-D") : "" }))
                    }
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            size: "small",
                            required: true,
                            //gray
                            sx: {
                                "& .MuiInputLabel-root": { color: "text.secondary" },
                                "& .MuiInputBase-input::placeholder": { color: "text.secondary", opacity: 1 },
                            },
                        },
                    }}
                    disableFuture      // prevent future dates
                />
            </LocalizationProvider>

            <TextField
                size="small"
                label="Notes"
                placeholder="Add description"
                multiline
                minRows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <Button type="submit" variant="contained" color="primary" disabled={disabled}>
                Add
            </Button>
        </form>
    );
}
