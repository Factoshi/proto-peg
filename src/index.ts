import path from 'path';
import protobuf from 'protobufjs';
import Long from 'long';

/**
 * Stakig Price Record.
 */
export interface StakingPriceRecord {
    /**
     * The Factoid address that submitted the price Record.
     */
    Address: string;
    /**
     * The height the price record was submitted for.
     */
    Height: number;
    /**
     * Ordered array of asset prices. Encoded as a string as an int may exceed MAX_SAFE_INTEGER.
     */
    Assets: string[];
}

/**
 * Oracle Price Record.
 */
export interface OraclePriceRecord extends StakingPriceRecord {
    /**
     * Previous winners.
     */
    Winners: Buffer[];
    /**
     * The ID of the submitter.
     */
    ID: string;
}

/**
 * ProtoPeg class. Must use the async initialise before encoding or decoding.
 */
export default class ProtoPeg {
    private root?: protobuf.Root;

    /**
     * Initialises the ProtoPeg instance. Must be called once before encoding or decoding price records.
     */
    public async init() {
        this.root = await protobuf.load(path.join(__dirname, '../priceRecord.proto'));
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
            const PriceRecordMessage = this.root.lookupType('priceRecordEncoding.ProtoPriceRecord');
            const message = PriceRecordMessage.decode(buf);
            const priceRecord = PriceRecordMessage.toObject(message, { longs: String });

            return priceRecord as T;
        } catch (err) {
            throw new DecodeError(err.message);
        }
    }

    public encodeSPR(spr: StakingPriceRecord) {
        return this.encode(spr);
    }

    public encodeOPR(opr: OraclePriceRecord) {
        if (typeof opr.ID !== 'string') {
            throw new EncodeError('ID field must be a string.');
        }

        if (!Array.isArray(opr.Winners)) {
            throw new EncodeError('Winners field must be an array.');
        }

        for (const winner of opr.Winners) {
            if (!Buffer.isBuffer(winner)) {
                throw new EncodeError('Winners array must contain buffers.');
            }
        }

        return this.encode(opr);
    }

    protected encode(priceRecord: StakingPriceRecord | OraclePriceRecord) {
        if (!this.root) {
            throw new ProtoPegError(`ProtoPeg instance not initialised. Did you call ${this.init.name}?`);
        }

        if (typeof priceRecord.Address !== 'string') {
            throw new EncodeError('Address field must be a string.');
        }

        if (!Array.isArray(priceRecord.Assets)) {
            throw new EncodeError('Assets field must be an array.');
        }

        for (const asset of priceRecord.Assets) {
            if (typeof asset !== 'string') {
                throw new EncodeError('Asset array must contain strings.');
            }
        }

        if (typeof priceRecord.Height !== 'number') {
            throw new EncodeError('Height field must be a number.');
        }

        try {
            const PriceRecordMessage = this.root.lookupType('priceRecordEncoding.ProtoPriceRecord');

            // The protobuf library expects a Long for uint64 types.
            const longPriceRecord = {
                ...priceRecord,
                Assets: priceRecord.Assets.map((asset) => Long.fromString(asset, true)),
            };

            const message = PriceRecordMessage.fromObject(longPriceRecord);
            return Buffer.from(PriceRecordMessage.encode(message).finish());
        } catch (err) {
            throw new EncodeError(err.message);
        }
    }
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
