import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Pencil, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import type { User, UserRole } from '../../types/user';
import { readStorage, writeStorage } from '../../utils/storage';
import { generateId } from '../../utils/taskUtils';

const USERS_KEY = 'app_users_custom';
const USER_OVERRIDES_KEY = 'app_user_overrides';

function loadCustomUsers(): User[] {
  const data = readStorage<unknown>(USERS_KEY, []);
  return Array.isArray(data) ? (data as User[]) : [];
}

function loadUserOverrides(): Record<string, Partial<User>> {
  const data = readStorage<unknown>(USER_OVERRIDES_KEY, {});
  return typeof data === 'object' && data !== null ? (data as Record<string, Partial<User>>) : {};
}

export default function TeamManagement() {
  const { t } = useTranslation();
  const { user: currentUser, users: baseUsers, canManageTeam, refreshUsers } = useAuth();
  const entranceRef = usePageEntrance();

  const [customUsers, setCustomUsers] = useState<User[]>(() => loadCustomUsers());
  const [overrides, setOverrides] = useState<Record<string, Partial<User>>>(() => loadUserOverrides());
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'member' as UserRole, team: '' });

  // baseUsers dari AuthContext sudah include MOCK_USERS + customUsers + overrides
  const allUsers = baseUsers.map((u) => {
    const override = overrides[u.id];
    return override ? { ...u, ...override } : u;
  });

  const saveCustomUsers = (updated: User[]) => {
    setCustomUsers(updated);
    writeStorage(USERS_KEY, updated);
  };

  const saveOverrides = (updated: Record<string, Partial<User>>) => {
    setOverrides(updated);
    writeStorage(USER_OVERRIDES_KEY, updated);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) return;

    if (editingUser) {
      const isCustom = customUsers.some((cu) => cu.id === editingUser.id);

      if (isCustom) {
        const updated = customUsers.map((u) =>
          u.id === editingUser.id
            ? { ...u, name: form.name.trim(), email: form.email.trim(), role: form.role, team: form.team.trim() }
            : u,
        );
        saveCustomUsers(updated);
      } else {
        const updatedOverrides = {
          ...overrides,
          [editingUser.id]: {
            name: form.name.trim(),
            email: form.email.trim(),
            role: form.role,
            team: form.team.trim(),
          },
        };
        saveOverrides(updatedOverrides);
      }

      setEditingUser(null);
    } else {
      const newUser: User = {
        id: generateId(),
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        team: form.team.trim() || 'General',
        avatarColor: ['bg-indigo-500', 'bg-purple-500', 'bg-blue-500', 'bg-pink-500', 'bg-teal-500'][
          Math.floor(Math.random() * 5)
        ],
      };
      saveCustomUsers([...customUsers, newUser]);
    }
    setForm({ name: '', email: '', role: 'member', team: '' });
    setShowForm(false);

    // Refresh AuthContext agar users ter-update
    refreshUsers?.();
  };

  const handleEdit = (u: User) => {
    setForm({ name: u.name, email: u.email, role: u.role, team: u.team ?? '' });
    setEditingUser(u);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    // Hapus dari custom users
    const updatedCustom = customUsers.filter((u) => u.id !== id);
    saveCustomUsers(updatedCustom);

    // Hapus override jika ada
    if (overrides[id]) {
      const updatedOverrides = { ...overrides };
      delete updatedOverrides[id];
      saveOverrides(updatedOverrides);
    }

    // Refresh AuthContext agar users ter-update
    refreshUsers?.();
  };

  const roleBadge: Record<string, string> = {
    admin: 'bg-danger/10 text-danger',
    manager: 'bg-warning/10 text-warning',
    member: 'bg-info/10 text-info',
  };

  const inputClass =
    'w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40';

  return (
    <div ref={entranceRef} className="space-y-6">
      <div data-animate className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('team.title')}</h1>
          <p className="mt-1 text-sm text-muted">{t('team.subtitle')}</p>
        </div>
        {canManageTeam && (
          <Button
            size="sm"
            onClick={() => {
              setShowForm(!showForm);
              setEditingUser(null);
              setForm({ name: '', email: '', role: 'member', team: '' });
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {showForm ? t('common.cancel') : t('team.addUser')}
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && canManageTeam && (
        <div data-animate className="space-y-4 rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold text-ink">
            {editingUser ? t('team.editUser') : t('team.addUser')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t('team.name')}</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t('team.email')}</label>
              <input
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="email@company.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t('team.role')}</label>
              <select
                className={inputClass}
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserRole }))}
              >
                <option value="member">{t('auth.role.member')}</option>
                <option value="manager">{t('auth.role.manager')}</option>
                <option value="admin">{t('auth.role.admin')}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t('team.team')}</label>
              <input
                className={inputClass}
                value={form.team}
                onChange={(e) => setForm((p) => ({ ...p, team: e.target.value }))}
                placeholder="Engineering, Product, dll"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>
              {t('common.cancel')}
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={!form.name.trim() || !form.email.trim()}>
              {editingUser ? t('common.save') : t('common.create')}
            </Button>
          </div>
        </div>
      )}

      {/* Users List */}
      <div data-animate>
        {allUsers.length === 0 ? (
          <EmptyState icon={Users} title={t('team.empty')} description="" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allUsers.map((u) => {
              const isCustom = customUsers.some((cu) => cu.id === u.id);
              const initials = u.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
              const isSelf = currentUser?.id === u.id;

              const canEdit = canManageTeam;
              const canDelete = canManageTeam && isCustom && !isSelf;

              return (
                <div key={u.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${u.avatarColor}`}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {u.name}
                      {isSelf && ' (You)'}
                    </p>
                    <p className="truncate text-xs text-muted">{u.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge className={roleBadge[u.role]}>{t(`auth.role.${u.role}`)}</Badge>
                      <span className="text-[10px] text-muted">{u.team}</span>
                    </div>
                  </div>
                  {(canEdit || canDelete) && (
                    <div className="flex shrink-0 items-center gap-1">
                      {canEdit && (
                        <button
                          onClick={() => handleEdit(u)}
                          className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-ink"
                          title="Edit user"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                          title="Hapus user"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}