/* ============================================================================
   STRIDE — Presentational components (Home)
   Each maps to a React component file in the reproduced project. Exposed on
   window so the Babel scripts can share scope.
   ============================================================================ */
const { useState, useEffect, useRef } = React;

/* ---- Icons (inline, stroke = currentColor) ------------------------------- */
const Icon = {
  search: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  pin: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.7" /></svg>,
  flag: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 21V4m0 0 9 1.5L19 4v9l-5 1.5L5 13" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>,
  arrow: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  close: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  phone: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 4h3l2 5-2 1.5a11 11 0 0 0 5 5L16 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>,
  mail: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" /></svg>,
  shoe: (p) => <svg viewBox="0 0 64 40" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 10h10M1 18h12M4 26h10"/><path d="M16 30C13 21 16 14 24 14h11c5 0 7 2 11 3.4 6 2 12 3.6 12 7.6 0 2.2-1.8 3-4 3H19"/><path d="M28 14.5l4.5 5M34 14.8l4.3 4.8M40 16l3.8 4.2"/><path d="M14 31h44" strokeWidth="2.8"/></svg>
};

/* ---- Helpers (mirror SPEC derived state) --------------------------------- */
const COUNTRY = { EE: "Estonia", MX: "Mexico", GB: "United Kingdom", ES: "Spain", FI: "Finland", FR: "France", CA: "Canada", IS: "Iceland", DE: "Germany" };
const minPrice = (ev) => Math.min(...ev.distances.map((d) => d.price));
function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return {
    day: String(d.getDate()).padStart(2, "0"),
    mon: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    full: d.toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric" }) +
    " (" + d.toLocaleString("en-US", { weekday: "short" }) + ")"
  };
}

/* ---- Brand wordmark ------------------------------------------------------ */
function Brand({ logo = "runner" }) {
  return (
    <a className="brand" href="#" onClick={(e) => e.preventDefault()}>
      <span className={"brand__mark brand__mark--" + logo} role="img" aria-label="NEXTRUN logo" />
      <span className="brand__name">NEXTRUN<b>.</b></span>
    </a>);

}

/* ---- Search bar (controlled; syncs ?q via parent) ------------------------ */
function SearchBar({ value, onChange }) {
  return (
    <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
      <input
        className="search__input"
        type="text"
        placeholder="Search races by name…"
        value={value}
        aria-label="Search races by name"
        onChange={(e) => onChange(e.target.value)} />
      
      {value &&
      <button type="button" className="search__clear" aria-label="Clear search" onClick={() => onChange("")}>
          <Icon.close />
        </button>
      }
      <button type="submit" className="search__btn" aria-label="Search"><Icon.search /></button>
    </form>);

}

/* ---- Event card ---------------------------------------------------------- */
function EventCard({ ev, onOpen }) {
  const [imgOk, setImgOk] = useState(true);
  const d = fmtDate(ev.date);
  const price = minPrice(ev);
  return (
    <button className="event-card" onClick={() => onOpen(ev)}>
      <div className="event-card__media">
        {imgOk ?
        <img className="event-card__img" src={ev.bannerImage} alt={ev.name} loading="lazy" onError={() => setImgOk(false)} /> :
        <div className="event-card__ph">running&nbsp;photo</div>}
        <div className="event-card__date"><b>{d.day}</b><span>{d.mon}</span></div>
        {ev.status !== "registration-open" &&
        <div className="event-card__flag">{ev.status === "completed" ? "Finished" : "Soon"}</div>
        }
      </div>
      <div className="event-card__body">
        <h3 className="event-card__title">{ev.name}</h3>
        <div className="event-card__meta">
          <span className="meta-row"><Icon.pin />{ev.city}, {COUNTRY[ev.country] || ev.country}</span>
          <span className="meta-row"><Icon.flag />{ev.distances.length} distances · {d.full}</span>
        </div>
        <div className="event-card__foot">
          <span className="event-card__price">Starting at<b><span>$</span>{price} USD</b></span>
          <span className="event-card__go"><Icon.arrow /></span>
        </div>
      </div>
    </button>);

}

/* ---- Mobile carousel dots ------------------------------------------------ */
function CarouselDots({ count, gridRef }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const onScroll = () => {
      const card = el.querySelector(".event-card");
      if (!card) return;
      const step = card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || 0);
      setActive(Math.round(el.scrollLeft / step));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [count]);
  const go = (i) => {
    const el = gridRef.current;
    const card = el && el.querySelector(".event-card");
    if (!card) return;
    const step = card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || 0);
    el.scrollTo({ left: step * i, behavior: "smooth" });
  };
  return (
    <div className="carousel-dots">
      {Array.from({ length: count }).map((_, i) =>
      <button key={i} aria-current={i === active} aria-label={`Go to card ${i + 1}`} onClick={() => go(i)} />
      )}
    </div>);

}

/* ---- Footer -------------------------------------------------------------- */
function Footer({ logo }) {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <Brand logo={logo} />
          <p className="footer-blurb">Find your next race. Browse marathons, trail runs and city classics — then register in a couple of taps.</p>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <ul className="footer-contact">
            <li><Icon.phone /> +1 (405) 732-5617</li>
            <li><Icon.mail /> hello@nextrun.run</li>
            <li><Icon.pin /> 98 Winn St, Woburn, MA 01801</li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 NEXTRUN. A learning project.</span>
        <span>Built from SPEC.md · charcoal / yellow</span>
      </div>
    </footer>);

}

Object.assign(window, { Icon, Brand, SearchBar, EventCard, CarouselDots, Footer, minPrice, fmtDate, COUNTRY });