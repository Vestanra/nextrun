/* ============================================================================
   NEXTRUN — App + client router (hash-based, mirrors SPEC §4 routes)
   ============================================================================ */
const { useState, useEffect, useRef } = window.React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "density": "regular",
  "logo": "rabbit"
}/*EDITMODE-END*/;

const THEME_ACCENT = { charcoal: "#f5d90a", dusk: "#f5d90a", light: "#1e1c12" };
const THEME_INK    = { charcoal: "#15140f", dusk: "#15140f", light: "#f5f0dc" };

/* ---- tiny hash router ---------------------------------------------------- */
function parseRoute() {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const [path, queryStr] = raw.split("?");
  const query = new URLSearchParams(queryStr || "");
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return { name: "home" };
  if (parts[0] === "events" && parts[1]) {
    const id = parts[1];
    if (parts.length === 2) return { name: "details", id };
    if (parts[2] === "checkout") return { name: "checkout", id, distance: query.get("distance") };
    if (parts[2] === "confirmation" && parts[3]) return { name: "confirmation", id, pid: parts[3] };
  }
  return { name: "notfound" };
}
function go(path) { window.location.hash = path; window.scrollTo(0, 0); }
function useRoute() {
  const [route, setRoute] = useState(parseRoute());
  useEffect(() => {
    const on = () => setRoute(parseRoute());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}
const findEvent = (id) => window.EVENTS.find((e) => e.id === id);

/* =============================== HOME ==================================== */
function readQ() { return new URLSearchParams(window.location.search).get("q") || ""; }

function HomeScreen({ logo }) {
  const [query, setQuery] = useState(readQ());
  const gridRef = useRef(null);

  const open = window.EVENTS.filter((e) => e.status === "registration-open");
  const q = query.trim().toLowerCase();
  const filtered = (q ? open.filter((e) => e.name.toLowerCase().includes(q)) : open)
    .slice().sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="view">
      <header className="container">
        <div className="topbar">
          <Brand logo={logo} />
          <SearchBar value={query} onChange={setQuery} />
        </div>
        <div className="events-head">
          <h1 className="events-head__title">All Events <em>You've Got</em></h1>
          <p className="events-head__count"><b>{filtered.length}</b> Listing Found</p>
        </div>
      </header>

      <main className="container" style={{ flex: 1 }}>
        {filtered.length > 0 ?
          <React.Fragment>
            <div className="event-grid" ref={gridRef}>
              {filtered.map((ev) => <EventCard key={ev.id} ev={ev} onOpen={(e) => go("/events/" + e.id)} />)}
            </div>
            <CarouselDots count={filtered.length} gridRef={gridRef} />
          </React.Fragment> :
          <div className="state">
            <h2 className="state__big">No events <em>match your search</em></h2>
            <p>Try a different name, or clear the search to see every race.</p>
            <button className="btn btn--primary btn--lg" onClick={() => setQuery("")}>Clear search</button>
          </div>
        }
      </main>

      <Footer logo={logo} />
    </div>
  );
}

/* =============================== APP ===================================== */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const route = useRoute();
  /* Apply theme tokens to <html> */
  useEffect(() => {
    const root = document.documentElement;
    const accent = THEME_ACCENT[t.theme] || "#f5d90a";
    root.setAttribute("data-theme", t.theme);
    root.setAttribute("data-density", t.density);
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-strong", "color-mix(in oklch, " + accent + " 78%, white)");
    root.style.setProperty("--accent-ink", THEME_INK[t.theme] || "#15140f");
  }, [t.theme, t.density]);

  /* Main app */
  let screen;
  if (route.name === "home") {
    screen = <HomeScreen logo={t.logo} />;
  } else if (route.name === "details") {
    const ev = findEvent(route.id);
    screen = ev ?
      <DetailScreen event={ev} logo={t.logo}
        onBack={() => go("/")}
        onRegister={(id, dist) => go("/events/" + id + "/checkout?distance=" + dist)} /> :
      <NotFoundScreen logo={t.logo} onBack={() => go("/")} />;
  } else if (route.name === "checkout") {
    const ev = findEvent(route.id);
    const dist = route.distance;
    const validDist = ev && ev.distances.find((d) => d.id === dist);
    screen = ev && validDist ?
      <CheckoutScreen event={ev} distanceId={dist} logo={t.logo}
        onBack={() => go("/")}
        onDone={(id, pid) => go("/events/" + id + "/confirmation/" + pid)} /> :
      <NotFoundScreen logo={t.logo} onBack={() => go("/")} />;
  } else if (route.name === "confirmation") {
    const ev = findEvent(route.id);
    screen = ev ?
      <ConfirmationScreen event={ev} participantId={route.pid} logo={t.logo} onBack={() => go("/")} /> :
      <NotFoundScreen logo={t.logo} onBack={() => go("/")} />;
  } else {
    screen = <NotFoundScreen logo={t.logo} onBack={() => go("/")} />;
  }

  return (
    <div className="app-root">
      {screen}
      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakRadio label="Surface" value={t.theme} options={["charcoal", "dusk", "light"]} onChange={(v) => setTweak("theme", v)} />
        <TweakSection label="Brand" />
        <TweakRadio label="Logo mark" value={t.logo} options={["runner", "rabbit"]} onChange={(v) => setTweak("logo", v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Card density" value={t.density} options={["compact", "regular", "comfy"]} onChange={(v) => setTweak("density", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
