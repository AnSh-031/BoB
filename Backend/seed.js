import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const sbiPassword = await bcrypt.hash("sbi123", 10);
    const hdfcPassword = await bcrypt.hash("hdfc123", 10);

    await prisma.auditor.create({
        data: {
            email: "audit@sbi.co.in",
            password: sbiPassword,
            role: "BANK_AUDITOR",
            bank: "SBI"
        }
    });

    await prisma.auditor.create({
        data: {
            email: "compliance@hdfc.com",
            password: hdfcPassword,
            role: Role.BANK_AUDITOR,
            bank: "HDFC"
        }
    });

    console.log("Auditors created");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());