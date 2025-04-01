import { getServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await getServerSupabaseClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Set the role to admin
    const { error } = await supabase
      .from("profiles")
      .update({
        role: "admin",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    )
  }
}