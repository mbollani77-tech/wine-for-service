import RegistrationForm from "@/components/RegistrationForm";
import { EVENT } from "@/lib/config";

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden bg-wine-deep text-ivory">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 10%, rgba(176,141,87,.18), transparent 55%), radial-gradient(ellipse at 85% 90%, rgba(107,29,46,.9), transparent 60%)",
          }}
        />
        <div className="relative mx-auto flex min-h-[92vh] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
          <p className="rise text-xs uppercase tracking-[0.4em] text-gold-soft">
            Rotary Club Chiari
          </p>
          <div className="rise rise-2 mt-8">
            <div className="ornament justify-center font-serif text-2xl italic">
              {EVENT.edition} edizione · {EVENT.year}
            </div>
            <h1 className="mt-6 font-serif text-6xl font-medium leading-[0.95] tracking-tight sm:text-8xl">
              Wine <span className="italic text-gold-soft">for</span> Service
            </h1>
          </div>
          <p className="rise rise-3 mt-10 max-w-xl font-serif text-xl leading-relaxed text-ivory/85 sm:text-2xl">
            Una cena esclusiva, un’asta di vini selezionati e un’esposizione di vini
            pregiati, per un mezzo destinato alle cure palliative a domicilio.
          </p>
          <div className="rise rise-3 mt-12 grid gap-px overflow-hidden rounded-sm border border-gold/40 bg-gold/30 text-sm sm:grid-cols-3">
            {[
              ["Quando", `${EVENT.dateLabel} · ore ${EVENT.time}`],
              ["Dove", `${EVENT.venue} · ${EVENT.city}`],
              ["Contributo", `€ ${EVENT.pricePerPerson} a persona`],
            ].map(([k, v]) => (
              <div key={k} className="bg-wine-deep/90 px-8 py-5">
                <div className="text-[0.65rem] uppercase tracking-[0.3em] text-gold-soft">{k}</div>
                <div className="mt-1 font-serif text-xl">{v}</div>
              </div>
            ))}
          </div>
          <a
            href="#iscrizione"
            className="rise rise-3 mt-12 border border-gold px-10 py-4 text-xs uppercase tracking-[0.3em] text-gold-soft transition hover:bg-gold hover:text-wine-deep"
          >
            Iscriviti alla serata
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="ornament justify-center font-serif text-lg italic">Il service</div>
        <p className="mt-8 font-serif text-2xl leading-relaxed text-ink/90 sm:text-3xl">
          Il Rotary Club Chiari organizza un service per l’acquisto di un mezzo destinato
          all’Ospedale di Chiari – ASST Franciacorta per il servizio di{" "}
          <em className="text-wine-soft">cure palliative a domicilio</em>.
        </p>
        <p className="mt-6 text-ink/70">
          La cena sarà seguita da un’asta di vini selezionati e da una esposizione di vini
          pregiati. Nuova location: {EVENT.venue}, {EVENT.city}.
        </p>
      </section>

      <section id="iscrizione" className="bg-paper px-6 py-24">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <div className="ornament justify-center font-serif text-lg italic">Iscrizione</div>
            <h2 className="mt-4 font-serif text-4xl text-wine sm:text-5xl">Riserva il tuo posto</h2>
          </div>
          <RegistrationForm />
        </div>
      </section>

      <footer className="bg-wine-deep px-6 py-10 text-center text-sm text-ivory/70">
        <p className="font-serif text-lg text-gold-soft">Rotary Club Chiari</p>
        <p className="mt-2">
          Info: {EVENT.phone} · {EVENT.email}
        </p>
      </footer>
    </main>
  );
}
