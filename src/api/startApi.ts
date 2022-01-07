import cors from 'cors';
import express from 'express';
import { log } from '../utils/log';
export async function startApi() {
    log('Starting API...');
    const app = express();
    app.use(cors());
    app.get('/', (req, res) => {
        res.send('Welcome to fast TON API!');
    });
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await new Promise<void>((resolve) => app.listen(port, resolve));
    log('API ready on port ' + port);
}