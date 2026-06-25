import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const barodaPassword = await bcrypt.hash("baroda123", 10);
    const hdfcPassword = await bcrypt.hash("hdfc123", 10);

    await prisma.auditor.create({
        data: {
            email: "audit@baroda.co.in",
            password: barodaPassword,
            role: "BANK_ADMIN",
            bank: "Bank of Baroda"
        }
    });

    console.log("Auditors created");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());