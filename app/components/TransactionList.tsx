"use client";

import * as React from "react";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Transaction } from "../../types/Transaction";

// currency and date format
const fmtMoney = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
});
const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return isNaN(+d)
        ? iso
        : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const CHIP_CLASSES = [
    "bg-indigo-100 text-indigo-700 border-indigo-200",
    "bg-emerald-100 text-emerald-700 border-emerald-200",
    "bg-sky-100 text-sky-700 border-sky-200",
    "bg-amber-100 text-amber-800 border-amber-200",
    "bg-rose-100 text-rose-700 border-rose-200",
    "bg-violet-100 text-violet-700 border-violet-200",
    "bg-cyan-100 text-cyan-700 border-cyan-200",
];

const AVATAR_BG = [
    "from-indigo-500 to-violet-500",
    "from-emerald-500 to-teal-500",
    "from-sky-500 to-blue-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
    "from-violet-500 to-fuchsia-500",
    "from-cyan-500 to-teal-500",
];

type Props = {
    transactions: Transaction[];
    onDelete: (id: string) => void;
};

export default function TransactionList({ transactions, onDelete }: Props) {
    if (!transactions.length) {
        return <p className="text-slate-600">No transactions yet.</p>;
    }

    // Map category -> color 
    const catIndex = new Map<string, number>();
    let next = 0;
    const getIndex = (cat: string) => {
        const key = (cat || "Uncategorized").trim();
        if (!catIndex.has(key)) {
            catIndex.set(key, next % CHIP_CLASSES.length);
            next += 1;
        }
        return catIndex.get(key)!;
    };

    return (
        <ul className="divide-y divide-slate-200">
            {transactions.map((t) => {
                const idx = getIndex(t.category);
                const chip = CHIP_CLASSES[idx];
                const avatar = AVATAR_BG[idx];
                const first = (t.category?.[0] || "?").toUpperCase();

                return (
                    <li key={t.id} className="py-3">
                        <div className="flex items-center gap-3 px-2">
                            {/* Avatar */}
                            <div
                                className={`h-10 w-10 rounded-full text-white grid place-items-center bg-gradient-to-br ${avatar} shadow-sm`}
                                aria-hidden
                            >
                                <span className="text-sm font-semibold">{first}</span>
                            </div>

                            {/* Middle content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-0.5 text-xs rounded-full border ${chip}`}>
                                        {t.category || "Uncategorized"}
                                    </span>
                                    <span className="text-xs text-slate-500">• {fmtDate(t.date)}</span>
                                </div>
                                {t.notes ? (
                                    <div className="text-slate-600 text-sm truncate mt-1">{t.notes}</div>
                                ) : null}
                            </div>

                            {/* Amount */}
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900 tabular-nums">
                                    {fmtMoney.format(Number(t.amount) || 0)}
                                </span>
                                <IconButton
                                    onClick={() => onDelete(t.id)}
                                    aria-label={`Delete ${t.category} ${t.amount} on ${t.date}`}
                                    size="small"
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
