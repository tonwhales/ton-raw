import express from 'express';
import { warn } from "../../utils/log";
import { Address } from "ton";
import { backoff } from "../../utils/time";
import { fetchAccountState, getClient, ingress } from "../../ton/ingress";
import { applyAccounts, getAccount } from '../../storage/startStorage';
import { extractInterfaces } from '../../ton/extractInterfaces';

export function handleGetAccount(): express.RequestHandler {
    return async (req, res) => {
        try {

            // Parse address
            const address = Address.parse(req.params.address);

            // Storage
            // let ex = await getAccount(address);
            // if (ex) {
            //     res.status(200)
            //         .set('Cache-Control', 'public, max-age=5')
            //         .send({
            //             address: address.toFriendly(),
            //             balance: ex.balance,
            //             state: ex.state,
            //             code: ex.code,
            //             data: ex.data,
            //             lastTransaction: ex.lastTransaction ? {
            //                 lt: ex.lastTransaction.lt,
            //                 hash: ex.lastTransaction.hash
            //             } : null,
            //             timestamp: ex.timestamp
            //         });

            //     return;
            // }

            // Fetch state
            let rawState = await backoff(async () => {
                return fetchAccountState(address, ingress.clients);
            });

            // Persist state
            await applyAccounts([rawState]);

            // Process
            let supportedInterfaces: number[] = [];
            if (rawState.code && rawState.data && address.workChain === 0) {
                supportedInterfaces = await extractInterfaces(Buffer.from(rawState.code, 'base64'), Buffer.from(rawState.data, 'base64'));
            }

            // Result
            res.status(200)
                .set('Cache-Control', 'public, max-age=5')
                .send({
                    address: address.toFriendly(),
                    balance: rawState.balance,
                    state: rawState.state,
                    code: rawState.code,
                    data: rawState.data,
                    meta: {
                        supportedInterfaces
                    },
                    lastTransaction: rawState.lastTransaction ? {
                        lt: rawState.lastTransaction.lt,
                        hash: rawState.lastTransaction.hash
                    } : null,
                    timestamp: rawState.timestamp
                });

        } catch (e) {
            warn(e);
            res.status(500).send('500 Internal Error');
        }
    };
}