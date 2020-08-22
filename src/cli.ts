#!/usr/bin/env node

import ProtoPeg from './';

// Importing it without types because it doesn't work with them, idk why.
const { Command } = require('commander');
const axios = require('axios');

const program = new Command();

program
    .version(require('../package.json').version)
    .description('Decode and encode PegNet Oracle Price Records (OPRs) and Staking Price Records (SPRs).');

const decode = program.command('decode <command>').description('decode a price record from a string or entry hash.');
decode
    .command('string <price-record> [encoding]')
    .description('decode a price record from a hex, base64 or ascii string. Default encoding is hex.')
    .action(decodePriceRecord);
decode
    .command('entry <hash>')
    .description('decode a price record from an entry hash. Uses OpenNode to get record.')
    .action(fetchEntry);

const encode = program
    .command('encode <record-type>')
    .description('encode a hex, base64 or ascii price record from a JSON string.');
encode
    .command('spr <price-record> [encoding]')
    .description('encoding can be hex, base64 or ascii. Default encoding is hex.')
    .action(encodePriceRecord('spr'));
encode
    .command('opr <price-record> [encoding]')
    .description('encoding can be hex, base64 or ascii. Default encoding is hex. Items in Winners array must be hex.')
    .action(encodePriceRecord('opr'));

async function fetchEntry(hash: string) {
    try {
        if (!/[A-Fa-f0-9]{64}/.test(hash)) {
            throw new Error('Entry hash must be valid hex-encoded sha256.');
        }
        const res = await axios.post('https://api.factomd.net/v2', {
            jsonrpc: '2.0',
            id: 0,
            method: 'entry',
            params: { hash },
        });
        const { content } = res.data.result;
        const message = await decodePriceRecord(content, 'hex');
    } catch (err) {
        console.error('Unable to resolve entry.');
        console.error(err.message);
    }
}

async function decodePriceRecord(priceRecord: string, encoding: string = 'hex') {
    try {
        if (encoding !== 'base64' && encoding !== 'hex' && encoding !== 'ascii') {
            throw new Error('encoding must be base64, hex or ascii');
        }

        const protoPeg = new ProtoPeg();
        await protoPeg.init();
        const buf = Buffer.from(priceRecord, encoding);
        const message: any = protoPeg.decode(buf);

        if (Array.isArray(message.Winners)) {
            message.Winners = message.Winners.map((winner: Buffer) => winner.toString('hex'));
        }

        console.log(message);
    } catch (err) {
        console.error('Unable to decode price record.');
        console.error(err.message);
        process.exit(1);
    }
}

function encodePriceRecord(type: 'opr' | 'spr') {
    return async function (jsonPriceRecord: string, encoding: string = 'hex') {
        try {
            if (encoding !== 'base64' && encoding !== 'hex' && encoding !== 'ascii') {
                throw new Error('encoding must be base64, hex or ascii');
            }

            const protoPeg = new ProtoPeg();
            await protoPeg.init();
            const priceRecord = JSON.parse(jsonPriceRecord);

            // Asset array must be an array of strings.
            if (!Array.isArray(priceRecord.Assets)) {
                throw new Error('Price record must contain Assets array.');
            }
            priceRecord.Assets = priceRecord.Assets.map((asset: string | number) =>
                typeof asset === 'number' ? asset.toString() : asset
            );

            let buf: Buffer;
            if (type === 'opr') {
                // Winners array must be an array of buffers.
                if (!Array.isArray(priceRecord.Winners)) {
                    throw new Error('OPRs must contain Winners array.');
                }
                priceRecord.Winners = priceRecord.Winners.map((winner: string) => Buffer.from(winner, 'hex'));
                buf = protoPeg.encodeOPR(priceRecord);
            } else {
                buf = protoPeg.encodeSPR(priceRecord);
            }

            console.log(buf.toString(encoding));
        } catch (err) {
            console.error('Unable to decode price record.');
            console.error(err.message);
            process.exit(1);
        }
    };
}

program.parse(process.argv);
