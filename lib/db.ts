import { MongoClient, Db, Collection, Document } from "mongodb";

const MONGO_URI = process.env.MONGO_URI as string;
if (!MONGO_URI) {
    throw new Error("MONGO_URI environment variable is undefined");
}

let DB_NAME = "";
try {
    const parsed = new URL(MONGO_URI);
    DB_NAME = parsed.pathname.replace("/", "") || "personal-finance";
} catch {
    DB_NAME = "personal-finance";
}

export const TRANSACTIONS_COLLECTION = "transactions";

let client: MongoClient | null = null;
let db: Db | null = null;

async function connect(): Promise<Db> {
    if (!client) {
        client = new MongoClient(MONGO_URI);
        await client.connect();
    }
    if (!db) {
        db = client.db(DB_NAME);
    }
    return db;
}

export default async function getCollection<T extends Document = Document>(
    collectionName: string
): Promise<Collection<T>> {
    const database = await connect();
    return database.collection<T>(collectionName);
}
