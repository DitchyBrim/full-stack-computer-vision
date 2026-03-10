import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { authApi } from "../api/client";
import type { APIKey, APIKeyCreated } from "../types/auth";

export default function Dashboard() {
    const {user, logout} = useAuth()
    const [apiKeys, setApiKeys] = useState<APIKey[]>([])
    const [newKeyName, setNewKeyName] = useState("")
    const [newKeyScope, setNewKeyScope] = useState<"read" | "write">("write")
    const [createdKey, setCreatedKey] = useState<APIKeyCreated | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false)

    useEffect( () => {
        authApi.getApiKeys().then( (res) => setApiKeys(res.data))
    }, [])

    const handleCreateKey = async () => {
        if (!newKeyName.trim() ) return;
        setLoading(true);
        try {
            const res = await authApi.createApiKey(newKeyName, newKeyScope);
            setCreatedKey(res.data)
            setNewKeyName("");
            //  refresh key list
            const listRes = await authApi.getApiKeys();
            setApiKeys(listRes.data)
        } finally {
            setLoading(false);
        }
    }
    const handleDeleteKey = async (keyId: string) => {
        await authApi.deleteApiKey(keyId);
        setApiKeys( (keys) => keys.filter((k) => k.id !== keyId))
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(createdKey.key)
            alert ("Key copied")
        } catch (err) {
            console.error("Failed to copy", err)
        }
    }
    const handleCopy = async () => {
        await navigator.clipboard.writeText(createdKey.key)
        setCopied(true)
        //  reset button text after 2 seconds
        setTimeout( () => setCopied(false), 2000)
    }

    return  (
        <div className="page">
            <header className="page-header">
                <h1>Dashboard</h1>
                <div className="header-right">
                    <span className="role-badge role-badge--{user?.role?">{user?.role}</span>
                    <span>{user?.username}</span>
                    {user?.role === "admin" && <a href="/admin">Admin Panel</a>}
                    <button onClick={logout}>Logout</button>
                </div>
            </header>

            {/* Profile */}
            <section className="card">
                <h2>Your Profile</h2>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Role:</strong> {user?.role}</p>
                <p><strong>Member since:</strong> {new Date(user?.created_at ?? "").toLocaleDateString()}</p>

            {/* API keys */}
            <section className="card">
                <h2>API keys</h2>
                <p className="hint">use these keys to call iamge processing endpoints with <code>X-API-Key</code>header</p>

                {/* Create api key */}
                <div className="key-create-row"></div>
                <input 
                    type="text"
                    placeholder="Key name"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}/>
            </section>
            <select value={newKeyScope} onChange={(e) => setNewKeyScope(e.target.value as "read" | "write")}>
                <option value="read">read</option>
                <option value="write">write</option>
            </select>
            <button onClick={handleCreateKey} disabled={loading}>
                {loading ? "Creating..." : "+ Generate key"}
            </button>

            {createdKey && (
                <div className="key-reveal"> 
                    <strong>Save this key now. it won't be shown again</strong>
                    <code>{createdKey.key}</code>
                    <button onClick={() => setCreatedKey(null)}>Dismiss</button>
                </div>
            )}
            {/* Existingkeys */}
            {apiKeys.length === 0 ? (
                <p>No API keys yet.</p>
            ) : (
                <table className="key-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Scope</th>
                <th>Last Used</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((key) => (
                  <tr key={key.id}>
                  <td>{key.name ?? "—"}</td>
                  <td><span className="scope-badge">{key.scope}</span></td>
                  <td>{key.last_used ? new Date(key.last_used).toLocaleDateString() : "Never"}</td>
                  <td>{new Date(key.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-danger" onClick={() => handleDeleteKey(key.id)}>
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </section>
        </div>
    )
}