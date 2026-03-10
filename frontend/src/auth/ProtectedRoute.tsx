import {Navigate, Outlet} from "react-router-dom";
import {useAuth} from "./AuthContext"

interface Props {
    requiredRole?: "user"| "admin"
}

export function ProtectedRoute ({requiredRole} : Props) {
    const { user, token, isLoading} = useAuth();

    //  still checking local storage
    if (isLoading) {
        return <div style={{padding: "2rem"}}>Loading...</div>
    }
    // not logged in 
    if (!token || !user) {
        return <Navigate to="/login" replace/>
    }

    //  logged in but wrong role
    if (requiredRole && user.role !== requiredRole){
        return <Navigate to="/403" replace/>
    }
    return <Outlet/>
}