"use client";

import { useState } from "react";
import { EVENT } from "@/lib/config";

type Done = { code: string; importo: number; nome: string; cognome: string };

export default function RegistrationForm() {
  const [n, setN] = useState(1);
  const [altri, setAltri] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const [copied, setCopied] = useState(false);

  const changeN = (v: number) => {
    setN(v);
    setAltri((a) => Array.from({ length: v - 1 }, (_, i) => a[i] ?? ""));
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? "");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: g("nome"),
          cognome: g("cognome"),
          email: g("email"),
          telefono: g("telefono"),
          partecipanti: n,
          altri,
          note: g("note"),
          privacy: f.get("privacy") === "on",
          website: g("website"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Errore");
      setDone({ code: data.code, importo: data.importo ?? n * EVENT.pricePerPerson, nome: g("nome"), cognome: g("cognome") });
      document.getElementById("iscrizione")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore imprevisto, riprova.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    const causale = `${done.cognome} ${done.nome} – ${done.code}`;
    return (
      <div className="mt-12 border border-gold/50 bg-ivory p-8 text-center sm:p-12">
        <p className="font-serif text-3xl text-wine">Grazie, {done.nome}.</p>
        <p className="mt-3 text-ink/75">
          La tua iscrizione è stata registrata. Per perfezionarla effettua il bonifico di
        </p>
        <p className="mt-2 font-serif text-5xl text-wine-soft">€ {done.importo}</p>
        <dl className="mx-auto mt-8 max-w-md space-y-4 text-left text-sm">
          <Row k="Intestatario" v={EVENT.accountHolder} />
          <Row k="Banca" v={EVENT.bank} />
          <Row k="IBAN" v={EVENT.iban} mono />
          <Row k="Causale" v={causale} />
        </dl>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(`${EVENT.iban.replace(/\s/g, "")}\n${causale}`);
            setCopied(true);
          }}
          className="mt-8 border border-wine px-6 py-3 text-xs uppercase tracking-[0.25em] text-wine transition hover:bg-wine hover:text-ivory"
        >
          {copied ? "Copiato" : "Copia IBAN e causale"}
        </button>
        <p className="mt-6 text-xs text-ink/55">
          Se abbiamo il servizio email attivo riceverai una conferma con gli stessi dati.
          Codice iscrizione: {done.code}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-12 space-y-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="nome">Nome</label>
          <input id="nome" name="nome" required autoComplete="given-name" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="cognome">Cognome</label>
          <input id="cognome" name="cognome" required autoComplete="family-name" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="telefono">Telefono</label>
          <input id="telefono" name="telefono" type="tel" required autoComplete="tel" className="field" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="n">Numero partecipanti</label>
        <select
          id="n"
          value={n}
          onChange={(e) => changeN(Number(e.target.value))}
          className="field"
        >
          {Array.from({ length: EVENT.maxPerRegistration }, (_, i) => i + 1).map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      {altri.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2">
          {altri.map((name, i) => (
            <div key={i}>
              <label className="label" htmlFor={`p${i}`}>Nome e cognome ospite {i + 2}</label>
              <input
                id={`p${i}`}
                required
                value={name}
                onChange={(e) => setAltri((a) => a.map((x, j) => (j === i ? e.target.value : x)))}
                className="field"
              />
            </div>
          ))}
        </div>
      )}

      <div>
        <label className="label" htmlFor="note">Intolleranze o richieste</label>
        <textarea id="note" name="note" rows={2} className="field resize-y" />
      </div>

      {/* honeypot anti-bot */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px]" />

      <label className="flex items-start gap-3 text-sm text-ink/75">
        <input type="checkbox" name="privacy" required className="mt-1 accent-[#6b1d2e]" />
        <span>Autorizzo il trattamento dei dati per la gestione dell’iscrizione all’evento.</span>
      </label>

      <div className="flex items-baseline justify-between border-t border-gold/40 pt-6">
        <span className="text-xs uppercase tracking-[0.25em] text-wine-soft">Contributo totale</span>
        <span className="font-serif text-4xl text-wine">€ {n * EVENT.pricePerPerson}</span>
      </div>

      {error && <p role="alert" className="text-sm font-medium text-red-800">{error}</p>}

      <button
        disabled={busy}
        className="w-full bg-wine py-5 text-xs uppercase tracking-[0.35em] text-ivory transition hover:bg-wine-deep disabled:opacity-60"
      >
        {busy ? "Invio in corso…" : "Conferma iscrizione"}
      </button>
      <p className="text-center text-xs text-ink/55">
        L’iscrizione si perfeziona con il bonifico di € {EVENT.pricePerPerson} a persona.
      </p>
    </form>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex flex-col border-b border-gold/30 pb-3 sm:flex-row sm:justify-between">
      <dt className="text-[0.65rem] uppercase tracking-[0.25em] text-wine-soft">{k}</dt>
      <dd className={mono ? "font-mono break-all" : ""}>{v}</dd>
    </div>
  );
}
