# Crackle Rivals contracts

## About

The CrackleRivals contract is ERC-721 type for NFT collection.
<br></br>
It cointain the folliwing models:

- Clan
- Character
- CharacterCard

The `truffle-config.js` have configuration for Ethereum and Matic chain (it can be used only with real account).

## Utilities

### Run migration

```
truffle migrate --reset
```

NOTE: `--reset` is for override json build contract and avoid JSON errors

### Run test

```
truffle test
```

NOTE: This command run all unit files on `test/` folder.\

`CrackleRivals.test.js` unit test run:

- Contract deployment
- Check contract card types max supply
- Mint 2 Clans
- Mint 4 Characters for every Clan (Copy [Characters]: for list of all characters)
- Check Minted characters ID / Name / Attack / Damage
- Mint 100 all card types for character zero
- Retrive all cards from contract

### Deploy on Matic

1. Open `truffle-config.js`
2. Create `.secret` file with mnemonic phrase on root folder
3. Go on [Polygon RPC](https://rpc.maticvigil.com/) and signup for PROJECT_ID
4. Create `.env` file with following content

```
PROJECT_ID=polygon-project-id
```

5. Uncomment `HDWalletProvider` import

```js
const HDWalletProvider = require("@truffle/hdwallet-provider");
const fs = require("fs");
const mnemonic = fs.readFileSync(".secret").toString().trim();
```

6. Uncomment matic network on `module.exports`

```js
matic: {
    provider: () => new HDWalletProvider({
        mnemonic: {
            phrase: mnemonic
        },
        providerOrUrl: `https://rpc-mumbai.maticvigil.com/v1/${process.env.PROJECT_ID}`,
        chainId: 80001
    }),
    network_id: 80001,
    confirmations: 2,
    timeoutBlocks: 200,
    skipDryRun: true,
    chainId: 80001
}
```

7. Run migration command

```
truffle migrate --network matic
```
