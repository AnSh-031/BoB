import "../Components/Dashboard.css";

export default function History({
    txns,
    activeBank,
    totalTransactions,
    totalVolume
}) {
    return (
        <main className="main-content">
            <div className="top-bar">
                <div>
                    <h1>
                        Transaction Ledger
                    </h1>

                    <p className="tb-sub">
                        {activeBank} · Private
                        Consortium Clearing
                    </p>
                </div>

                <div className="status-pill">
                    <span className="status-pill-dot" />
                    Consensus Verified
                </div>
            </div>

            <div className="metrics-row">

                <div className="metric-card">
                    <div className="mc-val">
                        {totalTransactions}
                    </div>

                    <div className="mc-label">
                        Total Tracked Events
                    </div>

                    <div className="mc-bar blue" />
                </div>

                <div className="metric-card">
                    <div className="mc-val">
                        ₹
                        {totalVolume >= 1e7
                            ? (
                                  totalVolume /
                                  1e7
                              ).toFixed(2) +
                              "Cr"
                            : totalVolume >=
                              1e5
                            ? (
                                  totalVolume /
                                  1e5
                              ).toFixed(2) +
                              "L"
                            : totalVolume.toLocaleString(
                                  "en-IN",
                                  {
                                      minimumFractionDigits: 2
                                  }
                              )}
                    </div>

                    <div className="mc-label">
                        Settled Capacity
                        (INR)
                    </div>

                    <div className="mc-bar teal" />
                </div>

                <div className="metric-card">
                    <div className="mc-val">
                        100%
                    </div>

                    <div className="mc-label">
                        Consensus Integrity
                    </div>

                    <div className="mc-bar green" />
                </div>

            </div>

            <div className="ledger-panel">

                <div className="ledger-header">
                    <div>
                        <h2>
                            Consolidated Ledger
                            Stream
                        </h2>

                        <span className="lh-count">
                            {
                                totalTransactions
                            }{" "}
                            entries ·
                            real-time
                        </span>
                    </div>

                    <span className="ledger-badge">
                        LIVE
                    </span>
                </div>

                <div className="ledger-scroll">

                    {!txns ||
                    txns.length === 0 ? (
                        <div className="ledger-empty">

                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    color:
                                        "#475569",
                                    marginBottom:
                                        "8px"
                                }}
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                ></circle>

                                <line
                                    x1="12"
                                    y1="8"
                                    x2="12"
                                    y2="12"
                                ></line>

                                <line
                                    x1="12"
                                    y1="16"
                                    x2="12.01"
                                    y2="16"
                                ></line>
                            </svg>

                            <span>
                                No
                                transaction
                                entries on
                                this ledger
                                stream
                            </span>
                        </div>
                    ) : (
                        txns.map(
                            (
                                txn
                            ) => (
                                <div
                                    key={`${txn.hash}-${txn.timeStamp}`}
                                    className="txn-row"
                                >
                                    <div className="txn-arrow-indicator">
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#38BDF8"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>

                                            <polyline points="16 7 22 7 22 13"></polyline>
                                        </svg>
                                    </div>

                                    <div className="txn-main">

                                        <div className="txn-parties">
                                            <span>
                                                {txn.senderName ||
                                                    "Unknown Remitter"}
                                            </span>

                                            <span className="txn-arrow">
                                                →
                                            </span>

                                            <span className="recv">
                                                {txn.receiverName ||
                                                    "Unknown Beneficiary"}
                                            </span>
                                        </div>

                                        <div className="txn-hash">
                                            {txn.hash ||
                                                "GENESIS_ROOT_AUTHENTICATION_LOG"}
                                        </div>

                                    </div>

                                    <div className="txn-amount-col">

                                        <div className="txn-amount">
                                            ₹
                                            {parseFloat(
                                                txn.amount ||
                                                    0
                                            ).toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2
                                                }
                                            )}
                                        </div>

                                        <div className="txn-currency">
                                            INR
                                        </div>

                                    </div>

                                    <span className="txn-secure">
                                        SECURE
                                    </span>

                                </div>
                            )
                        )
                    )}

                </div>

            </div>
        </main>
    );
}