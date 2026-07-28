/* ============================================================================
   NEXTRUN — Inner screens (built incrementally)
   Step 1: PageHeader + Events Details (SPEC Story 3)
   Components are exposed on window so the other Babel scripts share scope.
   ============================================================================ */
const { useState: useStateS, useEffect: useEffectS } = React;

/* ---- extra icons (merged into the shared Icon map) ----------------------- */
Object.assign(Icon, {
  back:    (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M19 12H5m6-6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  chevron: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  cal:     (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>,
  route:   (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M6 19V8a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><circle cx="6" cy="19" r="2.2" stroke="currentColor" strokeWidth="1.7" /><circle cx="18" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.7" /></svg>,
  alert:   (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  check:   (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  download:(p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
});

/* ---- distance helpers ---------------------------------------------------- */
const fmtKm = (km) => (Number.isInteger(km) ? km.toFixed(2) : km.toString().replace(/(\.\d)$/, "$10")) ;
const distanceLabels = (ev) =>
  ev.distances.slice().sort((a, b) => a.kilometers - b.kilometers).map((d) => d.label).join(", ");

/* ============================ PAGE HEADER ================================= */
function PageHeader({ label, onBack }) {
  return (
    <div className="page-head">
      <span className="page-head__label">{label}</span>
      <button className="back-btn" onClick={onBack}><Icon.back /> Back</button>
    </div>);

}

/* ---- one distance row in the Register panel ------------------------------ */
function DistanceRow({ d, selected, disabled, onSelect }) {
  const [open, setOpen] = useStateS(false);
  return (
    <div
      className={"distance-card" + (selected ? " is-selected" : "") + (disabled ? " is-disabled" : "")}
      onClick={() => !disabled && onSelect(d.id)}
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}>
      
      <div className="distance-card__top">
        <span className="radio" />
        <h4 className="distance-card__name">{d.label}</h4>
        <span className="distance-card__price">{d.price} USD</span>
      </div>
      <p className="distance-card__km">{fmtKm(d.kilometers)} Km</p>
      {d.description &&
      <React.Fragment>
          <button
          className={"distance-card__more" + (open ? " is-open" : "")}
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
          
            More information <Icon.chevron />
          </button>
          {open && <p className="distance-card__desc">{d.description}</p>}
        </React.Fragment>
      }
    </div>);

}

/* ============================ EVENTS DETAILS ============================= */
function DetailScreen({ event, logo, onBack, onRegister }) {
  const [sel, setSel] = useStateS(null);
  const [imgOk, setImgOk] = useStateS(true);
  const d = fmtDate(event.date);
  const open = event.status === "registration-open";
  const dists = event.distances.slice().sort((a, b) => a.kilometers - b.kilometers);

  let ctaLabel = "Register";
  if (event.status === "upcoming") ctaLabel = "Registration not open yet";
  else if (event.status === "completed") ctaLabel = "Event finished";

  return (
    <div className="view detail">
      <header className="container">
        <PageHeader label="Events Details" onBack={onBack} />
        <h1 className="detail-title">{event.name}</h1>
        <div className="detail-meta">
          <span className="meta-row"><Icon.pin />{event.city}, {COUNTRY[event.country] || event.country}</span>
          <span className="meta-row"><Icon.cal />{d.full}</span>
          <span className="meta-row"><Icon.route />{distanceLabels(event)}</span>
        </div>
      </header>

      <div className="container">
        <div className="detail-banner">
          {imgOk ?
          <img src={event.bannerImage} alt={event.name} onError={() => setImgOk(false)} /> :
          <div className="detail-ph">event&nbsp;banner</div>}
        </div>

        <div className="detail-body">
          <div>
            {event.subtitle && <h2 className="detail-subtitle">{event.subtitle}</h2>}
            <div className="detail-desc">
              {event.description.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
            </div>
          </div>

          <aside className="register" role="radiogroup" aria-label="Choose a distance">
            <h3 className="register__head">Register</h3>
            <p className="register__hint">
              {open ? "Pick a distance to continue to checkout." : ctaLabel + "."}
            </p>
            <div className="distance-list">
              {dists.map((dist) =>
              <DistanceRow
                key={dist.id}
                d={dist}
                selected={sel === dist.id}
                disabled={!open}
                onSelect={setSel} />

              )}
            </div>
            <div className="register__cta">
              <button
                className="btn btn--primary btn--lg"
                disabled={!open || !sel}
                onClick={() => sel && onRegister(event.id, sel)}>
                
                {ctaLabel}
              </button>
            </div>
          </aside>
        </div>
      </div>

      <Footer logo={logo} />
    </div>);

}

/* ============================ CHECKOUT =================================== */
const DAYS   = Array.from({length:31},(_,i)=>i+1);
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const YEARS  = Array.from({length:100},(_,i)=>new Date().getFullYear()-i);

function genId(){
  if(crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{
    const r=Math.random()*16|0; return (c==='x'?r:(r&0x3|0x8)).toString(16);
  });
}

function validate(f, ev, distId){
  const errs={};
  if(!f.email.trim()) errs.email="This field is required";
  else if(!/^[^@]+@[^@]+\.[^@]+$/.test(f.email.trim())) errs.email="Invalid email format";
  else if(!/^[\x00-\x7F]+$/.test(f.email.trim())) errs.email="Latin characters only (a–z)";
  if(!f.firstName.trim()) errs.firstName="This field is required";
  else if(!/^[a-zA-Z\s\-']+$/.test(f.firstName.trim())) errs.firstName="Latin characters only (a–z)";
  if(!f.lastName.trim())  errs.lastName="This field is required";
  else if(!/^[a-zA-Z\s\-']+$/.test(f.lastName.trim())) errs.lastName="Latin characters only (a–z)";
  if(!f.gender)            errs.gender="This field is required";
  if(!f.dobDay||!f.dobMonth||!f.dobYear) errs.dob="Date of birth is required";
  else {
    const dob=new Date(+f.dobYear, +f.dobMonth-1, +f.dobDay);
    if(dob>new Date()) errs.dob="Date of birth must be in the past";
    else {
      const evDate=new Date(ev.date+"T00:00:00");
      let age=evDate.getFullYear()-dob.getFullYear();
      if(evDate<new Date(evDate.getFullYear(),dob.getMonth(),dob.getDate())) age--;
      if(age<16) errs.dob="You must be at least 16 years old to register";
    }
  }
  if(!f.address.trim()) errs.address="This field is required";
  else if(!/^[a-zA-Z0-9\s\-',./]+$/.test(f.address.trim())) errs.address="Latin characters only (a–z)";
  if(!f.phone.trim()) errs.phone="This field is required";
  else if(!/^\d{8,15}$/.test(f.phone.trim())) errs.phone="Invalid phone number (8–15 digits)";
  return errs;
}

function FormField({id,label,error,children}){
  return (
    <div className={"field"+(error?" has-error":"")}>
      <label className="field__label" htmlFor={id}>{label} <span className="req">*</span></label>
      {children}
      {error&&<p className="field__error"><Icon.alert/>{error}</p>}
    </div>);
}

function CheckoutScreen({event, distanceId, logo, onBack, onDone}){
  const dist = event.distances.find(d=>d.id===distanceId);
  const blank={email:'',firstName:'',lastName:'',gender:'',dobDay:'',dobMonth:'',dobYear:'',address:'',phone:''};
  const [f,setF] = useStateS(blank);
  const [errs,setErrs] = useStateS({});
  const [loading,setLoading] = useStateS(false);
  const [banner,setBanner] = useStateS('');

  const set=(k,v)=>{ setF(p=>({...p,[k]:v})); setErrs(p=>({...p,[k]:undefined})); };
  const setPhone=(v)=>set('phone',v.replace(/\D/g,''));

  function submit(e){
    e.preventDefault();
    const ev=validate(f, event, distanceId);
    if(Object.keys(ev).length){ setErrs(ev); return; }
    // duplicate email check
    const dup=event.participants.some(p=>p.email.toLowerCase()===f.email.trim().toLowerCase());
    if(dup){ setBanner('already'); return; }
    // simulate API save
    setLoading(true); setBanner('');
    setTimeout(()=>{
      const pid=genId();
      const dob=`${f.dobYear}-${String(f.dobMonth).padStart(2,'0')}-${String(f.dobDay).padStart(2,'0')}`;
      event.participants.push({
        id:pid, email:f.email.trim(), firstName:f.firstName.trim(), lastName:f.lastName.trim(),
        gender:f.gender, dateOfBirth:dob, address:f.address.trim(), phone:f.phone.trim(),
        distanceId, registeredAt:new Date().toISOString()
      });
      setLoading(false);
      onDone(event.id, pid);
    },900);
  }

  return (
    <div className="view checkout">
      <header className="container">
        <PageHeader label="Checkout" onBack={onBack}/>
        <div className="checkout-bar">
          <h1 className="checkout-bar__name">{event.name}</h1>
          <span className="checkout-bar__dist">{dist?.label||distanceId}</span>
        </div>
      </header>

      <div className="container">
        <form className="form" onSubmit={submit} noValidate>
          <p className="form__section">Your Information</p>

          {banner==='already'&&
            <div className="form__error-banner"><Icon.alert/>You are already registered for this event.</div>}
          {banner==='error'&&
            <div className="form__error-banner"><Icon.alert/>Registration failed. Please try again.</div>}

          <FormField id="email" label="Email" error={errs.email}>
            <input id="email" className="input" type="email" placeholder="Enter your email"
              value={f.email} onChange={e=>set('email',e.target.value)}/>
          </FormField>

          <div className="field-row">
            <FormField id="firstName" label="First Name" error={errs.firstName}>
              <input id="firstName" className="input" placeholder="John"
                value={f.firstName} onChange={e=>set('firstName',e.target.value)}/>
            </FormField>
            <FormField id="lastName" label="Last Name" error={errs.lastName}>
              <input id="lastName" className="input" placeholder="Doe"
                value={f.lastName} onChange={e=>set('lastName',e.target.value)}/>
            </FormField>
          </div>

          <FormField id="gender" label="Gender" error={errs.gender}>
            <div className="radio-row">
              {['male','female','other'].map(g=>(
                <label key={g} className={"radio-pill"+(f.gender===g?" is-on":"")}>
                  <input type="radio" name="gender" value={g}
                    checked={f.gender===g} onChange={()=>set('gender',g)}/>
                  <span className="radio"/>
                  {g.charAt(0).toUpperCase()+g.slice(1)}
                </label>))}
            </div>
          </FormField>

          <FormField id="dob" label="Date of Birth" error={errs.dob}>
            <div className="field-row field-row--dob">
              <select id="dob" className="select" value={f.dobDay} onChange={e=>set('dobDay',e.target.value)}>
                <option value="">DD</option>
                {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
              <select className="select" value={f.dobMonth} onChange={e=>set('dobMonth',e.target.value)}>
                <option value="">MM</option>
                {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
              </select>
              <select className="select" value={f.dobYear} onChange={e=>set('dobYear',e.target.value)}>
                <option value="">YYYY</option>
                {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </FormField>

          <FormField id="address" label="Address" error={errs.address}>
            <input id="address" className="input" placeholder="Street, City, Country"
              value={f.address} onChange={e=>set('address',e.target.value)}/>
          </FormField>

          <FormField id="phone" label="Phone" error={errs.phone}>
            <input id="phone" className="input" placeholder="Digits only, 8–15 characters"
              value={f.phone} onChange={e=>setPhone(e.target.value)}
              onPaste={e=>{e.preventDefault();const t=e.clipboardData.getData('text').replace(/\D/g,'');set('phone',t);}}
              inputMode="numeric"/>
          </FormField>

          <div className="form__cta">
            <button className="btn btn--primary btn--lg" type="submit" disabled={loading}>
              {loading?<React.Fragment><span className="spinner"/>&nbsp;Registering…</React.Fragment>:"Register"}
            </button>
          </div>
        </form>
      </div>

      <Footer logo={logo}/>
    </div>);
}

/* ============================ PDF GENERATION ============================= */
async function imgToBase64(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext('2d').drawImage(img, 0, 0);
        resolve(c.toDataURL('image/jpeg', 0.82));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

async function generateTicketPDF(event, participant, dist) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, m = 16, cW = W - m * 2;
  const dark = [21, 20, 15], muted = [138, 134, 120], yellow = [197, 168, 0];
  let y = 18;

  /* Header */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18); doc.setTextColor(...dark);
  doc.text('NEXTRUN.', m, y);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...muted);
  doc.text('Ticket', W - m, y, { align: 'right' });
  y += 5;

  /* Rule */
  doc.setDrawColor(...yellow); doc.setLineWidth(0.8);
  doc.line(m, y, W - m, y); y += 8;

  /* Banner photo (right col) */
  const photoW = cW * 0.38, photoH = photoW * (10 / 16);
  const photoX = m + cW - photoW, photoY = y;
  const b64 = await imgToBase64(event.bannerImage);
  if (b64) doc.addImage(b64, 'JPEG', photoX, photoY, photoW, photoH, '', 'FAST');
  else {
    doc.setFillColor(220, 215, 205); doc.rect(photoX, photoY, photoW, photoH, 'F');
  }

  /* Event title */
  doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(...dark);
  const titleLines = doc.splitTextToSize(event.name, cW * 0.58);
  doc.text(titleLines, m, y); y += titleLines.length * 8 + 3;

  /* Meta */
  doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...muted);
  doc.text(event.venue + ', ' + (COUNTRY[event.country] || event.country), m, y); y += 5.5;
  doc.text(fmtDate(event.date).full, m, y); y += 5.5;
  doc.text(dist.label, m, y); y = Math.max(y + 10, photoY + photoH + 8);

  /* Participant name */
  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...muted);
  doc.text('NAME OF PARTICIPANT', m, y); y += 5;
  doc.setFontSize(17); doc.setFont('helvetica', 'bold'); doc.setTextColor(...dark);
  doc.text(participant.firstName + ' ' + participant.lastName, m, y); y += 12;

  /* KV grid */
  const kvs = [
    ['PARTICIPANT ID', 'DFR-' + participant.id.slice(0, 12).toUpperCase()],
    ['PHONE', participant.phone],
    ['EMAIL', participant.email],
    ['ADDRESS', participant.address],
  ];
  const colW = cW / 3;
  kvs.forEach(([lbl, val], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const kx = m + col * colW, ky = y + row * 16;
    doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...muted);
    doc.text(lbl, kx, ky);
    doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...dark);
    doc.text(doc.splitTextToSize(val, colW - 4), kx, ky + 4.5);
  });
  y += Math.ceil(kvs.length / 3) * 16 + 8;

  /* Payment row */
  doc.setDrawColor(...dark); doc.setLineWidth(0.5); doc.line(m, y, W - m, y); y += 6;
  doc.setFontSize(10.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...dark);
  doc.text(dist.label + '  —  ' + event.name, m, y);
  doc.text(dist.price.toFixed(2) + ' USD', W - m, y, { align: 'right' }); y += 6;
  doc.setFontSize(9); doc.setTextColor(...yellow);
  doc.text('Successfully Registered', m, y); y += 14;

  /* Stub separator */
  doc.setDrawColor(200, 193, 180); doc.setLineWidth(0.3);
  doc.setLineDash([3, 2]); doc.line(m, y, W - m, y); doc.setLineDash([]); y += 8;

  /* Stub row */
  [['Name of Participant', participant.firstName + ' ' + participant.lastName],
   ['Phone', participant.phone],
   ['Participant ID', 'DFR-' + participant.id.slice(0, 12).toUpperCase()]
  ].forEach(([lbl, val], i) => {
    const sx = m + i * colW;
    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...muted);
    doc.text(lbl, sx, y);
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...dark);
    doc.text(val, sx, y + 5);
  }); y += 20;

  /* Event footer */
  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...muted);
  doc.text('Event', m, y); y += 5;
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...dark);
  doc.text(event.name, m, y); y += 6;
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...muted);
  doc.text([event.city + ', ' + (COUNTRY[event.country] || event.country), fmtDate(event.date).full, dist.label].join('   |   '), m, y);

  /* Save */
  const slug = event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  doc.save('ticket-' + slug + '-' + participant.id.slice(0, 8) + '.pdf');
}


function TicketA4({ event, participant, dist, onClose }) {
  const d = fmtDate(event.date);
  const [imgOk, setImgOk] = useStateS(true);
  return (
    <div className="ticket-overlay">
      <div className="ticket-toolbar">
        <button className="btn btn--primary btn--lg" onClick={() => window.print()}>
          <Icon.download /> Print / Save as PDF
        </button>
        <button className="btn btn--ghost btn--lg" onClick={onClose}>Close</button>
      </div>
      <div className="ticket-a4">
        <div className="ticket-a4__head">
          <div className="ticket-a4__brand">
            <span className="ticket-a4__brand-mark" />
            <span className="ticket-a4__brand-name">NEXTRUN<b>.</b></span>
          </div>
          <span className="ticket-a4__tag">Ticket</span>
        </div>
        <div className="ticket-a4__rule" />
        <h2 className="ticket-a4__title">{event.name}</h2>
        <div className="ticket-a4__cols">
          <div>
            <div className="ticket-a4__meta">
              <span className="meta-row"><Icon.pin style={{color:"#c9a800"}}/>{event.venue}, {COUNTRY[event.country]||event.country}</span>
              <span className="meta-row"><Icon.cal style={{color:"#c9a800"}}/>{d.full}</span>
            </div>
            <p className="ticket-a4__name-lbl">Name of Participant</p>
            <p className="ticket-a4__name">{participant.firstName} {participant.lastName}</p>
          </div>
          <div className="ticket-a4__photo">
            {imgOk
              ? <img src={event.bannerImage} alt={event.name} onError={() => setImgOk(false)} />
              : <div style={{width:'100%',height:'100%',background:'#eee'}} />}
          </div>
        </div>
        <div className="ticket-a4__kv-grid">
          <div className="ticket-a4__kv"><p className="l">Participant ID</p><p className="v">DFR-{participant.id.slice(0,12).toUpperCase()}</p></div>
          <div className="ticket-a4__kv"><p className="l">Phone</p><p className="v">{participant.phone}</p></div>
          <div className="ticket-a4__kv"><p className="l">Email</p><p className="v">{participant.email}</p></div>
          <div className="ticket-a4__kv" style={{gridColumn:'1/-1'}}><p className="l">Address</p><p className="v">{participant.address}</p></div>
        </div>
        <div className="ticket-a4__pay">
          <div>
            <p className="ticket-a4__pay-event">{dist.label} — {event.name}</p>
            <p className="ticket-a4__pay-status">Successfully Registered</p>
          </div>
          <p className="ticket-a4__pay-amount">{dist.price}.00 USD</p>
        </div>
      </div>
    </div>
  );
}

/* ========================== CONFIRMATION ================================= */
function ConfirmationScreen({ event, participantId, logo, onBack }) {
  const participant = event.participants.find(p => p.id === participantId);
  const [downloading, setDownloading] = useStateS(false);
  const [imgOk, setImgOk] = useStateS(true);

  if (!participant) {
    return (
      <div className="view">
        <header className="container"><PageHeader label="Confirmation Ticket" onBack={onBack} /></header>
        <div className="container nf">
          <p className="nf__code" style={{fontSize:'4rem'}}>404</p>
          <h2 className="nf__title">Participant <em>not found</em></h2>
          <p className="nf__text">This confirmation link is invalid or has expired.</p>
          <button className="btn btn--primary btn--lg" onClick={onBack}>Back to Home</button>
        </div>
        <Footer logo={logo} />
      </div>
    );
  }

  const dist = event.distances.find(d => d.id === participant.distanceId) || event.distances[0];
  const d = fmtDate(event.date);

  return (
    <div className="view confirm">
      <header className="container">
        <PageHeader label="Confirmation Ticket" onBack={onBack} />
      </header>

      <div className="container">
        <div className="confirm-banner">
          <div className="confirm-banner__check"><Icon.check /></div>
          <p className="confirm-banner__text">Your Order successfully done!</p>
        </div>

        <h1 className="confirm-title">{event.name}</h1>

        <div className="confirm-grid">
          <div>
            <div className="confirm-meta">
              <span className="meta-row"><Icon.pin />{event.venue}, {COUNTRY[event.country]||event.country}</span>
              <span className="meta-row"><Icon.cal />{d.full}</span>
              <span className="meta-row"><Icon.route />{dist.label}</span>
            </div>

            <div className="kv-list">
              <div>
                <p className="kv__label">Name of Participant</p>
                <p className="kv__value kv__value--name">{participant.firstName} {participant.lastName}</p>
              </div>
              <div>
                <p className="kv__label">Phone</p>
                <p className="kv__value">{participant.phone}</p>
              </div>
              <div>
                <p className="kv__label">Email</p>
                <p className="kv__value">{participant.email}</p>
              </div>
              <div>
                <p className="kv__label">Address</p>
                <p className="kv__value">{participant.address}</p>
              </div>
            </div>

            <div className="confirm-actions">
              <button
                className="download-btn"
                disabled={downloading}
                onClick={async () => {
                  setDownloading(true);
                  await generateTicketPDF(event, participant, dist);
                  setDownloading(false);
                }}>
                {downloading
                  ? <React.Fragment><span className="spinner" style={{borderTopColor:'var(--accent-ink)'}}/> Generating…</React.Fragment>
                  : <React.Fragment><Icon.download /> Download Ticket</React.Fragment>}
              </button>
            </div>
          </div>

          <div className="confirm-photo">
            {imgOk
              ? <img src={event.bannerImage} alt={event.name} onError={() => setImgOk(false)} />
              : <div className="detail-ph">event photo</div>}
          </div>
        </div>
      </div>

      <Footer logo={logo} />
    </div>
  );
}

/* ================================ 404 =================================== */
function NotFoundScreen({ logo, onBack }) {
  return (
    <div className="view">
      <header className="container">
        <PageHeader label="Error" onBack={onBack} />
      </header>
      <div className="container nf">
        <p className="nf__code">404</p>
        <h1 className="nf__title">Error <em>Page</em></h1>
        <p className="nf__text">The page you're looking for doesn't exist or has been moved.</p>
        <button className="btn btn--primary btn--lg" onClick={onBack}>
          <Icon.back /> Back to Home
        </button>
      </div>
      <Footer logo={logo} />
    </div>
  );
}

Object.assign(window, { PageHeader, DistanceRow, DetailScreen, CheckoutScreen, ConfirmationScreen, TicketA4, NotFoundScreen, fmtKm, distanceLabels });