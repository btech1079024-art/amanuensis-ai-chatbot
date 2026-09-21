import "./AuthPage.css";
import { useState } from "react";
import Logo from "./Logo.jsx";
import { api, setToken } from "./utils/api.js";

function AuthPage({ onAuth }) {
    const [mode, setMode] = useState("login"); // "login" | "signup"
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const isSignup = mode === "signup";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (isSignup && !name.trim()) {
            setError("Please enter your name.");
            return;
        }
        if (!email.trim() || !password) {
            setError("Please fill in every field.");
            return;
        }

        setLoading(true);
        try {
            const path = isSignup ? "/api/auth/signup" : "/api/auth/login";
            const body = isSignup ? { name, email, password } : { email, password };
            const response = await api.post(path, body);
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Something went wrong. Please try again.");
                setLoading(false);
                return;
            }

            setToken(data.token);
            onAuth(data.user);
        } catch (err) {
            console.log(err);
            setError("Couldn't reach the server. Is the backend running?");
            setLoading(false);
        }
    };

    const switchMode = () => {
        setMode(isSignup ? "login" : "signup");
        setError("");
    };

    return (
        <div className="authPage">
            <div className="authBlobs" aria-hidden="true">
                <span className="authBlob authBlob--a" />
                <span className="authBlob authBlob--b" />
            </div>

            <form className="authCard" onSubmit={handleSubmit}>
                <Logo size={44} animated />
                <h1 className="authTitle">{isSignup ? "Create your account" : "Welcome back"}</h1>
                <p className="authSub">
                    {isSignup
                        ? "Amanuensis remembers your conversations."
                        : "Sign in to pick up where you left off."}
                </p>

                {isSignup && (
                    <label className="authField">
                        <span>Name</span>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="name"
                            placeholder="Your name"
                        />
                    </label>
                )}

                <label className="authField">
                    <span>Email</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        placeholder="you@example.com"
                    />
                </label>

                <label className="authField">
                    <span>Password</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={isSignup ? "new-password" : "current-password"}
                        placeholder="••••••••"
                    />
                </label>

                {error && <p className="authError">{error}</p>}

                <button type="submit" className="authSubmit" disabled={loading}>
                    {loading ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
                </button>

                <p className="authSwitch">
                    {isSignup ? "Already have an account?" : "New here?"}{" "}
                    <button type="button" onClick={switchMode}>
                        {isSignup ? "Log in" : "Sign up"}
                    </button>
                </p>
            </form>
        </div>
    );
}

export default AuthPage;