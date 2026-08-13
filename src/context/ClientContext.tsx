import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readStorage, writeStorage } from '../utils/storage';
import { generateId } from '../utils/taskUtils';
import { nowISO } from '../utils/dateUtils';
import type { Client } from '../types/client';

const CLIENTS_KEY = 'app_clients';

interface ClientContextValue {
  clients: Client[];
  addClient: (name: string, email: string, company: string) => void;
  deleteClient: (id: string) => void;
}

const ClientContext = createContext<ClientContextValue | null>(null);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(() => {
    const data = readStorage<unknown>(CLIENTS_KEY, []);
    return Array.isArray(data) ? data as Client[] : [];
  });

  useEffect(() => { writeStorage(CLIENTS_KEY, clients); }, [clients]);

  const addClient = useCallback((name: string, email: string, company: string) => {
    const client: Client = { id: generateId(), name: name.trim(), email: email.trim(), company: company.trim(), createdAt: nowISO() };
    setClients((prev) => [...prev, client]);
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = useMemo<ClientContextValue>(() => ({ clients, addClient, deleteClient }), [clients, addClient, deleteClient]);
  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
}

export function useClients(): ClientContextValue {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error('useClients must be used within ClientProvider');
  return ctx;
}