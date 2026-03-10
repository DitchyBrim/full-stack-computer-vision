import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {authApi} from "../api/client"
import type { AuthContextType, AuthState, LoginCredentials, User } from "../types/auth";

const AuthContext = createContext<AuthContextType | null>(null)

const INITIAL_STATE: AuthState = {
    user:null,
    token: null,
    isLoading: true,
    error: null,
}

export function AuthProvider({ children}: {children: ReactNode}) {
    const [state, setState] = useState<AuthState>(INITIAL_STATE)

    // rehydrate from localstorage on app load
    useEffect(() => {
        const token = localStorage.getItem("access_token")
        if (!token) {
            setState( (s) => ({...s, isLoading: false}))
            return
        }
        //  verify token
        authApi
            .getMe()
            .then( (res) => {
                setState({ user: res.data as User, token, isLoading: false, error: null})
            })
            .catch ( () => {
                localStorage.removeItem("access_token")
                setState({user: null, token: null, isLoading: false, error:null})
            })
    }, [])

    //  login
    const login = async (credentials: LoginCredentials) => {
        setState( (s) => ({...s, isLoading: true, error:null}))
        try {
            const res = await authApi.login(credentials.username, credentials.password)
            const { access_token} = res.data

            localStorage.setItem("access_token", access_token)

            //  fetch full user profile
            const meRes = await authApi.getMe();
            setState({ user:meRes.data as User, token: access_token, isLoading: false, error:null})
        } catch (err: any) {
            const message = err.response?.data?.detail ?? "Login failed";
            setState( (s) => ({ ...s, isLoading: false, error: message}))
            throw err
        }
    }

    // logout
    const logout = () => {
        localStorage.removeItem("access_token")
        setState( {user: null, token: null, isLoading: false, error:null})
    }

    const clearError = () => setState((s) => ({ ...s, error: null}))

    return (
        <AuthContext.Provider value={{ ...state, login, logout, clearError}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() : AuthContextType {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be inside authprovider")
        return ctx
}