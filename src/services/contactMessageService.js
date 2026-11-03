import { hasDemoAccess } from '../lib/demoAccess';
import { supabase } from './supabaseClient';

const DATABASE_NAME = 'barbershop-demo-messages';
const STORE_NAME = 'messages';
const DATABASE_VERSION = 1;

let databasePromise;

const openDemoDatabase = () => {
  if (!globalThis.indexedDB) {
    return Promise.reject(new Error('Este navegador não oferece armazenamento local para o modo demonstração.'));
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Não foi possível abrir o armazenamento local de mensagens.'));
      request.onblocked = () => reject(new Error('O armazenamento local de mensagens está bloqueado por outra aba.'));
    }).catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
};

const saveDemoMessage = async (message) => {
  const database = await openDemoDatabase();
  const savedMessage = {
    ...message,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).add(savedMessage);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('Não foi possível salvar a mensagem demonstrativa.'));
    transaction.onabort = () => reject(transaction.error || new Error('O salvamento da mensagem foi cancelado.'));
  });

  return savedMessage;
};

const getDemoMessages = async () => {
  const database = await openDemoDatabase();

  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    request.onerror = () => reject(request.error || new Error('Não foi possível carregar as mensagens demonstrativas.'));
  });
};

const deleteDemoMessage = async (id) => {
  const database = await openDemoDatabase();

  await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('Não foi possível excluir a mensagem demonstrativa.'));
    transaction.onabort = () => reject(transaction.error || new Error('A exclusão da mensagem foi cancelada.'));
  });
};

export const submitContactMessage = async (message) => {
  if (hasDemoAccess()) return saveDemoMessage(message);

  const { data, error } = await supabase
    .from('contact_messages')
    .insert(message);

  if (error) throw error;
  return data;
};

export const getContactMessages = async () => {
  if (hasDemoAccess()) return getDemoMessages();

  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, nome, email, mensagem, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const deleteContactMessage = async (id) => {
  if (hasDemoAccess()) return deleteDemoMessage(id);

  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
