import 'mocha';
import { assert } from 'chai';

import ProtoPeg, { OraclePriceRecord, StakingPriceRecord, DecodeError } from '../src/index';

describe('Test Library API', () => {
    it('should decode an OPR', async () => {
        // Entry 3ead976a39a16ace0d0d068dad77b9132682d662af3e35a410d79f73043261d6
        const v5OPR = Buffer.from(
            'CjRGQTJ1SFJ0VGtWSHE5amJxa291bVhDVmYzZ3k4cUZwWWZQdFd1cDRNOEY2d1cxNEpTOWZmEglDb2xkTm9ydGgY6ugPIgjvYwPlQDsIxCIIb6iJQYC2U3IiCJn+s1kSRBwEIggfKp4B10sCSiIIpqvduYksEGMiCA7WHWE/LTpNIgjc8LvNoVlQDiIIprJe4gzbwzciCDtpCu8vfQG0IghrqjuXZ/0y+CIIB9UJ9SsmQHAiCD5WksbOtbi4Ighslz8fQq1Y/SIIlhEDHPMpPp4iCBK0fr2RF8pOIggXQt82wJpzFSIIM+e7K+K7EvIiCG5MyhIoW83+Igh/oY9r1y7LIyII3afqeamPr+IiCKpRm/jpJDOeIgjxxO2i9W7TwSIIm4EgiOh9PKsiCOOXvLiznVEMIgh7VwisQV0pQCr+AeyGD4DC1y+ejJ84y9c5rJm1PpDelySrkqo0v7pRtPrhIr6J8gbMwJMGpY8FyYK+CIa7fcjdlQLM06b60QWridb8CcDy6PvOIcCe3sGRAbTc4YsWxqaNAcCvs4BqvPKyXIC1/5kIg6zlBOi27wW/8/SwIoTV5fYgwKzQvRuA1IqIB9GekiKMvpcfluu0Ba6wpQXMyVG44OMCsKrABoDEs5wBoND0wQWAheaPAu+RjhLj5N6kAenRqgLh0/67BvigggjAwoC/AoyE3ij13BSx7m7284ncAcjjuBrfz7QBoeD9DM/4UqTLzwGVqAa3wDjT1AHf0ALllAOewakBnuUP',
            'base64'
        );

        const protoPeg = new ProtoPeg();
        await protoPeg.init();
        const message = protoPeg.decode<OraclePriceRecord>(v5OPR);

        // prettier-ignore
        assert.deepStrictEqual(message, {
            Address: 'FA2uHRtTkVHq9jbqkoumXCVf3gy8qFpYfPtWup4M8F6wW14JS9ff',
            ID: 'ColdNorth',
            Height: 259178,
            Winners: [
               'ef6303e5403b08c4', '6fa8894180b65372', '99feb35912441c04', '1f2a9e01d74b024a',
               'a6abddb9892c1063', '0ed61d613f2d3a4d', 'dcf0bbcda159500e', 'a6b25ee20cdbc337',
               '3b690aef2f7d01b4', '6baa3b9767fd32f8', '07d509f52b264070', '3e5692c6ceb5b8b8',
               '6c973f1f42ad58fd', '9611031cf3293e9e', '12b47ebd9117ca4e', '1742df36c09a7315',
               '33e7bb2be2bb12f2', '6e4cca12285bcdfe', '7fa18f6bd72ecb23', 'dda7ea79a98fafe2', 
               'aa519bf8e924339e', 'f1c4eda2f56ed3c1', '9b812088e87d3cab', 'e397bcb8b39d510c',
               '7b5708ac415d2940',
            ].map(winner => Buffer.from(winner, 'hex')),
            Assets: [
                '246636',     '100000000',     '117949982',   '945099',
                '130895020',  '75886352',      '109742379',   '1334591',
                '72908084',   '14451902',      '12902476',    '83877',
                '17793353',   '2055558',       '4550344',     '193798449612',
                '2677376171', '1155069000000', '39061000000', '5930249780',
                '2315078',    '28455000000',   '193771836',   '2202000000',
                '10049027',   '12311400',      '9229384127',  '8839064196',
                '7377000000', '1896000000',    '71602001',    '65396492',
                '11351446',   '11098158',      '1336524',     '5828664',
                '13636912',   '328000000',     '1480402976',  '570000000',
                '37980399',   '345485923',     '4892905',     '1736419809',
                '16814200',   '669000000',     '85426700',    '339573',
                '1816369',    '461535734',     '55456200',    '2959327',
                '27226145',   '1358927',       '3401124',     '103445',
                '925751',     '27219',         '43103',       '51813',
                '2777246',    '258718'
              ]
        });
    });

    it('should decode an SPR', async () => {
        // Entry 30e99bfce43a67439babd1a788e4f3555d6799b369ca869c9b4d08823c9f7d9f
        const v5SPR = Buffer.from(
            'CjRGQTNMNUtiMmE1MTdoazFqQ3Q1RTRzeXlWMXl0WnR4S0tHbnpMZUp0WXplQ0hpZUtuMlpRGPfoDyr+AcfxDoDC1y+ejJ84x9g5rJm1PpDelySrkqo0v7pRtPrhIr6J8gbmw5MGpY8FzIK+CIa7fcjdlQLM06b60QWridb8CcCo+93UIYDapf6RAcDRsJsWr/CNAcCKncZp5bTIWMC5vJoI1KHlBPTn7gWDx72UIoCDs98ggJjyrRv/4dikB6GrkyLhg54fluu0Ba6wpQXMyVG44OMCsKrABoDEs5wBgJijtgXbs4WSAp6u8hGLw8CkAbjDrALAiKK8BtWxhwjAsIy9AoDE/Cii4RT/s27Ao+PcAaL2/hmA6bUBoeD9DM/4UqTLzwGVqAa3wDjT1AHf0ALllAOewakBnuUP',
            'base64'
        );

        const protoPeg = new ProtoPeg();
        await protoPeg.init();
        const message = protoPeg.decode<StakingPriceRecord>(v5SPR);

        // prettier-ignore
        assert.deepStrictEqual(message, {
            Address: 'FA3L5Kb2a517hk1jCt5E4syyV1ytZtxKKGnzLeJtYzeCHieKn2ZQ',
            Height: 259191,
            Assets: [
              '243911',     '100000000',     '117949982',   '945223',
              '130895020',  '75886352',      '109742379',   '1334591',
              '72908084',   '14451902',      '12902886',    '83877',
              '17793356',   '2055558',       '4550344',     '193798449612',
              '2677376171', '1156617000000', '39188000000', '5963000000',
              '2324527',    '28333000000',   '185735781',   '2203000000',
              '10047700',   '12301300',      '9169757059',  '8790000000',
              '7344000000', '1955999999',    '71620001',    '65503713',
              '11351446',   '11098158',      '1336524',     '5828664',
              '13636912',   '328000000',     '1456000000',  '574708187',
              '37525278',   '344990091',     '4923832',     '1737000000',
              '16898261',   '665000000',     '85926400',    '340130',
              '1808895',    '463000000',     '54508322',    '2978944',
              '27226145',   '1358927',       '3401124',     '103445',
              '925751',     '27219',         '43103',       '51813',
              '2777246',    '258718'
            ]
          });
    });

    it('should throw decode error on bad input', async () => {
        const badPriceRecord = Buffer.from('This is not a price record');

        const protoPeg = new ProtoPeg();
        await protoPeg.init();

        assert.throws(() => protoPeg.decode<StakingPriceRecord>(badPriceRecord), 'invalid wire type 4 at offset 1');
    });
});
