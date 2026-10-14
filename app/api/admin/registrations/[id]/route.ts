import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return Response.json({ error: "Non autorizzato" }, { status: 401 });
  const id = Number((await params).id);
  const body = (await req.json()) as { pagato?: boolean; note_admin?: string };
  const sql = await db();
  if (typeof body.pagato === "boolean")
    await sql`UPDATE registrations SET pagato = ${body.pagato} WHERE id = ${id}`;
  if (typeof body.note_admin === "string")
    await sql`UPDATE registrations SET note_admin = ${body.note_admin.slice(0, 2000)} WHERE id = ${id}`;
  return Response.json({ ok: true });
}

export async function DELETE(_: Request, { params }: Ctx) {
  if (!(await isAdmin())) return Response.json({ error: "Non autorizzato" }, { status: 401 });
  const id = Number((await params).id);
  const sql = await db();
  await sql`DELETE FROM registrations WHERE id = ${id}`;
  return Response.json({ ok: true });
}
