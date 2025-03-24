"use client";

// Define content item type
export interface OfflineContentItem {
  id: string;           // Content ID
  title: string;        // Content title
  type: string;         // Content type (course, lesson, quiz)
  data: any;            // Actual content data
  userId: string;       // User who downloaded this
  downloadedAt?: Date;  // When it was downloaded
  lastAccessedAt?: Date; // When it was last accessed
}

// Database configuration
const dbName = 'offline-storage';
const dbVersion = 1;

// Initialize IndexedDB
async function getDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = () => {
      console.error("Error opening offline storage database");
      resolve(null);
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('offline_content')) {
        const store = db.createObjectStore('offline_content', { keyPath: 'id' });
        store.createIndex('by_type', 'type');
        store.createIndex('by_user', 'userId');
        store.createIndex('by_user_and_type', ['userId', 'type']);
      }
    };
  });
}

/**
 * Save content to offline storage
 * @param item Content item to save
 */
export async function saveOfflineContent(item: OfflineContentItem): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const now = new Date();
  const transaction = db.transaction('offline_content', 'readwrite');
  const store = transaction.objectStore('offline_content');
  
  await new Promise<void>((resolve, reject) => {
    const request = store.put({
      ...item,
      downloadedAt: item.downloadedAt || now,
      lastAccessedAt: now,
    });

    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('Error saving offline content:', request.error);
      resolve();
    };
  });
}

/**
 * Get all offline content
 * @param userId Optional user ID to filter by
 * @param type Optional content type to filter by
 */
export async function getOfflineContent(
  userId?: string, 
  type?: string
): Promise<OfflineContentItem[]> {
  const db = await getDb();
  if (!db) return [];

  const transaction = db.transaction('offline_content', 'readonly');
  const store = transaction.objectStore('offline_content');

  return new Promise((resolve) => {
    if (userId && type) {
      const index = store.index('by_user_and_type');
      const request = index.getAll([userId, type]);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => {
        console.error('Error getting offline content:', request.error);
        resolve([]);
      };
    } else if (userId) {
      const index = store.index('by_user');
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => {
        console.error('Error getting offline content:', request.error);
        resolve([]);
      };
    } else if (type) {
      const index = store.index('by_type');
      const request = index.getAll(type);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => {
        console.error('Error getting offline content:', request.error);
        resolve([]);
      };
    } else {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => {
        console.error('Error getting offline content:', request.error);
        resolve([]);
      };
    }
  });
}

/**
 * Get a specific content item by ID
 * @param id Content ID
 */
export async function getOfflineContentById(id: string): Promise<OfflineContentItem | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const transaction = db.transaction('offline_content', 'readonly');
  const store = transaction.objectStore('offline_content');

  return new Promise((resolve) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.error('Error getting offline content by ID:', request.error);
      resolve(undefined);
    };
  });
}

/**
 * Delete offline content
 * @param id Content ID
 */
export async function deleteOfflineContent(id: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const transaction = db.transaction('offline_content', 'readwrite');
  const store = transaction.objectStore('offline_content');

  return new Promise((resolve) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => {
      console.error('Error deleting offline content:', request.error);
      resolve(false);
    };
  });
}

/**
 * Clear all offline content
 */
export async function clearOfflineContent(): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const transaction = db.transaction('offline_content', 'readwrite');
  const store = transaction.objectStore('offline_content');

  return new Promise((resolve) => {
    const request = store.clear();
    request.onsuccess = () => resolve(true);
    request.onerror = () => {
      console.error('Error clearing offline content:', request.error);
      resolve(false);
    };
  });
}