import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

//  main client
export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {"Content-Type": "application/json"}
})

// attach jwt token from localStorage onevery request
apiClient.interceptors.request.use((config: any) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// if token is expired, remove it from localStorage
apiClient.interceptors.response.use(
    (res: any) => res,
    (err: any) => {
        if (err.response?.status === 401){
            localStorage.removeItem("access_token");
            window.location.href = "/login";
        }
        return Promise.reject(err)
    }
)

// api client 
export const createApiKeyClient = (apiKey: string) => 
    axios.create({
        baseURL: BASE_URL,
        headers: {"X-API-Key": apiKey}
    })

    // auth capi call
    export const authApi = {
        login: (username: string, password: string) => {
            // fastAPI oauth2 expect form data, not JSON
            const form = new URLSearchParams();
            form.append("username", username);
            form.append("password", password);
            // return axios.post(`${BASE_URL}/auth/login`, form, {
            return apiClient.post(`${BASE_URL}/auth/login`, form, {
                headers: {"Content-Type": "application/x-www-form-urlencoded"}
            });
        },
        register: (email: string, username: string, password: string) => 
            axios.post(`${BASE_URL}/auth/register`, { email, username, password }),

        getMe: () => apiClient.get("/users/me"),

        getApiKeys: () => apiClient.get("/auth/api-keys"),

        createApiKey: (name: string, scope: string = "read") =>
            apiClient.post("/auth/api-keys", { name, scope }),

        deleteApiKey: (keyId: string) => apiClient.delete(`/auth/api-keys/${keyId}`),
    };

    //  admin api calls
    export const adminApi = {
        listUsers: () => apiClient.get("/users/"),
        changeRole: (userId: string, role: string) => 
            apiClient.patch(`/users/${userId}/role?role=${role}`),
        deactivateUser: (userId: string) =>
            apiClient.patch(`/users/${userId}/deactivate`),

    }