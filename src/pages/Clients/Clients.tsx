import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Pencil, Building2, Eye, Briefcase } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useClients } from '../../context/ClientContext';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';

export default function ClientsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const { projects } = useProjects();
  const { user, canManageClients } = useAuth();
  const entranceRef = usePageEntrance();

  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [deletingClient, setDeletingClient] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', address: '', notes: '' });

  // Filter clients berdasarkan role
  const visibleClients = useMemo(() => {
    if (!user) return [];
    if (canManageClients) return clients;
    // Member: hanya lihat client yang terhubung dengan project yang dia ikuti
    const myProjectIds = projects
      .filter((p) => p.memberIds.includes(user.id))
      .map((p) => p.id);
    const myClientIds = [
      ...new Set(
        projects
          .filter((p) => myProjectIds.includes(p.id) && p.clientId)
          .map((p) => p.clientId!),
      ),
    ];
    return clients.filter((c) => myClientIds.includes(c.id));
  }, [clients, projects, user, canManageClients]);

  // Hitung jumlah project per client
  const clientProjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      if (p.clientId) {
        counts[p.clientId] = (counts[p.clientId] || 0) + 1;
      }
    });
    return counts;
  }, [projects]);

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingClient) {
      updateClient(editingClient, form);
      setEditingClient(null);
    } else {
      addClient(form.name, form.email, form.company, form.phone, form.address, form.notes);
    }
    setForm({ name: '', email: '', company: '', phone: '', address: '', notes: '' });
    setShowForm(false);
  };

  const handleEdit = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    setForm({
      name: client.name,
      email: client.email,
      company: client.company,
      phone: client.phone ?? '',
      address: client.address ?? '',
      notes: client.notes ?? '',
    });
    setEditingClient(clientId);
    setShowForm(true);
  };

  const inputClass =
    'w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40';

  return (
    <div ref={entranceRef} className="space-y-6">
      {/* Header */}
      <div data-animate className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('client.title')}</h1>
          <p className="mt-1 text-sm text-muted">{t('client.subtitle')}</p>
        </div>
        {canManageClients && (
          <Button
            size="sm"
            onClick={() => {
              setShowForm(!showForm);
              setEditingClient(null);
              setForm({ name: '', email: '', company: '', phone: '', address: '', notes: '' });
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {showForm ? t('common.cancel') : t('client.add')}
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && canManageClients && (
        <div data-animate className="space-y-4 rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold text-ink">
            {editingClient ? t('client.edit') : t('client.add')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t('client.name')}</label>
              <input className={inputClass} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder={t('client.namePlaceholder')} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t('client.email')}</label>
              <input className={inputClass} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder={t('client.emailPlaceholder')} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t('client.company')}</label>
              <input className={inputClass} value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} placeholder={t('client.companyPlaceholder')} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t('client.phone')}</label>
              <input className={inputClass} value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder={t('client.phonePlaceholder')} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted">{t('client.address')}</label>
              <input className={inputClass} value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder={t('client.addressPlaceholder')} />
            </div>
            <div className="sm:col-span-3">
              <label className="mb-1 block text-xs font-medium text-muted">{t('client.notes')}</label>
              <input className={inputClass} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder={t('client.notesPlaceholder')} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>{t('common.cancel')}</Button>
            <Button size="sm" onClick={handleSubmit} disabled={!form.name.trim()}>
              {editingClient ? t('common.save') : t('common.create')}
            </Button>
          </div>
        </div>
      )}

      {/* Client Cards */}
      <div data-animate>
        {visibleClients.length === 0 ? (
          <EmptyState icon={Building2} title={t('client.empty')} description={canManageClients ? '' : t('client.emptyMember')} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleClients.map((client) => {
              const projectCount = clientProjectCounts[client.id] || 0;
              return (
                <div key={client.id} className="rounded-2xl border border-line bg-surface p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{client.name}</p>
                      {client.company && <p className="truncate text-xs text-muted">{client.company}</p>}
                    </div>
                  </div>

                  {client.email && <p className="truncate text-xs text-muted">📧 {client.email}</p>}
                  {client.phone && <p className="truncate text-xs text-muted">📞 {client.phone}</p>}

                  <div className="flex items-center gap-2 pt-1">
                    <Badge className="bg-info/10 text-info">
                      <Briefcase className="h-3 w-3" />
                      {t('client.projectCount', { count: projectCount })}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-1 border-t border-line pt-2">
                    <button
                      onClick={() => navigate(`/clients/${client.id}`)}
                      className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-ink"
                      title={t('common.detail')}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    {canManageClients && (
                      <>
                        <button
                          onClick={() => handleEdit(client.id)}
                          className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-ink"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingClient(client.id)}
                          className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingClient}
        title={t('client.deleteConfirmTitle')}
        message={t('client.deleteConfirmMessage', { name: clients.find((c) => c.id === deletingClient)?.name ?? '' })}
        onConfirm={() => {
          if (deletingClient) deleteClient(deletingClient);
          setDeletingClient(null);
        }}
        onClose={() => setDeletingClient(null)}
      />
    </div>
  );
}