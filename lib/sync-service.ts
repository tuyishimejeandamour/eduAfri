"use client";

import {
  getPendingActions,
  updateActionStatus,
  removeAction,
} from "./indexeddb";

/**
 * Process the action queue - syncs all pending actions with the server
 * @returns Object with count of successful and failed actions
 */
export async function processActionQueue(): Promise<{
  success: number;
  failed: number;
}> {
  const pendingActions = await getPendingActions();
  
  if (pendingActions.length === 0) {
    // If no actions to process, just return
    dispatchSyncEvent();
    return { success: 0, failed: 0 };
  }
  
  let successCount = 0;
  let failedCount = 0;
  
  for (const action of pendingActions) {
    try {
      // Mark as processing
      await updateActionStatus(action.id!, "processing");
      
      // Attempt to send the request
      const response = await fetch(action.url, {
        method: action.method,
        headers: action.headers || { "Content-Type": "application/json" },
        body:
          action.method !== "GET" && action.body
            ? JSON.stringify(action.body)
            : undefined,
      });
      
      if (response.ok) {
        // If successful, remove from queue
        await removeAction(action.id!);
        successCount++;
      } else {
        // If failed, mark as failed and increment retry count
        const retryCount = (action.retryCount || 0) + 1;
        await updateActionStatus(action.id!, "failed", retryCount);
        failedCount++;
      }
    } catch (error) {
      console.error("Error processing action:", error);
      // If error, mark as failed and increment retry count
      const retryCount = (action.retryCount || 0) + 1;
      await updateActionStatus(action.id!, "failed", retryCount);
      failedCount++;
    }
  }
  
  // Update last sync time in localStorage
  if (successCount > 0) {
    localStorage.setItem('lastSyncTime', new Date().toISOString());
    dispatchSyncEvent();
  }
  
  return { success: successCount, failed: failedCount };
}

/**
 * Retry failed actions only
 * @returns Object with count of successful and failed actions
 */
export async function retryFailedActions(): Promise<{
  success: number;
  failed: number;
}> {
  // Get all actions and filter for failed ones
  const pendingActions = await getPendingActions();
  const failedActions = pendingActions.filter(
    (action) => action.status === "failed"
  );
  
  if (failedActions.length === 0) {
    // If no failed actions to retry, just return
    return { success: 0, failed: 0 };
  }
  
  let successCount = 0;
  let failedCount = 0;
  
  for (const action of failedActions) {
    try {
      // Mark as pending again
      await updateActionStatus(action.id!, "pending");
      
      // Attempt to send the request
      const response = await fetch(action.url, {
        method: action.method,
        headers: action.headers || { "Content-Type": "application/json" },
        body:
          action.method !== "GET" && action.body
            ? JSON.stringify(action.body)
            : undefined,
      });
      
      if (response.ok) {
        // If successful, remove from queue
        await removeAction(action.id!);
        successCount++;
      } else {
        // If failed, mark as failed and increment retry count
        const retryCount = (action.retryCount || 0) + 1;
        await updateActionStatus(action.id!, "failed", retryCount);
        failedCount++;
      }
    } catch (error) {
      console.error("Error processing action:", error);
      // If error, mark as failed and increment retry count
      const retryCount = (action.retryCount || 0) + 1;
      await updateActionStatus(action.id!, "failed", retryCount);
      failedCount++;
    }
  }
  
  // Update last sync time in localStorage if any actions were successful
  if (successCount > 0) {
    localStorage.setItem('lastSyncTime', new Date().toISOString());
    dispatchSyncEvent();
  }
  
  return { success: successCount, failed: failedCount };
}

/**
 * Helper function to dispatch a sync completed event
 * This lets components know when synchronization has completed
 */
function dispatchSyncEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sync-completed'));
  }
}

/**
 * Get the timestamp of the last successful sync
 * @returns ISO string date or null if no sync has occurred
 */
export function getLastSyncTime(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lastSyncTime');
}

/**
 * Check if there are any pending actions that need to be synced
 * @returns Promise that resolves to true if there are pending actions
 */
export async function hasPendingActions(): Promise<boolean> {
  const actions = await getPendingActions();
  return actions.length > 0;
}
