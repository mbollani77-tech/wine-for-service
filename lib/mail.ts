import nodemailer from "nodemailer";
import { Resend } from "resend";
import { EVENT } from "@/lib/config";

type Conferma = {
  nome: string;
  cognome: string;
  email: string;
  code: string;
  partecipanti: number;
  importo: number;
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function html(r: Conferma) {
  return `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#2a1a1f">
  <h2 style="color:#6b1d2e;font-weight:normal">Grazie, ${esc(r.nome)}.</h2>
  <p>Abbiamo ricevuto la tua iscrizione a <b>${EVENT.name}</b> – ${EVENT.edition} edizione,
  ${EVENT.dateLabel.toLowerCase()} ${EVENT.year} alle ${EVENT.time}, ${EVENT.venue}, ${EVENT.address}, ${EVENT.city}.</p>
  <p>Partecipanti: <b>${r.partecipanti}</b><br>Contributo: <b>€ ${r.importo}</b></p>
  <p>Per perfezionare l'iscrizione effettua un bonifico a:</p>
  <p style="background:#f6efe6;padding:14px;border-left:3px solid #b08d57">
  <b>${EVENT.accountHolder}</b><br>${EVENT.bank}<br>IBAN: <b>${EVENT.iban}</b><br>
  Causale: <b>${esc(r.cognome)} ${esc(r.nome)} – ${r.code}</b></p>
  <p style="color:#777;font-size:13px">Info: ${EVENT.email} · ${EVENT.phone}</p>
  <p>Il Rotary Club Chiari</p></div>`;
}

/**
 * Invia la conferma di iscrizione. Non lancia mai: un errore email non deve
 * far fallire l'iscrizione. Priorità: SMTP (es. Gmail) poi Resend.
 */
export async function sendConfirmation(r: Conferma) {
  const subject = `Iscrizione ${EVENT.name} ${EVENT.year} – ${r.code}`;
  const { SMTP_USER, SMTP_PASS, SMTP_HOST, RESEND_API_KEY, MAIL_FROM } = process.env;
  try {
    if (SMTP_USER && SMTP_PASS) {
      const transport = nodemailer.createTransport({
        host: SMTP_HOST || "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
      await transport.sendMail({
        from: MAIL_FROM || `"Rotary Club Chiari" <${SMTP_USER}>`,
        to: r.email,
        bcc: EVENT.email,
        replyTo: EVENT.email,
        subject,
        html: html(r),
      });
    } else if (RESEND_API_KEY && MAIL_FROM) {
      await new Resend(RESEND_API_KEY).emails.send({
        from: MAIL_FROM,
        to: r.email,
        bcc: EVENT.email,
        replyTo: EVENT.email,
        subject,
        html: html(r),
      });
    }
  } catch (e) {
    console.error("Invio email fallito", e);
  }
}
