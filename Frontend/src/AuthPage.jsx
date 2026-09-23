import React, { useState } from "react";
import { api, setToken } from "./utils/api";
import "./AuthPage.css";

export default function AuthPage({ onAuthSuccess, onAuth }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const path = isSignup ? "/api/auth/signup" : "/api/auth/login";
    const body = isSignup ? { name, email, password } : { email, password };

    try {
      const res = await api.post(path, body);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setToken(data.token);
      
      // Call whichever handler prop App.jsx passed
      const handleSuccess = onAuthSuccess || onAuth;
      if (handleSuccess) {
        handleSuccess(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Panel: Showcase & AI Features */}
      <div className="auth-left-panel">
        <div className="brand-header">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="currentColor" />
            </svg>
          </div>
          <span className="brand-name">Amanuensis AI</span>
        </div>

        <div className="hero-content">
          <div className="preview-card">
            <div className="preview-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
              <span className="preview-title">Amanuensis Stream Engine v2.4</span>
            </div>
            <div className="preview-body">
              <div className="ai-message">
                <span className="badge">Groq Llama-3</span>
                <p>Streaming tokens at ultra-fast speeds with zero UI latency...</p>
              </div>
              <div className="metric-pills">
                <div className="pill">
                  <span className="label">TTFT</span>
                  <span className="val">&lt; 45ms</span>
                </div>
                <div className="pill">
                  <span className="label">Context</span>
                  <span className="val">128k Tokens</span>
                </div>
                <div className="pill">
                  <span className="label">SSE Streaming</span>
                  <span className="val active">Active</span>
                </div>
              </div>
            </div>
          </div>

          <h1 className="hero-title">Experience Next-Gen AI Performance</h1>
          <p className="hero-subtitle">
            Engineered for high-speed token inference, real-time Server-Sent Events, and instant contextual memory.
          </p>

          <ul className="feature-list">
            <li>
              <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span><strong>Sub-50ms Token Latency</strong> powered by native SSE streaming</span>
            </li>
            <li>
              <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span><strong>Persistent Thread History</strong> backed by MongoDB Atlas</span>
            </li>
            <li>
              <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span><strong>Groq LPInference Engine</strong> vs traditional REST delays</span>
            </li>
            <li>
              <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span><strong>Secure JWT Authentication</strong> & encrypted token store</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Panel: Form Area */}
      <div className="auth-right-panel">
        <div className="form-wrapper">
          <div className="form-header">
            <h2>{isSignup ? "Create an account" : "Welcome back"}</h2>
            <p>{isSignup ? "Sign up to start chatting with Amanuensis AI" : "Sign in to pick up where you left off."}</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {isSignup && (
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-field">
                  <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    placeholder="e.g. Aman Sinha"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label>Email address</label>
              <div className="input-field">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-field">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type="password"
                  placeholder={isSignup ? "Min. 6 characters" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Processing..." : isSignup ? "Create free account" : "Log in"}
            </button>
          </form>

          <div className="form-footer">
            <p>
              {isSignup ? "Already have an account?" : "New here?"}{" "}
              <button
                type="button"
                className="toggle-btn"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError("");
                }}
              >
                {isSignup ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}