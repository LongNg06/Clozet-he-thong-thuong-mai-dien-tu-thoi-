import React, { createContext, useContext, useEffect, useState } from "react";

type User = { name?: string } | null;

interface AuthContextValue {
  user: User;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const raw = localStorage.getItem("simple_user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("simple_user", JSON.stringify(user));
    else localStorage.removeItem("simple_user");
  }, [user]);

  const login = (u: User) => setUser(u);
  const logout = () => setUser(null);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
