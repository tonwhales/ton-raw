import { BN } from "bn.js";
import { MongoClient, Db, Collection } from "mongodb";
import { Address, Cell, parseTransaction } from "ton";
import { log } from "../utils/log";

export const storage = new MongoClient(process.env.STORAGE!);

let db: Db;
let syncStates: Collection;
let blocksCollection: Collection;
let transactionsCollection: Collection;
let addressCollection: Collection;

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

export async function applyAccounts(accounts: {
    address: string,
    balance: string,
    code: string | null,
    data: string | null,
    state: 'active' | 'uninitialized' | 'frozen',
    lastTransaction: {
        lt: string,
        hash: string
    } | null,
    timestamp: number,
    syncSeqno: number
}[]) {

    // Insert new
    await addressCollection.bulkWrite(accounts.map((v) => ({
        updateOne: {
            filter: { _id: v.address },
            update: {
                $setOnInsert: { _id: v.address, ...v }
            },
            upsert: true
        }
    })));

    // Update
    await addressCollection.bulkWrite(accounts.map((v) => ({
        updateOne: {
            filter: { _id: v.address, syncSeqno: { $lt: (v as any).syncSeqno } },
            update: {
                $set: { _id: v.address, ...v }
            },
            upsert: false
        }
    })));
}

export async function getAccount(address: Address) {
    let ex = await addressCollection.findOne({ _id: address.toFriendly() });
    if (ex) {
        return (ex as any) as {
            address: string,
            balance: string,
            code: string | null,
            data: string | null,
            state: 'active' | 'uninitialized' | 'frozen',
            lastTransaction: {
                lt: string,
                hash: string
            } | null,
            timestamp: number,
            syncSeqno: number
        };
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

export async function getTransactions(address: Address, lt: string, limit: number): Promise<{ end: boolean, items: { lt: string, hash: string, data: string }[] }> {
    let ex = await transactionsCollection.find({ address: address.toFriendly(), lt: { $lte: parseInt(lt, 10) } }, { limit }).toArray();

    // Nothing found
    if (ex.length === 0) {
        return { end: false, items: [] };
    }

    // First transaction is not target
    if (ex[0].lt !== parseInt(lt, 10)) {
        return { end: false, items: [] };
    }

    // Check continuity of transactions
    let res: { lt: string, hash: string, data: string }[] = [];
    res.push({ lt: ex[0].lt.toString(), hash: ex[0].hash, data: ex[0].data });
    let t = parseTransaction(address.workChain, Cell.fromBoc(Buffer.from(ex[0].data, 'base64'))[0].beginParse());
    let prevTx = t.prevTransaction;
    let reachedEnd = false;
    for (let i = 1; i < ex.length; i++) {
        let t = parseTransaction(address.workChain, Cell.fromBoc(Buffer.from(ex[i].data, 'base64'))[0].beginParse());
        if (!t.lt.eq(prevTx.lt)) {
            break;
        }
        res.push({ lt: ex[i].lt.toString(), hash: ex[i].hash, data: ex[i].data });
        prevTx = t.prevTransaction;
        if (prevTx.lt.eq(new BN(0))) {
            reachedEnd = true;
            break;
        }
    }

    return { end: reachedEnd, items: res };
}

export async function startStorage() {
    log('Connecting to MongoDB');
    await storage.connect();


    db = storage.db();
    syncStates = db.collection('sync_state');
    blocksCollection = db.collection('blocks');
    transactionsCollection = db.collection('transactions');
    addressCollection = db.collection('address');

    log('Connected');
}