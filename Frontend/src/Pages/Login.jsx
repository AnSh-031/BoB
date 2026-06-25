import axios from "axios";
import { useState } from "react";
import "../Components/Dashboard.css";

export default function Login({
    setIsAuthenticated,
    setMustChangePassword,
    setEmail,
    setActiveBank,
    setOperatorEmail,
    setRole
}) {
    const [email, updateEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState("");

    async function handleLogin(e) {
        e.preventDefault();

        setAuthError("");

        try {
            const res = await axios.post(
                "http://localhost:5001/api/v1/auth/login",
                {
                    email,
                    password
                }
            );

            if (res.data.mustChangePassword) {
                setEmail(email);
                setMustChangePassword(true);
                return;
            }

            localStorage.setItem(
                "bank_token",
                res.data.token
            );

            localStorage.setItem(
                "bank_name",
                res.data.bank
            );

            localStorage.setItem(
                "bank_email",
                email
            );

            localStorage.setItem(
                "bank_role",
                res.data.role
            );

            setIsAuthenticated(true);

            setActiveBank(res.data.bank);

            setOperatorEmail(email);

            setRole(res.data.role);

        } catch (err) {
            setAuthError(
                err.response?.data?.error ||
                "Authentication failed"
            );
        }
    }

    return (
        <div className="login-root">
            <style>
                {`
                #root{
                    max-width:100vw!important;
                    padding:0!important;
                    margin:0!important;
                    text-align:left!important
                }
                `}
            </style>

            <form
                onSubmit={handleLogin}
                className="login-card"
            >
                <div className="login-logo">
                    BoB
                </div>

                <h2>
                    Welcome back
                </h2>

                <p className="sub">
                    Interbank Settlement Clearing Terminal
                </p>

                {authError && (
                    <div className="login-error">
                        {authError}
                    </div>
                )}

                <div className="field-group">

                    <div className="field">
                        <label>
                            Security Email
                        </label>

                        <input
                            type="email"
                            placeholder="operator@bank.res.in"
                            value={email}
                            onChange={(e) =>
                                updateEmail(
                                    e.target.value
                                )
                            }
                            required
                        />
                    </div>

                    <div className="field">
                        <label>
                            Access Passphrase
                        </label>

                        <input
                            type="password"
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            required
                        />
                    </div>

                </div>

                <button
                    type="submit"
                    className="login-btn"
                >
                    Authenticate Core Node
                </button>

                <div className="login-divider">
                    <span>
                        Secured · Encrypted · Private
                    </span>
                </div>

            </form>
        </div>
    );
}