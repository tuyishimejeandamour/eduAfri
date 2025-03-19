"use client"

import { getPendingActions, updateActionStatus, removeAction } from "./indexeddb"

// Function to process the action queue
export async function processActionQueue(): Promise<{ success: number; failed: number }> {
  const pendingActions = await getPendingActions()

  let successCount = 0
  let failedCount = 0

  for (const action of pendingActions) {
    try {
      // Mark as processing
      await updateActionStatus(action.id!, "processing")

      // Attempt to send the request
      const response = await fetch(action.url, {
        method: action.method,
        headers: action.headers || { "Content-Type": "application/json" },
        body: action.method !== "GET" && action.body ? JSON.stringify(action.body) : undefined,
      })

      if (response.ok) {
        // If successful, remove from queue
        await removeAction(action.id!)
        successCount++
      } else {
        // If failed, mark as failed and increment retry count
        const retryCount = (action.retryCount || 0) + 1
        await updateActionStatus(action.id!, "failed", retryCount)
        failedCount++
      }
    } catch (error) {
      // If error, mark as failed and increment retry count
      const retryCount = (action.retryCount || 0) + 1
      await updateActionStatus(action.id!, "failed", retryCount)
      failedCount++
    }
  }

  return { success: successCount, failed: failedCount }
}

// Function to retry failed actions
export async function retryFailedActions(): Promise<{ success: number; failed: number }> {
  // Get all actions and filter for failed ones
  const pendingActions = await getPendingActions()
  const failedActions = pendingActions.filter((action) => action.status === "failed")

  let successCount = 0
  let failedCount = 0

  for (const action of failedActions) {
    try {
      // Mark as pending again
      await updateActionStatus(action.id!, "pending")

      // Attempt to send the request
      const response = await fetch(action.url, {
        method: action.method,
        headers: action.headers || { "Content-Type": "application/json" },
        body: action.method !== "GET" && action.body ? JSON.stringify(action.body) : undefined,
      })

      if (response.ok) {
        // If successful, remove from queue
        await removeAction(action.id!)
        successCount++
      } else {
        // If failed, mark as failed and increment retry count
        const retryCount = (action.retryCount || 0) + 1
        await updateActionStatus(action.id!, "failed", retryCount)
        failedCount++
      }
    } catch (error) {
      // If error, mark as failed and increment retry count
      const retryCount = (action.retryCount || 0) + 1
      await updateActionStatus(action.id!, "failed", retryCount)
      failedCount++
    }
  }

  return { success: successCount, failed: failedCount }
}

