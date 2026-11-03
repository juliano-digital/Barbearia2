const DATABASE_NAME = 'barbershop-demo-content';
const STORE_NAME = 'pages';
const DATABASE_VERSION = 1;

let databasePromise;

const openDatabase = () => {
  if (!globalThis.indexedDB) {
    return Promise.reject(new Error('Este navegador não oferece armazenamento local para o modo demonstração.'));
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'page' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Não foi possível abrir o armazenamento local.'));
      request.onblocked = () => reject(new Error('O armazenamento local está bloqueado por outra aba.'));
    }).catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
};

export const getDemoPageContent = async (page) => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(page);
    request.onsuccess = () => resolve(request.result?.content ?? null);
    request.onerror = () => reject(request.error || new Error('Não foi possível carregar o conteúdo demonstrativo.'));
  });
};

export const saveDemoPageContent = async (page, content) => {
  const database = await openDatabase();

  await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put({
      page,
      content,
      updated_at: new Date().toISOString(),
    });

    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('Não foi possível salvar o conteúdo demonstrativo.'));
    transaction.onabort = () => reject(transaction.error || new Error('O salvamento demonstrativo foi cancelado.'));
  });

  window.dispatchEvent(new CustomEvent('demo-content-updated', { detail: { page } }));
  return { page, content };
};
