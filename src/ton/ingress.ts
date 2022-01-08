import { TonClient } from "ton";
import { backoff } from "../utils/time";

if (!process.env.TON_ENDPOINTS) {
    throw Error('TON_ENDPOINTS is not set');
}
if (!process.env.TON_HISTORICAL) {
    throw Error('TON_HISTORICAL is not set');
}

const historical = new TonClient({ endpoint: process.env.TON_HISTORICAL });
const clients = (process.env.TON_ENDPOINTS.split(',')).map((v) => new TonClient({ endpoint: v }));
export const ingress = {
    historical,
    clients
};

export function getClient(clients: TonClient[]) {
    return clients[Math.floor(Math.random() * clients.length)];
}

export async function getBlock(seqno: number, clients: TonClient[]) {
    let shardDefs = await backoff(() => getClient(clients).getWorkchainShards(seqno));
    shardDefs = [{ workchain: -1, seqno, shard: '-9223372036854775808' }, ...shardDefs];

    // Fetch shard transactions
    let shards = await Promise.all(shardDefs.map(async (def) => {
        if (def.seqno > 0) {
            let tx = await backoff(() => getClient(clients).getShardTransactions(def.workchain, def.seqno, def.shard));
            let transactions = tx.map((v) => ({ address: v.account.toFriendly(), lt: v.lt, hash: v.hash }));
            return {
                workchain: def.workchain,
                seqno: def.seqno,
                shard: def.shard,
                transactions
            };
        } else {
            return {
                workchain: def.workchain,
                seqno: def.seqno,
                shard: def.shard,
                transactions: []
            };
        }
    }));
    return shards;
}