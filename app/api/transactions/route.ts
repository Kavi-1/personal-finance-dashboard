import { NextResponse } from "next/server";
import getCollection, { TRANSACTIONS_COLLECTION } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { WithId } from "mongodb";
import type { Transaction, NewTransaction } from "@/types/Transaction";

type DbTxn = {
    userEmail: string;
    amount: number;
    category: string;
    date: string;
    notes: string;
    createdAt: Date;
};

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const col = await getCollection<DbTxn>(TRANSACTIONS_COLLECTION);
    const docs = (await col
        .find({ userEmail: session.user.email })
        .sort({ _id: -1 })
        .toArray()) as WithId<DbTxn>[];

    // map mongo to your transaction type
    const data: Transaction[] = docs.map((d) => ({
        id: String(d._id),
        amount: d.amount,
        category: d.category,
        date: d.date,
        notes: d.notes,
        createdAt: d.createdAt.toISOString(),
    }));

    return NextResponse.json(data);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as NewTransaction;

    const doc: DbTxn = {
        userEmail: session.user.email,
        amount: Number(body.amount),
        category: body.category,
        date: body.date,
        notes: body.notes,
        createdAt: new Date(),
    };

    const col = await getCollection<DbTxn>(TRANSACTIONS_COLLECTION);
    const res = await col.insertOne(doc);

    const response: Transaction = {
        id: String(res.insertedId),
        amount: doc.amount,
        category: doc.category,
        date: doc.date,
        notes: doc.notes,
        createdAt: doc.createdAt.toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
}
