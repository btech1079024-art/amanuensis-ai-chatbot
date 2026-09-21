import "./App.css";
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import AuthPage from "./AuthPage.jsx";
import Logo from "./Logo.jsx";
import { MyContext } from "./MyContext.jsx";
import { useState, useEffect } from "react";
import { v1 as uuidv1 } from "uuid";
import { api, getToken, setToken } from "./utils/api.js";

const THEME_KEY = "amanuensis-theme";

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]); // all chats of current thread
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "violet";
    return localStorage.getItem(THEME_KEY) || "violet";
  });

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Apply + persist the chosen theme.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // On load: if a token is stored, ask the backend whether it's still good
  // and fetch the user it belongs to. Otherwise skip straight to the login
  // screen instead of flashing the main app first.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCheckingAuth(false);
      return;
    }
    (async () => {
      try {
        const response = await api.get("/api/auth/me");
        if (!response.ok) throw new Error("Session expired");
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setToken(null);
      } finally {
        setCheckingAuth(false);
      }
    })();
  }, []);

  // Any request that comes back 401 mid-session (expired token, etc.) drops
  // the user back to the login screen instead of failing silently.
  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener("amanuensis-unauthorized", handleUnauthorized);
    return () => window.removeEventListener("amanuensis-unauthorized", handleUnauthorized);
  }, []);

  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setPrompt("");
    setReply(null);
    setPrevChats([]);
    setAllThreads([]);
    setNewChat(true);
    setCurrThreadId(uuidv1());
  };

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allThreads, setAllThreads,
    sidebarOpen, setSidebarOpen,
    theme, setTheme,
    user, onLogout: handleLogout,
  };

  if (checkingAuth) {
    return (
      <div className="app app--centered">
        <Logo size={40} />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuth={handleAuthSuccess} />;
  }

  return (
    <div className="app">
      <MyContext.Provider value={providerValues}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  );
}

export default App;