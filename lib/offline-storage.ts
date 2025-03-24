// Offline storage utilities for managing downloaded content

const STORAGE_KEY = 'offline_content';

export type OfflineContent = {
  id: string;
  title: string;
  type: 'course' | 'lesson' | 'quiz';
  data: any; // The actual content data
  lastAccessed?: Date;
  downloadedAt: Date;
};

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Get all offline content items
 */
export async function getOfflineContent(): Promise<OfflineContent[]> {
  if (!isBrowser) return [];
  
  try {
    const storedContent = localStorage.getItem(STORAGE_KEY);
    if (!storedContent) return [];
    
    return JSON.parse(storedContent);
  } catch (error) {
    console.error('Failed to retrieve offline content:', error);
    return [];
  }
}

/**
 * Get a specific offline content item by ID
 */
export async function getOfflineContentById(id: string): Promise<OfflineContent | null> {
  if (!isBrowser) return null;
  
  try {
    const allContent = await getOfflineContent();
    const content = allContent.find(item => item.id === id);
    
    if (content) {
      // Update last accessed time
      await updateLastAccessed(id);
    }
    
    return content || null;
  } catch (error) {
    console.error(`Failed to get offline content with ID ${id}:`, error);
    return null;
  }
}

/**
 * Save content for offline use
 */
export async function saveOfflineContent(content: Omit<OfflineContent, 'downloadedAt'>): Promise<boolean> {
  if (!isBrowser) return false;
  
  try {
    const allContent = await getOfflineContent();
    
    // Check if content with this ID already exists
    const existingIndex = allContent.findIndex(item => item.id === content.id);
    
    const contentWithMeta = {
      ...content,
      downloadedAt: new Date(),
      lastAccessed: new Date()
    };
    
    if (existingIndex >= 0) {
      // Update existing content
      allContent[existingIndex] = contentWithMeta;
    } else {
      // Add new content
      allContent.push(contentWithMeta);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allContent));
    
    // Dispatch event to notify components about the change
    window.dispatchEvent(new CustomEvent('offline-content-updated'));
    
    return true;
  } catch (error) {
    console.error('Failed to save offline content:', error);
    return false;
  }
}

/**
 * Remove content from offline storage
 */
export async function removeOfflineContent(id: string): Promise<boolean> {
  if (!isBrowser) return false;
  
  try {
    let allContent = await getOfflineContent();
    const initialLength = allContent.length;
    
    allContent = allContent.filter(item => item.id !== id);
    
    if (allContent.length === initialLength) {
      return false; // Nothing was removed
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allContent));
    
    // Dispatch event to notify components about the change
    window.dispatchEvent(new CustomEvent('offline-content-updated'));
    
    return true;
  } catch (error) {
    console.error(`Failed to remove offline content with ID ${id}:`, error);
    return false;
  }
}

/**
 * Update the last accessed time for a content item
 */
async function updateLastAccessed(id: string): Promise<void> {
  if (!isBrowser) return;
  
  try {
    const allContent = await getOfflineContent();
    const contentIndex = allContent.findIndex(item => item.id === id);
    
    if (contentIndex >= 0) {
      allContent[contentIndex].lastAccessed = new Date();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allContent));
    }
  } catch (error) {
    console.error(`Failed to update last accessed time for content with ID ${id}:`, error);
  }
}

/**
 * Get the count of downloaded content items
 */
export async function getOfflineContentCount(): Promise<number> {
  if (!isBrowser) return 0;
  
  try {
    const allContent = await getOfflineContent();
    return allContent.length;
  } catch (error) {
    console.error('Failed to get offline content count:', error);
    return 0;
  }
}