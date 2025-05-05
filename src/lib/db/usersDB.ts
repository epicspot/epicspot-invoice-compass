
import { dbPromise } from './index';
import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const usersDB = {
  getAll: async (): Promise<User[]> => {
    const db = await dbPromise;
    return db.getAll('users');
  },
  
  get: async (id: string): Promise<User | undefined> => {
    const db = await dbPromise;
    return db.get('users', id);
  },
  
  getByEmail: async (email: string): Promise<User | undefined> => {
    const db = await dbPromise;
    return db.getFromIndex('users', 'by-email', email);
  },
  
  add: async (user: Omit<User, 'id'>): Promise<User> => {
    const db = await dbPromise;
    const newUser: User = {
      ...user,
      id: uuidv4()
    };
    await db.add('users', newUser);
    return newUser;
  },
  
  update: async (user: User): Promise<User> => {
    const db = await dbPromise;
    await db.put('users', user);
    return user;
  },
  
  delete: async (id: string): Promise<void> => {
    const db = await dbPromise;
    await db.delete('users', id);
  },
  
  getByRole: async (role: User['role']): Promise<User[]> => {
    const db = await dbPromise;
    return db.getAllFromIndex('users', 'by-role', role);
  }
};
