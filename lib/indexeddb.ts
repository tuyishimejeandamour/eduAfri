const isIndexedDBAvailable = () => {
  try {
    return "indexedDB" in window && window.indexedDB !== null;
  } catch (error: any) {
    console.error("IndexedDB is not available:", error);
    return false;
  }
};

// Database configuration
const DB_NAME = "eduafri-db";
const DB_VERSION = 1;
const STORES = {
  CONTENT: "content",
  PROGRESS: "progress",
  DOWNLOADS: "downloads",
  ACTION_QUEUE: "actionQueue",
};

// Initialize the database with error handling
export async function initDB(): Promise<IDBDatabase | null> {
  if (!isIndexedDBAvailable()) {
    console.warn("IndexedDB is not available in this browser");
    return null;
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("IndexedDB error:", event);
        resolve(null); // Resolve with null instead of rejecting
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.CONTENT)) {
          db.createObjectStore(STORES.CONTENT, { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
          db.createObjectStore(STORES.PROGRESS, { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains(STORES.DOWNLOADS)) {
          const downloadStore = db.createObjectStore(STORES.DOWNLOADS, {
            keyPath: "id",
          });
          downloadStore.createIndex("content_id", "content_id", {
            unique: true,
          });
          downloadStore.createIndex("user_id", "user_id", { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.ACTION_QUEUE)) {
          const queueStore = db.createObjectStore(STORES.ACTION_QUEUE, {
            keyPath: "id",
            autoIncrement: true,
          });
          queueStore.createIndex("status", "status", { unique: false });
          queueStore.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    } catch (error) {
      console.error("Error initializing IndexedDB:", error);
      resolve(null);
    }
  });
}

// Generic function to add an item to a store
export async function addItem<T>(storeName: string, item: T): Promise<T> {
  const db = await initDB();

  if (!db) {
    console.warn("IndexedDB not available, cannot add item");
    return item; // Return the item anyway
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onsuccess = () => {
        resolve(item);
      };

      request.onerror = (event) => {
        console.error(`Error adding item to ${storeName}:`, event);
        resolve(item); // Resolve with the item anyway
      };

      transaction.oncomplete = () => {
        db.close();
      };
    } catch (error) {
      console.error(`Error in addItem for ${storeName}:`, error);
      resolve(item); // Resolve with the item anyway
    }
  });
}

// Generic function to update an item in a store
export async function updateItem<T>(storeName: string, item: T): Promise<T> {
  const db = await initDB();

  if (!db) {
    console.warn("IndexedDB not available, cannot update item");
    return item;
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => {
        resolve(item);
      };

      request.onerror = (event) => {
        console.error(`Error updating item in ${storeName}:`, event);
        resolve(item);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    } catch (error) {
      console.error(`Error in updateItem for ${storeName}:`, error);
      resolve(item);
    }
  });
}

// Generic function to get an item from a store
export async function getItem<T>(
  storeName: string,
  id: string | number
): Promise<T | null> {
  const db = await initDB();

  if (!db) {
    console.warn("IndexedDB not available, cannot get item");
    return null;
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result as T;
        resolve(result || null);
      };

      request.onerror = (event) => {
        console.error(`Error getting item from ${storeName}:`, event);
        resolve(null);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    } catch (error) {
      console.error(`Error in getItem for ${storeName}:`, error);
      resolve(null);
    }
  });
}

// Generic function to delete an item from a store
export async function deleteItem(
  storeName: string,
  id: string | number
): Promise<boolean> {
  const db = await initDB();

  if (!db) {
    console.warn("IndexedDB not available, cannot delete item");
    return false;
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = (event) => {
        console.error(`Error deleting item from ${storeName}:`, event);
        resolve(false);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    } catch (error) {
      console.error(`Error in deleteItem for ${storeName}:`, error);
      resolve(false);
    }
  });
}

// Generic function to get all items from a store
export async function getAllItems<T>(storeName: string): Promise<T[]> {
  const db = await initDB();

  if (!db) {
    console.warn("IndexedDB not available, cannot get all items");
    return [];
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result as T[];
        resolve(result || []);
      };

      request.onerror = (event) => {
        console.error(`Error getting all items from ${storeName}:`, event);
        resolve([]);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    } catch (error) {
      console.error(`Error in getAllItems for ${storeName}:`, error);
      resolve([]);
    }
  });
}

// Get items by index
export async function getItemsByIndex<T>(
  storeName: string,
  indexName: string,
  value: string | number
): Promise<T[]> {
  const db = await initDB();

  if (!db) {
    console.warn("IndexedDB not available, cannot get items by index");
    return [];
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result as T[];
        resolve(result || []);
      };

      request.onerror = (event) => {
        console.error(`Error getting items by index from ${storeName}:`, event);
        resolve([]);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    } catch (error) {
      console.error(`Error in getItemsByIndex for ${storeName}:`, error);
      resolve([]);
    }
  });
}

// Clear all items from a store
export async function clearStore(storeName: string): Promise<boolean> {
  const db = await initDB();

  if (!db) {
    console.warn("IndexedDB not available, cannot clear store");
    return false;
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = (event) => {
        console.error(`Error clearing store ${storeName}:`, event);
        resolve(false);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    } catch (error) {
      console.error(`Error in clearStore for ${storeName}:`, error);
      resolve(false);
    }
  });
}

// Specific functions for our application

// Content functions
export async function saveContent(content: any): Promise<any> {
  return updateItem(STORES.CONTENT, content);
}

export async function getContent(id: string): Promise<any | null> {
  return getItem(STORES.CONTENT, id);
}

export async function getAllContent(): Promise<any[]> {
  return getAllItems(STORES.CONTENT);
}

// Download functions
export async function saveDownload(download: any): Promise<any> {
  return updateItem(STORES.DOWNLOADS, download);
}

export async function getDownload(id: string): Promise<any | null> {
  return getItem(STORES.DOWNLOADS, id);
}

export async function getDownloadByContentId(
  contentId: string
): Promise<any | null> {
  const downloads = await getItemsByIndex(
    STORES.DOWNLOADS,
    "content_id",
    contentId
  );
  return downloads.length > 0 ? downloads[0] : null;
}

export async function getAllDownloads(): Promise<any[]> {
  return getAllItems(STORES.DOWNLOADS);
}

export async function deleteDownload(id: string): Promise<boolean> {
  return deleteItem(STORES.DOWNLOADS, id);
}

export async function clearAllDownloads(): Promise<boolean> {
  return clearStore(STORES.DOWNLOADS);
}

// Progress functions
export async function saveProgress(progress: any): Promise<any> {
  return updateItem(STORES.PROGRESS, progress);
}

export async function getProgress(id: string): Promise<any | null> {
  return getItem(STORES.PROGRESS, id);
}

export async function getAllProgress(): Promise<any[]> {
  return getAllItems(STORES.PROGRESS);
}

// Action queue functions
export interface QueuedAction {
  id?: number;
  url: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  status: "pending" | "processing" | "failed";
  timestamp: number;
  retryCount?: number;
}

export async function queueAction(
  action: Omit<QueuedAction, "id" | "status" | "timestamp" | "retryCount">
): Promise<QueuedAction> {
  const db = await initDB();

  if (!db) {
    console.warn("IndexedDB not available, cannot queue action");
    return {
      ...action,
      status: "pending",
      timestamp: Date.now(),
      retryCount: 0,
    } as QueuedAction;
  }

  const queuedAction: QueuedAction = {
    ...action,
    status: "pending",
    timestamp: Date.now(),
    retryCount: 0,
  };

  return addItem<QueuedAction>(STORES.ACTION_QUEUE, queuedAction);
}

export async function getPendingActions(): Promise<QueuedAction[]> {
  return getItemsByIndex<QueuedAction>(
    STORES.ACTION_QUEUE,
    "status",
    "pending"
  );
}

export async function updateActionStatus(
  id: number,
  status: "pending" | "processing" | "failed",
  retryCount?: number
): Promise<boolean> {
  const db = await initDB();

  if (!db) {
    console.warn("IndexedDB not available, cannot update action status");
    return false;
  }

  const action = await getItem<QueuedAction>(STORES.ACTION_QUEUE, id);
  if (!action) return false;

  action.status = status;
  if (retryCount !== undefined) {
    action.retryCount = retryCount;
  }

  await updateItem(STORES.ACTION_QUEUE, action);
  return true;
}

export async function removeAction(id: number): Promise<boolean> {
  return deleteItem(STORES.ACTION_QUEUE, id);
}
