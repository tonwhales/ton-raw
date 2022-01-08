import express from 'express';
import { warn } from "../../utils/log";
import { Address } from "ton";
import { backoff } from "../../utils/time";
import { getClient, ingress } from "../../ton/ingress";

export function handleGetTransactions(): express.RequestHandler {
    return async (req, res) => {
        try {

            // Parse address
            const address = Address.parse(req.params.address);
            if (typeof req.query.lt !== 'string') {
                res.status(400).send('400 Bad Request');
                return;
            }
            if (typeof req.query.hash !== 'string') {
                res.status(400).send('400 Bad Request');
                return;
            }
            if (typeof req.query.limit !== 'string') {
                res.status(400).send('400 Bad Request');
                return;
            }
            let limit = parseInt(req.query.limit);
            if (limit < 10 || limit > 100) {
                res.status(400).send('400 Bad Request');
                return;
            }

            // Fetch state
            // let rawState = await backoff(async () => {
            //     return getClient(ingress.clients).getContractState(address);
            // });

            // // Result
            // res.status(200)
            //     .set('Cache-Control', 'public, max-age=5')
            //     .send({
            //         address: address.toFriendly(),
            //         balance: rawState.balance.toString(10),
            //         state: rawState.state,
            //         code: rawState.code ? rawState.code.toString('base64') : null,
            //         data: rawState.data ? rawState.data.toString('base64') : null,
            //         lastTransaction: rawState.lastTransaction ? {
            //             lt: rawState.lastTransaction.lt,
            //             hash: rawState.lastTransaction.hash
            //         } : null,
            //         timestamp: rawState.timestampt
            //     });

        } catch (e) {
            warn(e);
            res.status(500).send('500 Internal Error');
        }
    };
}