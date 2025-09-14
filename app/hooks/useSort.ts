import { useMemo, useState } from "react";
import type { Transaction } from "@/types/Transaction";

export type SortBy = "date" | "amount" | "category";
export type SortDir = "asc" | "desc";

export default function useSort(transactions: Transaction[]) {
    const [sortBy, setSortBy] = useState<SortBy>("date");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const sorted = useMemo(() => {
        const arr = [...transactions];
        arr.sort((a, b) => {
            let cmp = 0;
            if (sortBy === "date") cmp = a.date.localeCompare(b.date); // "YYYY-MM-DD" sorts well
            else if (sortBy === "amount") cmp = a.amount - b.amount;
            else cmp = a.category.localeCompare(b.category, undefined, { sensitivity: "base" });
            return sortDir === "asc" ? cmp : -cmp;
        });
        return arr;
    }, [transactions, sortBy, sortDir]);

    const toggleSortDir = () => setSortDir((d) => (d === "asc" ? "desc" : "asc"));

    return { sorted, sortBy, setSortBy, sortDir, toggleSortDir };
}
