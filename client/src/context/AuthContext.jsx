import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";
import React from 'react';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUserState] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('clinicUser')
            if (stored) setUserState(JSON.parse(stored))
        } catch {
            localStorage.removeItem('clinicUser')
        }
        setLoading(false)
    }, []);

    const setUser = (userData) => {
        if (userData) {
            localStorage.setItem('clinicUser', JSON.stringify(userData))
        } else {
            localStorage.removeItem('clinicUser')
        }
        setUserState(userData)
    }

    const login = async (email, password) => {
        const res = await axios.post("/auth/login", { email, password })
        setUser(res.data)
        return res.data
    }

    const register = async (name, email, password) => {
        const res = await axios.post("/auth/register", { name, email, password })
        setUser(res.data)
        return res.data
    }

    const logout = async () => {
        try { await axios.post("/auth/logout") } catch {}
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
           {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);