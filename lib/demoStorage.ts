export type DemoTransaction = {
    id: string;          // client id
    amount: number;
    category: string;
    date: string;
    notes: string;
    createdAt?: string;
};

const KEY = "pf_demo_transactions_v1";

export function loadDemo(): DemoTransaction[] {
    try {
        const raw = sessionStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as DemoTransaction[]) : [];
    } catch {
        return [];
    }
}

export function saveDemo(list: DemoTransaction[]) {
    sessionStorage.setItem(KEY, JSON.stringify(list));
}

export function addDemo(t: Omit<DemoTransaction, "id" | "createdAt">) {
    const list = loadDemo();
    const now = new Date().toISOString();
    const id = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const item: DemoTransaction = { id, createdAt: now, ...t };
    saveDemo([item, ...list]);
    return item;
}

export function removeDemo(id: string) {
    const list = loadDemo().filter((x) => x.id !== id);
    saveDemo(list);
}
