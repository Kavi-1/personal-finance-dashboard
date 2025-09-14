import { useMemo, useState } from "react";
import type { Transaction } from "@/types/Transaction";

export type SortBy = "date" | "amount" | "category";
export type SortDir = "asc" | "desc";

export default function useSort(transactions: Transaction[]) {
    const [sortBy, setSortBy] = useState<SortBy>("date");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const sorted = useMemo(() => {
        const sign = sortDir === "asc" ? 1 : -1;
        return [...transactions].sort((a, b) => {
            const cmp =
                sortBy === "amount"
                    ? a.amount - b.amount
                    : sortBy === "date"
                        ? (Date.parse(a.date) || 0) - (Date.parse(b.date) || 0)
                        : a.category.localeCompare(b.category, undefined, { sensitivity: "base" });
            return cmp * sign;
        });
    }, [transactions, sortBy, sortDir]);

    const toggleSortDir = () => setSortDir((d) => (d === "asc" ? "desc" : "asc"));

    return { sorted, sortBy, setSortBy, sortDir, toggleSortDir };
}
