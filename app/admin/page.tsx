"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Registration } from "@/lib/db";

export default function AdminPage() {
  const [rows, setRows] = useState<Registration[] | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/registrations");
    if (res.status === 401) return setAuthed(false);
    setRows(await res.json());
    setAuthed(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (!res.ok) return setErr("Password non corretta");
    setPw("");
    load();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setRows(null);
    setAuthed(false);
  }

  async function togglePaid(r: Registration) {
    setRows((rs) => rs!.map((x) => (x.id === r.id ? { ...x, pagato: !r.pagato } : x)));
    await fetch(`/api/admin/registrations/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pagato: !r.pagato }),
    });
  }

  async function remove(r: Registration) {
    if (!confirm(`Eliminare l'iscrizione di ${r.cognome} ${r.nome}?`)) return;
    await fetch(`/api/admin/registrations/${r.id}`, { method: "DELETE" });
    load();
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!rows) return [];
    return s
      ? rows.filter((r) =>
          [r.nome, r.cognome, r.email, r.telefono, r.code, ...r.altri].join(" ").toLowerCase().includes(s),
        )
      : rows;
  }, [rows, q]);

  const stats = useMemo(() => {
    const all = rows ?? [];
    const paid = all.filter((r) => r.pagato);
    return {
      iscrizioni: all.length,
      persone: all.reduce((a, r) => a + r.partecipanti, 0),
      incassato: paid.reduce((a, r) => a + r.importo, 0),
      attesa: all.filter((r) => !r.pagato).reduce((a, r) => a + r.importo, 0),
    };
  }, [rows]);

  if (authed === null) return <main className="p-10 text-center text-ink/60">Caricamento…</main>;

  if (!authed)
    return (
      <main className="grid min-h-screen place-items-center bg-wine-deep px-6">
        <form onSubmit={login} className="w-full max-w-sm bg-ivory p-10 text-center">
          <h1 className="font-serif text-3xl text-wine">Area organizzatori</h1>
          <p className="mt-2 text-sm text-ink/60">Wine for Service {new Date().getFullYear()}</p>
          <input
            type="password"
            autoFocus
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            className="field mt-8 text-center"
          />
          {err && <p className="mt-3 text-sm text-red-800">{err}</p>}
          <button className="mt-8 w-full bg-wine py-4 text-xs uppercase tracking-[0.3em] text-ivory hover:bg-wine-deep">
            Entra
          </button>
        </form>
      </main>
    );

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl text-wine">Iscrizioni</h1>
        <div className="flex gap-3 text-xs uppercase tracking-[0.2em]">
          <a href="/api/admin/export" className="bg-wine px-5 py-3 text-ivory hover:bg-wine-deep">
            Scarica Excel
          </a>
          <button onClick={logout} className="border border-wine px-5 py-3 text-wine hover:bg-wine hover:text-ivory">
            Esci
          </button>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-px bg-gold/30 sm:grid-cols-4">
        {[
          ["Iscrizioni", stats.iscrizioni],
          ["Persone", stats.persone],
          ["Incassato", `€ ${stats.incassato}`],
          ["In attesa", `€ ${stats.attesa}`],
        ].map(([k, v]) => (
          <div key={k} className="bg-paper px-5 py-4">
            <div className="text-[0.65rem] uppercase tracking-[0.25em] text-wine-soft">{k}</div>
            <div className="font-serif text-3xl text-wine">{v}</div>
          </div>
        ))}
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cerca per nome, email, codice…"
        className="field mt-8"
      />

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-[0.65rem] uppercase tracking-[0.2em] text-wine-soft">
            <tr>
              <th className="py-3 pr-3">Iscritto</th>
              <th className="pr-3">Contatti</th>
              <th className="pr-3 text-center">Pers.</th>
              <th className="pr-3">Ospiti / note</th>
              <th className="pr-3 text-right">€</th>
              <th className="pr-3 text-center">Bonifico</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-gold/30 align-top">
                <td className="py-3 pr-3">
                  <div className="font-medium">{r.cognome} {r.nome}</div>
                  <div className="text-xs text-ink/50">
                    {r.code} · {new Date(r.created_at).toLocaleDateString("it-IT")}
                  </div>
                </td>
                <td className="pr-3">
                  <div>{r.email}</div>
                  <div className="text-xs text-ink/60">{r.telefono}</div>
                </td>
                <td className="pr-3 text-center">{r.partecipanti}</td>
                <td className="pr-3 text-xs text-ink/70">
                  {r.altri.join(", ")}
                  {r.note && <div className="mt-1 italic">“{r.note}”</div>}
                </td>
                <td className="pr-3 text-right">{r.importo}</td>
                <td className="pr-3 text-center">
                  <button
                    onClick={() => togglePaid(r)}
                    className={`px-3 py-1 text-xs ${r.pagato ? "bg-emerald-800 text-white" : "border border-gold text-wine-soft"}`}
                  >
                    {r.pagato ? "Ricevuto" : "In attesa"}
                  </button>
                </td>
                <td>
                  <button onClick={() => remove(r)} className="text-xs text-red-800 hover:underline">
                    Elimina
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-ink/50">Nessuna iscrizione.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
