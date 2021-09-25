// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CrackleRivals is ERC721, Ownable {
    // Character card type
    enum CardType {
        COMMON,
        GOLD,
        RARE,
        LIMITED
    }
    string constant COMMON_CARD_HASH = "to-define";
    string constant GOLD_CARD_HASH = "to-define";
    string constant RARE_CARD_HASH = "to-define";
    string constant LIMITED_CARD_HASH = "to-define";

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
        uint256 clanId;
        string name;
        string description;
        string hash;
        Attribute ability;
    }

    struct CharacterCard {
        CardType cardType;
        uint256 characterId;
        uint8 attack;
        uint8 defence;
        address owner;
    }

    mapping(uint256 => Clan) private _clans;
    uint256 nextClanId = 0;

    mapping(uint256 => Character) private _characters;
    uint256 nextCharacterId = 0;

    mapping(uint256 => CharacterCard) private _characterCards;
    uint256 nextCharacterCardId = 0;

    constructor() ERC721("Crackle Rivals", "CKL") {}

    function mintClan(
        string memory name,
        string memory description,
        Attribute memory skill
    ) public onlyOwner {
        _clans[nextClanId] = Clan(name, description, skill);
        emit ClanMinted(nextClanId);

        nextClanId++;
    }

    function mintCharacter(
        uint256 clanId,
        string memory name,
        string memory description,
        string memory hash,
        Attribute memory ability
    ) public onlyOwner {
        _characters[nextCharacterId] = Character(
            clanId,
            name,
            description,
            hash,
            ability
        );
        emit CharacterMinted(nextCharacterId);

        nextCharacterId++;
    }

    function mintCard(
        CardType cardType,
        uint256 characterId,
        uint8 attack,
        uint8 defence
    ) public onlyOwner {
        _characterCards[nextCharacterCardId] = CharacterCard(
            cardType,
            characterId,
            attack,
            defence,
            msg.sender
        );

        // Mint card
        _safeMint(msg.sender, nextCharacterCardId);
        emit CharacterCardMinted(nextCharacterCardId);

        nextCharacterCardId++;
    }

    function transferCard(address to, uint256 characterCardId) public {
        require(
            _characterCards[characterCardId].owner == msg.sender,
            "Irregular owner"
        );

        _transfer(msg.sender, to, characterCardId);
        _characterCards[characterCardId].owner = msg.sender;

        emit CharacterCardTransfered(characterCardId, msg.sender, to);
    }

    function getClan(uint256 clanId) public view returns (Clan memory) {
        return _clans[clanId];
    }

    function getCharacter(uint256 characterId)
        public
        view
        returns (Character memory)
    {
        return _characters[characterId];
    }

    function getCharacterCard(uint256 characterCardId)
        public
        view
        returns (CharacterCard memory)
    {
        return _characterCards[characterCardId];
    }

    /*
    Events
    */
    event ClanMinted(uint256 clanId);
    event CharacterMinted(uint256 characterId);
    event CharacterCardMinted(uint256 characterCardId);
    event CharacterCardTransfered(
        uint256 characterCardId,
        address oldOwner,
        address newOwner
    );
}
