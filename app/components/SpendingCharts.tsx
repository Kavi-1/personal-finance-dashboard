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

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title, ChartDataLabels);

ChartJS.defaults.font.family =
    "'Inter', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
ChartJS.defaults.font.size = 12;
ChartJS.defaults.color = "#334155"; // slate-700

type Props = { transactions: Transaction[] };

const fmtFull = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
const fmtCompact = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
});

function lastNMonthsKeys(n: number) {
    const keys: string[] = [];
    const d = new Date();
    d.setDate(1);
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

function aggregateByCategoryTopN(transactions: Transaction[], topN = 6) {
    const buckets = new Map<string, number>();
    for (const t of transactions) {
        const c = (t.category || "Uncategorized").trim();
        buckets.set(c, (buckets.get(c) || 0) + Number(t.amount) || 0);
    }
    const sorted = Array.from(buckets.entries()).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, topN);
    const rest = sorted.slice(topN);
    const otherTotal = rest.reduce((s, [, v]) => s + v, 0);
    const labels = top.map(([k]) => k).concat(otherTotal > 0 ? ["Other"] : []);
    const data = top.map(([, v]) => v).concat(otherTotal > 0 ? [otherTotal] : []);
    return { labels, data };
}

function makePalette(n: number, alpha = 0.9) {
    return Array.from({ length: Math.max(n, 1) }, (_, i) => {
        const hue = Math.round((360 / Math.max(n, 1)) * i);
        return `hsla(${hue}, 70%, 55%, ${alpha})`;
    });
}

// ---------- component ----------
export default function SpendingCharts({ transactions }: Props) {
    if (!transactions?.length) return null;

    const total = transactions.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const avg = total / transactions.length;

    const monthly = aggregateByMonthLastN(transactions, 12);
    const byCat = aggregateByCategoryTopN(transactions, 6);

    const barData = {
        labels: monthly.labels,
        datasets: [
            {
                label: "Monthly Total",
                data: monthly.data,
                backgroundColor: "rgba(79,70,229,0.65)",   // indigo-ish
                borderColor: "rgba(79,70,229,0.95)",
                borderWidth: 1,
                borderRadius: 10,
                hoverBorderWidth: 2,
            },
        ],
    };

    const catColors = makePalette(byCat.labels.length, 0.9);
    const catColorsHover = makePalette(byCat.labels.length, 0.7);
    const doughnutData = {
        labels: byCat.labels,
        datasets: [
            {
                data: byCat.data,
                backgroundColor: catColors,
                hoverBackgroundColor: catColorsHover,
                borderWidth: 0,
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
            tooltip: {
                callbacks: { label: (ctx) => fmtFull.format(Number(ctx.parsed.y || 0)) },
            },
            datalabels: {
                anchor: "end",
                align: "end",
                clamp: true,
                offset: 4,
                color: "#0f172a", // slate-900
                formatter: (v) => fmtCompact.format(Number(v || 0)),
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
        animation: { duration: 600, easing: "easeOutQuart" },
    };

    const optionsDoughnut: ChartOptions<"doughnut"> = {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 8 },
        plugins: {
            title: { display: true, text: "Spending by Category (top groups)" },
            legend: {
                position: "bottom",
                labels: { usePointStyle: true, boxWidth: 8, padding: 16 },
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const v = Number(ctx.raw || 0);
                        const total = (ctx.dataset.data as number[]).reduce((s, x) => s + Number(x || 0), 0);
                        const pct = total ? Math.round((v / total) * 100) : 0;
                        return `${ctx.label}: ${fmtFull.format(v)} (${pct}%)`;
                    },
                },
            },
            datalabels: {
                color: "#0f172a",
                formatter: (v, ctx) => {
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
            {/* KPI header */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded shadow">
                    <div className="text-sm text-slate-500">Total Spend</div>
                    <div className="text-2xl font-semibold">{fmtFull.format(total)}</div>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <div className="text-sm text-slate-500">Avg per Transaction</div>
                    <div className="text-2xl font-semibold">{fmtFull.format(avg || 0)}</div>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <div className="text-sm text-slate-500">Transactions</div>
                    <div className="text-2xl font-semibold">{transactions.length}</div>
                </div>
            </div>

            {/* Charts */}
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
