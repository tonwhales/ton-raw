# TON Raw API

Low level, reliable and performant API for TON Blockchain. This API is intended to use for fast blockchain scans, fast and reliable blocks and transaction fetching.

* 🏎 Ultra fast
* 🚀 Scalable to hundreds of millions of requests/second
* 🔨 Almost trivial API
* 💎 Reliable: works or from scalable database or with multiple TON Nodes.

# How to use

API endpoint: `https://raw.tonhubapi.com/`

Endpoint is DDOS protected and can handle any sizable load (could be used on user devices).

# Get block
```GET /block/<seqno>```
Returns JSON with fields:

| Field         | Descriptiopn | Type |
| ------------- | ------------- | ----|
| `exist`     | `true` if block exists  | `boolean` |
| `shards`     | if `exist` has list of shards  | array of `shard` |

where `shard` is an array of
| Field         | Descriptiopn | Type |
| ------------- | ------------- | ----|
| `workchain`     | Shard's workchain  | `-1` or `0` |
| `seqno`     | shard seqno  | `number` |
| `shard` | shard id | `string` |
| `transactions`| array of transactions | `array` |

Example response
```json
{
 "exist":true,
 "shards":[
  {
     "workchain":-1,
     "seqno":17410044,
     "shard":"-9223372036854775808",
     "transactions": [
        {
           "address":"Ef9VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVbxn",
           "lt":"24488106000003",
           "hash":"Cu5pTcdh8xsEgMchd0OCf3Ui8QTGPpgkDuCbZPh/aMA="
        }
     ]
  }
 ]
}
```



# Get latest block seqno
```GET /block/latest```
Returns JSON with fields:

| Field         | Descriptiopn | Type |
| ------------- | ------------- | ----|
| `seqno`     | Maximum known seqno  | `number` |

Example response
```json
{"seqno":17410019}
```

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
