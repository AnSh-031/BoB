import express from "express";
import http from "http"; 
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { ethers } from "ethers";
import ABI from "./artifacts/build-info/contractABI.json" with { type: 'json' };
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5001;
const JWT_SECRET = process.env.JWT_Secret;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: ["http://localhost:5173", "http://127.0.0.1:5173"] } });

const provider = new ethers.WebSocketProvider(process.env.URL);

provider.on("error", (err) => {
    console.error("WebSocket Provider Error:", err);
});

const contractAdd = process.env.CONTRACT_ADDRESS;
const BoBcontract = new ethers.Contract(contractAdd, ABI, provider);

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });

    socket.on("error", (err) => {
        console.error("Socket Error:", err);
    });
});

BoBcontract.on("TransactionRecorded", (sender, receiver, fromBank, toBank, amount, timeStamp, txnHash, event) => {
    console.log("New consortium block mined! Alerting all connected client dashboards...");
    
    const rawTxnHash = txnHash;

    let readableRefCode;
    try {
        readableRefCode = ethers.decodeBytes32String(rawTxnHash);
    } catch (e) {
        readableRefCode = rawTxnHash; 
    }

    io.emit("new_transaction", {
        senderName: maskVPA(sender),
        receiverName: maskVPA(receiver),
        fromBank: fromBank,
        toBank: toBank,
        amount: ethers.formatUnits(amount, 18),
        timeStamp: Number(timeStamp),
        hash: readableRefCode
    });
});

function verifyBankRole(requiredRole) {
    return (req, res, next) => {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) return res.status(401).json({ error: "Access Denied: Missing Token" });

        jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
            if (err) return res.status(403).json({ error: "Token expired or altered" });
            
            if (decodedUser.role !== requiredRole) {
                return res.status(403).json({ error: "Forbidden: Deficient Clearance Role" });
            }

            req.bankContext = decodedUser; 
            next();
        });
    };
}

function maskVPA(value) {
    if (!value) return "XXXXXX";

    value = value.trim();

    const hasAt = value.includes("@");
    const username = hasAt ? value.split("@")[0] : value;
    const handle = hasAt ? value.split("@")[1] : "";

    const start = username.substring(0, Math.min(2, username.length));
    const end =
        username.length > 2
            ? username.substring(Math.max(username.length - 2, 2))
            : "";

    const masked = `${start}******${end}`;

    return hasAt ? `${masked}@${handle}` : masked;
}

app.post("/api/v1/auth/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.auditor.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                error: "Invalid bank administrator credentials"
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {
            return res.status(401).json({
                error: "Invalid bank administrator credentials"
            });
        }

        const token = jwt.sign(
            {
                email: user.email,
                role: user.role,
                bank: user.bank
            },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            token,
            role: user.role,
            bank: user.bank
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Database error"
        });
    }
});

app.get("/api/v1/history", verifyBankRole("BANK_AUDITOR"), async (req, res) => {
    try {
        const requestingBank = req.bankContext.bank; 
        console.log(`Auditing access granted to: ${req.bankContext.email} from ${requestingBank}`);
        
        const txns = await BoBcontract.allTxns();
        
        const formattedTxns = txns.map((txn) => {
            let visualHash;
            try {
                visualHash = ethers.decodeBytes32String(txn.transactionHash);
            } catch (e) {
                visualHash = txn.transactionHash;
            }

            return {
                senderName: maskVPA(txn.senderName),
                receiverName: maskVPA(txn.receiverName),
                fromBank: txn.fromBank,
                toBank: txn.toBank,
                amount: ethers.formatUnits(txn.amount, 18),
                timeStamp: Number(txn.timeStamp),
                hash: visualHash
            };
        });
        res.status(200).json({ status: "success", Transactions: formattedTxns.reverse() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

server.listen(PORT, () => {
    console.log(`Interbank Blockchain Audit Server active on port ${PORT}`);
});