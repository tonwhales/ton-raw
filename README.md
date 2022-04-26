# TON Raw API

Low level, reliable and performant API for TON Blockchain. This API is intended to use for fast blockchain scans, fast and reliable blocks and transaction fetching.

* 🏎 Ultra fast
* 🚀 Scalable to hundreds of millions of requests/second
* 🔨 Almost trivial API
* 💎 Reliable: delivers answers from scalable database or from multiple TON Nodes.

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

# License

MIT
