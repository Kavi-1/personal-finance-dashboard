import { NextResponse } from "next/server";
import getCollection, { TRANSACTIONS_COLLECTION } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const col = await getCollection(TRANSACTIONS_COLLECTION);
    const docs = await col.find({ userEmail: session.user.email }).sort({ _id: -1 }).toArray();
    const data = docs.map(({ _id, ...rest }: any) => ({ id: String(_id), ...rest }));
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, category, date, notes } = await req.json();
    const doc = {
        userEmail: session.user.email, // tie to the user
        amount: Number(amount),
        category,
        date,
        notes,
        createdAt: new Date(),
    };

    const col = await getCollection(TRANSACTIONS_COLLECTION);
    const res = await col.insertOne(doc);
    return NextResponse.json({ id: String(res.insertedId), ...doc }, { status: 201 });
}
