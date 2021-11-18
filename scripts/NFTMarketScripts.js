const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  [a1, a2, a3, a4, a5, a6]= await ethers.getSigners();
  await hre.run("compile");
  const CryptoPuppies = await ethers.getContractFactory("NFTOne");
  const puppies = await CryptoPuppies.deploy();

  await puppies.deployed();
  console.log("CryptoPuppies Contract deployed to:", puppies.address);
  
  await puppies.mintNFT(a1.address, 10);
  await puppies.mintNFT(a1.address, 20);
  await puppies.mintNFT(a1.address, 30);
  await puppies.mintNFT(a1.address, 40);
  await puppies.mintNFT(a1.address, 50);
  await puppies.mintNFT(a1.address, 60);
  await puppies.mintNFT(a1.address, 70);
  await puppies.mintNFT(a1.address, 80);
  // await puppies.mintNFT(a3.address, 100);

  const CryptoKitties = await ethers.getContractFactory("NFTTwo");
  const kitties = await CryptoKitties.deploy();
  
  await kitties.deployed();
  console.log("CryptoKitties Contract deployed to:", kitties.address);

  await kitties.mintNFT(a2.address, 88);
  // await kitties.mintNFT(a3.address, 89);
  // await kitties.mintNFT(a2.address, 90);

  const NftMarket = await ethers.getContractFactory("NFTMarket");
  const market = await NftMarket.deploy();

  await market.deployed();
  console.log("NFT Market Contract deployed to:", market.address);

  // await puppies.connect(a2).approve(market.address,90);

  // const enlistingPuppies1 = await market.connect(a2).enlistNFT(puppies.address, 90, 10, {
  //     value : ethers.utils.parseUnits("0.025", "ether")
  // });
  // console.log("Puppies Enlisted: ");
  
  // const viewMarketNFT1 = await market.viewEnlistedNFT(puppies.address, 90);
  // console.log(viewMarketNFT1);
  
//   await kitties.connect(a1).approve(market.address,88);

//   const enlistingKitties1 = await market.connect(a1).enlistNFT(kitties.address, 88, 20, {
//     value : ethers.utils.parseUnits("0.025", "ether")
// });
//   console.log("Kitties Enlisted: ");

//   const viewMarketNFT2 = await market.viewEnlistedNFT(kitties.address, 88);

//   const delistingkitties = await market.delistNFT(kitties.address, 88, a1.address);
//   console.log("Kitties delisted: ");

//   const buying = await market.buyNFT(puppies.address, 90, a4.address,10);
//   console.log("NFT bought!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });