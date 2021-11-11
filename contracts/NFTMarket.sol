//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "hardhat/console.sol";
import "./NFTOne.sol";
import "./NFTTwo.sol";

contract NFTMarket is IERC721Receiver {

    uint256 listingPrice = 0.025 ether;

    struct Item {
        address _tokenAddress;
        uint256 _tokenId;
        address _tokenOwner;
        uint256 _price;
        bool _exists;
    }

    mapping(address => mapping(uint256 => Item)) public enlistedNFTs;

    
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        // return IERC721.onERC721Received.selector;
        return IERC721Receiver.onERC721Received.selector;
    }

    function enlistNFT(address tokenAddress, uint256 tokenId, uint256 price) public payable { 
        require(enlistedNFTs[tokenAddress][tokenId]._exists == false, "NFT already enlisted!");
        require(msg.value == listingPrice, "Insufficient listing price!");
        IERC721 newNFT = IERC721(tokenAddress);
        require(newNFT.ownerOf(tokenId) == msg.sender, "Address is not the owner of the NFT!");
        newNFT.safeTransferFrom(msg.sender, address(this), tokenId);
        enlistedNFTs[tokenAddress][tokenId] = Item(tokenAddress,tokenId,msg.sender,price,true);
    }

    function delistNFT(address tokenAddress, uint256 tokenId, address itemOwner) public {
        require(enlistedNFTs[tokenAddress][tokenId]._exists == true, "NFT does not exist!");
        require(enlistedNFTs[tokenAddress][tokenId]._tokenOwner == itemOwner, "Address is not the owner of the enlisted NFT!");
        IERC721 newNFT = IERC721(tokenAddress);
        newNFT.safeTransferFrom(address(this), itemOwner, tokenId);
        delete enlistedNFTs[tokenAddress][tokenId];
    }

    function buyNFT(address tokenAddress, uint256 tokenId, address buyer, uint256 price) public {
        require(enlistedNFTs[tokenAddress][tokenId]._exists == true, "NFT does not exist!");
        require(enlistedNFTs[tokenAddress][tokenId]._price == price, "Incorrect Price!");
        IERC721 newNFT = IERC721(tokenAddress);
        newNFT.safeTransferFrom(address(this), buyer, tokenId);
        payable(buyer).transfer(price);
        delete enlistedNFTs[tokenAddress][tokenId];
    }

    function viewEnlistedNFT(address tokenAddress, uint256 tokenId) public view {
        require(enlistedNFTs[tokenAddress][tokenId]._exists == true, "NFT does not exist!");
        console.log("NFT Address: ", enlistedNFTs[tokenAddress][tokenId]._tokenAddress);
        console.log("NFT ID: ", enlistedNFTs[tokenAddress][tokenId]._tokenId);
        console.log("NFT Owner: ", enlistedNFTs[tokenAddress][tokenId]._tokenOwner);
        console.log("NFT Price: ", enlistedNFTs[tokenAddress][tokenId]._price);
        console.log("Enlisted: ", enlistedNFTs[tokenAddress][tokenId]._exists);
    }

}