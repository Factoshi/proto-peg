# Proto PEG

Library and CLI for serialisation and deserialisation of PegNet SPRs and OPRs.

## Usage

#### Instantiate and initialise

ProtoPeg needs to be both instantiated and initialised before it is ready to use.

```javascript
const protoPeg = new ProtoPeg();
await protoPeg.init();
```

#### Decode

Decode takes a price record in a Buffer and returns StakingPriceRecord or OraclePriceRecord.

```javascript
const buf = Buffer.from('CjRGQTJ1SFJ0V...');
const priceRecord = protoPeg.decode(buf);
```

#### Encode OPR

```javascript
const opr = {
    Address: 'FA2uHRtTkVHq9jbqkoumXCVf3gy8qFpYfPtWup4M8F6wW14JS9f1',
    ID: 'ExampleID',
    Height: 259178,
    Winners: ['ef6303e5403b08c4', '6fa8894180b65372'].map((winner) => Buffer.from(winner, 'hex')),
    Assets: [
        '246636',
        '100000000',
        '117949982',
        // etc...
    ],
};
const message = protoPeg.encodeOPR(opr);
```

#### Encode SPR

```javascript
const spr = {
    Address: 'FA2eJ947e7ibZDY4h1RZ8p95avUhMpqGrP8cC5GMGR4VAeKnaRyk',
    Height: 259208,
    Assets: [
        '243772',
        '100000000',
        '117949982',
        // etc...
    ],
};
const message = protoPeg.encodeOPR(spr);
```

## Command Line Interface

The CLI tool is able to encode to ascii, hex and base64 strings. It is able to decode from JSON strings or will fetch entry content directly
from the blockchain using an entry hash.

### Installation

```
npm i -G @factoshi/proto-peg
```

### Usage

```
Usage: protopeg [options][command]

Decode and encode PegNet Oracle Price Records (OPRs) and Staking Price Records (SPRs).

Options:
-V, --version output the version number
-h, --help display help for command

Commands:
decode <command> decode a price record from a string or entry hash.
encode <record-type> encode a hex, base64 or ascii price record from a JSON string.
help [command] display help for command
```
