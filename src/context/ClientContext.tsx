import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readStorage, writeStorage } from '../utils/storage';
import { generateId } from '../utils/taskUtils';
import { nowISO } from '../utils/dateUtils';
import type { Client } from '../types/client';

const CLIENTS_KEY = 'app_clients';

interface ClientContextValue {
  clients: Client[];
  addClient: (name: string, email: string, company: string, phone?: string, address?: string, notes?: string) => void;
  updateClient: (id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
}

const ClientContext = createContext<ClientContextValue | null>(null);

function loadClients(): Client[] {
  const data = readStorage<unknown>(CLIENTS_KEY, []);
  if (!Array.isArray(data)) return [];
  return data.map((item: Record<string, unknown>) => ({
    id: String(item.id ?? ''),
    name: String(item.name ?? ''),
    email: String(item.email ?? ''),
    company: String(item.company ?? ''),
    phone: String(item.phone ?? ''),
    address: String(item.address ?? ''),
    notes: String(item.notes ?? ''),
    createdAt: String(item.createdAt ?? new Date().toISOString()),
    updatedAt: String(item.updatedAt ?? item.createdAt ?? new Date().toISOString()),
  })) as Client[];
}

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(() => loadClients());

  useEffect(() => {
    writeStorage(CLIENTS_KEY, clients);
  }, [clients]);

  const addClient = useCallback(
    (name: string, email: string, company: string, phone?: string, address?: string, notes?: string) => {
      const now = nowISO();
      const client: Client = {
        id: generateId(),
        name: name.trim(),
        email: email.trim(),
        company: company.trim(),
        phone: phone?.trim() ?? '',
        address: address?.trim() ?? '',
        notes: notes?.trim() ?? '',
        createdAt: now,
        updatedAt: now,
      };
      setClients((prev) => [...prev, client]);
    },
    [],
  );

  const updateClient = useCallback(
    (id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>) => {
      setClients((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...data,
                name: data.name !== undefined ? data.name.trim() : c.name,
                email: data.email !== undefined ? data.email.trim() : c.email,
                company: data.company !== undefined ? data.company.trim() : c.company,
                phone: data.phone !== undefined ? data.phone.trim() : c.phone,
                address: data.address !== undefined ? data.address.trim() : c.address,
                notes: data.notes !== undefined ? data.notes.trim() : c.notes,
                updatedAt: nowISO(),
              }
            : c,
        ),
      );
    },
    [],
  );

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getClientById = useCallback(
    (id: string) => clients.find((c) => c.id === id),
    [clients],
  );

  const value = useMemo<ClientContextValue>(
    () => ({ clients, addClient, updateClient, deleteClient, getClientById }),
    [clients, addClient, updateClient, deleteClient, getClientById],
  );

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
}

export function useClients(): ClientContextValue {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error('useClients must be used within ClientProvider');
  return ctx;
}