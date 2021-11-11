//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTTwo is ERC721 {

    constructor() ERC721("CryptoKitties","KIT") {}

    function mintNFT(address to, uint256 tokenId) public {
        _mint(to,tokenId);
    }

}