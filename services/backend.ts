
import { User, CivicComplaint, ApiResponse } from '../types';

const STORAGE_KEYS = {
  USER: 'nexus_user_session',
  COMPLAINTS: 'nexus_complaints_v3',
  USERS_DB: 'nexus_users_database'
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
  auth: {
    login: async (email: string, password?: string): Promise<ApiResponse<User>> => {
      await delay(800);
      const usersRaw = localStorage.getItem(STORAGE_KEYS.USERS_DB);
      const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
      
      const user = users.find(u => u.email === email);
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        return { success: true, data: user };
      }
      
      // Default fallback for demo if DB is empty
      const demoUser: User = {
        id: '1',
        name: 'Guest Citizen',
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        role: 'Citizen',
        credits: 1000,
        impactScore: { daily: 12, weekly: 45 }
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
      return { success: true, data: demoUser };
    },

    signup: async (userData: any): Promise<ApiResponse<User>> => {
      await delay(1000);
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: userData.name,
        email: userData.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
        role: 'Citizen',
        credits: 500,
        impactScore: { daily: 0, weekly: 0 }
      };

      const usersRaw = localStorage.getItem(STORAGE_KEYS.USERS_DB);
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      
      return { success: true, data: newUser };
    },

    // Fix: Added missing socialLogin implementation
    socialLogin: async (provider: string): Promise<ApiResponse<User>> => {
      await delay(1000);
      const demoUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: `${provider} User`,
        email: `user@${provider.toLowerCase()}.com`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
        role: 'Citizen',
        credits: 1000,
        impactScore: { daily: 5, weekly: 15 },
        provider: provider
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
      return { success: true, data: demoUser };
    },

    logout: async () => {
      localStorage.removeItem(STORAGE_KEYS.USER);
    },

    subscribeToAuth: (callback: (user: User | null) => void) => {
      const checkAuth = () => {
        const userRaw = localStorage.getItem(STORAGE_KEYS.USER);
        callback(userRaw ? JSON.parse(userRaw) : null);
      };
      checkAuth();
      return () => {}; // No-op unsubscribe for localStorage
    }
  },

  complaints: {
    list: async (): Promise<ApiResponse<CivicComplaint[]>> => {
      await delay(500);
      const raw = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
      return { success: true, data: raw ? JSON.parse(raw) : [] };
    },
    create: async (complaint: Partial<CivicComplaint>): Promise<ApiResponse<CivicComplaint>> => {
      await delay(500);
      const raw = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
      const current = raw ? JSON.parse(raw) : [];
      const newComplaint = {
        ...complaint,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toLocaleDateString(),
        status: 'Active'
      };
      current.unshift(newComplaint);
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(current));
      return { success: true, data: newComplaint as CivicComplaint };
    }
  }
};
