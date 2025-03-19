"use client"

import { saveContent, saveDownload, getContent, getDownloadByContentId, queueAction } from "./indexeddb"

// Function to download content and store it in IndexedDB
export async function downloadContent(contentId: string, userId: string): Promise<boolean> {
  try {
    // First check if we already have this content downloaded
    const existingDownload = await getDownloadByContentId(contentId)
    if (existingDownload) {
      console.log("Content already downloaded:", contentId)
      return true
    }

    // Fetch the content details
    const contentResponse = await fetch(`/api/content/${contentId}`)
    if (!contentResponse.ok) {
      throw new Error("Failed to fetch content")
    }

    const contentData = await contentResponse.json()
    const { content, lessons, questions } = contentData.data

    // Save the main content
    await saveContent(content)

    // Save related content (lessons or questions)
    if (lessons && lessons.length > 0) {
      for (const lesson of lessons) {
        await saveContent(lesson)
      }
    }

    if (questions && questions.length > 0) {
      // Save questions as part of the content object
      content.questions = questions
      await saveContent(content)
    }

    // Calculate size (simplified)
    let sizeBytes = 0
    switch (content.type) {
      case "course":
        sizeBytes = 5 * 1024 * 1024 // 5 MB
        break
      case "lesson":
        sizeBytes = 2 * 1024 * 1024 // 2 MB
        break
      case "quiz":
        sizeBytes = 1 * 1024 * 1024 // 1 MB
        break
      default:
        sizeBytes = 1 * 1024 * 1024 // 1 MB
    }

    // Record the download in IndexedDB
    const download = {
      id: `${userId}-${contentId}`,
      user_id: userId,
      content_id: contentId,
      downloaded_at: new Date().toISOString(),
      size_bytes: sizeBytes,
      content: content, // Include the content for offline access
    }

    await saveDownload(download)

    // Try to record the download on the server
    try {
      const response = await fetch("/api/downloads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentId, sizeBytes }),
      })

      if (!response.ok) {
        // If server request fails, queue it for later
        await queueAction({
          url: "/api/downloads",
          method: "POST",
          body: { contentId, sizeBytes },
          headers: { "Content-Type": "application/json" },
        })
      }
    } catch (error) {
      // If offline, queue the action for later
      await queueAction({
        url: "/api/downloads",
        method: "POST",
        body: { contentId, sizeBytes },
        headers: { "Content-Type": "application/json" },
      })
    }

    return true
  } catch (error) {
    console.error("Error downloading content:", error)
    return false
  }
}

// Function to get downloaded content from IndexedDB
export async function getDownloadedContent(contentId: string): Promise<any | null> {
  try {
    // First check if we have this content downloaded
    const download = await getDownloadByContentId(contentId)
    if (!download) {
      return null
    }

    // Get the content from IndexedDB
    const content = await getContent(contentId)
    return content
  } catch (error) {
    console.error("Error getting downloaded content:", error)
    return null
  }
}

