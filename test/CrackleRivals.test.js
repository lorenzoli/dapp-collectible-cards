const CrackleRivals = artifacts.require('./CrackleRivals.sol');
const web3 = require('web3');

const { assert } = require('chai');
const { CARD_TYPE, MODIFIER_LIFE } = require('../utils/constant');

const address = "0x31C51F0B141895f12AE58a50EC7A3e7784a2B40F";
const cardMaxSupply = 100;
const calculatedSupply = {
    [CARD_TYPE.EPIC]: (cardMaxSupply / 100) * 45,
    [CARD_TYPE.RARE]: (cardMaxSupply / 100) * 35,
    [CARD_TYPE.LEGENDARY]: (cardMaxSupply / 100) * 15,
    [CARD_TYPE.LIMITED]: (cardMaxSupply / 100) * 5
}

let skills = {}
let characters = []

require('chai')
    .use(require('chai-as-promised'))
    .should();

contract('CrackleRivals', accounts => {
    let contract;

    before(async () => {
        contract = await CrackleRivals.deployed();
    });

    describe('deployment', async () => {
        it('deploys success', async () => {
            const address = contract.address;
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })
    })

    describe('card max supply', async () => {
        it('get supply from contract', async () => {
            const epicMaxSupply = await contract.getCardTypeMaxSupply(CARD_TYPE.EPIC);
            const rareMaxSupply = await contract.getCardTypeMaxSupply(CARD_TYPE.RARE);
            const legendaryMaxSupply = await contract.getCardTypeMaxSupply(CARD_TYPE.LEGENDARY);
            const limitedMaxSupply = await contract.getCardTypeMaxSupply(CARD_TYPE.LIMITED);

            assert.equal(web3.utils.toNumber(epicMaxSupply), calculatedSupply[CARD_TYPE.EPIC], "Epic card max supply is not 45%");
            assert.equal(web3.utils.toNumber(rareMaxSupply), calculatedSupply[CARD_TYPE.RARE], "Rare card max supply is not 35%");
            assert.equal(web3.utils.toNumber(legendaryMaxSupply), calculatedSupply[CARD_TYPE.LEGENDARY], "Legendary card max supply is not 15%");
            assert.equal(web3.utils.toNumber(limitedMaxSupply), calculatedSupply[CARD_TYPE.LIMITED], "Limited card max supply is not 5%");
        })
    })

    describe('mint clan', async () => {
        it('define clans', () => {
            skills = {
                ['CLAN_0']: { // CLAN 1 => +8 attack
                    clanId: 0,
                    selfModifier: {
                        modifierLife: MODIFIER_LIFE.AMPLIFIER,
                        attack: 8,
                        damage: 0,
                        energy: 0,
                        health: 0
                    },
                    rivalModifier: {
                        modifierLife: MODIFIER_LIFE.AMPLIFIER,
                        attack: 0,
                        damage: 0,
                        energy: 0,
                        health: 0
                    },
                    blocks: {
                        skill: false,
                        ability: false,
                        attackModifier: false,
                        damageModifier: false,
                        energyModifier: false,
                        healthModifier: false
                    }
                },
                ['CLAN_1']: { // CLAN 2 => Block attack
                    clanId: 1,
                    selfModifier: {
                        modifierLife: MODIFIER_LIFE.AMPLIFIER,
                        attack: 0,
                        damage: 0,
                        energy: 0,
                        health: 0
                    },
                    rivalModifier: {
                        modifierLife: MODIFIER_LIFE.AMPLIFIER,
                        attack: 0,
                        damage: 0,
                        energy: 0,
                        health: 0
                    },
                    blocks: {
                        skill: false,
                        ability: false,
                        attackModifier: true,
                        damageModifier: false,
                        energyModifier: false,
                        healthModifier: false
                    }
                }
            }
        })
        it('mint clans', async () => {
            // Go from -1
            // Because starting from 0
            let clanId = -1;
            for (let clanName of Object.keys(skills)) {
                console.log('\n\n');
                console.log('Trying clan: ', clanName);
                const res = await contract.mintClan(clanName, 'description', skills[clanName]);
                const event = res.logs[0].args;
                const newClanId = event.clanId.toNumber();
                console.log('mintedClanId: ' + newClanId);
                clanId++;
                assert.equal(newClanId, clanId, 'Clan ID not match ' + clanId);
                skils = {
                    ...skills,
                    [clanName]: {
                        ...skills[clanName],
                        clanId: clanId
                    }
                }
            }

            assert.notEqual(clanId, Object.keys(skills).length, "Not minted all clans");
        })
    })

    describe('mint character', async () => {
        it('define character', () => {
            const characterForClans = 4;
            console.log('\nThere are ' + characterForClans + ' characters on every clan');
            for (let clan of Object.keys(skills)) {
                for (let i = 0; i < characterForClans; i++) {
                    characters.push({
                        id: -1,
                        clanId: skills[clan].clanId,
                        name: 'Character ' + i + ' for clan ' + clan,
                        description: 'none',
                        hash: 'okqdqqddwq',
                        attack: i + skills[clan].clanId + 1,
                        damage: i + i + 1
                    })
                }
            }
            console.log('Characters: ', JSON.stringify(characters));
            assert.equal(characters.length, 4 * 2, "Characters ok\n\n");
        })
        it('mint characters for every clan', async () => {
            let characterId = -1;
            for (let character of characters) {
                const res = await contract.mintCharacter(
                    character.clanId,
                    character.name,
                    character.description,
                    character.hash,
                    character.attack,
                    character.damage
                );
                characterId++;
                const newId = res.logs[0].args.characterId.toNumber();
                assert.equal(characterId, newId, "Character ID failed");
                characters[characterId].id = newId;
            }
        })
        it('check characters ID / Name / Attack / Damage', async () => {
            let clanId = 0;
            let characterId = 0;
            for (let i = 0; i < characters.length; i++) {
                const retrived = await contract.getCharacter(i);

                // Manual update indexes
                if (i / 4 === 1) {
                    clanId++;
                    characterId = 0;
                }

                assert.equal(retrived.clanId, clanId, "Clan ID not match");
                assert.equal(retrived.name, 'Character ' + characterId + ' for clan CLAN_' + clanId, "Name not match")
                assert.equal(web3.utils.toNumber(retrived.attack), characterId + clanId + 1, "Bad attack for character " + retrived.name);
                assert.equal(web3.utils.toNumber(retrived.damage), characterId + characterId + 1, "Bad damage for character " + retrived.name);

                characterId++;
            }
        })
    })

    describe('mint character cards', async () => {
        it('mint for one character', async () => {
            const firstCharacterId = 0;
            let totalMinted = 0;
            const totalTypes = Object.keys(CARD_TYPE).length - 1; // Not count common

            // Starting type from 1
            // because COMMON type is unlimited
            let totalMintedType = {}

            // Go over total types
            for (let type = 1; type <= totalTypes; type++) {
                totalMintedType = {
                    ...totalMintedType,
                    [type]: 0
                }

                // Mint until total type < calculated type supply
                for (let totalCurrent = 0; totalCurrent < calculatedSupply[type]; totalCurrent++) {
                    await contract.mintCard(
                        type,
                        firstCharacterId,
                        {
                            selfModifier: {
                                modifierLife: MODIFIER_LIFE.AMPLIFIER,
                                attack: 0,
                                damage: 5,
                                energy: 0,
                                health: 0
                            },
                            rivalModifier: {
                                modifierLife: MODIFIER_LIFE.AMPLIFIER,
                                attack: 0,
                                damage: 0,
                                energy: 0,
                                health: 0
                            },
                            blocks: {
                                skill: false,
                                ability: false,
                                attackModifier: false,
                                damageModifier: false,
                                energyModifier: false,
                                healthModifier: false
                            }
                        }
                    )
                    totalMintedType = {
                        ...totalMintedType,
                        [type]: totalMintedType[type] + 1
                    }
                    totalMinted++;
                }
            }

            assert.equal(totalMinted, cardMaxSupply, "Mint more than " + cardMaxSupply + ' max supply');
            assert.equal(totalMintedType[CARD_TYPE.EPIC], calculatedSupply[CARD_TYPE.EPIC], "Bad supply " + CARD_TYPE.EPIC);
            assert.equal(totalMintedType[CARD_TYPE.RARE], calculatedSupply[CARD_TYPE.RARE], "Bad supply " + CARD_TYPE.RARE);
            assert.equal(totalMintedType[CARD_TYPE.LEGENDARY], calculatedSupply[CARD_TYPE.LEGENDARY], "Bad supply " + CARD_TYPE.LEGENDARY);
            assert.equal(totalMintedType[CARD_TYPE.LIMITED], calculatedSupply[CARD_TYPE.LIMITED], "Bad supply " + CARD_TYPE.LIMITED);
        })
        it('get character cards', async () => {
            const res = await contract.getCardsByCharacter(0, 100);
            console.log(JSON.stringify(res));
            const last = res[res.length - 1];

            console.log(last.cardType);
            console.log(last.characterId);
            console.log(JSON.stringify(last.ability));
        })
        // it('check every minted from contract', async () => {
        //     let totalEpic = 0;
        //     let totalRare = 0;
        //     let totalLegendary = 0;
        //     let totalLimited = 0;

        //     for (let expectedCardId = 0; expectedCardId < cardMaxSupply; expectedCardId++) {
        //         const retrived = await contract.getCharacterCardById(expectedCardId);
        //         switch (web3.utils.toNumber(retrived.cardType)) {
        //             case CARD_TYPE.EPIC:
        //                 totalEpic++;
        //                 break;
        //             case CARD_TYPE.RARE:
        //                 totalRare++;
        //                 break;
        //             case CARD_TYPE.LEGENDARY:
        //                 totalLegendary++;
        //                 break;
        //             case CARD_TYPE.LIMITED:
        //                 totalLimited++;
        //                 break;
        //         }
        //     }
        //     console.log(totalEpic, totalRare, totalLegendary, totalLimited);
        //     assert.equal(totalEpic, calculatedSupply[CARD_TYPE.EPIC], "Bad minted epic");
        //     assert.equal(totalRare, calculatedSupply[CARD_TYPE.RARE], "Bad minted rare");
        //     assert.equal(totalLegendary, calculatedSupply[CARD_TYPE.LEGENDARY], "Bad minted legendary");
        //     assert.equal(totalLimited, calculatedSupply[CARD_TYPE.LIMITED], "Bad minted limited");
        // })
    })
})