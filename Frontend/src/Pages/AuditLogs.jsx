import axios from "axios";
import { useEffect, useState } from "react";

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchLogs();
    }, [page]);

    async function fetchLogs() {
        try {
            const token =
                localStorage.getItem(
                    "bank_token"
                );

            const res =
                await axios.get(
                    `http://localhost:5001/api/v1/audit-logs?page=${page}&limit=10`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setLogs(res.data.logs);
            
            setTotalPages(res.data.totalPages);

        } catch (err) {
            console.error(err);
        }
    }

    return (
        <main className="main-content">
            <div className="top-bar">
                <div>
                    <h1>Audit Logs</h1>
                    <p className="tb-sub">
                        System activity records
                    </p>
                </div>
            </div>

            <div className="ledger-panel">
                <div className="ledger-header">
                    <h2>Audit Records</h2>
                </div>

                <div className="ledger-scroll">
                    {logs.length === 0 ? (
                        <div className="ledger-empty">
                            No audit records found.
                        </div>
                    ) : (
                        <div>
                            <table className="audit-table">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Email</th>
                                        <th>Action</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {logs.map((log, index) => (
                                        <tr key={index}>
                                            <td>
                                                {new Date(log.createdAt).toLocaleString(
                                                    "en-IN",
                                                    {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    }
                                                )}
                                            </td>

                                            <td>
                                                {log.email}
                                            </td>

                                            <td>
                                                {log.action}
                                            </td>

                                            <td>
                                                {log.status}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="pagination">
                                <button
                                    disabled={page === 1}
                                    onClick={() =>
                                        setPage(page - 1)
                                    }
                                >
                                    Previous
                                </button>

                                <span>
                                    Page {page} of {totalPages}
                                </span>

                                <button
                                    disabled={page === totalPages}
                                    onClick={() =>
                                        setPage(page + 1)
                                    }
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}