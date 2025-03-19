import { createClient } from "@supabase/supabase-js"
import fs from "fs"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.",
  )
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log("Setting up EduAfri database schema...")

    // Read schema SQL file
    const schemaSql = fs.readFileSync("./eduafri-schema.sql", "utf8")

    // Execute schema SQL
    const { error: schemaError } = await supabase.rpc("pgexec", { query: schemaSql })

    if (schemaError) {
      console.error("Error setting up schema:", schemaError)
      return
    }

    console.log("Schema created successfully!")

    // Read sample data SQL file
    const dataSql = fs.readFileSync("./sample-data.sql", "utf8")

    // Execute sample data SQL
    const { error: dataError } = await supabase.rpc("pgexec", { query: dataSql })

    if (dataError) {
      console.error("Error inserting sample data:", dataError)
      return
    }

    console.log("Sample data inserted successfully!")
    console.log("EduAfri database setup complete!")
  } catch (error) {
    console.error("Error setting up database:", error)
  }
}

// Run the setup
setupDatabase()

