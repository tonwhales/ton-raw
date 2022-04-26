import { TonClient } from "ton";
import { backoff } from "../utils/time";

if (!process.env.TON_ENDPOINT) {
    throw Error('TON_ENDPOINT is not set');
}

export const client = new TonClient({ endpoint: process.env.TON_ENDPOINT });

export async function fetchBlock(seqno: number) {
    let shardDefs = await backoff(() => client.getWorkchainShards(seqno));
    shardDefs = [{ workchain: -1, seqno, shard: '-9223372036854775808' }, ...shardDefs];

    // Fetch shard transactions
    let shards = await Promise.all(shardDefs.map(async (def) => {
        if (def.seqno > 0) {
            let tx = await backoff(() => client.getShardTransactions(def.workchain, def.seqno, def.shard));
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