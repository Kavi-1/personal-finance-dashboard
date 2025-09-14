"use client";

import { Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    Title,
    type ChartOptions,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import type { Transaction } from "../../types/Transaction";

// better colors
const CATEGORY_BASE = [
    "#6366F1",
    "#10B981",
    "#0EA5E9",
    "#F59E0B",
    "#F43F5E",
    "#8B5CF6",
    "#14B8A6",
    "#84CC16",
    "#3B82F6",
    "#FB923C",
];

function hexToRgba(hex: string, a = 0.9) {
    const m = hex.replace("#", "");
    const r = parseInt(m.slice(0, 2), 16);
    const g = parseInt(m.slice(2, 4), 16);
    const b = parseInt(m.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// same colors for each category
function hashLabelToIndex(label: string, mod: number) {
    let h = 0;
    for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) | 0;
    return Math.abs(h) % mod;
}

function colorsForLabels(labels: string[]) {
    const bg = labels.map(l => hexToRgba(CATEGORY_BASE[hashLabelToIndex(l, CATEGORY_BASE.length)], 0.88));
    const hover = labels.map(l => hexToRgba(CATEGORY_BASE[hashLabelToIndex(l, CATEGORY_BASE.length)], 0.7));
    return { bg, hover };
}


ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title, ChartDataLabels);

ChartJS.defaults.font.family =
    "'Inter', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
ChartJS.defaults.font.size = 12;
ChartJS.defaults.color = "#334155"; // slate-700

type Props = { transactions: Transaction[] };

const fmtFull = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
const fmtCompact = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });

function lastNMonthsKeys(n: number) {
    const keys: string[] = [];
    const d = new Date(); d.setDate(1);
    for (let i = n - 1; i >= 0; i--) {
        const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
        keys.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`);
    }
    return keys;
}

function aggregateByMonthLastN(transactions: Transaction[], n = 12) {
    const keys = lastNMonthsKeys(n);
    const index = new Map(keys.map((k, i) => [k, i]));
    const data = Array(keys.length).fill(0);
    for (const t of transactions) {
        const d = new Date(t.date);
        if (isNaN(+d)) continue;
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const i = index.get(k);
        if (i != null) data[i] += Number(t.amount) || 0;
    }
    const labels = keys.map((k) => {
        const [y, m] = k.split("-");
        const dt = new Date(Number(y), Number(m) - 1, 1);
        return dt.toLocaleString(undefined, { month: "short", year: "2-digit" });
    });
    return { labels, data };
}

function aggregateByCategory(transactions: Transaction[]) {
    const buckets = new Map<string, number>();
    for (const t of transactions) {
        const c = (t.category || "Uncategorized").trim();
        buckets.set(c, (buckets.get(c) || 0) + Number(t.amount) || 0);
    }
    const labels = Array.from(buckets.keys());
    const data = labels.map((l) => buckets.get(l) || 0);
    return { labels, data };
}

export default function SpendingCharts({ transactions }: Props) {
    const hasData = (transactions?.length ?? 0) > 0;

    const total = transactions.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const avg = transactions.length ? total / transactions.length : 0;

    const monthly = aggregateByMonthLastN(transactions, 12); // always returns 12 labels
    const byCatRaw = aggregateByCategory(transactions);

    // --- Bar chart (always 12 months; zeros if none) ---
    const barData = {
        labels: monthly.labels,
        datasets: [
            {
                label: "Monthly Total",
                data: monthly.data,
                backgroundColor: "rgba(79,70,229,0.65)",
                borderColor: "rgba(79,70,229,0.95)",
                borderWidth: 1,
                borderRadius: 10,
            },
        ],
    };

    const optionsBar: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 8 },
        plugins: {
            title: { display: true, text: "Spending by Month (last 12 months)" },
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => fmtFull.format(Number(ctx.parsed.y || 0)) } },
            datalabels: {
                anchor: "end",
                align: "end",
                offset: 4,
                color: "#0f172a",
                formatter: (v) => (v ? fmtCompact.format(Number(v)) : ""),
            },
        },
        scales: {
            x: { grid: { display: false } },
            y: {
                beginAtZero: true,
                grid: { color: "rgba(148,163,184,0.25)" },
                ticks: { callback: (v) => fmtCompact.format(Number(v)) },
                border: { display: false },
            },
        },
    };

    const hasCatData = hasData && byCatRaw.data.some((v) => v > 0);
    const catLabels = hasCatData ? byCatRaw.labels : ["No data"];
    const catData = hasCatData ? byCatRaw.data : [1];

    const { bg: colors, hover: colorsHover } = hasCatData
        ? colorsForLabels(catLabels)
        : { bg: ["rgba(203,213,225,0.6)"], hover: ["rgba(203,213,225,0.8)"] };


    const doughnutData = {
        labels: catLabels,
        datasets: [
            {
                data: catData,
                backgroundColor: colors,
                hoverBackgroundColor: colorsHover,
                borderColor: "#fff",
                borderWidth: 2,
            },
        ],
    };

    const optionsDoughnut: ChartOptions<"doughnut"> = {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 8 },
        plugins: {
            title: { display: true, text: "Spending by Category" },
            legend: { position: "bottom", display: hasCatData, labels: { usePointStyle: true, boxWidth: 8, padding: 16 } },
            tooltip: { enabled: hasCatData },
            datalabels: {
                color: "#0f172a",
                formatter: (v, ctx) => {
                    if (!hasCatData) return ""; // hide "100%" on placeholder
                    const total = (ctx.dataset.data as number[]).reduce((s, x) => s + Number(x || 0), 0);
                    const pct = total ? Math.round((Number(v) / total) * 100) : 0;
                    return `${pct}%`;
                },
            },
        },
        cutout: "65%",
        rotation: -0.5 * Math.PI,
    };

    return (
        <div className="space-y-6">
            {/* KPI header (always visible) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded shadow">
                    <div className="text-sm text-slate-500">Total Spent</div>
                    <div className="text-2xl text-emerald-700 font-semibold">{fmtFull.format(total)}</div>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <div className="text-sm text-slate-500">Average per Transaction</div>
                    <div className="text-2xl text-emerald-700 font-semibold">{fmtFull.format(avg)}</div>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <div className="text-sm text-slate-500">Transactions</div>
                    <div className="text-2xl text-black font-semibold">{transactions.length}</div>
                </div>
            </div>

            {/* Charts (always visible) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded shadow" style={{ height: 340 }}>
                    <Bar data={barData} options={optionsBar} />
                </div>
                <div className="bg-white p-4 rounded shadow" style={{ height: 340 }}>
                    <Doughnut data={doughnutData} options={optionsDoughnut} />
                </div>
            </div>
        </div>
    );
}
