import { MongoClient, Db, Collection } from "mongodb";
import { Address } from "ton";
import { log } from "../utils/log";

export const storage = new MongoClient(process.env.STORAGE!);

let db: Db;
let syncStates: Collection;
let blocksCollection: Collection;
let transactionsCollection: Collection;

export async function getSyncState(key: string) {
    let ex = await syncStates.findOne({ _id: key });
    if (ex) {
        return ex.value as string;
    } else {
        return null;
    }
}

export async function setSyncState(key: string, existing: string | null, value: string | null) {
    if (existing) {
        if (value) {
            await syncStates.updateOne({ _id: key, value: existing }, { $set: { value } }, { upsert: false });
        } else {
            await syncStates.deleteOne({ _id: key, value: existing });
        }
    } else {
        if (value) {
            await syncStates.insertOne({ _id: key as any, value });
        } else {
            // Do nothing
        }
    }
}

export async function applyBlocks(blocks: { seq: number, data: any }[]) {
    await blocksCollection.bulkWrite(blocks.map((v) => ({
        updateOne: {
            filter: { _id: v.seq },
            update: { $set: { data: v.data } },
            upsert: true
        }
    })));
}

export async function getBlock(seq: number) {
    let ex = await blocksCollection.findOne({ _id: seq });
    if (ex) {
        return ex.data;
    } else {
        return null;
    }
}

export async function applyTransactions(transactions: { address: Address, lt: string, hash: string, data: string }[]) {
    await transactionsCollection.bulkWrite(transactions.map((v) => ({
        updateOne: {
            filter: { address: v.address.toFriendly(), lt: parseInt(v.lt, 10) },
            update: { $set: { address: v.address.toFriendly(), lt: parseInt(v.lt, 10), hash: v.hash, data: v.data } },
            upsert: true
        }
    })));
}

export async function startStorage() {
    log('Connecting to MongoDB');
    await storage.connect();


    db = storage.db();
    syncStates = db.collection('sync_state');
    blocksCollection = db.collection('blocks');
    transactionsCollection = db.collection('transactions');

    log('Connected');
}