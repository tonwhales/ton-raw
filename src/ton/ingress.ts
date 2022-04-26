import { TonClient } from "ton";
import { backoff } from "../utils/time";

if (!process.env.TON_ENDPOINT) {
    throw Error('TON_ENDPOINT is not set');
}

export const client = new TonClient({ endpoint: process.env.TON_ENDPOINT });

export async function fetchBlock(seqno: number) {

    // Initial method
    if (seqno <= 1) {
        return [{
            workchain: -1,
            seqno,
            shard: '-9223372036854775808',
            transactions: []
        }];
    }

    // Fetch shards
    let [currentShardDefs, prevShardDefs] = await Promise.all([
        backoff(() => client.getWorkchainShards(seqno)),
        backoff(() => client.getWorkchainShards(seqno - 1))
    ]);

    // Resolve all intermediate shards
    let shardDefs = [{ workchain: -1, seqno, shard: '-9223372036854775808' }];
    for (let sh of currentShardDefs) {
        let prev = prevShardDefs.find((v) => v.shard === sh.shard && v.workchain === sh.workchain);
        if (prev) {
            for (let i = prev.seqno + 1; i <= sh.seqno; i++) {
                shardDefs.push({ workchain: sh.workchain, shard: sh.shard, seqno: i });
            }
        } else {
            shardDefs.push({ workchain: sh.workchain, shard: sh.shard, seqno: sh.seqno });
        }
    }

    // Fetch shard transactions
    let shards = await Promise.all(shardDefs.map(async (def) => {
        let tx = await backoff(() => client.getShardTransactions(def.workchain, def.seqno, def.shard));
        let transactions = tx.map((v) => ({ address: v.account.toFriendly(), lt: v.lt, hash: v.hash }));
        return {
            workchain: def.workchain,
            seqno: def.seqno,
            shard: def.shard,
            transactions
        };
    }));
    return shards;
}