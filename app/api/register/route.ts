import { randomInt } from "node:crypto";
import { z } from "zod";
import { Resend } from "resend";
import { db, mapRow } from "@/lib/db";
import { EVENT } from "@/lib/config";

const schema = z.object({
  nome: z.string().trim().min(1).max(80),
  cognome: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  telefono: z.string().trim().min(6).max(30),
  partecipanti: z.number().int().min(1).max(EVENT.maxPerRegistration),
  altri: z.array(z.string().trim().max(120)).max(EVENT.maxPerRegistration),
  note: z.string().trim().max(1000).default(""),
  privacy: z.literal(true),
  website: z.string().optional(), // honeypot
});

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newCode = () =>
  "WFS-" + Array.from({ length: 5 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Dati non validi" }, { status: 400 });
  const d = parsed.data;
  if (d.website) return Response.json({ ok: true }); // bot: finge successo

  const altri = d.altri.slice(0, d.partecipanti - 1);
  if (altri.length < d.partecipanti - 1 || altri.some((n) => !n))
    return Response.json({ error: "Inserisci il nome di tutti i partecipanti" }, { status: 400 });

  const sql = await db();
  if (EVENT.maxSeats > 0) {
    const [{ tot }] = await sql`SELECT COALESCE(SUM(partecipanti),0)::int AS tot FROM registrations`;
    if (tot + d.partecipanti > EVENT.maxSeats)
      return Response.json({ error: "Posti esauriti o insufficienti" }, { status: 409 });
  }

  const importo = d.partecipanti * EVENT.pricePerPerson;
  let row;
  for (let i = 0; i < 5 && !row; i++) {
    const res = await sql`INSERT INTO registrations
      (code,nome,cognome,email,telefono,partecipanti,altri,note,importo)
      VALUES (${newCode()},${d.nome},${d.cognome},${d.email},${d.telefono},
              ${d.partecipanti},${JSON.stringify(altri)}::jsonb,${d.note},${importo})
      ON CONFLICT (code) DO NOTHING RETURNING *`;
    row = res[0];
  }
  if (!row) return Response.json({ error: "Errore, riprova" }, { status: 500 });
  const r = mapRow(row);

  if (process.env.RESEND_API_KEY && process.env.MAIL_FROM) {
    try {
      await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: process.env.MAIL_FROM,
        to: r.email,
        bcc: EVENT.email,
        subject: `Iscrizione ${EVENT.name} ${EVENT.year} – ${r.code}`,
        html: confirmationHtml(r),
      });
    } catch (e) {
      console.error("Invio email fallito", e);
    }
  }
  return Response.json({ ok: true, code: r.code, importo });
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function confirmationHtml(r: { nome: string; cognome: string; code: string; partecipanti: number; importo: number }) {
  return `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#2a1a1f">
  <h2 style="color:#6b1d2e;font-weight:normal">Grazie, ${esc(r.nome)}.</h2>
  <p>Abbiamo ricevuto la tua iscrizione a <b>${EVENT.name}</b> – ${EVENT.edition} edizione,
  ${EVENT.dateLabel.toLowerCase()} ${EVENT.year} alle ${EVENT.time}, ${EVENT.venue}, ${EVENT.city}.</p>
  <p>Partecipanti: <b>${r.partecipanti}</b><br>Contributo: <b>€ ${r.importo}</b></p>
  <p>Per perfezionare l'iscrizione effettua un bonifico a:</p>
  <p style="background:#f6efe6;padding:14px;border-left:3px solid #b08d57">
  <b>${EVENT.accountHolder}</b><br>${EVENT.bank}<br>IBAN: <b>${EVENT.iban}</b><br>
  Causale: <b>${esc(r.cognome)} ${esc(r.nome)} – ${r.code}</b></p>
  <p style="color:#777;font-size:13px">Info: ${EVENT.email} · ${EVENT.phone}</p>
  <p>Il Rotary Club Chiari</p></div>`;
}
