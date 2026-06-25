import axios from "axios";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import Sidebar from "../Components/Sidebar";
import History from "./History";

const socket = io(
    "http://localhost:5001",
    {
        autoConnect: false
    }
);

export default function Dashboard({
    activeBank,
    operatorEmail,
    role,
    currentPage,
    setCurrentPage,
    setIsAuthenticated,
    setActiveBank,
    setOperatorEmail
}) {
    const [txns, setTxn] = useState([]);

    const totalTransactions = txns
        ? txns.length
        : 0;

    const totalVolume = txns
        ? txns.reduce(
            (sum, txn) =>
                sum +
                parseFloat(
                    txn.amount || 0
                ),
            0
        )
        : 0;

    useEffect(() => {
        const token =
            localStorage.getItem(
                "bank_token"
            );

        if (!token) {
            handleLogout();
            return;
        }

        fetchLedgerHistory(token);
    }, []);

    useEffect(() => {
        console.log(
            "Connecting to Interbank Core WebSocket..."
        );

        socket.connect();

        socket.on(
            "connect",
            () => {
                console.log(
                    "Socket connected:",
                    socket.id
                );
            }
        );

        socket.on(
            "disconnect",
            () => {
                console.log(
                    "Socket disconnected"
                );
            }
        );

        const handleIncomingTxn = (
            newLiveTxn
        ) => {
            console.log(
                "Live WebSocket data packet received from compliance hub:",
                newLiveTxn
            );

            setTxn(
                (prevTxns) => {
                    const isDuplicate =
                        prevTxns.some(
                            (t) =>
                                t.hash ===
                                    newLiveTxn.hash &&
                                Number(
                                    t.timeStamp
                                ) ===
                                    Number(
                                        newLiveTxn.timeStamp
                                    )
                        );

                    if (
                        isDuplicate
                    ) {
                        console.log(
                            "Duplicate row filtered out."
                        );

                        return prevTxns;
                    }

                    console.log(
                        "Pushing new live row into dashboard matrix."
                    );

                    return [
                        newLiveTxn,
                        ...prevTxns
                    ];
                }
            );
        };

        socket.on(
            "new_transaction",
            handleIncomingTxn
        );

        return () => {
            console.log(
                "Tearing down terminal network bridges..."
            );

            socket.off(
                "new_transaction",
                handleIncomingTxn
            );

            socket.disconnect();
        };
    }, []);

    async function fetchLedgerHistory(
        token
    ) {
        try {
            const response =
                await axios.get(
                    "http://localhost:5001/api/v1/history",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setTxn(
                Array.isArray(
                    response.data
                        .Transactions
                )
                    ? response.data
                          .Transactions
                    : []
            );
        } catch (err) {
            console.error(
                err.message
            );

            handleLogout();
        }
    }

    function handleLogout() {
        localStorage.removeItem(
            "bank_token"
        );

        localStorage.removeItem(
            "bank_name"
        );

        localStorage.removeItem(
            "bank_email"
        );

        localStorage.removeItem(
            "bank_role"
        );

        setIsAuthenticated(
            false
        );

        setTxn([]);

        setActiveBank("");

        setOperatorEmail("");

        socket.disconnect();
    }

    return (
        <div className="app-shell">
            <style>
                {`
                #root{
                    max-width:100vw!important;
                    padding:0!important;
                    margin:0!important;
                    text-align:left!important;
                    display:flex!important;
                }
                `}
            </style>

            <Sidebar
                activeBank={
                    activeBank
                }
                operatorEmail={
                    operatorEmail
                }
                role={role}
                currentPage={
                    currentPage
                }
                setCurrentPage={
                    setCurrentPage
                }
                handleLogout={
                    handleLogout
                }
            />

            <History
                txns={txns}
                activeBank={
                    activeBank
                }
                totalTransactions={
                    totalTransactions
                }
                totalVolume={
                    totalVolume
                }
            />
        </div>
    );
}