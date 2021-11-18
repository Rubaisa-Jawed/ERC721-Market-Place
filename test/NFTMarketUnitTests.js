const { ErrorCode } = require("@ethersproject/wordlists/node_modules/@ethersproject/logger");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("ERC721 Market Place Test", () => {

    let CryptoPuppies, CryptoKitties, NftMarket;
    let puppies, kitties, market;
    let addr0, addr1, addr2, addr3;

    beforeEach(async function () {
        CryptoPuppies = await ethers.getContractFactory("NFTOne");
        puppies = await CryptoPuppies.deploy();
        CryptoKitties = await ethers.getContractFactory("NFTTwo");
        kitties = await CryptoKitties.deploy();
        NftMarket = await ethers.getContractFactory("NFTMarket");
        market = await NftMarket.deploy();
        [addr0, addr1, addr2, addr3] = await ethers.getSigners();
        await puppies.mintNFT(addr1.address, 80);
        await puppies.mintNFT(addr2.address, 100);
        await kitties.mintNFT(addr1.address, 88);
        await kitties.mintNFT(addr2.address, 90);
    });

    describe("Enlisting an NFT", function () {

        it("should fail if address tries to enlist an already enlisted NFT", async function () {
            await kitties.connect(addr1).approve(market.address, 88);
            await market.connect(addr1).enlistNFT(kitties.address, 88, 10, {
                value: ethers.utils.parseUnits("0.025", "ether")
            });
            await expect(market.connect(addr1).enlistNFT(kitties.address, 88, 10, {
                value: ethers.utils.parseUnits("0.025", "ether")
            })).to.be.revertedWith("NFT already enlisted!");
        });

        it("should fail if listing price is incorrect", async function () {
            await kitties.connect(addr1).approve(market.address, 88);
            await expect(market.connect(addr1).enlistNFT(kitties.address, 88, 10)).to.be.revertedWith("Insufficient listing price!");
        });

        it("should fail if address trying to enlist NFT is not the owner of the NFT", async function () {
            await kitties.connect(addr1).approve(market.address, 88);
            await expect(market.connect(addr2).enlistNFT(kitties.address, 88, 10, {
                value: ethers.utils.parseUnits("0.025", "ether")
            })).to.be.revertedWith("Address is not the owner of the NFT!");
        });

        it("should enlist an NFT", async function () {
            await kitties.connect(addr1).approve(market.address, 88);
            await market.connect(addr1).enlistNFT(kitties.address, 88, 10, {
                value: ethers.utils.parseUnits("0.025", "ether")
            });
        });

        it("should transfer NFT from Owner to Market Place", async function() {
            await kitties.connect(addr1).approve(market.address, 88);
            await market.connect(addr1).enlistNFT(kitties.address, 88, 10, {
                value: ethers.utils.parseUnits("0.025", "ether")
            });
            const owner = await kitties.ownerOf(88);
            expect(owner).to.equal(market.address);
        });

        it("should emit an enlisted NFT Event", async function() {
            await kitties.connect(addr1).approve(market.address, 88);
            await expect(market.connect(addr1).enlistNFT(kitties.address, 88, 10, {
                value: ethers.utils.parseUnits("0.025", "ether")
            })).to.emit(market, 'NFTenlisted').withArgs(kitties.address, 88);
        });

    });

    describe("Delisting an NFT", function () {

        it("should fail if NFT does not exist in the market", async function () {
            await kitties.connect(addr1).approve(market.address, 88);
            await expect(market.connect(addr1).delistNFT(kitties.address, 88, addr1.address))
                .to.be.revertedWith("NFT does not exist!");
        });

        it("should fail if address other than the owner tries to delist NFT", async function () {
            await kitties.connect(addr1).approve(market.address, 88);
            await market.connect(addr1).enlistNFT(kitties.address, 88, 10, {
                value: ethers.utils.parseUnits("0.025", "ether")
            });
            await expect(market.connect(addr1).delistNFT(kitties.address, 88, addr2.address))
                .to.be.revertedWith("Address is not the owner of the enlisted NFT!");
        });

        it("should delist an enlisted NFT", async function () {
            await kitties.connect(addr1).approve(market.address, 88);
            await market.connect(addr1).enlistNFT(kitties.address, 88, 10, {
                value: ethers.utils.parseUnits("0.025", "ether")
            });
            await market.connect(addr1).delistNFT(kitties.address, 88, addr1.address);
        });

        it("should transfer NFT from Market Place to Owner", async function() {
            await kitties.connect(addr1).approve(market.address, 88);
            await market.connect(addr1).enlistNFT(kitties.address, 88, 10, {
                value: ethers.utils.parseUnits("0.025", "ether")
            });
            await market.connect(addr1).delistNFT(kitties.address, 88, addr1.address);
            const owner = await kitties.ownerOf(88);
            expect(owner).to.equal(addr1.address);
        });

        it("should emit a Delist NFT Event", async function() {
            await kitties.connect(addr1).approve(market.address, 88);
            await market.connect(addr1).enlistNFT(kitties.address, 88, 10, {
                value: ethers.utils.parseUnits("0.025", "ether")
            });
            await expect(market.connect(addr1).delistNFT(kitties.address, 88, addr1.address))
                .to.emit(market, 'NFTdelisted').withArgs(kitties.address, 88);
        });

    });

    describe("Buying an Enlisted NFT", function () {

        it("should fail if NFT does not Exist in the market", async function () {
            await expect(market.buyNFT(kitties.address, 88, addr3.address, 10))
                .to.be.revertedWith("NFT does not exist!");
        });

        it("should fail if the NFT price is incorrect", async function () {
            await kitties.connect(addr1).approve(market.address, 88);
            await market.connect(addr1).enlistNFT(kitties.address, 88, 10, {
                value: ethers.utils.parseUnits("0.025", "ether")
            });
            await expect(market.buyNFT(kitties.address, 88, addr3.address, 5))
                .to.be.revertedWith("Incorrect Price!");
        });

        it("should allow NFT to be bought", async function () {
            await kitties.connect(addr1).approve(market.address, 88);
            await market.connect(addr1).enlistNFT(kitties.address, 88, 10, {
                value: ethers.utils.parseUnits("0.025", "ether")
            });
            await market.buyNFT(kitties.address, 88, addr3.address, 10);
        });

        it("should transfer NFT from Market Place to Buyer", async function() {
            await kitties.connect(addr1).approve(market.address, 88);
            await market.connect(addr1).enlistNFT(kitties.address, 88, 10, {
                value: ethers.utils.parseUnits("0.025", "ether")
            });
            await market.buyNFT(kitties.address, 88, addr3.address, 10);
            const owner = await kitties.ownerOf(88);
            expect(owner).to.equal(addr3.address);
        });

        it("should emit a Bought NFT Event", async function() {
            await kitties.connect(addr1).approve(market.address, 88);
            await market.connect(addr1).enlistNFT(kitties.address, 88, 10, {
                value: ethers.utils.parseUnits("0.025", "ether")
            });
            await expect(market.connect(addr1).buyNFT(kitties.address, 88, addr3.address, 10))
                .to.emit(market, 'NFTbought').withArgs(kitties.address, 88);
        });

    });

    describe("Viewing Enlisted NFTs", async function () {

        it("should fail if NFT does not exist in the market", async function () {
            await expect(market.viewEnlistedNFT(kitties.address, 88))
                .to.be.revertedWith("NFT does not exist!");
        })

        it("should allow NFT to be viewed", async function () {
            await kitties.connect(addr1).approve(market.address, 88);
            await market.connect(addr1).enlistNFT(kitties.address, 88, 10, {
                value: ethers.utils.parseUnits("0.025", "ether")
            }); 
            await market.viewEnlistedNFT(kitties.address, 88);
        });
    });
});
