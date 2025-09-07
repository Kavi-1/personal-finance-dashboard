export interface Transaction {
    id: string;
    amount: number;
    category: string;
    date: string;
    notes: string;
    createdAt?: string;
}

export type NewTransaction = {
    amount: number;
    category: string;
    date: string;
    notes: string;
};
