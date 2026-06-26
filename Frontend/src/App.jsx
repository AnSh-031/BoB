import { useEffect, useState } from "react";

import Login from "./Pages/Login";
import ChangePassword from "./Pages/ChangePassword";
import Dashboard from "./Pages/Dashboard";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [mustChangePassword, setMustChangePassword] = useState(false);

    const [email, setEmail] = useState("");
    const [activeBank, setActiveBank] = useState("");
    const [operatorEmail, setOperatorEmail] = useState("");
    const [role, setRole] = useState("");

    const [currentPage, setCurrentPage] = useState("dashboard");

    useEffect(() => {
        const token = localStorage.getItem("bank_token");
        const savedBank = localStorage.getItem("bank_name");
        const savedEmail = localStorage.getItem("bank_email");
        const savedRole = localStorage.getItem("bank_role");

        if (token) {
            setIsAuthenticated(true);
            setActiveBank(savedBank || "");
            setOperatorEmail(savedEmail || "");
            setRole(savedRole || "");
        }
    }, []);

    if (mustChangePassword) {
        return (
            <ChangePassword
                email={email}
                setMustChangePassword={setMustChangePassword}
            />
        );
    }

    if (!isAuthenticated) {
        return (
            <Login
                setIsAuthenticated={setIsAuthenticated}
                setMustChangePassword={setMustChangePassword}
                setEmail={setEmail}
                setActiveBank={setActiveBank}
                setOperatorEmail={setOperatorEmail}
                setRole={setRole}
                setCurrentPage={setCurrentPage}
            />
        );
    }

    return (
        <Dashboard
            activeBank={activeBank}
            operatorEmail={operatorEmail}
            role={role}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            setIsAuthenticated={setIsAuthenticated}
            setActiveBank={setActiveBank}
            setOperatorEmail={setOperatorEmail}
        />
    );
}

export default App;