import cors from 'cors';
import express from 'express';
import { log } from '../utils/log';
import { handleGetBlock } from './handlers/handleGetBlock';
import { handleGetBlockLatest } from './handlers/handleGetBlockLatest';
import { handleGetStatus } from './handlers/handleGetStatus';
import { handleGetTransactions } from './handlers/handleGetTransactions';
export async function startApi() {

    // Configure
    log('Starting API...');
    const app = express();
    app.use(cors());
    app.get('/', (req, res) => {
        res.send('Welcome to fast TON API!');
    });

    // Handlers
    app.get('/block/latest', handleGetBlockLatest());
    app.get('/block/:seqno', handleGetBlock());
    app.get('/tx/:address', handleGetTransactions());
    app.get('/status', handleGetStatus());

    // Start
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await new Promise<void>((resolve) => app.listen(port, resolve));
    log('API ready on port http://localhost:' + port);
}