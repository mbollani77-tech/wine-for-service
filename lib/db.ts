import { neon } from "@neondatabase/serverless";

export type Registration = {
  id: number;
  code: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  partecipanti: number;
  altri: string[];
  note: string;
  note_admin: string;
  importo: number;
  pagato: boolean;
  created_at: string;
};

const sql = neon(process.env.DATABASE_URL ?? "postgres://missing");
let ready: Promise<unknown> | null = null;

export function db() {
  ready ??= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    cognome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT NOT NULL,
    partecipanti INT NOT NULL,
    altri JSONB NOT NULL DEFAULT '[]',
    note TEXT NOT NULL DEFAULT '',
    note_admin TEXT NOT NULL DEFAULT '',
    importo NUMERIC NOT NULL,
    pagato BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
    await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS note_admin TEXT NOT NULL DEFAULT ''`;
  })();
  return ready.then(() => sql);
}

export function mapRow(r: Record<string, unknown>): Registration {
  return { ...(r as unknown as Registration), importo: Number(r.importo) };
}
