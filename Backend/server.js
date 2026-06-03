import express from "express";
import cors from "cors";
import { ethers } from "ethers";
import ABI from "./artifacts/build-info/contractABI.json" with { type: "json" };
import dotenv from "dotenv"

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const provider = new ethers.JsonRpcProvider(process.env.URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const BoBcontract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, wallet);


app.post("/api/v1/bank-core/sync", async (req, res) => {
    const { 
        originatingBank, 
        destinationBank, 
        senderVPA, 
        receiverVPA, 
        amountINR, 
        bankRRN 
    } = req.body;

    try {
        const txnRes = await BoBcontract.transferTo(
            senderVPA, 
            receiverVPA, 
            destinationBank, 
            ethers.parseUnits(amountINR.toString(), 18),
            bankRRN
        );
        
        const liveBlockchainHash = txResponse.hash;

        const receipt = await txnRes.wait();

        return res.status(201).json({
            status: "synchronized",
            blockchainTxHash: liveBlockchainHash,
            timestamp: Date.now()
        });

    } catch (err) {
        console.error("Critical: Bank sync ledger write failed:", err.message);
        return res.status(500).json({ error: "Ledger anchoring failure" });
    }
});


app.get("/api/v1/history", async (req, res) => {
    try {
        const txns = await BoBcontract.allTxns();
        const formattedTxns = txns.map((txn, index) => ({
            senderName: txn.senderName,
            receiverName: txn.receiverName,
            fromBank: txn.fromBank, 
            toBank: txn.toBank,    
            amount: ethers.formatUnits(txn.amount, 18),
            timeStamp: Number(txn.timeStamp),
            hash: txn.transactionHash 
        }));
        
        res.status(200).json({
            status: "success",
            Transactions: formattedTxns
        });
    } catch (err) {
        res.status(400).json({ "status" : "error", "error" : err.message });
    }
});

app.listen(5001, () => console.log("Interbank Node Engine active on port 5001"));