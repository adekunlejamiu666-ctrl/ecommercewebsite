import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Sync user object to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setToken(data.token);
      const userPayload = {
        id: data.id || data._id,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        role: data.role || "user",
        avatar: data.avatar || "",
        phone: data.phone || "",
        address: data.address || {},
      };
      setUser(userPayload);
      return userPayload;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      // authService.register returns res.data.user = { id, firstname, lastname, email, role, token, avatar }
      const data = await authService.register(userData);

      // token lives on the user object returned from backend
      const token = data.token;
      if (token) {
        setToken(token);
        localStorage.setItem("token", token);
      }

      const userPayload = {
        id: data.id || data._id,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        role: data.role || "user",
        avatar: data.avatar || "",
        phone: data.phone || "",
        address: data.address || {},
      };
      setUser(userPayload);
      return userPayload;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      if (!merged.id && merged._id) {
        merged.id = merged._id;
      }
      localStorage.setItem("user", JSON.stringify(merged));
      return merged;
    });
  };

  const isAdmin = user?.role === "admin";
  const isVendor = user?.role === "vendor";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        isVendor,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
