# TON Raw API

Low level, reliable and performant API for TON Blockchain. This API is intended to use for fast blockchain scans, fast and reliable blocks and transaction fetching.

* 🏎 Ultra fast
* 🚀 Scalable to hundreds of millions of requests/second
* 🔨 Almost trivial

# How to use

API endpoint: `https://raw.tonhubapi.com/`

Endpoint is DDOS protected and can handle any sizable load (could be used on user devices).

# Get address state

```GET /address/<address>```

Returns JSON with fields:

| Field         | Descriptiopn | Type |
| ------------- | ------------- | ----|
| `address`     | Normalized address  | `string` |
| `balance`  | Address balance in nanotons  | `string` |
| `state` | State of contract | `active`, `uninitialized` or `frozen` |
| `code` | BOC of contract code | `string` or `null` |
| `data` | BOC of contract data | `string` or `null` |
| `lastTransaction` | Last transaction | `{lt:string, hash: string}` or `null` |
| `timestamp` | Timestamp of contract state | `number` |

Example response
```json
{
 "address":"EQAAFhjXzKuQ5N0c96nsdZQWATcJm909LYSaCAvWFxVJP80D",
 "balance":"383491517132656",
 "state":"active",
 "code":"te6cckEBAQEAYgAAwP8AIN0gggFMl7qXMO1E0NcLH+Ck8mCDCNcYINMf0x/TH/gjE7vyY+1E0NMf0x/T/9FRMrryoVFEuvKiBPkBVBBV+RDyo/gAkyDXSpbTB9QC+wDo0QGkyMsfyx/L/8ntVD++buA=",
 "data":"te6cckEBAQEAKgAAUAAAAhIpqaMXgLYkJTaqrvVmjvDKaYYeYrymdgDJHU3lRcihkG9+/ueSIVig",
 "lastTransaction":{"lt":"24487954000001","hash":"tQ2vvuKoA8IzhjbkvkAYEJRLV2vS74lckPT/neT0XD0="},
 "timestamp":1641653410
}
```

# License

MIT
