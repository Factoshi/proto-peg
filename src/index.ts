import path from 'path';
import protobuf from 'protobufjs';

export interface StakingPriceRecord {
    // The Factoid address that submitted the Price Record.
    Address: string;
    // The height the price record was submitted for.
    Height: number;
    // Ordered array of asset prices. Encoded as a string as an int may exceed MAX_SAFE_INTEGER.
    Assets: string[];
}

export interface OraclePriceRecord extends StakingPriceRecord {
    // Previous winners.
    Winners: Buffer[];
    // The ID of the submitter.
    ID: string;
}

export default class ProtoPeg {
    private root?: protobuf.Root;

    /**
     * Initialises the ProtoPeg instance. Must be called once before encoding or decoding price records.
     */
    public async init() {
        this.root = await protobuf.load(path.join(__dirname, 'opr.proto'));
    }

    /**
     * Decodes the entry content of a price record. Handles both SPRs and OPRs.
     * @param buf Raw price record to decode.
     */
    public decode<T = StakingPriceRecord | OraclePriceRecord>(buf: Buffer) {
        if (!this.root) {
            throw new ProtoPegError(`ProtoPeg instance not initialised. Did you call ${this.init.name}?`);
        }

        try {
            const PriceRecordMessage = this.root.lookupType('oprencoding.ProtoOPR');
            const message = PriceRecordMessage.decode(buf);
            const priceRecord = PriceRecordMessage.toObject(message, { longs: String });

            return priceRecord as T;
        } catch (err) {
            throw new DecodeError(err.message);
        }
    }

    // /**
    //  *
    //  * @param priceRecord An SPR or OPR to encode.
    //  */
    // public encode(priceRecord: StakingPriceRecord | OraclePriceRecord) {
    //     if (!this.root) {
    //         throw new ProtoPegError(`ProtoPeg instance not initialised. Did you call ${this.init.name}?`);
    //     }

    //     const PriceRecordMessage = this.root.lookupType('oprencoding.ProtoOPR');

    //     // Validate the input
    //     const err = PriceRecordMessage.verify(priceRecord);
    //     if (err) {
    //         throw new ProtoPegError(err);
    //     }

    //     const message = PriceRecordMessage.create(priceRecord);
    // }
}

export class ProtoPegError extends Error {}

export class DecodeError extends ProtoPegError {
    constructor(message: string) {
        super(message);
        this.name = 'DecodeError';
    }
}

export class EncodeError extends ProtoPegError {
    constructor(message: string) {
        super(message);
        this.name = 'EncodeError';
    }
}
