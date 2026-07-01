import express from "express";
import http from "http"; 
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { ethers } from "ethers";
import ABI from "./artifacts/build-info/contractABI.json" with { type: 'json' };
import crypto from "crypto";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


async function logAction({ email, role, action, status, req }) {
    try {
        await prisma.auditLog.create({
            data: {
                email: email || "UNKNOWN",
                role: role || "UNKNOWN",
                action,
                status,
                ipAddress:
                    req.headers["x-forwarded-for"]?.split(",")[0] ||
                    req.socket.remoteAddress
            }
        });
    } catch (err) {
        console.error("Audit log failed:", err.message);
    }
}


dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(auditMiddleware);

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


async function auditMiddleware(req, res, next) {
    if (req.method === "GET") {
        return next();
    }
    
    const skipPaths = [
        "/api/v1/auth/login",
        "/api/v1/auth/change-password",
        "/api/v1/admin/create-user",
        "/api/v1/history",
        "/api/v1/audit-logs",
    ];

    if (skipPaths.includes(req.originalUrl)) {
        return next();
    }

    const start = Date.now();

    res.on("finish", async () => {
        const duration = Date.now() - start;

        try {
            await prisma.auditLog.create({
                data: {
                    email: req.bankContext?.email || "UNKNOWN",
                    role: req.bankContext?.role || "UNKNOWN",
                    action: `${req.method} ${req.originalUrl}`,
                    status: res.statusCode < 400 ? "SUCCESS" : "FAILED",
                    ipAddress:
                        req.headers["x-forwarded-for"]?.split(",")[0] ||
                        req.socket.remoteAddress,
                }
            });

            console.log(
                `[AUDIT] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`
            );
        } catch (err) {
            console.error("Audit log failed:", err.message);
        }
    });

    next();
}


function verifyBankRole(allowedRoles) {
    return async (req, res, next) => {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                error: "Access Denied: Missing Token"
            });
        }

        jwt.verify(token, JWT_SECRET, async (err, decodedUser) => {
            if (err) {
                return res.status(403).json({
                    error: "Token expired or altered"
                });
            }

            if (!allowedRoles.includes(decodedUser.role)) {
                await logAction({
                    email: decodedUser?.email,
                    role: decodedUser?.role,
                    action: "AUTH_FAILED_ROLE_DENIED",
                    status: "FAILED",
                    req
                });

                return res.status(403).json({
                    error: "Forbidden: Insufficient Permissions"
                });
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


app.post("/api/v1/admin/create-user", verifyBankRole(["BANK_ADMIN"]), async (req, res) => {
    try {
        const { email, role, bank } = req.body;

        const tempPassword = crypto.randomBytes(4).toString("hex"); 

        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const user = await prisma.auditor.create({
            data: {
                email,
                password: hashedPassword,
                role,
                bank,
                mustChangePassword: true,
            },
        });

        await logAction({
            email: req.bankContext.email,
            role: req.bankContext.role,
            action: `USER_CREATED:${email}`,
            status: "SUCCESS",
            req
        });

        res.json({
            message: "User created successfully",
            tempPassword,
            email,
            role,
            userId: user.id,
        });
    } catch (err) {
        res.status(500).json({ error: "User creation failed" });
    }
  }
);


app.post("/api/v1/auth/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.auditor.findUnique({
            where: { email }
        });

        if (!user) {
            await logAction({
                email,
                role: "UNKNOWN",
                action: "LOGIN_FAILED",
                status: "FAILED",
                req
            });

            return res.status(401).json({
                error: "Invalid bank administrator credentials"
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );


        if (!validPassword) {
            await logAction({
                email,
                role: user.role,
                action: "LOGIN_FAILED",
                status: "FAILED",
                req
            });

            return res.status(401).json({ error: "Invalid credentials" });
        }

        if (user.mustChangePassword) {
            return res.json({
                mustChangePassword: true,
                userId: user.id,
                email: user.email
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

        await logAction({
            email: user.email,
            role: user.role,
            action: "LOGIN_SUCCESS",
            status: "SUCCESS",
            req
        });

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


app.post("/api/v1/auth/change-password", async (req, res) => {
    try {
        const { email, tempPassword, newPassword } = req.body;

        const user = await prisma.auditor.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const isValid = await bcrypt.compare(
            tempPassword,
            user.password
        )

        if(!isValid) {
            return res.status(401).json({
                error: "Invalid temporary password"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.auditor.update({
            where: { email },
            data: {
                password: hashedPassword,
                mustChangePassword: false
            }
        });

        await logAction({
            email,
            role: user.role,
            action: "PASSWORD_CHANGED",
            status: "SUCCESS",
            req
        });

        res.json({
            message: "Password updated successfully"
        });

    } catch (err) {
        res.status(500).json({
            error: "Password update failed"
        });
    }
});


app.get("/api/v1/history", verifyBankRole(["BANK_AUDITOR", "BANK_ADMIN", "BANK_OPERATOR"]), async (req, res) => {
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


app.get("/api/v1/audit-logs", verifyBankRole(["BANK_ADMIN", "BANK_AUDITOR"]), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page-1) * limit;

        const logs = await prisma.auditLog.findMany({
            orderBy: {
                createdAt: "desc"
            },
            skip,
            take : limit
        });
        
        const totalLogs = await prisma.auditLog.count();

        res.json({
            logs,
            totalLogs,
            currentPage : page,
            totalPages : Math.ceil(totalLogs / limit)
        });
    } catch (err) {
        res.status(500).json({
            error: "Failed to fetch audit logs"
        });
    }
});


server.listen(PORT, () => {
    console.log(`Interbank Blockchain Audit Server active on port ${PORT}`);
});

process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
});