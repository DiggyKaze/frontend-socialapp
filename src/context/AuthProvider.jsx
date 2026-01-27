import {useState} from "react";
import {AuthContext} from "./AuthContext";
import {API_BASE_URL} from "../config/api";

export const AuthProvider = ({children}) => {
    const [token, setToken] = useState(
        localStorage.getItem("token")
    );
    const [userId, setUserId] = useState(() => {
        const stored = localStorage.getItem("userId");
        return stored ? Number(stored) : null;
    });

    const login = async (username, password) => {
        const res = await fetch(`${API_BASE_URL}/request-token`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, password}),
        });

        if (!res.ok) {
            throw new Error("Login failed");
        }

        const data = await res.json();

        // token
        setToken(data.token);
        console.log(data.token);

        setUserId(data.userId);
        const numericUserId = Number(data.userId);
        setUserId(numericUserId);
        console.log(data.userId);

        // Persistera auth-data
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", String(numericUserId));
    };

    const logout = () => {
        setToken(null);
        setUserId(null);

        localStorage.removeItem("token");
        localStorage.removeItem("userId");
    };

    return (
        <AuthContext.Provider value={{token, userId, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};
