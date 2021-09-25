// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CrackleRivals is ERC721, Ownable {
    // Character card type
    enum CardType {
        COMMON,
        GOLD,
        LIMITED,
        UNIQUE
    }

    /*
     ** attributes
     */
    // Amplifier => Same value plus every round
    // Reducer => Same value min. every round
    // W_Round => Win current round bonus for next round
    // L_Round => Lose current round bonus for next round
    enum ModifierLife {
        AMPLIFIER,
        REDUCER,
        W_ROUND,
        L_ROUND
    }

    struct Modifier {
        ModifierLife modifierLife;
        uint8 attack;
        uint8 defence;
        uint8 energy;
        uint8 health;
    }

    /*
     ** Skill => Block skill
     ** Ability => Block ability
     */
    struct Blocker {
        bool skill;
        bool ability;
        bool attackModifier;
        bool defenceModifier;
        bool energyModifier;
        bool healthModifier;
    }

    // Self modifier => positive
    // Rival modifier => negative
    struct Attribute {
        Modifier selfModifier;
        Modifier rivalModifier;
        Blocker blocks;
    }
    /*
     ** end attributes
     */

    struct Clan {
        string name;
        string description;
        Attribute skill;
    }

    struct Character {
        CardType cardType;
        uint256 clanId;
        string name;
        string description;
        string hash;
        uint8 attack;
        uint8 defence;
        address owner;
        Attribute ability;
    }

    struct CharacterMetadta {
        uint256 characterId;
        CardType cardType;
    }

    mapping(uint256 => Clan) private _clans;
    uint256 nextClanId = 0;

    mapping(uint256 => Character) private _characters;
    uint256 nextCharacterId = 0;

    constructor() ERC721("Crackle Rivals", "CKL") {}

    function mintClan(
        string memory name,
        string memory description,
        Attribute memory skill
    ) public onlyOwner {
        _clans[nextClanId] = Clan(name, description, skill);
        nextClanId++;
    }

    // function mint(
    //     string memory name,

    // ) public onlyOwner {

    // }
}
