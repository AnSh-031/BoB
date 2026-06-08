import axios from "axios";
import { useState, useEffect } from "react";
import "./Dashboard.css";

export default function Dashboard() {
    const [txns, setTxn] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState("");
    const [activeBank, setActiveBank] = useState("");
    const [operatorEmail, setOperatorEmail] = useState("");

    const totalTransactions = txns ? txns.length : 0;
    const totalVolume = txns ? txns.reduce((sum, txn) => sum + parseFloat(txn.amount || 0), 0) : 0;

    useEffect(() => {
        const token = localStorage.getItem("bank_token");
        const savedBank = localStorage.getItem("bank_name");
        const savedEmail = localStorage.getItem("bank_email");
        if (token) {
            setIsAuthenticated(true);
            setActiveBank(savedBank || "Auditor Node");
            setOperatorEmail(savedEmail || "");
            fetchLedgerHistory(token);
        }
    }, []);

    async function handleLogin(e) {
        e.preventDefault();
        setAuthError("");
        try {
            const res = await axios.post("http://localhost:5001/api/v1/auth/login", { email, password });
            localStorage.setItem("bank_token", res.data.token);
            localStorage.setItem("bank_name", res.data.bank);
            localStorage.setItem("bank_email", email);
            setIsAuthenticated(true);
            setActiveBank(res.data.bank);
            setOperatorEmail(email);
            fetchLedgerHistory(res.data.token);
        } catch (err) {
            setAuthError(err.response?.data?.error || "Authentication failed");
        }
    }

    async function fetchLedgerHistory(token) {
        try {
            const response = await axios.get("http://localhost:5001/api/v1/history", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTxn(Array.isArray(response.data.Transactions) ? response.data.Transactions : []);
        } catch (err) {
            console.error(err.message);
            handleLogout();
        }
    }

    function handleLogout() {
        localStorage.removeItem("bank_token");
        localStorage.removeItem("bank_name");
        localStorage.removeItem("bank_email");
        setIsAuthenticated(false);
        setTxn([]);
        setActiveBank("");
        setOperatorEmail("");
    }

    const initials = operatorEmail ? operatorEmail.substring(0, 2).toUpperCase() : "OP";
    const bankShort = activeBank ? activeBank.substring(0, 2).toUpperCase() : "BK";

    if (!isAuthenticated) {
        return (
            <div className="login-root">
                <style>{`#root{max-width:100vw!important;padding:0!important;margin:0!important;text-align:left!important}`}</style>
                <form onSubmit={handleLogin} className="login-card">
                    <div className="login-logo">BoB</div>
                    <h2>Welcome back</h2>
                    <p className="sub">Interbank Settlement Clearing Terminal</p>
                    {authError && <div className="login-error">{authError}</div>}
                    <div className="field-group">
                        <div className="field">
                            <label>Security Email</label>
                            <input 
                                type="email" 
                                placeholder="operator@bank.res.in" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="field">
                            <label>Access Passphrase</label>
                            <input 
                                type="password" 
                                placeholder="••••••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>
                    <button type="submit" className="login-btn">Authenticate Core Node</button>
                    <div className="login-divider"><span>Secured · Encrypted · Private</span></div>
                </form>
            </div>
        );
    }

    return (
        <div className="app-shell">
            <style>{`#root{max-width:100vw!important;padding:0!important;margin:0!important;text-align:left!important;display:flex!important}`}</style>
            
            {/* SIDEBAR */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">BoB</div>
                    <div className="brand-text">
                        <h3>BoB Systems</h3>
                        <p>Consortium Ledger</p>
                    </div>
                </div>

                <div className="sidebar-section-label">Navigation</div>
                <nav className="sidebar-nav">
                    <div className="nav-item active">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Ledger Records
                    </div>
                    <div className="nav-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                        Settlements
                    </div>
                    <div className="nav-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        Integrity Audit
                    </div>
                </nav>

                <div className="sidebar-divider" />

                <div className="sidebar-section-label">Infrastructure Peers</div>
                <div className="node-card">
                    <div className="nc-label">Live Nodes</div>
                    <div className="node-list">
                        {["State Bank of India", "HDFC Clearing Hub", "ICICI Core Vault", "Axis Liquidity"].map((n, i) => (
                            <div key={i} className="node-item">
                                <span className="node-item-name">{n}</span>
                                <span className="node-dot" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sidebar-bottom">
                    <div className="sidebar-user">
                        <div className="user-avatar">{initials}</div>
                        <div className="user-info">
                            <div className="u-name">{operatorEmail}</div>
                            <div className="u-role">{bankShort} Node · Operator</div>
                        </div>
                        <button className="logout-icon-btn" onClick={handleLogout} title="Disconnect">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN */}
            <main className="main-content">
                <div className="top-bar">
                    <div>
                        <h1>Transaction Ledger</h1>
                        <p className="tb-sub">{activeBank} · Private Consortium Clearing</p>
                    </div>
                    <div className="status-pill">
                        <span className="status-pill-dot" />
                        Consensus Verified
                    </div>
                </div>

                <div className="metrics-row">
                    <div className="metric-card">
                        <div className="mc-val">{totalTransactions}</div>
                        <div className="mc-label">Total Tracked Events</div>
                        <div className="mc-bar blue" />
                    </div>
                    <div className="metric-card">
                        <div className="mc-val">
                            ₹{totalVolume >= 1e7
                                ? (totalVolume / 1e7).toFixed(2) + "Cr"
                                : totalVolume >= 1e5
                                ? (totalVolume / 1e5).toFixed(2) + "L"
                                : totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="mc-label">Settled Capacity (INR)</div>
                        <div className="mc-bar teal" />
                    </div>
                    <div className="metric-card">
                        <div className="mc-val">100%</div>
                        <div className="mc-label">Consensus Integrity</div>
                        <div className="mc-bar green" />
                    </div>
                </div>

                <div className="ledger-panel">
                    <div className="ledger-header">
                        <div>
                            <h2>Consolidated Ledger Stream</h2>
                            <span className="lh-count">{totalTransactions} entries · real-time</span>
                        </div>
                        <span className="ledger-badge">LIVE</span>
                    </div>

                    <div className="ledger-scroll">
                        {!txns || txns.length === 0 ? (
                            <div className="ledger-empty">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#475569', marginBottom: '8px'}}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                <span>No transaction entries on this ledger stream</span>
                            </div>
                        ) : (
                            [...txns].reverse().map((txn, index) => (
                                <div key={index} className="txn-row">
                                    <div className="txn-arrow-indicator">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                                    </div>
                                    <div className="txn-main">
                                        <div className="txn-parties">
                                            <span>{txn.senderName || "Unknown Remitter"}</span>
                                            <span className="txn-arrow">&rarr;</span>
                                            <span className="recv">{txn.receiverName || "Unknown Beneficiary"}</span>
                                        </div>
                                        <div className="txn-hash">
                                            {txn.hash || "GENESIS_ROOT_AUTHENTICATION_LOG"}
                                        </div>
                                    </div>
                                    <div className="txn-amount-col">
                                        <div className="txn-amount">
                                            ₹{parseFloat(txn.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </div>
                                        <div className="txn-currency">INR</div>
                                    </div>
                                    <span className="txn-secure">SECURE</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}