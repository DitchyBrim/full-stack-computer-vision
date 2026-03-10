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
    
    // const handleDeleteKey = async (keyId: string) => {
    //     await authApi.deleteApiKey(keyId);
    //     setApiKeys( (keys) => keys.filter((k) => k.id !== keyId))
    // }
    const handleDeleteKey = async (keyId: string, keyName: string) => {
        const confirmed = window.confirm(
            `Revoke API key "${keyName}"?\n\nThis cannot be undone. Any scripts using this key will stop working immediately.`
        )
        if (!confirmed) return

        await authApi.deleteApiKey(keyId)
        setApiKeys((keys) => keys.filter((k) => k.id !== keyId))
        }

    return  (
    <div className="page">
      {/* <header className="page-header">
        <h1>Dashboard</h1>
        <div className="header-right">
          <span className="role-badge role-badge--{user?.role}">{user?.role}</span>
          <span>{user?.username}</span>
          {user?.role === "admin" && <a href="/admin">Admin Panel →</a>}
          <button onClick={logout}>Logout</button>
        </div>
      </header> */}

      {/* Profile */}
      <section className="card">
        <h2>Your Profile</h2>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Username:</strong> {user?.username}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>Member since:</strong> {new Date(user?.created_at ?? "").toLocaleDateString()}</p>
      </section>

      {/* API Keys */}
      <section className="card">
        <h2>API Keys</h2>
        <p className="hint">Use these keys to call image processing endpoints with the <code>X-API-Key</code> header.</p>

        {/* Create new key */}
        <div className="key-create-row">
          <input
            type="text"
            placeholder="Key name (e.g. my-script)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
          <select value={newKeyScope} onChange={(e) => setNewKeyScope(e.target.value as "read" | "write")}>
            <option value="read">read</option>
            <option value="write">write</option>
          </select>
          <button onClick={handleCreateKey} disabled={loading}>
            {loading ? "Creating..." : "+ Generate Key"}
          </button>
        </div>

        {/* One-time key reveal */}
        {createdKey && (
          <div className="key-reveal">
            <strong>Save this key now — it won't be shown again</strong>
            <div className="key-reveal-row">
              <code>{createdKey.key}
              <button className="btn-copy" onClick={handleCopy}>{copied? "Copied" :"Copy Key"}</button>
              </code>
              <div className="key-reveal-actions">
              </div>
            </div>
              <button onClick={() => setCreatedKey(null)}>Dismiss</button>
          </div>
        )}

        {/* Existing keys */}
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
                    <button className="btn-danger" onClick={() => handleDeleteKey(key.id, key.name ?? "Unnamed")}>
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
  );
}