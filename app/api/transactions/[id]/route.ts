import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import getCollection, { TRANSACTIONS_COLLECTION } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const col = await getCollection(TRANSACTIONS_COLLECTION);
    await col.deleteOne({ _id: new ObjectId(id), userEmail: session.user.email });
    return NextResponse.json({ ok: true });
}
