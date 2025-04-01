'use client'

import { createContext, useContext } from "react";

interface UserContextType {
  userId: string | null;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children, userId }: { children: React.ReactNode; userId: string }) {
  return (
    <UserContext.Provider value={{ userId }}>
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