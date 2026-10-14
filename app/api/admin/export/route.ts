import ExcelJS from "exceljs";
import { isAdmin } from "@/lib/auth";
import { db, mapRow } from "@/lib/db";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Non autorizzato" }, { status: 401 });
  const sql = await db();
  const rows = (await sql`SELECT * FROM registrations ORDER BY created_at`).map(mapRow);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Iscrizioni");
  ws.columns = [
    { header: "Codice", key: "code", width: 12 },
    { header: "Data", key: "data", width: 18 },
    { header: "Cognome", key: "cognome", width: 18 },
    { header: "Nome", key: "nome", width: 18 },
    { header: "Email", key: "email", width: 30 },
    { header: "Telefono", key: "telefono", width: 16 },
    { header: "N. partecipanti", key: "n", width: 14 },
    { header: "Altri partecipanti", key: "altri", width: 40 },
    { header: "Note / intolleranze", key: "note", width: 40 },
    { header: "Importo €", key: "importo", width: 12 },
    { header: "Bonifico ricevuto", key: "pagato", width: 16 },
  ];
  ws.getRow(1).font = { bold: true };
  for (const r of rows)
    ws.addRow({
      code: r.code,
      data: new Date(r.created_at).toLocaleString("it-IT", { timeZone: "Europe/Rome" }),
      cognome: r.cognome,
      nome: r.nome,
      email: r.email,
      telefono: r.telefono,
      n: r.partecipanti,
      altri: r.altri.join(", "),
      note: r.note,
      importo: r.importo,
      pagato: r.pagato ? "Sì" : "No",
    });
  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="iscrizioni-wine-for-service-2026.xlsx"',
    },
  });
}
