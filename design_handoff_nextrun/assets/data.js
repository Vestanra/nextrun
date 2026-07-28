/* ============================================================================
   NEXTRUN — Mock events
   Shape mirrors SPEC §3.2 (Event / Distance / EventStatus / Participant). In the
   real project this comes from `GET /events` (MockAPI). Here it's a static array
   so the whole flow — filter(status), search(name), sort(date), minPrice, details,
   distance select, checkout, confirmation — is fully exercised client-side.

   `minPrice` is NOT stored (SPEC §3.3 derived state); computed at render time.
   `participants` start empty and are pushed to in-memory on a successful Checkout.
   ============================================================================ */
window.EVENTS = [
  {
    id: "1",
    name: "Mispo Winter Marathon",
    date: "2026-06-14",
    city: "Tallinn", country: "EE",
    venue: "Old Town Riverside",
    status: "registration-open",
    bannerImage: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1400&q=80",
    subtitle: "Run the medieval streets of Tallinn under the low winter sun.",
    description: "The Mispo Winter Marathon threads the cobblestone lanes of Tallinn's Old Town before opening onto the riverside promenade. Expect crisp air, generous aid stations every 5 km, and a crowd that lines the final kilometre into the merchant square.\n\nAll distances share a chip-timed start and finish inside the historic harbour. Pacers are provided for the half and full marathon at 10-minute intervals.",
    distances: [
      { id: "d1", label: "Half Marathon Individual", kilometers: 21.1, price: 50, description: "A flat, fast 21.1 km loop along the river with a single gentle climb at the 14 km mark." },
      { id: "d2", label: "Marathon Individual",      kilometers: 42.2, price: 60, description: "The full 42.2 km course — two riverside loops finishing through the Old Town gate." },
      { id: "d3", label: "10 km Run",                kilometers: 10,   price: 28, description: "A single fast loop, ideal for a first race or a tempo effort." }
    ],
    participants: []
  },
  {
    id: "2",
    name: "Maya Marathon — Run in the Jungle",
    date: "2026-06-21",
    city: "Cozumel", country: "MX",
    venue: "Riviera Maya Coast",
    status: "registration-open",
    bannerImage: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=1400&q=80",
    subtitle: "A coastal trail race through jungle canopy and Caribbean shoreline.",
    description: "Maya Marathon runs along shaded jungle paths before breaking out onto the white sand of the Riviera Maya. The early start beats the heat, and the second half hugs the coast with the sea breeze at your back.\n\nThis is a trail event — expect packed earth, roots and a couple of soft-sand sections near the finish.",
    distances: [
      { id: "d1", label: "10 km Trail", kilometers: 10, price: 10, description: "A rolling jungle loop on packed trail, finishing on the beach." },
      { id: "d2", label: "Half Marathon", kilometers: 21.1, price: 24, description: "Jungle out-and-back joined to a long coastal stretch." }
    ],
    participants: []
  },
  {
    id: "3",
    name: "The Stirling Scottish Marathon",
    date: "2026-07-05",
    city: "Stirling", country: "GB",
    venue: "Stirling Castle Loop",
    status: "registration-open",
    bannerImage: "https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=1400&q=80",
    subtitle: "From the castle esplanade out through the Carse of Stirling and back.",
    description: "The Stirling Scottish Marathon starts beneath the castle walls and rolls out into the wide green Carse before returning for a downhill finish past the Wallace Monument. A scenic, supported course with a generous time limit.\n\nThe 5 km is run entirely within the castle park for newer runners and families.",
    distances: [
      { id: "d1", label: "Marathon", kilometers: 42.2, price: 45, description: "The full point-to-loop course with the celebrated downhill finish." },
      { id: "d2", label: "Half Marathon", kilometers: 21.1, price: 21, description: "A single scenic loop through the Carse of Stirling." },
      { id: "d3", label: "5 km", kilometers: 5, price: 15, description: "A flat park course inside the castle grounds." }
    ],
    participants: []
  },
  {
    id: "4",
    name: "Gran Canaria Maspalomas",
    date: "2026-07-19",
    city: "Maspalomas", country: "ES",
    venue: "Dunes Boardwalk",
    status: "registration-open",
    bannerImage: "https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=1400&q=80",
    subtitle: "An evening race along the famous Maspalomas dunes and boardwalk.",
    description: "Gran Canaria Maspalomas is run in the cool of the evening, starting at the lighthouse and tracing the boardwalk that skirts the protected dunes. A fast, flat seafront course finishing under stadium lights.\n\nWater and electrolytes are provided every 3 km given the warm climate.",
    distances: [
      { id: "d1", label: "Half Marathon", kilometers: 21.1, price: 21, description: "Two laps of the seafront boardwalk, flat and fast." },
      { id: "d2", label: "10 km", kilometers: 10, price: 18, description: "A single seafront lap, perfect for an evening PB." }
    ],
    participants: []
  },
  {
    id: "5",
    name: "Paavo Nurmi Marathon",
    date: "2026-08-02",
    city: "Turku", country: "FI",
    venue: "Aura River Route",
    status: "registration-open",
    bannerImage: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1400&q=80",
    subtitle: "Finland's oldest marathon, run along the banks of the Aura river.",
    description: "Named for the legendary Flying Finn, the Paavo Nurmi Marathon follows the Aura river out of Turku and through the surrounding countryside. A historic, well-organised race with strong local support and a riverside finish.\n\nThe 1 km Kids race takes place on the morning of the event in the city centre.",
    distances: [
      { id: "d1", label: "Marathon", kilometers: 42.2, price: 55, description: "The classic riverside course out to the countryside and back." },
      { id: "d2", label: "Half Marathon", kilometers: 21.1, price: 30, description: "A riverside out-and-back finishing in the city centre." },
      { id: "d3", label: "1 km Kids", kilometers: 1, price: 5, description: "A short, fun city-centre loop for young runners." }
    ],
    participants: []
  },
  {
    id: "6",
    name: "VIRTUAL 20 km de Paris",
    date: "2026-08-16",
    city: "Paris", country: "FR",
    venue: "Bois de Boulogne",
    status: "registration-open",
    bannerImage: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1400&q=80",
    subtitle: "Run your 20 km anywhere — the classic Paris distance, your route.",
    description: "The VIRTUAL 20 km de Paris lets you run the iconic distance on your own roads, any time across the event weekend. Log your run, and your finisher pack and digital certificate are posted out.\n\nA suggested route through the Bois de Boulogne is provided for runners in Paris.",
    distances: [
      { id: "d1", label: "20 km", kilometers: 20, price: 21, description: "Run the 20 km on any route, tracked on your own device." }
    ],
    participants: []
  },
  {
    id: "7",
    name: "Running GP Oulton Park",
    date: "2026-08-30",
    city: "Cheshire", country: "GB",
    venue: "Oulton Park Circuit",
    status: "registration-open",
    bannerImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=80",
    subtitle: "Race traffic-free laps of a famous motorsport circuit.",
    description: "Running GP Oulton Park puts you on a closed motor-racing circuit — smooth tarmac, sweeping bends and a couple of cheeky climbs, with zero traffic. Multiple laps make for easy spectating and split-checking.\n\nA fast surface and a festival atmosphere in the paddock.",
    distances: [
      { id: "d1", label: "Half Marathon", kilometers: 21.1, price: 26, description: "Multiple circuit laps on smooth, closed tarmac." },
      { id: "d2", label: "10 km", kilometers: 10, price: 19, description: "A short, fast set of laps around the circuit." }
    ],
    participants: []
  },
  {
    id: "8",
    name: "Longueuil City Marathon",
    date: "2026-09-13",
    city: "Longueuil", country: "CA",
    venue: "St. Lawrence Promenade",
    status: "registration-open",
    bannerImage: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1400&q=80",
    subtitle: "A flat, fast autumn marathon along the St. Lawrence river.",
    description: "The Longueuil City Marathon runs the length of the St. Lawrence promenade with skyline views across to Montreal. Cool September temperatures and a pancake-flat profile make this a popular course for a personal best.\n\nFull road closures and pacers for every target time.",
    distances: [
      { id: "d1", label: "Marathon", kilometers: 42.2, price: 40, description: "A flat, fast riverside course built for PBs." },
      { id: "d2", label: "Half Marathon", kilometers: 21.1, price: 21, description: "A single flat loop along the promenade." }
    ],
    participants: []
  },
  {
    id: "9",
    name: "L'Ultra Marin",
    date: "2026-09-27",
    city: "Vannes", country: "FR",
    venue: "Gulf of Morbihan",
    status: "registration-open",
    bannerImage: "https://images.unsplash.com/photo-1486739985386-d4fae04ca6f7?auto=format&fit=crop&w=1400&q=80",
    subtitle: "An ultra around the wild coastline of the Gulf of Morbihan.",
    description: "L'Ultra Marin circles the Gulf of Morbihan on coastal paths, beaches and harbour towns. The 100 km is a serious undertaking with night sections and full support; the shorter distances share the most scenic stretches of the route.\n\nHeadtorch mandatory for the ultra. Cut-offs apply at each checkpoint.",
    distances: [
      { id: "d1", label: "Ultra 100 km", kilometers: 100, price: 90, description: "A full coastal circuit with night running and staffed checkpoints." },
      { id: "d2", label: "Marathon", kilometers: 42.2, price: 35, description: "The most scenic coastal section, run in daylight." },
      { id: "d3", label: "Half Marathon", kilometers: 21.1, price: 21, description: "A coastal-path half along the harbour towns." }
    ],
    participants: []
  },
  /* --- Below: intentionally NOT "registration-open" → proves the Home filter
         hides them (SPEC Story 1), and the Details status states render. --- */
  {
    id: "10",
    name: "Reykjavik Midnight Sun Run",
    date: "2026-06-10",
    city: "Reykjavik", country: "IS",
    venue: "Harbour Front",
    status: "upcoming",
    bannerImage: "https://images.unsplash.com/photo-1508215885820-4585e56135c8?auto=format&fit=crop&w=1400&q=80",
    subtitle: "A late-night run under the Icelandic midnight sun.",
    description: "Registration opens soon for this bucket-list run along Reykjavik's harbour front, started just before midnight under perpetual daylight.",
    distances: [ { id: "d1", label: "10 km", kilometers: 10, price: 22, description: "A harbour-front loop under the midnight sun." } ],
    participants: []
  },
  {
    id: "11",
    name: "Berlin Autumn Classic",
    date: "2026-05-03",
    city: "Berlin", country: "DE",
    venue: "Tiergarten",
    status: "completed",
    bannerImage: "https://images.unsplash.com/photo-1456613820599-bfe244172af5?auto=format&fit=crop&w=1400&q=80",
    subtitle: "The traditional season-opener through the Tiergarten.",
    description: "This event has finished. Results and photos are available from the organiser.",
    distances: [ { id: "d1", label: "Marathon", kilometers: 42.2, price: 60, description: "A flat city-park marathon through central Berlin." } ],
    participants: []
  }
];
