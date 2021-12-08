require('dotenv').config()

const NFTArtifact = require('../artifacts/contracts/NFTMarket.sol/NFTMarket.json');
const tokenArtifact = require('../artifacts/@openzeppelin/contracts/token/ERC721/ERC721.sol/ERC721.json');
const { ethers } = require('ethers');
const express = require('express');
const { register } = require('ts-node');
const app = express();
const mongoose = require('mongoose')
const Enlist = require('./enlistSchema')
const Delist = require('./delistSchema')
const Approve = require('./approveSchema')


mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection;
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())

async function main() {
  window.ethereum.enable()
  
  const provider = await new ethers.providers.JsonRpcProvider(); //goes to localhost directly if no url entered

  const a1 = await provider.getSigner(0)
  const a2 = await provider.getSigner(1)
  const a3 = await provider.getSigner(2)

  const marketAddress = '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e';
  const market = new ethers.Contract(marketAddress, NFTArtifact.abi, a1);

  const puppiesAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
  const puppies = new ethers.Contract(puppiesAddress, tokenArtifact.abi, a2);
  // try {
  //   const b = await puppies.connect(a1).approve(marketAddress, 30);
  // }
  // catch(err) {
  //   console.log(JSON.parse(err.body).error.message)
  // }
  
  // const a = await market.enlistedNFTs(puppiesAddress, 30)
  // console.log(a[4])



  app.get('/', async (req, res) => {
    try {
      const enlist = await Enlist.find()
      res.json(enlist)
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })

  app.post('/checkapprove', async (req, res) => {
    const approve = await Approve.find({tokenId: req.body.tokenId, tokenOwner: req.body.tokenOwner})
    res.status(201).json({approve})
  })

  app.post('/approve', async (req, res) => {
    try {
      // const a1 = domagic(req.body.privatekey);
      const approveHash = await puppies.connect(a1).approve(marketAddress, req.body.tokenId);
      if(!req.body.tokenId || req.body.tokenId.length == 42) {
        res.status(400).send('Token ID is required and should be 42 characters!');
      }
      const approve = new Approve({
        tokenAddress: puppiesAddress,
        tokenId: req.body.tokenId,
        transactionHash: approveHash.hash,
        tokenOwner: req.body.tokenOwner
      })
        try {
          const newApprove = await approve.save()
          res.status(201).json({newApprove})
        } 
        catch (err) {
          res.status(400).json({ message: err.message })
        }
    }
    catch(err) {
      console.log(JSON.parse(err.body).error.message)
    }
  })


  app.post('/enlist', async (req, res) => {
    if(!req.body.tokenAddress || req.body.tokenAddress.length == 42) {
      res.status(400).send('Token Address is required and should be 42 characters!');
      return;
    }
      try {
        const enlistHash = await market.connect(a1).enlistNFT(req.body.tokenAddress, req.body.tokenId, req.body.price, {
         value : ethers.utils.parseUnits("0.025", "ether")
        });

        const enlist = new Enlist({
          tokenAddress: req.body.tokenAddress,
          tokenId: req.body.tokenId,
          transactionHash: enlistHash.hash,
          status: 'Enlisted'
        })
          try {
            const newEnlist = await enlist.save()
            res.status(201).json({newEnlist})
          }   catch (err) {
            res.status(400).json({ message: err.message })
          }
      }
      catch(err){
        res.status(400).send({ message: err.message })
      }
  });


  app.delete('/delist', async (req, res) => {
    if(!req.body.tokenAddress || req.body.tokenAddress.length < 42) {
      res.status(400).send('Token Address is required and should be 42 characters!');
      return;
    }
    if(!req.body.tokenOwner || req.body.tokenOwner.length < 42) {
      res.status(400).send('Token Owner Address is required and should be 42 characters!');
      return;
    }
    try {
      await market.connect(a1).delistNFT(req.body.tokenAddress, req.body.tokenId, req.body.itemOwner);
      const delist = new Delist({
        tokenAddress: req.body.tokenAddress,
        tokenId: req.body.tokenId,
        transactionHash: enlistHash.hash
      })
      const enlist = Enlist.updateOne({ tokenAddress: req.body.tokenAddress, tokenId: req.body.tokenId }, { status: 'Delisted' })
        try {
          const Update = await enlist.save()
          res.status(201).json({Update})
        }   catch (err) {
          res.status(400).json({ message: err.message })
        }
    }
    catch (err) {
      console.log("Error!")
    }
  });

  // app.delete('/buy', async (req, res) => {
  //   await market.connect(a3).buyNFT(req.body.tokenAddress, req.body.tokenId, req.body.buyer, req.body.price);
  //   res.send('NFT has been Bought!');
  //   console.log(await puppies.ownerOf(req.body.tokenId))
  // });


  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Listening on port ${port}...`));
}

main()
