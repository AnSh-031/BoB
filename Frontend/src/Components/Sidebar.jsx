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
                        setCurrentPage(
                            "dashboard"
                        )
                    }
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>

                        <polyline points="14 2 14 8 20 8"></polyline>

                        <line
                            x1="16"
                            y1="13"
                            x2="8"
                            y2="13"
                        ></line>

                        <line
                            x1="16"
                            y1="17"
                            x2="8"
                            y2="17"
                        ></line>

                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>

                    Ledger Records
                </div>

                <div className="nav-item">
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="17 1 21 5 17 9"></polyline>

                        <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>

                        <polyline points="7 23 3 19 7 15"></polyline>

                        <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                    </svg>

                    Settlements
                </div>

                <div className="nav-item">
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>

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
                            {bankShort} Node ·
                            Operator
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