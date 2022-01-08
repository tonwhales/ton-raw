require('dotenv').config();

import { startApi } from "./api/startApi";
import { startStorage } from "./storage/startStorage";
import { startWorkers } from "./workers/startWorkers";

(async () => {
    await startStorage();
    if (!process.env.ROLE || process.env.ROLE === 'api') {
        await startApi();
    }
    if (!process.env.ROLE || process.env.ROLE === 'worker') {
        await startWorkers();
    }
})();