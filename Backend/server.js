import express from "express";
import cors from "cors";
import ABI from "./artifacts/build-info/contractABI.json" with {type : "json"};
import {ethers} from "ethers";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const provider = new ethers.JsonRpcProvider(process.env.URL);
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

const contractAdd = process.env.CONTRACT_ADDRESS;
const BoBcontract = new ethers.Contract(contractAdd, ABI, wallet);

app.post("/api/v1/transfer", async(req, res) => {
    const {sender, receiver, to, amount} = req.body;
    
    try {
    const txnRes = await BoBcontract.transferTo(sender, receiver, to, amount);
    const receipt = await txnRes.wait();

    res.status(201).json({
        status : "successful",
        txnHash : receipt.hash
    });
    } 
    catch(err) {
        res.status(400).json({
            status : "Unsuccessful",
            error : err.message
        })
    }
}) 

app.get("/api/v1/history", async(req,res) => {
    try{
        const txns = await BoBcontract.allTxns();
        const formattedTxns = txns.map((txn) => ({
            senderName : txn.senderName,
            receiverName : txn.receiverName,
            fromBank : txn.fromBank,
            toBank : txn.toBank,
            amount : txn.amount.toString(),
            timeStamp : Number(txn.timeStamp) 
        }))
        
        res.status(200).json({
            "status" : "success",
            "count" : formattedTxns.length,
            "Transactions" : formattedTxns
        })
    }
    catch(err) {
        res.status(400).json({
            "status" : "error",
            "error" : err.message
        })
    }
})

app.listen(5001);