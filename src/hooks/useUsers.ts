import { useState, useEffect } from 'react';
import { User } from '@/lib/types';

const API_URL = 'http://localhost:3000/api/users';

// Transform backend data to frontend format
const transformUser = (backendUser: any): User => ({
  id: backendUser.id,
  name: backendUser.name,
  email: backendUser.email,
  role: backendUser.role,
  active: backendUser.active === 1 || backendUser.active === true,
  createdAt: backendUser.created_at || backendUser.createdAt,
  siteIds: backendUser.site_id ? [backendUser.site_id] : [],
});

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.map(transformUser));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (user: Omit<User, 'id'>) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          role: user.role,
          site_id: user.siteIds?.[0] || '',
          active: user.active,
        }),
      });
      if (response.ok) {
        const newUser = await response.json();
        const transformedUser = transformUser(newUser);
        setUsers([...users, transformedUser]);
        return transformedUser;
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const userToUpdate = users.find(u => u.id === id);
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updates.name || userToUpdate?.name,
          email: updates.email || userToUpdate?.email,
          role: updates.role || userToUpdate?.role,
          site_id: updates.siteIds?.[0] || userToUpdate?.siteIds?.[0] || '',
          active: updates.active !== undefined ? updates.active : userToUpdate?.active,
        }),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        const transformedUser = transformUser(updatedUser);
        setUsers(users.map(u => u.id === id ? transformedUser : u));
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setUsers(users.filter(u => u.id !== id));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const getUser = (id: string) => {
    return users.find(u => u.id === id);
  };

  return {
    users,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    getUser,
    refetch: fetchUsers,
  };
}
