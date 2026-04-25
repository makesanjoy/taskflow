import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Task, User } from '../types';

const SEED_TASKS: Task[] = [
  { id: '1', title: 'Design new landing page', description: 'Create mockups for the redesigned marketing homepage.', priority: 'high', status: 'in-progress', assignee: 'Alice', createdAt: '2025-04-01', dueDate: '2025-04-30' },
  { id: '2', title: 'Fix login redirect bug', description: 'Users are not being redirected after successful login.', priority: 'high', status: 'todo', assignee: 'Bob', createdAt: '2025-04-05', dueDate: '2025-04-20' },
  { id: '3', title: 'Write API documentation', description: 'Document all REST endpoints using OpenAPI spec.', priority: 'medium', status: 'todo', assignee: 'Alice', createdAt: '2025-04-06', dueDate: '2025-05-10' },
  { id: '4', title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment.', priority: 'medium', status: 'done', assignee: 'Charlie', createdAt: '2025-03-20', dueDate: '2025-04-15' },
  { id: '5', title: 'Implement dark mode', description: 'Add a theme toggle with persistent user preference.', priority: 'low', status: 'todo', assignee: 'Bob', createdAt: '2025-04-08', dueDate: '2025-05-20' },
  { id: '6', title: 'Database query optimization', description: 'Fix N+1 queries causing slow dashboard load times.', priority: 'high', status: 'in-progress', assignee: 'Charlie', createdAt: '2025-04-10', dueDate: '2025-04-28' },
];

interface AppContextType {
  user: User | null;
  tasks: Task[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tf_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tf_tasks');
    return saved ? JSON.parse(saved) : SEED_TASKS;
  });

  useEffect(() => {
    localStorage.setItem('tf_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const login = (email: string, password: string): boolean => {
    if (email === 'admin@taskflow.com' && password === 'password123') {
      const u = { email, name: 'Admin User' };
      setUser(u);
      localStorage.setItem('tf_user', JSON.stringify(u));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tf_user');
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = { ...task, id: Date.now().toString(), createdAt: new Date().toISOString().split('T')[0] };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppContext.Provider value={{ user, tasks, login, logout, addTask, updateTask, deleteTask }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};