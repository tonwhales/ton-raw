import { delay } from "teslabot";
import { applyBlocks, getSyncState, setSyncState } from "../storage/startStorage";
import { fetchBlock, client } from "../ton/ingress";
import { backoff } from "../utils/time";

export async function startBlocksWorker(syncKey: string, large: boolean) {
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
            const lastSeqno = (await backoff(() => client.getMasterchainInfo())).latestSeqno;
            if (lastSeqno <= lastSeq) {
                await delay(1000);
                continue;
            }

            // Fetching blocks
            let start = Date.now();
            let seqs: number[] = [];
            for (let i = 0; i + lastSeq + 1 <= lastSeqno && i < (large ? 100 : 10); i++) {
                seqs.push(lastSeq + i + 1);
            }
            const blocks = await Promise.all(seqs.map((seqno) => backoff(async () => {
                return fetchBlock(seqno);
            })));
            console.log(blocks.length + ' fetched in ' + (Date.now() - start) + ' ms');

            // Persisting blocks
            start = Date.now();
            await backoff(async () => {
                await applyBlocks(blocks.map((b) => ({ seq: b[0].seqno/* First is always masterchain one */, data: b })))
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
    startBlocksWorker('blocks_simple', true);
    // startBlocksWorker('blocks_fresh', false);
}