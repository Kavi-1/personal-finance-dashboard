import { NextResponse } from "next/server";
import getCollection, { TRANSACTIONS_COLLECTION } from "@/lib/db";

type TransactionDoc = {
    amount: number;
    category: string;
    date: string;
    notes?: string;
    createdAt: Date;
};

export async function GET() {
    const col = await getCollection<TransactionDoc>(TRANSACTIONS_COLLECTION);
    const docs = await col.find({}).sort({ _id: -1 }).toArray(); // inferred WithId<TransactionDoc>[]
    const data = docs.map(({ _id, ...rest }) => ({ id: String(_id), ...rest }));
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    const body = (await req.json()) as {
        amount: number | string;
        category: string;
        date: string;
        notes?: string;
    };

    const doc: TransactionDoc = {
        amount: Number(body.amount),
        category: body.category,
        date: body.date,
        ...(body.notes ? { notes: body.notes } : {}),
        createdAt: new Date(),
    };

    const col = await getCollection<TransactionDoc>(TRANSACTIONS_COLLECTION);
    const res = await col.insertOne(doc);

    return NextResponse.json({ id: String(res.insertedId), ...doc }, { status: 201 });
}
