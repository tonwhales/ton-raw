import { TonClient } from "ton";

if (!process.env.TON_ENDPOINTS) {
    throw Error('TON_ENDPOINTS is not set');
}
if (!process.env.TON_HISTORICAL) {
    throw Error('TON_HISTORICAL is not set');
}

const historical = new TonClient({ endpoint: process.env.TON_HISTORICAL });
const clients = (process.env.TON_ENDPOINTS.split(',')).map((v) => new TonClient({ endpoint: v }));
export const ingress = {
    historical,
    clients
};

export function getClient(clients: TonClient[]) {
    return clients[Math.floor(Math.random() * clients.length)];
}