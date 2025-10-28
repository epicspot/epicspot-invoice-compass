import { useLocalStorage } from './useLocalStorage';
import { User } from '@/lib/types';

export function useUsers() {
  const [users, setUsers] = useLocalStorage<User[]>('users', []);

  const createUser = (user: Omit<User, 'id'>) => {
    const newUser: User = {
      ...user,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setUsers([...users, newUser]);
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, ...updates } : u
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const getUser = (id: string) => {
    return users.find(u => u.id === id);
  };

  return {
    users,
    createUser,
    updateUser,
    deleteUser,
    getUser,
  };
}
