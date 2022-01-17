import { BN } from "bn.js";
import { Cell } from "ton";
import { SmartContract } from 'ton-contract-executor';

const ignored = new Set<string>();
const simpleWallet = 'a0cfc2c48aee16a271f2cfc0b7382d81756cecb1017d077faaab3bb602f6868c';
const simpleWalletR2 = 'd4902fcc9fad74698fa8e353220a68da0dcf72e32bcb2eb9ee04217c17d3062c';
const simpleWalletR3 = '587cc789eff1c84f46ec3797e45fc809a14ff5ae24f1e0c7a6a99cc9dc9061ff';
const wallet2 = '5c9a5e68c108e18721a07c42f9956bfb39ad77ec6d624b60c576ec88eee65329';
const wallet2R2 = 'fe9530d3243853083ef2ef0b4c2908c0abf6fa1c31ea243aacaa5bf8c7d753f1';
const wallet3 = 'b61041a58a7980b946e8fb9e198e3c904d24799ffa36574ea4251c41a566f581';
const wallet3R2 = '84dafa449f98a6987789ba232358072bc0f76dc4524002a5d0918b9a75d2d599';
ignored.add(simpleWallet);
ignored.add(simpleWalletR2);
ignored.add(simpleWalletR3);
ignored.add(wallet2);
ignored.add(wallet2R2);
ignored.add(wallet3);
ignored.add(wallet3R2);

export async function extractInterfaces(code: Buffer, data: Buffer): Promise<number[]> {
    try {
        let codeCell = Cell.fromBoc(code)[0];
        let dataCell = Cell.fromBoc(data)[0];
        let codeHash = (await codeCell.hash()).toString('hex');
        if (ignored.has(codeHash)) {
            return [];
        }

        const executor = await SmartContract.fromCell(codeCell, dataCell);
        const result = await executor.invokeGetMethod('supported_interfaces', []);
        if (result.exit_code !== 0) {
            return [];
        }
        let res: number[] = [];
        for (let r of result.result) {
            if (r instanceof BN) {
                res.push(r.toNumber());
            }
        }
        return res;
    } catch (e) {
        console.warn(e);
        return [];
    }
}