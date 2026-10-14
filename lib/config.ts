export const EVENT = {
  name: "Wine for Service",
  edition: "IV",
  year: 2026,
  dateLabel: "Sabato 14 novembre",
  time: "19:30",
  venue: "Villa Mazzotti",
  city: "Chiari",
  pricePerPerson: 80,
  maxPerRegistration: 10,
  accountHolder: "ROTARY CLUB CHIARI",
  iban: "IT83 W033 6754 3400 0010 0000 403",
  bank: "Banca Santa Giulia – Chiari",
  email: "servicercchiari@gmail.com",
  phone: "030 7002776",
  // Posti massimi (0 = illimitati). Sovrascrivibile con la variabile MAX_SEATS.
  maxSeats: Number(process.env.MAX_SEATS ?? 0),
};
