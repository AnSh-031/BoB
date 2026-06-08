import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import { ethers } from "ethers";
import ABI from "./artifacts/build-info/contractABI.json" with { type: 'json' };
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = "SUPER_SECRET_COMPLIANCE_KEY_1082";

const provider = new ethers.JsonRpcProvider(process.env.URL);
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

const contractAdd = process.env.CONTRACT_ADDRESS;
const BoBcontract = new ethers.Contract(contractAdd, ABI, wallet);


const AUTHORIZED_BANK_STAFF_DATABASE = {
    "audit@sbi.co.in": { pass: "sbi123", role: "BANK_AUDITOR", bank: "SBI" },
    "compliance@hdfc.com": { pass: "hdfc123", role: "BANK_AUDITOR", bank: "HDFC" }
};


app.post("/api/v1/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = AUTHORIZED_BANK_STAFF_DATABASE[email];

    if (!user || user.pass !== password) {
        return res.status(401).json({ error: "Invalid bank administrator credentials" });
    }


    const token = jwt.sign({ email, role: user.role, bank: user.bank }, JWT_SECRET, { expiresIn: "1h" });
    return res.json({ token, role: user.role, bank: user.bank });
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


app.get("/api/v1/history", verifyBankRole("BANK_AUDITOR"), async (req, res) => {
    try {
        const requestingBank = req.bankContext.bank; 
        
        console.log(`Auditing access granted to: ${req.bankContext.email} from ${requestingBank}`);
        
        const txns = await BoBcontract.allTxns();
        
        
        const formattedTxns = txns.map((txn) => {
            const isParticipant = (txn.fromBank === requestingBank || txn.toBank === requestingBank);
            
            return {
                senderName: isParticipant ? txn.senderName : maskVPA(txn.senderName), 
                receiverName: isParticipant ? txn.receiverName : maskVPA(txn.receiverName),
                fromBank: txn.fromBank,
                toBank: txn.toBank,
                amount: ethers.formatUnits(txn.amount, 18),
                timeStamp: Number(txn.timeStamp),
                hash: txn.transactionHash
            };
        });
        res.status(200).json({ status: "success", Transactions: formattedTxns });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

function maskVPA(vpa) {
    if (!vpa || !vpa.includes("@")) return "XXXXXX";
    const [username, handle] = vpa.split("@");
    const maskedUser = username.length > 4 
        ? `${username.substring(0, 2)}******${username.substring(username.length - 2)}`
        : "******";
    return `${maskedUser}@${handle}`;
}

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Interbank Blockchain Audit Server active on port ${PORT}`);
});