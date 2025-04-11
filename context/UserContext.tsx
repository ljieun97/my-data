'use client'

import { createContext, useContext } from "react";

interface UserContextType {
  uid: string | null;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children, uid }: { children: React.ReactNode; uid: string }) {
  return (
    <UserContext.Provider value={{ uid }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}