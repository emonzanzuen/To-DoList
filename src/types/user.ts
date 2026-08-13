export type UserRole = 'admin' | 'manager' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team: string;
  avatarColor: string; // untuk inisial avatar (bg color)
}

// Pre-seeded mock users untuk demo
export const MOCK_USERS: User[] = [
  {
    id: 'user_admin_001',
    name: 'Budi Santoso',
    email: 'budi@company.com',
    role: 'admin',
    team: 'Engineering',
    avatarColor: 'bg-indigo-500',
  },
  {
    id: 'user_manager_001',
    name: 'Siti Nurhaliza',
    email: 'siti@company.com',
    role: 'manager',
    team: 'Product',
    avatarColor: 'bg-purple-500',
  },
  {
    id: 'user_member_001',
    name: 'Ahmad Rizky',
    email: 'ahmad@company.com',
    role: 'member',
    team: 'Engineering',
    avatarColor: 'bg-blue-500',
  },
  {
    id: 'user_member_002',
    name: 'Dewi Lestari',
    email: 'dewi@company.com',
    role: 'member',
    team: 'Design',
    avatarColor: 'bg-pink-500',
  },
];