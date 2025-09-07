import { NextResponse } from "next/server";
import getCollection, { TRANSACTIONS_COLLECTION } from "@/lib/db";

export async function GET() {
    const col = await getCollection(TRANSACTIONS_COLLECTION);
    const docs = await col.find({}).sort({ _id: -1 }).toArray();
    return NextResponse.json(docs.map(({ _id, ...rest }: any) => ({ id: String(_id), ...rest })));
}

export async function POST(req: Request) {
    const { amount, category, date, notes } = await req.json();
    const doc = { amount: Number(amount), category, date, notes, createdAt: new Date() };

    const col = await getCollection(TRANSACTIONS_COLLECTION);
    const res = await col.insertOne(doc);

    return NextResponse.json({ id: String(res.insertedId), ...doc }, { status: 201 });
}
