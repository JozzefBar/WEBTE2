import { createContext, useContext, useEffect, useState } from "react"
import { getMe, logout as apiLogout } from "/..api/api"

const AuthContext = createContext(null)
export function AuthProvide({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    //ask if somebody is already logged in
    useEffect(() => {
        getMe()
            .then(res => setUser(res.authenticated && res.user ? res.user : 
                null ))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    const logout = async () => {
        await apiLogout()
        setUser(null)
    }

    return (
        <AuthContext.Provider value = {{user, loading, setUser, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if(!ctx) throw new Error("useAuth must be used within AuthProvider")
    return ctx
}