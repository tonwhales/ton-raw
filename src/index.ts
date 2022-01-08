require('dotenv').config();

import { startApi } from "./api/startApi";
import { startStorage } from "./storage/startStorage";

(async () => {
    await startStorage();
    await startApi();
})();