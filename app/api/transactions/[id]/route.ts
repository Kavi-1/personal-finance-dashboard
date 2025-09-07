import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import getCollection, { TRANSACTIONS_COLLECTION } from "@/lib/db";

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const col = await getCollection(TRANSACTIONS_COLLECTION);
    await col.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
}
