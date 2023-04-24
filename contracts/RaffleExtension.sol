// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@manifoldxyz/libraries-solidity/contracts/access/AdminControl.sol";
import "@manifoldxyz/creator-core-solidity/contracts/core/IERC721CreatorCore.sol";
import "@manifoldxyz/creator-core-solidity/contracts/extensions/ICreatorExtensionTokenURI.sol";

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract RaffleExtension is AdminControl, ICreatorExtensionTokenURI, VRFConsumerBase {
    using Strings for uint256;

    address private _creator;
    string private _baseURI;
    uint256 private _maxEntries;

    uint256 private _entryCount;
    address[] private _participants;

    bytes32 private _keyHash;
    uint256 private _fee;

    uint256 public randomResult;
    bool public raffleEnded;

    event WinnersSelected(uint256[] winningTokenIds);

    constructor(
        address creator,
        uint256 maxEntries,
        address vrfCoordinator,
        address linkToken,
        bytes32 keyHash,
        uint256 fee
    )
        AdminControl()
        VRFConsumerBase(vrfCoordinator, linkToken)
    {
        _creator = creator;
        _maxEntries = maxEntries;
        _keyHash = keyHash;
        _fee = fee;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AdminControl, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(ICreatorExtensionTokenURI).interfaceId ||
            AdminControl.supportsInterface(interfaceId) ||
            super.supportsInterface(interfaceId);
    }

    function mint() public {
        require(!raffleEnded, "Raffle has ended");
        IERC721CreatorCore(_creator).mintExtension(msg.sender);
        _participants.push(msg.sender);
        _entryCount++;

        if (_entryCount >= _maxEntries) {
            raffleEnded = true;
            requestRandomNumber();
        }
    }

    function requestRandomNumber() internal {
        require(LINK.balanceOf(address(this)) >= _fee, "Not enough LINK");
        requestRandomness(_keyHash, _fee);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        randomResult = randomness;
        selectWinners();
    }

    function selectWinners() internal {
        uint256[] memory winningTokenIds = new uint256[](_participants.length);
        for (uint256 i = 0; i < _participants.length; i++) {
            uint256 randomIndex = (uint256(keccak256(abi.encodePacked(randomResult, i))) % _participants.length) + 1;
            winningTokenIds[i] = randomIndex;
        }

        emit WinnersSelected(winningTokenIds);
    }

    function setBaseURI(string memory baseURI) public adminRequired {
        _baseURI = baseURI;
    }

    function tokenURI(address creator, uint256 tokenId)
        external
        view
        override
        returns (string memory)
    {
        require(creator == _creator, "Invalid token");
        return string(abi.encodePacked(_baseURI, tokenId.toString()));
    }

    function getParticipants() public view returns (address[] memory) {
        return _participants;
    }

    function getWinners() public view returns (uint256[] memory) {
        require(raffleEnded, "Raffle is not yet ended");
        uint256[] memory winningTokenIds = new uint256[](_participants.length);
        for (uint256 i = 0; i < _participants.length; i++) {
            uint256 randomIndex = (uint256(keccak256(abi.encodePacked(randomResult, i))) % _participants.length) + 1;
            winningTokenIds[i] = randomIndex;
        }
        return winningTokenIds;
    }
}
