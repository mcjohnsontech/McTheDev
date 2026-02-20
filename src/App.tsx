import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM — Deep Indigo-Purple × Midnight Atmosphere
   ═══════════════════════════════════════════════════════════════════════════ */
const C = {
  // Sky
  skyZenith:    "#0a0614",
  skyMid:       "#160b30",
  skyDeep:      "#1e0f42",
  skyGlow:      "#2d1468",
  // Horizon
  horizonPurp:  "#3b1f6e",
  horizonPink:  "#6b2d8b",
  // Ground
  groundFar:    "#0d0820",
  groundMid:    "#130d2e",
  groundNear:   "#1c1040",
  grass:        "#1a0e42",
  grassLight:   "#241554",
  // Road
  roadBase:     "#08060f",
  roadSurface:  "#0d0a1e",
  roadLine:     "#b89aff",
  roadEdgeGlow: "rgba(120,60,220,0.2)",
  // Accents
  accent:       "#a78bfa",     // soft violet
  accentBright: "#c084fc",     // bright purple
  accentGold:   "#f0c060",     // warm gold contrast
  accentPink:   "#e879f9",     // magenta pop
  neon:         "#d946ef",     // neon fuchsia for glows
  teal:         "#818cf8",     // indigo-teal
  // Sign
  signPurp:     "#3730a3",
  signLight:    "#4338ca",
  // Text
  textPrimary:  "#f0e6ff",
  textSecond:   "#a78bfa",
  textDim:      "#4c3880",
  // Glass
  glass:        "rgba(22,11,44,0.72)",
  glassBorder:  "rgba(167,139,250,0.22)",
  // Skin tones (for accurate avatar)
  skinBase:     "#5c3018",   // deep brown
  skinMid:      "#6d3a1e",   // mid brown
  skinLight:    "#7a4525",   // highlight brown
  skinShadow:   "#3d1e0a",   // deep shadow
  skinLip:      "#4a2010",   // lip
  hairColor:    "#0d0a08",   // very dark black
  // Shirt (navy-blue collared from photo)
  shirtMain:    "#1e2f5c",
  shirtDark:    "#141f3e",
  shirtCheck:   "#2a4080",
};

const TOTAL_WIDTH = 8000;

type Project = {
  name: string;
  category: string;
  description: string;
  tech: string[];
  github?: string;
  color: string;
  colorDark?: string;
  colorAccent?: string;
  x: number;
};

/* ═══════════════════════════════════════════════════════════════════════════
   SCROLL HOOK
   ═══════════════════════════════════════════════════════════════════════════ */
function useHorizontalScroll() {
  const scrollXRef = useRef(0);
  const [scrollX, setScrollXState] = useState(0);
  const velocity = useRef(0);
  const animFrame = useRef<number | null>(null);

  const setScrollX = useCallback((val: number) => {
    const maxS = TOTAL_WIDTH - window.innerWidth;
    const clamped = Math.max(0, Math.min(maxS, val));
    scrollXRef.current = clamped;
    setScrollXState(clamped);
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => { e.preventDefault(); velocity.current += (e.deltaY + e.deltaX) * 0.85; };
    window.addEventListener("wheel", onWheel, { passive: false });
    let startX = 0;
    const onTS = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onTM = (e: TouchEvent) => {
      e.preventDefault();
      velocity.current += (startX - e.touches[0].clientX) * 2;
      startX = e.touches[0].clientX;
    };
    window.addEventListener("touchstart", onTS, { passive: false });
    window.addEventListener("touchmove", onTM, { passive: false });
    const tick = () => {
      if (Math.abs(velocity.current) > 0.3) {
        setScrollX(scrollXRef.current + velocity.current);
        velocity.current *= 0.88;
      } else velocity.current = 0;
      animFrame.current = requestAnimationFrame(tick);
    };
    animFrame.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchmove", onTM);
      if (animFrame.current !== null) {
        cancelAnimationFrame(animFrame.current);
      }
    };
  }, [setScrollX]);

  const jumpTo = useCallback((target: number) => {
    const start = scrollXRef.current, delta = target - start;
    const dur = 900, t0 = performance.now();
    const ease = (t: number) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
    const run = (now: number) => {
      const t = Math.min((now - t0) / dur, 1);
      setScrollX(start + delta * ease(t));
      if (t < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [setScrollX]);

  return { scrollX, progress: scrollX / (TOTAL_WIDTH - window.innerWidth), jumpTo };
}

/* ═══════════════════════════════════════════════════════════════════════════
   STARS
   ═══════════════════════════════════════════════════════════════════════════ */
const STARS = Array.from({ length: 160 }, () => ({
  x: Math.random() * 100, y: Math.random() * 56,
  r: Math.random() * 1.5 + 0.3, d: Math.random() * 4,
  purple: Math.random() > 0.6,
}));
function Stars() {
  return (
    <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:1 }}
      viewBox="0 0 100 100" preserveAspectRatio="none">
      {STARS.map((s,i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r*0.12}
          fill={s.purple ? C.accentBright : "#f0e6ff"}
          style={{ animation:`tw ${2+s.d}s ease-in-out infinite alternate`, opacity:0.5 }}/>
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MOON — crescent with purple glow
   ═══════════════════════════════════════════════════════════════════════════ */
function Moon({ progress }: { progress: number }) {
  return (
    <div style={{ position:"absolute", left:"11%", top: progress > 0.8 ? 58 : 36,
      transition:"top 1.5s ease", pointerEvents:"none", zIndex:2 }}>
      <svg width="62" height="62" viewBox="0 0 62 62">
        <circle cx="31" cy="31" r="28" fill="none" stroke={C.accentBright} strokeWidth="0.8" opacity="0.12"/>
        <circle cx="31" cy="31" r="22" fill="#e8d8ff" opacity="0.88"/>
        <circle cx="39" cy="27" r="20" fill={C.skyMid} opacity="0.9"/>
        {/* purple glow halo */}
        <circle cx="31" cy="31" r="28" fill="none" stroke={C.neon} strokeWidth="2" opacity="0.08"/>
        <circle cx="31" cy="31" r="18" fill="none" stroke={C.accent} strokeWidth="1" opacity="0.06"/>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLOUD — purple-tinted
   ═══════════════════════════════════════════════════════════════════════════ */
function Cloud({ absX, y, size, speed, scrollX }: { absX: number; y: number; size: number; speed: number; scrollX: number }) {
  const px = absX - scrollX * speed;
  if (px < -220 || px > window.innerWidth + 220) return null;
  return (
    <div style={{ position:"absolute",left:px,top:y,transform:`scale(${size})`,transformOrigin:"left top",pointerEvents:"none",zIndex:2 }}>
      <svg width="175" height="68" viewBox="0 0 175 68" style={{filter:"blur(0.9px)"}}>
        <ellipse cx="88" cy="48" rx="78" ry="20" fill="rgba(45,20,104,0.3)"/>
        <ellipse cx="65" cy="42" rx="52" ry="19" fill="rgba(35,15,80,0.32)"/>
        <ellipse cx="112" cy="39" rx="48" ry="18" fill="rgba(30,12,70,0.28)"/>
        <ellipse cx="88" cy="34" rx="40" ry="18" fill="rgba(40,18,90,0.3)"/>
        <ellipse cx="86" cy="31" rx="36" ry="13" fill="none" stroke="rgba(167,139,250,0.07)" strokeWidth="1"/>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MOUNTAINS
   ═══════════════════════════════════════════════════════════════════════════ */
function Mountains({ scrollX }: { scrollX: number }) {
  const W = TOTAL_WIDTH * 0.12;
  const off = scrollX * 0.08;
  return (
    <div style={{ position:"absolute",bottom:178,left:-off,width:W,pointerEvents:"none",zIndex:2 }}>
      <svg width={W} height="195" viewBox={`0 0 ${W} 195`} preserveAspectRatio="none">
        <polygon
          points={`0,195 ${W*.018},52 ${W*.038},128 ${W*.052},36 ${W*.068},108 ${W*.082},65 ${W*.096},142 ${W*.12},195`}
          fill={C.groundFar} opacity="0.7"/>
        <polygon
          points={`0,195 ${W*.014},82 ${W*.03},150 ${W*.048},50 ${W*.063},120 ${W*.078},74 ${W*.093},144 ${W*.12},195`}
          fill={C.skyDeep} opacity="0.38"/>
        {/* purple snow caps */}
        <polygon points={`${W*.052},36 ${W*.044},62 ${W*.060},62`} fill="rgba(192,132,252,0.4)"/>
        <polygon points={`${W*.018},52 ${W*.011},76 ${W*.025},76`} fill="rgba(192,132,252,0.32)"/>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LAGOS SKYLINE — purple-lit 3D buildings
   ═══════════════════════════════════════════════════════════════════════════ */
function LagosSkyline({ scrollX }: { scrollX: number }) {
  const off = scrollX * 0.18;
  const BH = 290;
  const blds = [
    {x:0,w:72,h:158,d:13},{x:82,w:42,h:108,d:10},{x:134,w:68,h:198,d:15},
    {x:212,w:36,h:136,d:9},{x:258,w:54,h:176,d:13},{x:322,w:44,h:128,d:11},
    {x:376,w:64,h:218,d:15},{x:450,w:40,h:148,d:10},{x:500,w:50,h:168,d:12},
    {x:560,w:36,h:118,d:9},{x:606,w:58,h:188,d:14},{x:674,w:44,h:142,d:11},
  ];
  return (
    <div style={{ position:"absolute",left:480-off,bottom:178,pointerEvents:"none",zIndex:3 }}>
      <svg width="880" height={BH} viewBox={`0 0 880 ${BH}`}>
        <defs>
          <linearGradient id="bf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e0f42"/><stop offset="100%" stopColor="#090514"/>
          </linearGradient>
          <linearGradient id="bs" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#130830"/><stop offset="100%" stopColor="#08041a"/>
          </linearGradient>
          <linearGradient id="bt" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2d1468"/><stop offset="100%" stopColor="#1a0a3c"/>
          </linearGradient>
        </defs>
        {/* National Theatre dome */}
        <g>
          <rect x="0" y={BH-155} width="68" height="155" fill="url(#bf)"/>
          <polygon points={`0,${BH-155} 12,${BH-168} 80,${BH-168} 68,${BH-155}`} fill="url(#bt)"/>
          <rect x="68" y={BH-155} width="12" height="155" fill="url(#bs)"/>
          <ellipse cx="34" cy={BH-182} rx="34" ry="30" fill="#100626"/>
          <ellipse cx="34" cy={BH-186} rx="27" ry="25" fill="#1a0a3c"/>
          <ellipse cx="34" cy={BH-186} rx="19" ry="17" fill="#2d1468" opacity="0.55"/>
          <ellipse cx="27" cy={BH-192} rx="7" ry="4" fill="rgba(167,139,250,0.15)"/>
        </g>
        {blds.map((b,i) => {
          const top = BH - b.h;
          return (
            <g key={i}>
              <polygon points={`${b.x+b.w},${top} ${b.x+b.w+b.d},${top-b.d} ${b.x+b.w+b.d},${BH-b.d} ${b.x+b.w},${BH}`} fill="url(#bs)" opacity="0.92"/>
              <polygon points={`${b.x},${top} ${b.x+b.d},${top-b.d} ${b.x+b.w+b.d},${top-b.d} ${b.x+b.w},${top}`} fill="url(#bt)"/>
              <rect x={b.x} y={top} width={b.w} height={b.h} fill="url(#bf)"/>
              {Array.from({length:Math.floor(b.h/22)}).map((_,row) =>
                Array.from({length:Math.floor(b.w/14)}).map((_,col) => {
                  const lit = (row*3+col*7+i*2)%5 > 1;
                  return <rect key={`${row}-${col}`} x={b.x+4+col*14} y={top+5+row*22} width={7} height={10}
                    fill={lit ? C.accent : "#0a0520"} opacity={lit ? 0.6 : 0.25}/>;
                })
              )}
              {b.h > 165 && <line x1={b.x+b.w/2} y1={top} x2={b.x+b.w/2} y2={top-22}
                stroke={C.accentPink} strokeWidth="1.5" opacity="0.5"/>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROAD — purple-lit
   ═══════════════════════════════════════════════════════════════════════════ */
function Road({ scrollX }: { scrollX: number }) {
  const dashCount = Math.ceil(window.innerWidth / 80) + 4;
  const dashOff = -(scrollX % 80);
  return (
    <>
      <div style={{ position:"fixed",bottom:130,left:0,right:0,height:42,
        background:`linear-gradient(to bottom, ${C.grass}, ${C.groundNear})`, zIndex:5 }}/>
      <div style={{ position:"fixed",bottom:0,left:0,right:0,height:130,
        background:`linear-gradient(to bottom, #0c0820 0%, #070511 100%)`,
        boxShadow:"inset 0 6px 28px rgba(0,0,0,0.7)", zIndex:5 }}>
        {/* top glow */}
        <div style={{ position:"absolute",top:0,left:0,right:0,height:3,
          background:`linear-gradient(to right,transparent,rgba(167,139,250,0.28),transparent)` }}/>
        {/* center dashes */}
        <div style={{ position:"absolute",top:"46%",left:0,right:0,height:5,
          display:"flex",gap:0,transform:`translateX(${dashOff}px)` }}>
          {Array.from({length:dashCount+2}).map((_,i) => (
            <div key={i} style={{ width:62,height:5,background:C.roadLine,borderRadius:3,marginRight:18,
              boxShadow:`0 0 12px ${C.roadLine}70`,opacity:0.82,flexShrink:0 }}/>
          ))}
        </div>
        <div style={{ position:"absolute",top:12,left:0,right:0,height:1.5,background:"rgba(167,139,250,0.1)" }}/>
        {/* purple road shimmer */}
        <div style={{ position:"absolute",inset:0,
          background:"linear-gradient(to bottom,rgba(120,60,220,0.04) 0%,transparent 50%)" }}/>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AVATAR — based on the photo:
   Dark brown skin, very short close-cropped hair, navy blue collared shirt,
   strong jawline, defined cheekbones, subtle confident smile, slight beard
   ═══════════════════════════════════════════════════════════════════════════ */
function AvatarRider() {
  return (
    <g>
      {/* ── TORSO (navy blue collared shirt) ── */}
      {/* shirt body */}
      <ellipse cx="106" cy="54" rx="16" ry="19" fill={C.shirtDark}/>
      <ellipse cx="106" cy="50" rx="14" ry="16" fill={C.shirtMain}/>
      {/* shirt shoulder highlight */}
      <path d="M93,44 Q106,38 119,44" fill="none" stroke="rgba(100,130,200,0.25)" strokeWidth="2"/>
      {/* shirt button placket */}
      <line x1="106" y1="38" x2="106" y2="66" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"/>
      {/* collar — small checkered blue-white pattern */}
      <path d="M100,39 Q106,35 112,39 L110,44 Q106,42 102,44Z" fill="#2a4080"/>
      <path d="M100,39 Q106,35 112,39 L110,44 Q106,42 102,44Z"
        fill="none" stroke="rgba(180,200,255,0.2)" strokeWidth="0.8"/>
      {/* collar checkered lines */}
      {[0,1,2,3].map(i => (
        <line key={i} x1={101+i*2.5} y1={39+i*0.8} x2={99+i*2.8} y2={43+i*0.4}
          stroke="rgba(255,255,255,0.18)" strokeWidth="0.6"/>
      ))}
      <line x1="106" y1="35" x2="106" y2="44" stroke="rgba(180,200,255,0.15)" strokeWidth="0.8"/>

      {/* ── NECK ── */}
      <rect x="102" y="36" width="8" height="8" rx="2" fill={C.skinBase}/>
      <rect x="103" y="36" width="4" height="7" rx="1" fill={C.skinMid} opacity="0.5"/>

      {/* ── HEAD ── */}
      {/* head base shape — slightly wide, strong jaw */}
      <ellipse cx="106" cy="22" rx="14.5" ry="15" fill={C.skinBase}/>
      {/* jaw definition — wider lower face */}
      <path d="M92,22 Q91,30 94,35 Q100,40 106,40 Q112,40 118,35 Q121,30 120,22"
        fill={C.skinBase}/>
      {/* cheek planes (slight highlight on high cheekbones) */}
      <ellipse cx="97" cy="26" rx="5" ry="3" fill={C.skinMid} opacity="0.35"/>
      <ellipse cx="115" cy="26" rx="5" ry="3" fill={C.skinMid} opacity="0.35"/>
      {/* forehead */}
      <ellipse cx="106" cy="14" rx="13" ry="8" fill={C.skinBase}/>
      {/* forehead highlight */}
      <ellipse cx="104" cy="12" rx="7" ry="4" fill={C.skinLight} opacity="0.2"/>
      {/* temple shadow */}
      <ellipse cx="93" cy="20" rx="4" ry="5" fill={C.skinShadow} opacity="0.3"/>
      <ellipse cx="119" cy="20" rx="4" ry="5" fill={C.skinShadow} opacity="0.3"/>
      {/* under-jaw shadow */}
      <path d="M96,36 Q106,42 116,36" fill={C.skinShadow} opacity="0.25"/>

      {/* ── HAIR — very short, close-cropped, natural hairline ── */}
      {/* main hair cap */}
      <path d="M92,20 Q92,8 106,6 Q120,8 120,20 Q118,14 106,12 Q94,14 92,20Z"
        fill={C.hairColor}/>
      {/* hair follows scalp tightly — no volume */}
      <path d="M92,20 Q91,15 94,11 Q100,7 106,6 Q112,7 118,11 Q121,15 120,20
               Q118,13 106,11 Q94,13 92,20Z"
        fill={C.hairColor}/>
      {/* hairline — slightly irregular/natural */}
      <path d="M92,20 Q93,17 96,15 Q101,12 106,11 Q111,12 116,15 Q119,17 120,20"
        fill="none" stroke={C.hairColor} strokeWidth="2" strokeLinecap="round"/>
      {/* subtle hair texture */}
      <path d="M96,14 Q102,11 106,11" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      <path d="M106,11 Q110,11 116,14" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
      {/* sideburns — short */}
      <path d="M92,20 Q91,24 93,28" stroke={C.hairColor} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M120,20 Q121,24 119,28" stroke={C.hairColor} strokeWidth="2.5" fill="none" strokeLinecap="round"/>

      {/* ── EARS ── */}
      <ellipse cx="92" cy="24" rx="3.5" ry="4.5" fill={C.skinBase}/>
      <ellipse cx="120" cy="24" rx="3.5" ry="4.5" fill={C.skinBase}/>
      <ellipse cx="92" cy="24" rx="1.8" ry="2.5" fill={C.skinShadow} opacity="0.3"/>
      <ellipse cx="120" cy="24" rx="1.8" ry="2.5" fill={C.skinShadow} opacity="0.3"/>

      {/* ── EYES ── */}
      {/* eye sockets */}
      <ellipse cx="100" cy="23" rx="5" ry="3.5" fill={C.skinShadow} opacity="0.2"/>
      <ellipse cx="112" cy="23" rx="5" ry="3.5" fill={C.skinShadow} opacity="0.2"/>
      {/* whites */}
      <ellipse cx="100" cy="23" rx="4" ry="2.8" fill="#f5eee0"/>
      <ellipse cx="112" cy="23" rx="4" ry="2.8" fill="#f5eee0"/>
      {/* irises */}
      <circle cx="100" cy="23" r="2.2" fill="#1a0e06"/>
      <circle cx="112" cy="23" r="2.2" fill="#1a0e06"/>
      {/* pupils */}
      <circle cx="100" cy="23" r="1.2" fill="#080500"/>
      <circle cx="112" cy="23" r="1.2" fill="#080500"/>
      {/* eye glints */}
      <circle cx="101" cy="22" r="0.7" fill="white" opacity="0.85"/>
      <circle cx="113" cy="22" r="0.7" fill="white" opacity="0.85"/>
      {/* upper eyelid line */}
      <path d="M96,21.5 Q100,20 104,21.5" stroke={C.hairColor} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M108,21.5 Q112,20 116,21.5" stroke={C.hairColor} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* lower lash line */}
      <path d="M96,24.5 Q100,25.5 104,24.5" stroke={C.skinShadow} strokeWidth="0.7" fill="none" opacity="0.5"/>
      <path d="M108,24.5 Q112,25.5 116,24.5" stroke={C.skinShadow} strokeWidth="0.7" fill="none" opacity="0.5"/>

      {/* ── NOSE ── */}
      {/* nose bridge */}
      <path d="M106,24 L105,30" stroke={C.skinShadow} strokeWidth="1" fill="none" opacity="0.3"/>
      {/* nose base — wider, flatter bridge typical features */}
      <ellipse cx="106" cy="31" rx="4.5" ry="2.5" fill={C.skinShadow} opacity="0.22"/>
      <ellipse cx="103" cy="31" rx="2.2" ry="1.8" fill={C.skinShadow} opacity="0.18"/>
      <ellipse cx="109" cy="31" rx="2.2" ry="1.8" fill={C.skinShadow} opacity="0.18"/>
      {/* nose highlight */}
      <ellipse cx="106" cy="29.5" rx="1.2" ry="1.8" fill={C.skinLight} opacity="0.2"/>

      {/* ── MOUTH — full lips, subtle confident smile ── */}
      {/* upper lip */}
      <path d="M100,35 Q103,33.5 106,34 Q109,33.5 112,35" fill={C.skinLip} stroke={C.skinLip} strokeWidth="0.5"/>
      <path d="M100,35 Q103,33 106,33.5 Q109,33 112,35" fill={C.skinShadow} opacity="0.15"/>
      {/* lower lip — fuller */}
      <path d="M100,35 Q106,39 112,35" fill={C.skinLip}/>
      <path d="M101,36 Q106,39.5 111,36" fill={C.skinLight} opacity="0.15"/>
      {/* lip line (mouth corner micro-smile) */}
      <path d="M100,35 Q106,35.5 112,35" stroke="#2d1008" strokeWidth="0.8" fill="none"/>
      {/* corner smile */}
      <path d="M99,35 Q99,36.5 101,36" fill="none" stroke={C.skinShadow} strokeWidth="0.8" opacity="0.4"/>
      <path d="M113,35 Q113,36.5 111,36" fill="none" stroke={C.skinShadow} strokeWidth="0.8" opacity="0.4"/>

      {/* ── CHIN / JAW detail ── */}
      {/* slight chin shadow */}
      <ellipse cx="106" cy="39" rx="5" ry="2" fill={C.skinShadow} opacity="0.15"/>
      {/* subtle stubble/beard shadow */}
      <path d="M98,34 Q106,37 114,34 Q114,40 106,41 Q98,40 98,34Z"
        fill={C.hairColor} opacity="0.08"/>
      {/* philtrum */}
      <path d="M104,32 Q106,33.5 108,32" fill="none" stroke={C.skinShadow} strokeWidth="0.7" opacity="0.3"/>

      {/* ── ARM to handlebar ── */}
      <line x1="118" y1="52" x2="140" y2="42" stroke={C.skinBase} strokeWidth="5.5" strokeLinecap="round"/>
      <line x1="116" y1="52" x2="138" y2="42" stroke={C.shirtMain} strokeWidth="4" strokeLinecap="round"/>

      {/* ── LEGS ── */}
      <line x1="106" y1="68" x2="87" y2="86" stroke={C.shirtDark} strokeWidth="6.5" strokeLinecap="round"/>
      <line x1="87" y1="86" x2="80" y2="93" stroke="#0d1020" strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="106" y1="68" x2="117" y2="88" stroke={C.shirtDark} strokeWidth="5.5" strokeLinecap="round"/>
      {/* shoes */}
      <ellipse cx="80" cy="94" rx="8.5" ry="4" fill="#0a0815"/>
      <ellipse cx="80" cy="93" rx="6" ry="2.5" fill="#160e28" opacity="0.6"/>
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BICYCLE + AVATAR
   ═══════════════════════════════════════════════════════════════════════════ */
function Bicycle() {
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    let id: number;
    const loop = () => { setAngle(a => a + 3.6); id = requestAnimationFrame(loop); };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  const spokes = [0,45,90,135,180,225,270,315];
  const Wheel = ({cx,cy,r}: {cx: number; cy: number; r: number}) => (
    <g>
      <circle cx={cx+3} cy={cy+3} r={r} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="5"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0e0820" strokeWidth="7"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2d1468" strokeWidth="3.5"/>
      {spokes.map(a => {
        const rad = ((a+angle)*Math.PI)/180;
        return <line key={a} x1={cx} y1={cy}
          x2={cx+Math.cos(rad)*(r-5)} y2={cy+Math.sin(rad)*(r-5)}
          stroke={C.accent} strokeWidth="1.1" opacity="0.5"/>;
      })}
      <circle cx={cx} cy={cy} r={r*0.34} fill="none" stroke={C.accent} strokeWidth="1.3" opacity="0.38"/>
      <circle cx={cx} cy={cy} r={5} fill={C.accentGold}/>
      <circle cx={cx} cy={cy} r={3} fill="#0a0616"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(167,139,250,0.13)" strokeWidth="1.2"/>
    </g>
  );

  return (
    <svg width="175" height="132" viewBox="0 0 175 132"
      style={{ overflow:"visible", filter:"drop-shadow(0 10px 30px rgba(80,20,180,0.4))" }}>
      <defs>
        <linearGradient id="fg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4c1d95"/>
          <stop offset="100%" stopColor="#1e0a40"/>
        </linearGradient>
        <linearGradient id="fk" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6d28d9"/>
          <stop offset="100%" stopColor="#2e1065"/>
        </linearGradient>
      </defs>

      <Wheel cx={36} cy={92} r={31}/>
      <Wheel cx={132} cy={92} r={31}/>

      {/* chain ring */}
      <ellipse cx="84" cy="92" rx="14" ry="8" fill="none" stroke={C.accentGold} strokeWidth="1.5" opacity="0.42"/>

      {/* frame shadows */}
      <line x1="39" y1="95" x2="84" y2="50" stroke="rgba(0,0,0,0.3)" strokeWidth="8" strokeLinecap="round"/>
      <line x1="84" y1="50" x2="135" y2="95" stroke="rgba(0,0,0,0.3)" strokeWidth="8" strokeLinecap="round"/>
      {/* main frame */}
      <line x1="36" y1="92" x2="82" y2="48" stroke="url(#fg)" strokeWidth="6.5" strokeLinecap="round"/>
      <line x1="82" y1="48" x2="132" y2="92" stroke="url(#fg)" strokeWidth="6.5" strokeLinecap="round"/>
      <line x1="82" y1="48" x2="80" y2="92" stroke="#2d1468" strokeWidth="4" strokeLinecap="round"/>
      {/* frame highlight */}
      <line x1="36" y1="92" x2="82" y2="48" stroke="rgba(167,139,250,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="82" y1="48" x2="132" y2="92" stroke="rgba(167,139,250,0.25)" strokeWidth="1.5" strokeLinecap="round"/>

      {/* seat post */}
      <line x1="80" y1="92" x2="72" y2="38" stroke="url(#fk)" strokeWidth="5.5" strokeLinecap="round"/>
      {/* seat */}
      <rect x="56" y="32" width="30" height="8" rx="4" fill="#1e0a40" stroke="rgba(167,139,250,0.3)" strokeWidth="1"/>
      <rect x="59" y="32" width="20" height="4" rx="2" fill="#2d1468"/>
      <line x1="62" y1="33" x2="74" y2="33" stroke="rgba(167,139,250,0.35)" strokeWidth="1"/>

      {/* fork */}
      <line x1="132" y1="92" x2="138" y2="50" stroke="url(#fk)" strokeWidth="5.5" strokeLinecap="round"/>
      <line x1="138" y1="50" x2="140" y2="38" stroke="url(#fk)" strokeWidth="4.5" strokeLinecap="round"/>
      {/* handlebar */}
      <path d="M130,37 Q140,34 150,38" stroke="#1e0a40" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M130,37 Q140,34 150,38" stroke="rgba(167,139,250,0.28)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* Avatar rider */}
      <AvatarRider/>

      {/* ground shadow */}
      <ellipse cx="84" cy="130" rx="62" ry="7" fill="rgba(40,0,80,0.4)"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   3D TREE — purple-forest tones
   ═══════════════════════════════════════════════════════════════════════════ */
function Tree3D({ x, variant=0, size=1 }: { x: number; variant?: number; size?: number }) {
  const heights = [82,104,66];
  const h = heights[variant%3]*size;
  const palettes = [
    ["#160b30","#1e0f42","#0d0720"],
    ["#120830","#1a0c3c","#0a0518"],
    ["#180d36","#220f48","#0e0622"],
  ];
  const fc = palettes[variant%3];
  return (
    <div style={{ position:"absolute",left:x,bottom:172,pointerEvents:"none" }}>
      <svg width={50*size} height={(h+32)*size} viewBox={`0 0 50 ${h+32}`} style={{overflow:"visible"}}>
        <rect x="24" y={h} width="8" height="32" rx="2" fill="rgba(0,0,0,0.3)" transform="skewX(5)"/>
        <rect x="22" y={h} width="6" height="32" rx="2" fill="#0a0516"/>
        <rect x="22" y={h} width="2" height="30" rx="1" fill="rgba(167,139,250,0.07)"/>
        {[0,1,2].map(layer => {
          const ly = h*0.14+layer*(h*0.23);
          const lw = 26-layer*6;
          return (
            <g key={layer}>
              <polygon points={`25,${ly} ${25+lw},${ly+lw*1.45} 25,${ly+lw*1.45}`} fill={fc[2]} opacity="0.85"/>
              <polygon points={`25,${ly} ${25-lw},${ly+lw*1.45} ${25+lw},${ly+lw*1.45}`} fill={fc[0]}/>
              <polygon points={`25,${ly} ${25-lw},${ly+lw*1.45} 25,${ly+lw*0.92}`} fill={fc[1]} opacity="0.6"/>
              <line x1={25-lw} y1={ly+lw*1.45} x2={25+lw} y2={ly+lw*1.45} stroke="rgba(167,139,250,0.06)" strokeWidth="1"/>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROAD SIGN — purple 3D
   ═══════════════════════════════════════════════════════════════════════════ */
function RoadSign({ label, tooltip, x, scrollX }: { label: string; tooltip: string; x: number; scrollX: number }) {
  const [hov, setHov] = useState(false);
  const visible = scrollX + window.innerWidth * 0.9 > x;
  const relX = x - scrollX;
  if (relX < -300 || relX > window.innerWidth + 200) return null;
  return (
    <div style={{
      position:"absolute",left:x,bottom:188,
      transform:`translateX(-50%) translateY(${visible?0:52}px) scale(${visible?1:0.82})`,
      opacity:visible?1:0, transition:"all 0.55s cubic-bezier(0.34,1.4,0.64,1)",
      cursor:"pointer",zIndex:20,
    }} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{ position:"relative",width:5,height:68,margin:"0 auto" }}>
        <div style={{ position:"absolute",left:3,top:2,width:5,height:68,background:"rgba(0,0,0,0.3)",borderRadius:2,transform:"skewX(3deg)" }}/>
        <div style={{ width:5,height:68,background:"linear-gradient(to right,#2d1468,#1a0a3c)",borderRadius:2,boxShadow:"inset 1px 0 0 rgba(167,139,250,0.18)" }}/>
      </div>
      <div style={{ position:"relative",marginTop:-2 }}>
        <div style={{ position:"absolute",right:-6,top:4,width:6,bottom:0,
          background:"linear-gradient(to bottom,#0e0728,#080414)",clipPath:"polygon(0 0,100% 100%,100% 100%,0 100%)" }}/>
        <div style={{ position:"absolute",bottom:-4,left:4,right:0,height:4,background:"#080414" }}/>
        <div style={{
          background:`linear-gradient(135deg,${C.signPurp} 0%,#1a0a3c 100%)`,
          color:C.textPrimary,padding:"8px 18px",borderRadius:"4px 4px 4px 4px",
          fontFamily:"'JetBrains Mono','Courier New',monospace",fontWeight:"600",fontSize:12,
          whiteSpace:"nowrap",border:"1px solid rgba(167,139,250,0.38)",borderBottom:"none",
          boxShadow:"inset 0 1px 0 rgba(167,139,250,0.18),0 0 14px rgba(167,139,250,0.12)",
          letterSpacing:"0.5px",
        }}>{label}</div>
      </div>
      {hov && (
        <div style={{
          position:"absolute",bottom:"110%",left:"50%",transform:"translateX(-50%)",
          background:C.glass,backdropFilter:"blur(12px)",border:`1px solid ${C.glassBorder}`,
          color:C.textPrimary,padding:"7px 15px",borderRadius:8,fontSize:12,
          boxShadow:"0 8px 32px rgba(0,0,0,0.5)",whiteSpace:"nowrap",marginBottom:8,
          fontFamily:"monospace",zIndex:100,
        }}>
          <span style={{color:C.accent}}>{">"} </span>{tooltip}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BILLBOARD
   ═══════════════════════════════════════════════════════════════════════════ */
function Billboard({ title, company, period, quote, x, scrollX }: { title: string; company: string; period: string; quote: string; x: number; scrollX: number }) {
  const visible = scrollX + window.innerWidth * 0.85 > x;
  const relX = x - scrollX;
  if (relX < -470 || relX > window.innerWidth + 420) return null;
  return (
    <div style={{
      position:"absolute",left:x,bottom:215,
      transform:`translateX(-50%) scale(${visible?1:0.82}) translateY(${visible?0:22}px)`,
      opacity:visible?1:0,transition:"all 0.65s cubic-bezier(0.34,1.2,0.64,1)",
      zIndex:20,width:305,
    }}>
      <div style={{ display:"flex",justifyContent:"space-between",padding:"0 26px" }}>
        {[0,1].map(i => (
          <div key={i} style={{ position:"relative" }}>
            <div style={{ position:"absolute",left:3,top:2,width:8,height:92,background:"rgba(0,0,0,0.3)",borderRadius:3,transform:"skewX(2deg)" }}/>
            <div style={{ width:8,height:92,borderRadius:3,background:"linear-gradient(to right,#2d1468,#1a0a3c)",boxShadow:"inset 1px 0 0 rgba(167,139,250,0.14)" }}/>
          </div>
        ))}
      </div>
      <div style={{ position:"relative" }}>
        <div style={{ position:"absolute",right:-10,top:7,bottom:0,width:10,
          background:"linear-gradient(to bottom,#06031a,#03010d)",clipPath:"polygon(0 0,100% 15%,100% 100%,0 100%)" }}/>
        <div style={{ position:"absolute",bottom:-7,left:5,right:-5,height:7,background:"#03010d" }}/>
        <div style={{
          background:"linear-gradient(160deg,#0e0728 0%,#06031a 100%)",
          borderRadius:"6px 6px 0 6px",padding:"22px 24px",
          border:"1px solid rgba(167,139,250,0.18)",
          boxShadow:"0 0 32px rgba(120,60,220,0.08),inset 0 1px 0 rgba(167,139,250,0.1)",
        }}>
          <div style={{ height:2,width:36,marginBottom:12,background:`linear-gradient(to right,${C.accent},transparent)` }}/>
          <div style={{ fontSize:9,color:C.accent,fontFamily:"monospace",letterSpacing:2,marginBottom:6 }}>{period}</div>
          <div style={{ fontSize:15,fontWeight:"700",color:C.textPrimary,marginBottom:4,fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.3 }}>{title}</div>
          <div style={{ fontSize:11,color:C.textDim,marginBottom:12,fontFamily:"monospace" }}>◈ {company}</div>
          <div style={{ fontSize:12,lineHeight:1.65,color:C.textSecond,fontStyle:"italic",fontFamily:"Georgia,serif" }}>"{quote}"</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROJECT STOP
   ═══════════════════════════════════════════════════════════════════════════ */
function ProjectStop({ project, x, scrollX, onOpen }: { project: Project; x: number; scrollX: number; onOpen: (project: Project) => void }) {
  const [hov, setHov] = useState(false);
  const visible = scrollX + window.innerWidth * 0.9 > x;
  const relX = x - scrollX;
  if (relX < -360 || relX > window.innerWidth + 310) return null;
  return (
    <div style={{
      position:"absolute",left:x,bottom:172,
      transform:`translateX(-50%) scale(${visible?(hov?1.07:1):0.78}) translateY(${visible?0:32}px)`,
      opacity:visible?1:0,transition:"all 0.55s cubic-bezier(0.34,1.3,0.64,1)",
      cursor:"pointer",zIndex:20,textAlign:"center",
      filter:hov?`drop-shadow(0 0 24px ${project.color}60)`:"none",
    }} onClick={()=>onOpen(project)}
       onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <svg width="105" height="115" viewBox="0 0 105 115" style={{overflow:"visible"}}>
        <defs>
          <linearGradient id={`pf${project.name.replace(/\s/g,"")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={project.color} stopOpacity="0.92"/>
            <stop offset="100%" stopColor={project.colorDark||"#06031a"}/>
          </linearGradient>
        </defs>
        <ellipse cx="58" cy="118" rx="40" ry="6" fill="rgba(60,0,120,0.35)"/>
        <polygon points="84,32 98,20 98,105 84,117" fill={project.colorDark||"#06031a"}/>
        <polygon points="52,11 84,32 98,20 66,3" fill={project.color} opacity="0.68"/>
        <polygon points="16,37 52,11 66,3 30,29" fill={project.color} opacity="0.5"/>
        <rect x="16" y="32" width="68" height="85" fill={`url(#pf${project.name.replace(/\s/g,"")})`}/>
        {[0,1,2,3].map(row=>[0,1,2].map(col=>{
          const lit=(row+col+project.name.charCodeAt(0))%2===0;
          return <rect key={`${row}-${col}`} x={21+col*19} y={40+row*19} width={11} height={13} rx="1.5"
            fill={lit?project.colorAccent||C.accent:"rgba(0,0,0,0.4)"} opacity={lit?0.72:0.28}/>;
        }))}
        <rect x="36" y="95" width="19" height="22" rx="2" fill="rgba(0,0,0,0.55)"/>
        <rect x="37" y="96" width="8" height="20" rx="1" fill={project.color} opacity="0.28"/>
        <line x1="16" y1="32" x2="16" y2="117" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
        <line x1="16" y1="32" x2="84" y2="32" stroke="rgba(255,255,255,0.09)" strokeWidth="1"/>
        <line x1="52" y1="11" x2="52" y2="-10" stroke={project.colorAccent||C.accent} strokeWidth="1.5" opacity="0.65"/>
        <circle cx="52" cy="-13" r="3.5" fill={project.colorAccent||C.accent} opacity={hov?1:0.45}>
          {hov&&<animate attributeName="opacity" values="0.3;1;0.3" dur="1.1s" repeatCount="indefinite"/>}
        </circle>
      </svg>
      <div style={{
        background:C.glass,backdropFilter:"blur(10px)",border:`1px solid ${C.glassBorder}`,
        color:C.textPrimary,padding:"6px 14px",borderRadius:20,
        fontSize:11,fontWeight:"700",fontFamily:"monospace",letterSpacing:"0.5px",
        boxShadow:"0 4px 20px rgba(60,0,120,0.35)",marginTop:4,
        maxWidth:145,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
      }}>{project.name}</div>
      <div style={{ fontSize:9,color:C.accent,marginTop:4,fontFamily:"monospace",letterSpacing:1 }}>CLICK TO EXPLORE</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL
   ═══════════════════════════════════════════════════════════════════════════ */
function Modal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  if (!project) return null;
  return (
    <div onClick={onClose} style={{
      position:"fixed",inset:0,background:"rgba(4,1,12,0.92)",backdropFilter:"blur(20px)",
      zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24,
      animation:"fadeIn 0.28s ease",
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"linear-gradient(160deg,#0e0728 0%,#06031a 100%)",
        border:`1px solid rgba(167,139,250,0.22)`,borderRadius:22,
        maxWidth:590,width:"100%",padding:"46px 46px 38px",
        boxShadow:"0 48px 130px rgba(60,0,120,0.5),inset 0 1px 0 rgba(167,139,250,0.1)",
        position:"relative",animation:"slideUp 0.36s cubic-bezier(0.34,1.3,0.64,1)",
      }}>
        <button onClick={onClose} style={{
          position:"absolute",top:20,right:20,
          background:"rgba(167,139,250,0.07)",border:`1px solid rgba(167,139,250,0.18)`,
          color:C.textSecond,width:34,height:34,borderRadius:"50%",
          cursor:"pointer",fontSize:17,display:"flex",alignItems:"center",justifyContent:"center",
        }}>×</button>
        <div style={{ height:3,width:60,marginBottom:26,
          background:`linear-gradient(to right,${project.color},${project.colorAccent||C.accent},transparent)`,borderRadius:2 }}/>
        <div style={{ fontSize:9,color:project.color,fontFamily:"monospace",letterSpacing:3,marginBottom:10 }}>
          {project.category.toUpperCase()}
        </div>
        <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif",fontSize:30,fontWeight:"700",
          color:C.textPrimary,margin:"0 0 16px",lineHeight:1.15 }}>{project.name}</h2>
        <p style={{ fontFamily:"Georgia,serif",fontSize:15,lineHeight:1.82,color:C.textSecond,margin:"0 0 28px" }}>
          {project.description}
        </p>
        <div style={{ display:"flex",flexWrap:"wrap",gap:8,marginBottom:34 }}>
          {project.tech.map((t: string)=>(
            <span key={t} style={{
              background:"rgba(167,139,250,0.07)",border:`1px solid rgba(167,139,250,0.18)`,
              color:C.accent,padding:"5px 15px",borderRadius:20,fontSize:11,fontFamily:"monospace",letterSpacing:"0.5px",
            }}>{t}</span>
          ))}
        </div>
        {project.github && (
          <a href={project.github} target="_blank" rel="noreferrer" style={{
            display:"inline-flex",alignItems:"center",gap:8,
            background:"rgba(167,139,250,0.08)",border:`1px solid rgba(167,139,250,0.28)`,
            color:C.accent,padding:"13px 30px",borderRadius:9,textDecoration:"none",
            fontFamily:"monospace",fontSize:13,fontWeight:"600",letterSpacing:"0.5px",
          }}>↗ View on GitHub</a>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════════════════════════════════════ */
const SECTIONS = [
  {label:"Start",x:0},{label:"Origin",x:850},{label:"Skills",x:1950},
  {label:"Experience",x:3400},{label:"Projects",x:5500},{label:"Present",x:7300},
];
function Nav({ scrollX, jumpTo }: { scrollX: number; jumpTo: (target: number) => void }) {
  const maxS = TOTAL_WIDTH - window.innerWidth;
  const [hov, setHov] = useState<string | null>(null);
  return (
    <div style={{
      position:"fixed",bottom:26,left:"50%",transform:"translateX(-50%)",
      display:"flex",gap:6,zIndex:200,
      background:C.glass,backdropFilter:"blur(14px)",border:`1px solid ${C.glassBorder}`,
      padding:"9px 18px",borderRadius:40,boxShadow:"0 8px 36px rgba(60,0,120,0.4)",
    }}>
      {SECTIONS.map(s => {
        const t = (s.x/(TOTAL_WIDTH-50))*maxS;
        const active = scrollX >= t-60 && scrollX < t+(maxS/SECTIONS.length);
        return (
          <button key={s.label} title={s.label} onClick={()=>jumpTo(t)}
            onMouseEnter={()=>setHov(s.label)} onMouseLeave={()=>setHov(null)}
            style={{
              width:active?34:9,height:9,borderRadius:5,
              background:active?C.accent:"rgba(167,139,250,0.22)",
              border:"none",cursor:"pointer",transition:"all 0.3s ease",padding:0,position:"relative",
              boxShadow:active?`0 0 10px ${C.accent}80`:"none",
            }}>
            {hov===s.label&&(
              <div style={{
                position:"absolute",bottom:"calc(100% + 9px)",left:"50%",transform:"translateX(-50%)",
                background:C.glass,border:`1px solid ${C.glassBorder}`,
                color:C.textPrimary,padding:"4px 11px",borderRadius:7,
                fontSize:10,whiteSpace:"nowrap",fontFamily:"monospace",letterSpacing:1,pointerEvents:"none",
              }}>{s.label}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════════ */
const SKILLS = [
  {label:"HTML5",tooltip:"Semantic, accessible markup",x:1750},
  {label:"CSS3",tooltip:"Animations, layouts, variables",x:1920},
  {label:"JavaScript",tooltip:"ES6+, async, closures",x:2110},
  {label:"TypeScript",tooltip:"Typed & safe codebases",x:2290},
  {label:"React",tooltip:"Hooks, context, performance",x:2470},
  {label:"Next.js",tooltip:"SSR, SSG, App Router",x:2650},
  {label:"Vue.js",tooltip:"Composition API, Vuex",x:2830},
  {label:"WebSockets",tooltip:"Real-time data streams",x:3010},
  {label:"Recharts",tooltip:"Complex data dashboards",x:3180},
  {label:"Git",tooltip:"Version control & collaboration",x:3360},
  {label:"Docker",tooltip:"Containerized dev flows",x:3540},
  {label:"Figma",tooltip:"Design-to-code pipeline",x:3720},
];
const EXPERIENCES = [
  {title:"Fullstack Engineer",company:"WotBusiness · Remote",period:"JAN 2026 – PRESENT",
   quote:"Built a high-performance, real-time SaaS frontend with Next.js and TypeScript, improving transparency and trust for SME logistics users.",x:4000},
  {title:"Junior Frontend Engineer",company:"Boolbyte Technologies · Remote",period:"NOV 2024 – DEC 2025",
   quote:"Collaborated on scalable React applications, gaining strong experience with professional workflows, code reviews, and version control.",x:4450},
  {title:"Web Developer",company:"Dayari.ng · Lagos",period:"AUG 2023 – OCT 2024",
   quote:"Designed and launched a production e-commerce platform with strong SEO and user experience.",x:4890},
  {title:"Web Developer (Contract)",company:"Kollslashbar.com",period:"APR 2025",
   quote:"Built a full e-commerce website from scratch with a seamless customer-to-business ordering system.",x:5240},
];
const PROJECTS = [
  {name:"Nexus Disrupt",category:"Fintech / Fraud Hackathon",
   description:"Built an interactive fraud-disruption dashboard for financial institutions, visualizing AI-driven fraud signals and real-time detection metrics.",
   tech:["React","TypeScript","Recharts","Python"],github:"https://github.com/Sadiq-Teslim/nexus_d",
   color:"#7c3aed",colorDark:"#0e0520",colorAccent:"#a78bfa",x:5650},
  {name:"HealthWallet",category:"Hackathon Project",
   description:"A digital health-wallet concept focused on improving access to healthcare services and managing health-related expenses.",
   tech:["React","JavaScript","TypeScript"],
   color:"#2563eb",colorDark:"#020d20",colorAccent:"#60a5fa",x:5970},
  {name:"WooCommerce Plugin",category:"Production Workflow Plugin",
   description:"Developed a real-time production workflow plugin enabling collaboration, RBAC, messaging, WhatsApp integration, and audit logging.",
   tech:["PHP","WordPress","WooCommerce","MySQL","REST API","WebSocket"],
   color:"#7e22ce",colorDark:"#08021a",colorAccent:"#d8b4fe",x:6280},
  {name:"Unilag Energy Club",category:"Official Website",
   description:"Designed and built the official website for the University of Lagos Energy Club to showcase initiatives and student-led innovation.",
   tech:["HTML","CSS","JavaScript","React"],
   color:"#0e7490",colorDark:"#020c12",colorAccent:"#67e8f9",x:6590},
  {name:"AuxSync",category:"Playlist Transfer Tool",
   description:"Built a tool to transfer playlists between music streaming platforms including Spotify, YouTube, and Apple Music.",
   tech:["Python","Spotipy","YouTube SDK","Apple Music API"],github:"https://github.com/mcjohnsontech/AuxShare",
   color:"#9333ea",colorDark:"#0a0218",colorAccent:"#e879f9",x:6900},
  {name:"Hallelujah Counter",category:"Web Application",
   description:"Built a responsive, SEO-optimized web application with strong accessibility and performance.",
   tech:["HTML","CSS","JavaScript","React"],
   color:"#be185d",colorDark:"#100208",colorAccent:"#f9a8d4",x:7200},
];
const TREES_DATA = [
  {x:260,v:0,s:1},{x:440,v:1,s:0.85},{x:630,v:2,s:1.1},{x:920,v:0,s:0.9},
  {x:1110,v:1,s:1},{x:1360,v:2,s:0.8},{x:1560,v:0,s:1.05},{x:2120,v:1,s:0.9},
  {x:2370,v:2,s:1},{x:2620,v:0,s:0.85},{x:2920,v:1,s:1},{x:3120,v:0,s:1.1},
  {x:3620,v:2,s:0.9},{x:3820,v:1,s:1},{x:4120,v:0,s:0.85},{x:4520,v:2,s:1},
  {x:4920,v:1,s:0.9},{x:5220,v:0,s:1.05},{x:5470,v:2,s:0.8},{x:5760,v:1,s:1},
  {x:6060,v:0,s:0.9},{x:6360,v:2,s:1},{x:6660,v:1,s:0.85},{x:6960,v:0,s:1},
  {x:7260,v:2,s:0.9},{x:7520,v:1,s:1},{x:7780,v:0,s:0.85},
];
const CLOUDS = [
  {absX:320,y:48,size:1.3,speed:0.2},{absX:720,y:26,size:0.9,speed:0.15},
  {absX:1150,y:68,size:1.1,speed:0.25},{absX:1650,y:36,size:0.85,speed:0.18},
  {absX:2250,y:58,size:1.2,speed:0.22},{absX:3050,y:32,size:1,speed:0.2},
  {absX:3850,y:72,size:0.95,speed:0.25},{absX:4750,y:42,size:1.15,speed:0.18},
  {absX:5550,y:62,size:0.9,speed:0.22},{absX:6350,y:34,size:1.05,speed:0.2},
  {absX:7150,y:58,size:1.2,speed:0.15},
];

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const { scrollX, progress, jumpTo } = useHorizontalScroll();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const w = window.innerWidth;

  const showStart  = scrollX < 520;
  const showOrigin = scrollX >= 380 && scrollX < 1650;
  const showSkills = scrollX >= 1580 && scrollX < 2280;
  const showExp    = scrollX >= 3800 && scrollX < 4420;
  const showProj   = scrollX >= 5450 && scrollX < 5900;
  const showEnd    = scrollX >= 7050;

  return (
    <div style={{ width:"100vw",height:"100vh",overflow:"hidden",cursor:"ew-resize",
      userSelect:"none",position:"relative",background:C.skyZenith,fontFamily:"Georgia,serif" }}>

      {/* Sky gradient */}
      <div style={{
        position:"absolute",inset:0,
        background:`linear-gradient(to bottom, ${C.skyZenith} 0%, ${C.skyMid} 40%, ${C.skyGlow} 75%, ${C.horizonPurp} 100%)`,
        zIndex:0,
      }}/>

      {/* Horizon purple-pink glow */}
      <div style={{
        position:"absolute",bottom:"25%",left:0,right:0,height:120,
        background:`radial-gradient(ellipse at 50% 100%, rgba(107,45,139,0.18) 0%, transparent 70%)`,
        pointerEvents:"none",zIndex:1,
      }}/>

      <Stars/>
      <Moon progress={progress}/>
      {CLOUDS.map((c,i) => <Cloud key={i} {...c} scrollX={scrollX}/>)}
      <Mountains scrollX={scrollX}/>

      {/* Atmospheric haze at ground level */}
      <div style={{
        position:"absolute",bottom:175,left:0,right:0,height:70,
        background:`linear-gradient(to top,rgba(45,20,104,0.18),transparent)`,
        pointerEvents:"none",zIndex:4,
      }}/>

      {/* ── SCROLLABLE WORLD ── */}
      <div style={{
        position:"absolute",left:0,bottom:0,width:TOTAL_WIDTH,height:"100%",
        transform:`translateX(${-scrollX}px)`,willChange:"transform",zIndex:5,
      }}>
        <div style={{ position:"absolute",bottom:170,left:0,width:TOTAL_WIDTH,height:22,background:C.groundFar }}/>
        <div style={{ position:"absolute",bottom:130,left:0,width:TOTAL_WIDTH,height:42,
          background:`linear-gradient(to bottom,${C.grass},${C.groundNear})` }}/>

        {TREES_DATA.map((t,i) => {
          const rx = t.x - scrollX;
          if (rx < -200 || rx > w+200) return null;
          return <Tree3D key={i} x={t.x} variant={t.v} size={t.s}/>;
        })}

        <LagosSkyline scrollX={scrollX}/>

        {SKILLS.map(s => (
          <RoadSign key={s.label} label={s.label} tooltip={s.tooltip} x={s.x} scrollX={scrollX}/>
        ))}
        {EXPERIENCES.map(e => (
          <Billboard key={e.company} {...e} scrollX={scrollX}/>
        ))}
        {/* elcarnaval */}
        {(()=>{
          const ex=5550, vis=scrollX+w*0.85>ex, rx=ex-scrollX;
          if(rx<-400||rx>w+350) return null;
          return (
            <div style={{ position:"absolute",left:ex,bottom:228,
              transform:`translateX(-50%) scale(${vis?1:0.85})`,
              opacity:vis?1:0,transition:"all 0.55s ease",zIndex:20 }}>
              <div style={{ background:C.glass,backdropFilter:"blur(12px)",
                border:`1px solid ${C.glassBorder}`,borderRadius:10,
                padding:"14px 20px",color:C.textPrimary,fontFamily:"monospace",fontSize:11,maxWidth:230,
                boxShadow:"0 8px 32px rgba(60,0,120,0.35)" }}>
                <div style={{ color:C.accent,fontSize:9,letterSpacing:2,marginBottom:5 }}>FEB 2025 · CONTRACT</div>
                <div style={{ fontWeight:700,marginBottom:5,letterSpacing:0.5 }}>elcarnaval.xyz</div>
                <div style={{ color:C.textSecond,fontSize:11,lineHeight:1.55 }}>
                  "Revamped an entertainment platform with SEO improvements and real-time visitor tracking."
                </div>
              </div>
            </div>
          );
        })()}
        {PROJECTS.map(p => (
          <ProjectStop key={p.name} project={p} x={p.x} scrollX={scrollX} onOpen={setSelectedProject}/>
        ))}
      </div>

      <Road scrollX={scrollX}/>

      {/* Bicycle + Avatar */}
      <div style={{ position:"fixed",left:152,bottom:130,zIndex:50 }}>
        <Bicycle/>
      </div>

      {/* ══ OVERLAYS ══ */}

      {/* START */}
      <div style={{
        position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-55%)",textAlign:"center",
        opacity:showStart?1:0,transition:"opacity 0.7s ease",pointerEvents:"none",zIndex:80,
      }}>
        <div style={{ fontSize:10,letterSpacing:6,color:C.accent,fontFamily:"monospace",marginBottom:16 }}>
          ABIODUN MARK ADEKUNLE
        </div>
        <h1 style={{
          fontSize:"clamp(42px,6.8vw,84px)",fontWeight:"700",color:C.textPrimary,margin:0,lineHeight:1.04,
          fontFamily:"'Playfair Display',Georgia,serif",
          textShadow:`0 0 80px rgba(167,139,250,0.25), 0 0 160px rgba(120,60,220,0.12)`,
          letterSpacing:"-1.5px",
        }}>My Portfolio</h1>
        <p style={{ fontSize:"clamp(13px,1.6vw,18px)",color:C.textSecond,marginTop:16,fontStyle:"italic" }}>
          This is a ride through my life
        </p>
        {/* purple glow orb behind title */}
        <div style={{
          position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          width:400,height:200,
          background:"radial-gradient(ellipse,rgba(120,60,220,0.12) 0%,transparent 70%)",
          pointerEvents:"none",zIndex:-1,
        }}/>
        <div style={{
          marginTop:48,display:"flex",alignItems:"center",justifyContent:"center",gap:10,
          color:C.textDim,fontFamily:"monospace",fontSize:11,letterSpacing:2,
          animation:"pulse 2.2s ease-in-out infinite",
        }}>
          <span>scroll right to begin</span><span style={{fontSize:16}}>→</span>
        </div>
      </div>

      {/* ORIGIN */}
      <div style={{
        position:"fixed",top:"50%",right:80,transform:"translateY(-52%)",maxWidth:410,
        opacity:showOrigin?1:0,transition:"opacity 0.8s ease",pointerEvents:"none",zIndex:80,
      }}>
        <div style={{
          background:C.glass,backdropFilter:"blur(22px)",border:`1px solid ${C.glassBorder}`,
          borderRadius:18,padding:"34px 38px",
          boxShadow:"0 28px 90px rgba(60,0,120,0.45),inset 0 1px 0 rgba(167,139,250,0.07)",
        }}>
          <div style={{ height:2,width:40,background:`linear-gradient(to right,${C.accent},transparent)`,marginBottom:22 }}/>
          <div style={{ fontSize:9,color:C.accent,fontFamily:"monospace",letterSpacing:4,marginBottom:16 }}>02 — ORIGIN</div>
          <p style={{ fontSize:"clamp(15px,1.7vw,19px)",lineHeight:1.85,color:C.textPrimary,
            fontFamily:"'Playfair Display',Georgia,serif",margin:0 }}>
            I'm a frontend developer<br/>
            based in{" "}
            <span style={{ color:C.accentBright,fontWeight:600 }}>Lagos, Nigeria.</span>
          </p>
          <p style={{ fontSize:14,lineHeight:1.78,color:C.textSecond,fontFamily:"Georgia,serif",marginTop:18,marginBottom:0 }}>
            My journey started with curiosity — and it turned into building real products used by real people.
          </p>
        </div>
      </div>

      {/* Section labels */}
      {[
        {show:showSkills,eye:"SECTION 03 · SKILLS",title:"Skills",sub:"Collected along the road"},
        {show:showExp,eye:"SECTION 04 · EXPERIENCE",title:"Experience",sub:"Stops along the way"},
        {show:showProj,eye:"SECTION 05 · PROJECTS",title:"Projects",sub:"Click any building to explore"},
      ].map(({show,eye,title,sub}) => (
        <div key={title} style={{
          position:"fixed",top:50,left:62,
          opacity:show?1:0,transform:`translateY(${show?0:-14}px)`,
          transition:"all 0.5s ease",pointerEvents:"none",zIndex:80,
        }}>
          <div style={{ fontSize:9,color:C.accent,fontFamily:"monospace",letterSpacing:4,marginBottom:7 }}>{eye}</div>
          <div style={{ fontSize:"clamp(26px,3.8vw,46px)",fontWeight:"700",color:C.textPrimary,
            fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.08,
            textShadow:`0 0 40px rgba(167,139,250,0.2)` }}>{title}</div>
          <div style={{ fontSize:12,color:C.textDim,marginTop:7,fontFamily:"monospace" }}>{sub}</div>
        </div>
      ))}

      {/* END */}
      <div style={{
        position:"fixed",top:"50%",right:80,transform:"translateY(-50%)",
        opacity:showEnd?1:0,transition:"opacity 0.8s ease",zIndex:80,maxWidth:410,
      }}>
        <div style={{
          background:C.glass,backdropFilter:"blur(26px)",border:`1px solid ${C.glassBorder}`,
          borderRadius:22,padding:"42px 46px",
          boxShadow:"0 44px 110px rgba(60,0,120,0.5),inset 0 1px 0 rgba(167,139,250,0.09)",
        }}>
          <div style={{ height:2,width:40,background:`linear-gradient(to right,${C.accentGold},transparent)`,marginBottom:22 }}/>
          <div style={{ fontSize:9,color:C.accentGold,fontFamily:"monospace",letterSpacing:4,marginBottom:18 }}>06 — PRESENT</div>
          <p style={{ fontFamily:"'Playfair Display',Georgia,serif",
            fontSize:"clamp(16px,1.9vw,21px)",lineHeight:1.78,color:C.textPrimary,
            fontStyle:"italic",margin:"0 0 34px" }}>
            "This is where I am now.<br/>
            Still learning. Still building.<br/>
            Still moving forward."
          </p>
          <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
            {[
              {label:"GitHub",href:"https://github.com/mcjohnsontech",color:C.accent},
              {label:"Contact",href:"mailto:mcj26017@gmail.com",color:C.accentGold},
              {label:"Resume",href:"#",color:C.textSecond},
            ].map(btn => (
              <a key={btn.label} href={btn.href}
                target={btn.href.startsWith("http")?"_blank":undefined} rel="noreferrer"
                style={{
                  display:"inline-flex",alignItems:"center",
                  background:"rgba(167,139,250,0.06)",border:`1px solid ${btn.color}40`,
                  color:btn.color,padding:"12px 26px",borderRadius:9,textDecoration:"none",
                  fontFamily:"monospace",fontSize:12,fontWeight:"600",letterSpacing:1,
                }}>{btn.label}</a>
            ))}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        position:"fixed",top:0,left:0,height:2,width:`${progress*100}%`,
        background:`linear-gradient(to right,${C.teal},${C.accent},${C.accentPink},${C.accentGold})`,
        transition:"width 0.06s linear",zIndex:300,
        boxShadow:`0 0 16px ${C.accent}90`,
      }}/>

      <Nav scrollX={scrollX} jumpTo={jumpTo}/>
      <Modal project={selectedProject} onClose={()=>setSelectedProject(null)}/>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;}
        body{margin:0;overflow:hidden;}
        @keyframes tw{from{opacity:0.2;}to{opacity:0.85;}}
        @keyframes pulse{0%,100%{opacity:0.3;}50%{opacity:0.9;}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes slideUp{from{transform:translateY(26px) scale(0.95);opacity:0;}to{transform:translateY(0) scale(1);opacity:1;}}
        a{transition:opacity 0.2s,transform 0.2s;}
        a:hover{opacity:0.78;transform:translateY(-2px);}
        button{outline:none;}
      `}</style>
    </div>
  );
}