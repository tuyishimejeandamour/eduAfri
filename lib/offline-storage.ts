"use client";

import { DownloadedContent, saveDownload, getDownload, getAllDownloads, deleteDownload, clearAllDownloads } from './indexeddb';

// Define content item type
export interface OfflineContentItem {
  id: string;           // Content ID
  title: string;        // Content title
  type: string;         // Content type (course, lesson, quiz)
  downloaded: boolean;  // Whether the content is downloaded
  downloadedAt: string; // When it was downloaded
  downloaded_at: string; // Legacy field for compatibility
  user_id: string;      // User who downloaded this
  content_id: string;   // ID of the content
  size_bytes: number;   // Size of the content in bytes
  content?: any;        // The actual content data
}

// Re-export the DownloadedContent type for consistency
export type { DownloadedContent } from './indexeddb';

/**
 * Save content to offline storage
 * @param content Content to save for offline use
 */
export async function saveContentForOffline(content: DownloadedContent) {
  try {
    await saveDownload(content);
    return true;
  } catch (error) {
    console.error('Error saving content for offline use:', error);
    return false;
  }
}

/**
 * Get a specific content item by ID
 * @param id Content ID
 */
export async function getDownloadedContentById(id: string): Promise<DownloadedContent | null> {
  try {
    // First try to get the download record
    const download = await getDownload(id);
    if (!download) return null;

    // Return the actual content data, combined with metadata
    return {
      ...download,
      ...(typeof download.content === 'object' ? download.content : {}), // Spread the content data if it exists
      downloaded: true, // Mark as downloaded content
      downloadedAt: download.downloaded_at,
    };
  } catch (error) {
    console.error('Error retrieving downloaded content:', error);
    return null;
  }
}

/**
 * Get all downloaded content
 */
export async function getAllDownloadedContent(): Promise<DownloadedContent[]> {
  try {
    const downloads = await getAllDownloads();
    return downloads.map(download => ({
      ...download,
      ...(download.content || {}),
      downloaded: true,
      downloadedAt: download.downloaded_at,
    }));
  } catch (error) {
    console.error('Error retrieving all downloaded content:', error);
    return [];
  }
}

/**
 * Delete downloaded content by ID
 * @param id Content ID
 */
export async function removeDownloadedContent(id: string): Promise<boolean> {
  try {
    return await deleteDownload(id);
  } catch (error) {
    console.error('Error removing downloaded content:', error);
    return false;
  }
}

/**
 * Clear all downloaded content
 */
export async function clearAllDownloadedContent(): Promise<boolean> {
  try {
    return await clearAllDownloads();
  } catch (error) {
    console.error('Error clearing all downloaded content:', error);
    return false;
  }
}