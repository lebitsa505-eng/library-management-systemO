
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [membershipId, setMembershipId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(e) {
        e.preventDefault();
        setError("");

        if (!membershipId.trim() || !password) {
            setError("Please enter your membership ID and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        membership_id: membershipId.trim(),
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed.");
            }

            // Store the login session for this browser tab
            sessionStorage.setItem("bookwiseToken", data.token);
            sessionStorage.setItem(
                "bookwiseUser",
                JSON.stringify(data.user)
            );

            navigate("/");
        } catch (err) {
            setError(err.message || "Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <h1>BookWise</h1>
                <p>Library Management System</p>

                <h2>Welcome Back</h2>
                <p>Sign in to access your library dashboard.</p>

                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <label>Membership ID</label>

                    <input
                        type="text"
                        placeholder="Enter membership ID"
                        value={membershipId}
                        onChange={(e) => setMembershipId(e.target.value)}
                        required
                    />

                    <label>Password</label>

                    <div className="password-field">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="login-footer">
                    BookWise Library Management
                </p>
            </div>
        </div>
    );
}

export default Login;
