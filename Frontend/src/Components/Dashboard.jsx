import axios from "axios";
import { useState, useEffect } from "react";

export default function Dashboard() {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [toAddress, setAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [change, setChange] = useState(false);
    const [txns, setTxn] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: null, message: "" });

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get("http://localhost:5001/api/v1/history");
                if (response.data.status === "success") {
                    setTxn(response.data.Transactions);
                }
            } catch (err) {
                console.error(err.message);
            }
        }
        fetchData();
    }, [change]);

    async function Transfer() {
        if (!from || !to || !toAddress || !amount) {
            setStatus({ type: "error", message: "All input fields are mandatory." });
            return;
        }

        setLoading(true);
        setStatus({ type: null, message: "" });

        try {
            await axios.post("http://localhost:5001/api/v1/transfer", {
                "sender": from,
                "receiver": to,
                "to": toAddress,
                "amount": Number(amount)
            });

            setStatus({ type: "success", message: "Transaction processed and synchronized successfully." });
            
            setFrom("");
            setTo("");
            setAddress("");
            setAmount("");
                
            setChange(!change);
        } catch (err) {
            setStatus({ type: "error", message: `Broadcast Failed: ${err.message}` });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.dashboardContainer}>
            <div style={styles.panelCard}>
                <h2 style={styles.panelTitle}>New Transfer</h2>
                
                <div style={styles.formGroup}>
                    <label style={styles.fieldLabel}>From</label>
                    <input 
                        type="text" 
                        placeholder="Sender name" 
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        style={styles.textInput}
                        disabled={loading}
                    />
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.fieldLabel}>To</label>
                    <input 
                        type="text" 
                        placeholder="Receiver name" 
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        style={styles.textInput}
                        disabled={loading}
                    />
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.fieldLabel}>Address</label>
                    <input 
                        type="text" 
                        placeholder="0x..." 
                        value={toAddress}
                        onChange={(e) => setAddress(e.target.value)}
                        style={styles.textInput}
                        disabled={loading}
                    />
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.fieldLabel}>Amount</label>
                    <input 
                        type="text" 
                        placeholder="0" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={styles.textInput}
                        disabled={loading}
                    />
                </div>
                
                <button 
                    onClick={Transfer} 
                    style={{ 
                        ...styles.actionButton, 
                        backgroundColor: loading ? "#64748b" : "#1e293b",
                        cursor: loading ? "not-allowed" : "pointer"
                    }}
                    disabled={loading}
                >
                    {loading ? "Processing Block..." : "Send"}
                </button>

                {status.type && (
                    <div style={{
                        ...styles.statusBanner,
                        backgroundColor: status.type === "success" ? "#f0fdf4" : "#fef2f2",
                        border: status.type === "success" ? "1px solid #bbf7d0" : "1px solid #fecaca",
                        color: status.type === "success" ? "#166534" : "#991b1b"
                    }}>
                        {status.message}
                    </div>
                )}
            </div>

            <div style={styles.historyCard}>
                <h2 style={styles.panelTitle}>History Ledger</h2>
                {!txns || txns.length === 0 ? (
                    <p style={styles.emptyPrompt}>No transactions found.</p>
                ) : (
                    <div style={styles.ledgerStream}>
                        {[...txns].reverse().map((txn, index) => (
                            <div key={index} style={styles.ledgerRow}>
                                <div style={styles.rowMain}>
                                    <div style={styles.rowTopology}>
                                        <div style={styles.nodeBlock}>
                                            <span style={styles.entityNode}>{txn.senderName}</span>
                                            <span style={styles.addressMeta}>
                                                {txn.fromBank ? `${txn.fromBank.substring(0, 6)}...${txn.fromBank.substring(txn.fromBank.length - 4)}` : "0x00...0000"}
                                            </span>
                                        </div>
                                        <span style={styles.vectorArrow}>&rarr;</span>
                                        <div style={styles.nodeBlock}>
                                            <span style={styles.entityNode}>{txn.receiverName}</span>
                                            <span style={styles.addressMeta}>
                                                {txn.toBank ? `${txn.toBank.substring(0, 6)}...${txn.toBank.substring(txn.toBank.length - 4)}` : "0x00...0000"}
                                            </span>
                                        </div>
                                    </div>
                                    <span style={styles.tokenVolume}>{txn.amount} BoB</span>
                                </div>
                                <div style={styles.hashRow}>
                                    <span style={styles.hashLabel}>TXID:</span>
                                    <span style={styles.hashValue}>
                                        {txn.hash ? `${txn.hash.substring(0, 12)}...${txn.hash.substring(txn.hash.length - 8)}` : "Internal Genesis Block"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    dashboardContainer: {
        display: "flex",
        gap: "2rem",
        flexWrap: "wrap",
        width: "100%",
    },
    panelCard: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "2rem",
        flex: "1 1 380px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    },
    historyCard: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "2rem",
        flex: "1.5 1 380px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    },
    panelTitle: {
        fontSize: "1.15rem",
        fontWeight: "600",
        color: "#1e293b",
        margin: "0 0 1.5rem 0",
        paddingBottom: "0.5rem",
        borderBottom: "1px solid #f1f5f9",
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "0.3rem",
        marginBottom: "1.25rem",
    },
    fieldLabel: {
        fontSize: "0.85rem",
        fontWeight: "500",
        color: "#64748b",
    },
    textInput: {
        padding: "0.75rem 0.85rem",
        border: "1px solid #cbd5e1",
        borderRadius: "6px",
        fontSize: "0.9rem",
        color: "#334155",
        outline: "none",
        backgroundColor: "#fff",
    },
    actionButton: {
        padding: "0.85rem",
        color: "#ffffff",
        border: "none",
        borderRadius: "6px",
        fontSize: "0.9rem",
        fontWeight: "500",
        marginTop: "0.5rem",
        transition: "background-color 0.2s ease",
    },
    statusBanner: {
        marginTop: "1rem",
        padding: "0.75rem 1rem",
        borderRadius: "6px",
        fontSize: "0.85rem",
        fontWeight: "500",
        textAlign: "center",
    },
    emptyPrompt: {
        color: "#94a3b8",
        fontStyle: "italic",
        fontSize: "0.9rem",
        textAlign: "center",
        margin: "2rem 0",
    },
    ledgerStream: {
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        maxHeight: "480px",
        overflowY: "auto",
    },
    ledgerRow: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        padding: "1rem",
        backgroundColor: "#f8fafc",
        border: "1px solid #f1f5f9",
        borderRadius: "6px",
    },
    rowMain: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    rowTopology: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
    },
    nodeBlock: {
        display: "flex",
        flexDirection: "column",
        gap: "0.1rem",
    },
    entityNode: {
        fontWeight: "500",
        color: "#334155",
        fontSize: "0.9rem",
    },
    addressMeta: {
        fontFamily: "monospace",
        fontSize: "0.75rem",
        color: "#94a3b8",
    },
    vectorArrow: {
        color: "#cbd5e1",
        fontWeight: "bold",
    },
    tokenVolume: {
        fontWeight: "600",
        color: "#0f172a",
        fontSize: "0.95rem",
    },
    hashRow: {
        display: "flex",
        gap: "0.25rem",
        alignItems: "center",
        borderTop: "1px dashed #e2e8f0",
        paddingTop: "0.4rem",
        marginTop: "0.2rem",
    },
    hashLabel: {
        fontSize: "0.7rem",
        fontWeight: "600",
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.02em",
    },
    hashValue: {
        fontFamily: "monospace",
        fontSize: "0.75rem",
        color: "#64748b",
    }
};