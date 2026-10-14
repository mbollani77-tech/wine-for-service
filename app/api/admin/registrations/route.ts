import { isAdmin } from "@/lib/auth";
import { db, mapRow } from "@/lib/db";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Non autorizzato" }, { status: 401 });
  const sql = await db();
  const rows = await sql`SELECT * FROM registrations ORDER BY created_at DESC`;
  return Response.json(rows.map(mapRow));
}
