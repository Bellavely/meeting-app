import {
  FC,
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { setAccessToken, api } from "../api/api";
import { User } from "../types/user";

type AuthContextType = {
  user: User | null;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  updateUserData: (user: User) => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to refresh token on app load
        const response = await api.post("/auth/refresh");
        const { accessToken, user: userData } = response.data;
        setAccessToken(accessToken);
        setUser(userData);
      } catch (err) {
        console.log("No active session");
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [user]);

  const login = (token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
      window.location.href = "/login";
    }
  };

  const updateUserData = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
