import { useEffect, useState } from "react";
import { adminApi} from "../api/client"
import { useAuth } from "../auth/AuthContext";
import type {User} from "../types/auth"

export default function AdminPanel() {
    const {user: currentUser} = useAuth()
    const [ users, setUsers] = useState<User[]>([])
    const [message, setMessage] = useState<string | null>(null)

    useEffect( () => {
        adminApi.listUsers().then( (res: any) => setUsers(res.data))
    }, [])

    const handleRoleChange = async (userId:string, newRole: string) => {
        await adminApi.changeRole(userId, newRole)
        setUsers ((list) => 
        list.map( (u) => (u.id === userId ? {...u, role:newRole as "user" | "admin"} : u))
    )
    setMessage("role updated")
    setTimeout( () => setMessage(null), 2000) 
    }
    
    const handleDeactivate = async (userId: string, username: string) => {
    if (!confirm(`Deactivate user "${username}"?`)) return;
    await adminApi.deactivateUser(userId);
    setUsers((list) =>
      list.map((u) => (u.id === userId ? { ...u, is_active: false } : u))
    );
  };

  return (
    <div className="page">
        <header className="page-header">
            <h1>Admin panel</h1>
            <a href="/dashboard"> Back to dashboard</a>
        </header>

        { message && <div className="success-banner">{message}</div>}

        <section className="card">
            <h2>All users</h2>
            <table className="key-table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map( (u) => (
                        <tr key={u.id} style={{opacity: u.is_active ?1 : 0.5}}>
                            <td>{u.username} {u.id === currentUser?.id && <em>(you)</em>}</td>
                            <td>{u.email}</td>
                            <td>
                                <select
                                    value={u.role}
                                    disabled={u.id === currentUser?.id}
                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                >
                                    <option value="user">user</option>
                                    <option value="admin">admin</option>
                                </select>
                            </td>
                            <td>{u.is_active ? "Active" : "Inactive"}</td>
                            <td>
                                {u.is_active && u.id !== currentUser?.id && (
                                    <button className="btn-danger" onClick={() => handleDeactivate(u.id, u.username)}>
                                    Deactivate
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    </div>
  )
}