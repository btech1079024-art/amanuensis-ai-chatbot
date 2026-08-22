import "./AuthPage.css";
import { useState, useContext } from "react";
import { MyContext } from "./MyContext.jsx";
import Logo from "./Logo.jsx";

function AuthPage() {
    const { setUser, setToken } = useContext(MyContext);
    const [mode, setMode] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (mode === "signup" && !name.trim()) {
            setError("Please enter your name");
            return;
        }
        if (!email.trim() || !password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
            const body = mode === "login" ? { email, password } : { name, email, password };

            const response = await fetch(`http://localhost:8080${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Something went wrong");
                setLoading(false);
                return;
            }

            localStorage.setItem("amanuensis_token", data.token);
            localStorage.setItem("amanuensis_user", JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);
        } catch (err) {
            console.log(err);
            setError("Could not connect to the server");
        }
        setLoading(false);
    };

    return (
        <div className="authPage">
            <div className="authCard">
                <div className="authLogo">
                    <Logo size={44} />
                </div>
                <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
                <p className="authSub">
                    {mode === "login" ? "Sign in to continue to Amanuensis" : "Get started with Amanuensis"}
                </p>

                <form onSubmit={handleSubmit} className="authForm">
                    {mode === "signup" && (
                        <input
                            type="text"
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && <p className="authError">{error}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Sign up"}
                    </button>
                </form>

                <p className="authToggle">
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                    <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
                        {mode === "login" ? "Sign up" : "Sign in"}
                    </span>
                </p>
            </div>
        </div>
    );
}

export default AuthPage;