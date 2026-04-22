const API_URL = "http://localhost:8080/api"; // Forzado para desarrollo local

// Endpoints que no deben enviar token y no deben redirigir
const publicEndpoints = ["/check-availability", "/forgot-password", "/reset-password", "/register", "/login", "/login/google", "/interests"];

const getHeaders = (endpoint) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };
  // No enviar token en endpoints públicos
  if (token && !publicEndpoints.some(ep => endpoint.includes(ep))) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const isPublicEndpoint = (endpoint) => {
    return publicEndpoints.some(ep => endpoint.includes(ep));
};

// Función genérica para manejar respuestas y errores 401
const handleResponse = async (res, endpoint) => {
    if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (!window.location.pathname.includes("/login") && !isPublicEndpoint(endpoint)) {
            window.location.href = "/login";
        }
        throw new Error("Sesión expirada o inválida");
    }

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.error) {
          throw new Error(errorData.error);
        }
        throw errorData; 
    }

    return res.json();
};

export const api = {
  get: async (endpoint) => {
    const separator = endpoint.includes('?') ? '&' : '?';
    const noCacheUrl = `${API_URL}${endpoint}${separator}_t=${Date.now()}`;

    try {
      const res = await fetch(noCacheUrl, {
        method: "GET",
        headers: getHeaders(endpoint),
        cache: "no-store",
      });
      return handleResponse(res, endpoint);
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  post: async (endpoint, body) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(endpoint),
      body: JSON.stringify(body),
    });
    return handleResponse(res, endpoint);
  },

  put: async (endpoint, body) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(endpoint),
      body: JSON.stringify(body),
    });
    return handleResponse(res, endpoint);
  },

  delete: async (endpoint) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(endpoint),
    });
    return handleResponse(res, endpoint);
  },

  upload: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}` 
        },
        body: formData
    });

    if (!res.ok) throw new Error("Error subiendo imagen");
    const data = await res.json();
    return data.url;
  }
};