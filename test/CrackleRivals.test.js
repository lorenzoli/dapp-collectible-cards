const CrackleRivals = artifacts.require('./CrackleRivals.sol');

const { assert } = require('chai');
const { CARD_TYPE, MODIFIER_LIFE } = require('../utils/constant');

const address = "0x31C51F0B141895f12AE58a50EC7A3e7784a2B40F";
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
                        ability: {
                            selfModifier: {
                                modifierLife: MODIFIER_LIFE.AMPLIFIER,
                                attack: 0,
                                damage: Number((i % 2) + 1),
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
                                damageModifier: i % 2 == 0,
                                energyModifier: false,
                                healthModifier: false
                            }
                        }
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
                    character.ability
                );
                characterId++;
                const newId = res.logs[0].args.characterId.toNumber();
                assert.equal(characterId, newId, "Character ID failed");
                characters[characterId].id = newId;
            }
        })
        it('check characters IDs', async () => {
            let clanId = 0;
            let characterId = 0;
            for (let i = 0; i < characters.length; i++) {
                const retrived = await contract.getCharacter(i);
                const toCheck = characters[i];
                if (i / 4 === 1) {
                    clanId++;
                    characterId = 0;
                }
                console.log('Checking:')
                console.log('RetrivedId: ', retrived.clanId);
                console.log('ExpectedId: ', clanId);
                assert.equal(retrived.clanId, clanId, "Clan ID not match");

                console.log('======');
                console.log('RetrivedName: ', retrived.name);
                console.log('ExpectedName: ', 'Character ' + characterId + ' for clan CLAN_' + clanId)
                assert.equal(retrived.name, 'Character ' + characterId + ' for clan CLAN_' + clanId, "Name not match")

                console.log('======');
                console.log('RetrivedAbility [self]: ', retrived.ability.selfModifier)
                console.log('ExpectedAbility [self]: ', {
                    modifierLife: MODIFIER_LIFE.AMPLIFIER,
                    attack: 0,
                    damage: Number((i % 2) + 1),
                    energy: 0,
                    health: 0
                })
                console.log('\n\n')
                characterId++;
            }
        })
    })
})