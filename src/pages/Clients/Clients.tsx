import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Building2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { RoleGuard } from '../../components/auth/RoleGuard';
import { useClients } from '../../context/ClientContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';

export default function ClientsPage() {
  const { t } = useTranslation();
  const { clients, addClient, deleteClient } = useClients();
  const entranceRef = usePageEntrance();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', company: '' });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    addClient(form.name, form.email, form.company);
    setForm({ name: '', email: '', company: '' });
    setShowForm(false);
  };

  const inputClass =
    'w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40';

  return (
    <div ref={entranceRef} className="space-y-6">
      <div data-animate className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('client.title')}</h1>
          <p className="mt-1 text-sm text-muted">{t('client.subtitle')}</p>
        </div>
        <RoleGuard allowedRoles={['admin', 'manager']}>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {showForm ? t('common.cancel') : t('client.add')}
          </Button>
        </RoleGuard>
      </div>

      {showForm && (
        <div data-animate className="space-y-4 rounded-2xl border border-line bg-surface p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t('client.name')}</label>
              <input className={inputClass} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Nama klien" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t('client.email')}</label>
              <input className={inputClass} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="email@client.com" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t('client.company')}</label>
              <input className={inputClass} value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} placeholder="PT / CV" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>{t('common.cancel')}</Button>
            <Button size="sm" onClick={handleSubmit} disabled={!form.name.trim()}>{t('common.create')}</Button>
          </div>
        </div>
      )}

      <div data-animate>
        {clients.length === 0 ? (
          <EmptyState icon={Building2} title={t('client.empty')} description="" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <div key={client.id} className="flex items-start justify-between rounded-2xl border border-line bg-surface p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{client.name}</p>
                  {client.company && <p className="truncate text-xs text-muted">{client.company}</p>}
                  {client.email && <p className="truncate text-xs text-muted">{client.email}</p>}
                </div>
                <RoleGuard allowedRoles={['admin', 'manager']}>
                  <button onClick={() => deleteClient(client.id)} className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </RoleGuard>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}