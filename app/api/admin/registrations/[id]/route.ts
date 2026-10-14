import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return Response.json({ error: "Non autorizzato" }, { status: 401 });
  const id = Number((await params).id);
  const { pagato } = (await req.json()) as { pagato: boolean };
  const sql = await db();
  await sql`UPDATE registrations SET pagato = ${!!pagato} WHERE id = ${id}`;
  return Response.json({ ok: true });
}

export async function DELETE(_: Request, { params }: Ctx) {
  if (!(await isAdmin())) return Response.json({ error: "Non autorizzato" }, { status: 401 });
  const id = Number((await params).id);
  const sql = await db();
  await sql`DELETE FROM registrations WHERE id = ${id}`;
  return Response.json({ ok: true });
}
