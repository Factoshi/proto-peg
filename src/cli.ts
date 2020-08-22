#!/usr/bin/env node

import ProtoPeg from './';

// Importing it without types because of an odd type bug in Commander that I can't figure out.
const { Command } = require('commander');

const program = new Command();

program.version(require('../package.json').version);

/**
 * DECODE
 */

program
    .command('decode <price record> [encoding]')
    .description('Decode a price record from a hex, base64 or ascii string. Default encoding hex.')
    .action(decodePriceRecord);

async function decodePriceRecord(priceRecord: string, encoding: string = 'hex') {
    try {
        if (encoding !== 'base64' && encoding !== 'hex' && encoding !== 'ascii') {
            console.error('encoding must be base64, hex or ascii');
        }

        const protoPeg = new ProtoPeg();
        await protoPeg.init();
        const buf = Buffer.from(priceRecord, encoding as any);
        const message: any = protoPeg.decode(buf);

        if (Array.isArray(message.Winners)) {
            message.Winners = message.Winners.map((winner: Buffer) => winner.toString('hex'));
        }

        console.log(message);
    } catch (err) {
        console.error('Unable to decode price record.');
        console.error(err.message);
    }
}

/**
 * ENCODE
 */

// const encode = program.command('encode');

// encode.command('spr <price record>').description('encode an SPR from JSON').action(encodeSPR);

// encode.command('opr <price record>').description('encode an OPR from JSON').action(encodeOPR);

program.parse(process.argv);
