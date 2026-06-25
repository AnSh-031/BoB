import axios from "axios";
import { useState } from "react";
import "../Components/Dashboard.css";

export default function ChangePassword({
    email,
    setMustChangePassword
}) {
    const [tempPassword, setTempPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    async function handlePasswordChange(e) {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            await axios.post(
                "http://localhost:5001/api/v1/auth/change-password",
                {
                    email,
                    tempPassword,
                    newPassword
                }
            );

            alert(
                "Password changed successfully. Please login again."
            );

            setMustChangePassword(false);

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.error ||
                "Password update failed"
            );
        }
    }

    return (
        <div className="login-root">

            <form
                onSubmit={handlePasswordChange}
                className="login-card"
            >
                <h2>
                    First Login Security Setup
                </h2>

                <p className="sub">
                    You must change your temporary password.
                </p>

                <div className="field">
                    <label>
                        Temporary Password
                    </label>

                    <input
                        type="password"
                        value={tempPassword}
                        onChange={(e) =>
                            setTempPassword(
                                e.target.value
                            )
                        }
                        required
                    />
                </div>

                <div className="field">
                    <label>
                        New Password
                    </label>

                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) =>
                            setNewPassword(
                                e.target.value
                            )
                        }
                        required
                    />
                </div>

                <div className="field">
                    <label>
                        Confirm Password
                    </label>

                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(
                                e.target.value
                            )
                        }
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="login-btn"
                >
                    Update Password
                </button>

            </form>

        </div>
    );
}