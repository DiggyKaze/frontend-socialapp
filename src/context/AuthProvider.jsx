import {useState} from "react";
import {AuthContext} from "./AuthContext";
import {API_BASE_URL} from "../config/api";

export const AuthProvider = ({children}) => {
    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    const [userId, setUserId] = useState(
        localStorage.getItem("userId")
    );

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
        localStorage.setItem("token", data.token);

        // userId (STRING!)
        setUserId(data.userID);
        localStorage.setItem("userId", data.userID);

        console.log("Auth userId:", data.userID, typeof data.userID);
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
