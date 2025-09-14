"use client";

import * as React from "react";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Transaction } from "../../types/Transaction";
import { getCategoryMeta, hexToRgba } from "@/constants/categoryStyle";

// currency and date format
const fmtMoney = new Intl.NumberFormat("en-US", {
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

type Props = {
    transactions: Transaction[];
    onDelete: (id: string) => void;
};

export default function TransactionList({ transactions, onDelete }: Props) {
    if (!transactions.length) {
        return <p className="text-slate-600">No transactions yet.</p>;
    }

    return (
        <ul className="divide-y divide-slate-200">
            {transactions.map((t) => {
                const { category, color, bg, border, Icon } = getCategoryMeta(t.category);

                return (
                    <li key={t.id} className="py-3">
                        <div className="flex items-center gap-3 px-2">
                            {/* Avatar */}
                            <div
                                className="h-10 w-10 rounded-full grid place-items-center shadow-sm text-white"
                                style={{
                                    background: `linear-gradient(135deg, ${hexToRgba(color, 0.95)} 0%, ${hexToRgba(color, 0.65)} 100%)`,
                                }}
                                aria-hidden
                                title={category}
                            >
                                <Icon fontSize="small" />
                            </div>
                            {/* Middle content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="px-2.5 py-0.5 text-xs rounded-full border"
                                        style={{ backgroundColor: bg, color, borderColor: border }}
                                    >
                                        {category}
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
