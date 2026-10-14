import { checkPassword, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 800)); // rallenta i tentativi
    return Response.json({ error: "Password non corretta" }, { status: 401 });
  }
  await createSession();
  return Response.json({ ok: true });
}
