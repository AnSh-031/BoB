import "../Components/Dashboard.css";

export default function Sidebar({
    activeBank,
    operatorEmail,
    role,
    currentPage,
    setCurrentPage,
    handleLogout
}) {
    const initials = operatorEmail
        ? operatorEmail.substring(0, 2).toUpperCase()
        : "OP";

    const bankShort = activeBank
        ? activeBank.substring(0, 2).toUpperCase()
        : "BK";

    const displayRole = role
        ? role.replace("BANK_", "").replace("_", " ")
        : "OPERATOR";

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-icon">BoB</div>

                <div className="brand-text">
                    <h3>BoB Systems</h3>
                    <p>Consortium Ledger</p>
                </div>
            </div>

            <div className="sidebar-section-label">
                Navigation
            </div>

            <nav className="sidebar-nav">
                <div
                    className={`nav-item ${
                        currentPage === "dashboard"
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        setCurrentPage("dashboard")
                    }
                >
                    Ledger Records
                </div>

                {(role === "BANK_ADMIN" ||
                role === "BANK_AUDITOR") && (
                    <div
                        className={`nav-item ${
                            currentPage === "auditLogs"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            setCurrentPage("auditLogs")
                        }
                    >
                        Audit Logs
                    </div>
                )}

                <div className="nav-item">
                    Settlements
                </div>

                <div className="nav-item">
                    Integrity Audit
                </div>
            </nav>

            <div className="sidebar-divider" />

            <div className="sidebar-section-label">
                Infrastructure Peers
            </div>

            <div className="node-card">
                <div className="nc-label">
                    Live Nodes
                </div>

                <div className="node-list">
                    {[
                        "State Bank of India",
                        "HDFC Clearing Hub",
                        "ICICI Core Vault",
                        "Axis Liquidity"
                    ].map((n, i) => (
                        <div
                            key={i}
                            className="node-item"
                        >
                            <span className="node-item-name">
                                {n}
                            </span>

                            <span className="node-dot" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="sidebar-bottom">
                <div className="sidebar-user">
                    <div className="user-avatar">
                        {initials}
                    </div>

                    <div className="user-info">
                        <div className="u-name">
                            {operatorEmail}
                        </div>

                        <div className="u-role">
                            {bankShort} Node · {displayRole}
                        </div>
                    </div>

                    <button
                        className="logout-icon-btn"
                        onClick={handleLogout}
                        title="Disconnect"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>

                            <polyline points="16 17 21 12 16 7"></polyline>

                            <line
                                x1="21"
                                y1="12"
                                x2="9"
                                y2="12"
                            ></line>
                        </svg>
                    </button>
                </div>
            </div>
        </aside>
    );
}