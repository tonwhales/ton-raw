import { delay } from "teslabot";
import { Address, TonClient } from "ton";
import { applyAccounts, applyBlocks, getSyncState, setSyncState, storage } from "../storage/startStorage";
import { fetchAccountState, fetchBlock, getClient, ingress } from "../ton/ingress";
import { backoff } from "../utils/time";

export async function startBlocksWorker(syncKey: string) {
    backoff(async () => {
        while (true) {

            // Fetch seqno
            let lastSeq: number;
            let known = await backoff(() => getSyncState(syncKey));
            if (known) {
                lastSeq = parseInt(known, 10);
            } else {
                lastSeq = 0;
            }

            // Check if reached end
            const lastSeqno = (await backoff(() => getClient(ingress.clients).getMasterchainInfo())).latestSeqno;
            if (lastSeqno <= lastSeq) {
                await delay(1000);
                continue;
            }

            // Fetching blocks
            let start = Date.now();
            let seqs: number[] = [];
            for (let i = 0; i + lastSeq + 1 <= lastSeqno && i < 100; i++) {
                seqs.push(lastSeq + i + 1);
            }
            const blocks = await Promise.all(seqs.map((seqno) => backoff(async () => {

                // Pick better client collection
                let clients: TonClient[];
                if (lastSeqno - seqno < 10000) {
                    clients = ingress.clients; // For last 10k blocks - fetch contemporary
                } else {
                    clients = [ingress.historical];
                }

                // Fetch shards
                return fetchBlock(seqno, clients);
            })));
            console.log(blocks.length + ' fetched in ' + (Date.now() - start) + ' ms');

            // Fetching accounts
            let accounts = new Map<string, number>();
            for (let b of blocks) {
                for (let sh of b) {
                    for (let t of sh.transactions) {
                        accounts.set(t.address, Math.max((accounts.get(t.address) || b[0].seqno), b[0].seqno));
                    }
                }
            }
            console.log('Unique accounts: ' + accounts.size);
            start = Date.now();
            let states = await Promise.all(Array.from(accounts).map((src) => backoff(async () => {
                let d = await fetchAccountState(Address.parse(src[0]), ingress.clients);
                if (d.syncSeqno < src[1]) {
                    throw Error('Too old account state');
                }
                return d;
            })));
            console.log('Accounts ' + states.length + ' fetched in ' + (Date.now() - start) + ' ms');

            // Persist accounts
            start = Date.now();
            await applyAccounts(states);
            console.log('Accounts ' + states.length + ' written in ' + (Date.now() - start) + ' ms');

            // Persisting blocks
            start = Date.now();
            await backoff(async () => {
                applyBlocks(blocks.map((b) => ({ seq: b[0].seqno/* First is always masterchain one */, data: b })))
            });
            console.log(blocks.length + ' written in ' + (Date.now() - start) + ' ms');

            // Persist seq
            await backoff(() => setSyncState(syncKey, known, (seqs[seqs.length - 1]).toString(10)));

            // Next iteration
            await delay(100);
        }
    });
}

export async function startWorkers() {
    startBlocksWorker('blocks_historic');
    startBlocksWorker('blocks_fresh');
}