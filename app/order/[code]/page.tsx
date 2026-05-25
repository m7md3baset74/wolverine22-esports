"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, animate, useInView } from "framer-motion";
import { CheckCircle, Info, RotateCw, AlertTriangle } from "lucide-react";

// ─── Animated Number ──────────────────────────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [value]);
  return <>{display}</>;
}

// ─── Realistic Claw Scratch Progress ─────────────────────────────────────────
// Each scratch is a closed jagged shape (top edge + bottom edge) like real claw marks
// Top edge: jagged/torn upward; Bottom edge: jagged/torn downward → filled dark with orange stroke
function ClawProgress({ progress }: { progress: number }) {
  // 3 scratch shapes — diagonal, jagged, different widths
  // Each path is a closed polygon simulating a torn slash
  // Points go left→right on top, then right→left on bottom
  const scratches: { top: string; bot: string; fill: string; stroke: string; strokeW: number; delay: number; yShift: number }[] = [
    {
      // Scratch 1 — thickest, top
      top: "M2,10 L8,4 L18,8 L30,2 L45,7 L58,1 L72,6 L85,0 L100,5 L115,1 L130,6 L145,2 L160,7 L175,2 L190,6 L205,1 L220,5 L235,1 L250,4 L265,0 L278,4 L290,1 L300,3",
      bot: "M300,11 L290,16 L278,12 L265,17 L250,13 L235,17 L220,13 L205,17 L190,12 L175,16 L160,12 L145,16 L130,13 L115,17 L100,13 L85,17 L72,12 L58,16 L45,13 L30,16 L18,13 L8,17 L2,13 Z",
      fill: "rgba(100,8,0,0.85)",
      stroke: "#f97356",
      strokeW: 1.2,
      delay: 0.15,
      yShift: 0,
    },
    {
      // Scratch 2 — medium
      top: "M2,34 L10,28 L22,32 L36,26 L50,31 L65,25 L80,30 L95,24 L112,29 L128,24 L144,29 L160,24 L176,28 L192,23 L208,28 L224,23 L240,27 L256,22 L272,26 L285,22 L295,25 L300,23",
      bot: "M300,39 L295,43 L285,39 L272,43 L256,39 L240,43 L224,39 L208,43 L192,38 L176,42 L160,38 L144,42 L128,38 L112,42 L95,38 L80,42 L65,38 L50,42 L36,38 L22,42 L10,38 L2,42 Z",
      fill: "rgba(100,8,0,0.8)",
      stroke: "#fb926c",
      strokeW: 1,
      delay: 0.35,
      yShift: 0,
    },
    {
      // Scratch 3 — thinnest, bottom
      top: "M2,56 L12,51 L26,55 L42,49 L58,54 L75,48 L92,53 L110,47 L128,52 L146,47 L164,51 L182,46 L200,51 L218,46 L236,50 L254,46 L270,49 L283,46 L293,48 L300,47",
      bot: "M300,59 L293,62 L283,59 L270,62 L254,59 L236,62 L218,59 L200,62 L182,58 L164,62 L146,58 L128,61 L110,58 L92,61 L75,58 L58,61 L42,58 L26,61 L12,58 L2,61 Z",
      fill: "rgba(100,8,0,0.75)",
      stroke: "#fdba94",
      strokeW: 0.8,
      delay: 0.55,
      yShift: 0,
    },
  ];

  // We clip the entire SVG to progress% width using a clipPath rect
  const clipId = "clawClip";

  return (
    <div style={{ width: "100%" }}>
      {/* Label + big % */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 11, letterSpacing: "0.25em", color: "rgba(249,115,22,0.7)" }}>
          TRANSFER PROGRESS
        </span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 44, lineHeight: 1, color: "#f97316", filter: "drop-shadow(0 0 16px rgba(249,115,22,0.6))", letterSpacing: "0.02em" }}
        >
          {progress}<span style={{ fontSize: 22, opacity: 0.55 }}>%</span>
        </motion.span>
      </div>

      {/* SVG canvas */}
      <div style={{ position: "relative", width: "100%", height: 72, overflow: "hidden" }}>
        <svg
          width="100%"
          height="72"
          viewBox="0 0 300 72"
          preserveAspectRatio="none"
          fill="none"
          style={{ display: "block" }}
        >
          <defs>
            <filter id="scratchGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Ghost track (dim full-length scratches) */}
          {scratches.map((s, i) => (
            <g key={`track-${i}`} opacity={0.08}>
              <path d={`${s.top} L${s.bot.replace("M", "")}`} fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeW} />
            </g>
          ))}

          {/* Animated scratches — each clipped to progress width with staggered reveal */}
          {scratches.map((s, i) => (
            <motion.g
              key={`scratch-${i}`}
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
              transition={{ duration: 1.8, delay: s.delay, ease: [0.16, 1, 0.3, 1] }}
              filter="url(#scratchGlow)"
            >
              {/* Dark fill body */}
              <path
                d={`${s.top} L${s.bot.replace(/^M/, "")}`}
                fill={s.fill}
                stroke="none"
              />
              {/* Top jagged edge */}
              <path
                d={s.top}
                fill="none"
                stroke={s.stroke}
                strokeWidth={s.strokeW}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Bottom jagged edge */}
              <path
                d={`M${s.bot.replace(/^M300/, "300").replace(" Z", "")}`}
                fill="none"
                stroke={s.stroke}
                strokeWidth={s.strokeW * 0.7}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={0.6}
              />
            </motion.g>
          ))}

          {/* Glowing tip that travels with the fill */}
          <motion.rect
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: (progress / 100) * 300 - 3, opacity: progress > 2 ? 1 : 0 }}
            transition={{ duration: 1.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            y={0}
            width={3}
            height={72}
            fill="rgba(249,115,22,0.35)"
            style={{ filter: "blur(4px)" }}
          />
        </svg>
      </div>
    </div>
  );
}

// ─── Slash Reveal animation variant ──────────────────────────────────────────
const slashReveal = {
  hidden: { clipPath: "inset(0 100% 0 0)", opacity: 0 },
  visible: (delay: number) => ({
    clipPath: "inset(0 0% 0 0)",
    opacity: 1,
    transition: { duration: 0.55, delay, ease: [0.77, 0, 0.18, 1] },
  }),
};

// ─── Claw Scratch SVG decorative ─────────────────────────────────────────────
function ClawScratch({
  x,
  y,
  rotate,
  opacity,
  scale,
}: {
  x: string;
  y: string;
  rotate: number;
  opacity: number;
  scale: number;
}) {
  return (
    <svg
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `rotate(${rotate}deg) scale(${scale})`,
        opacity,
        pointerEvents: "none",
      }}
      width="120"
      height="80"
      viewBox="0 0 120 80"
      fill="none"
    >
      <path d="M10 70 Q30 10 45 5" stroke="rgba(249,115,22,0.6)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M28 72 Q48 12 63 7" stroke="rgba(249,115,22,0.5)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M46 74 Q66 14 81 9" stroke="rgba(249,115,22,0.72)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

// ─── Alert Block ──────────────────────────────────────────────────────────────
function AlertBlock({
  accent,
  label,
  children,
}: {
  accent: [number, number, number];
  label: string;
  children: React.ReactNode;
}) {
  const [r, g, b] = accent;
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: `rgba(${r},${g},${b},0.07)`,
        border: `1px solid rgba(${r},${g},${b},0.2)`,
        borderLeft: `3px solid rgba(${r},${g},${b},0.7)`,
        borderRadius: 8,
        padding: "12px 16px",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 12,
          letterSpacing: "0.2em",
          color: `rgba(${r},${g},${b},0.9)`,
          marginBottom: 6,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <AlertTriangle size={12} />
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: 12,
          fontWeight: 300,
          color: "rgba(255,255,255,0.65)",
          lineHeight: 1.65,
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function OrderPage() {
  const params = useParams();
  const code = params.code as string;
  const [showError, setShowError] = useState(false);
  const [order, setOrder] = useState<any>(null);

  const fetchOrder = async () => {
    const res = await fetch(`/api/order?code=${code}`);
    const data = await res.json();
    setOrder(data[0]);
  };

  useEffect(() => {
    if (!code) return;
    fetchOrder();
    if (order?.status === "finished") return;
    const interval = setInterval(() => {
      if (!document.hidden) fetchOrder();
    }, 60000);
    return () => clearInterval(interval);
  }, [code, order?.status]);

  // ── Loading ──
  if (!order)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;600&display=swap');`}</style>
        <motion.div
          animate={{ scaleX: [0.6, 1, 0.6], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 48,
            color: "#f97316",
            letterSpacing: "0.1em",
          }}
        >
          WOLVERINE_22
        </motion.div>
        <div
          style={{
            width: 120,
            height: 2,
            background: "linear-gradient(90deg,transparent,#f97316,transparent)",
          }}
        />
      </div>
    );

  const progress = Number(order.percentDelivered);
  const isFinished = order.status === "finished";
  const isActionRequired =
    order.economyState === "interrupted" &&
    order.accountCheck === "FailLoggedInConsoleTo";
  const isWrongUserPass = order.accountCheck === "wrongUserPass";
  const isNoTransferMarket = order.accountCheck === "noTM";
  const isWrongBackup = order.accountCheck === "wrongBA";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,400;0,700;0,900;1,700&family=Barlow:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; }

        .wlv-page {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 40% at 50% 0%, rgba(249,115,22,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 50% 50% at 5% 80%, rgba(249,115,22,0.04) 0%, transparent 50%),
            radial-gradient(ellipse 50% 50% at 95% 20%, rgba(249,115,22,0.03) 0%, transparent 50%),
            #0a0a0a;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          gap: 0;
          position: relative;
          overflow: hidden;
        }

        /* Noise grain */
        .wlv-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
          opacity: 0.5;
          pointer-events: none;
          z-index: 0;
        }

        .wlv-card {
          width: 100%;
          max-width: 500px;
          position: relative;
          z-index: 10;
          background:
            linear-gradient(145deg, rgba(249,115,22,0.06) 0%, rgba(249,115,22,0.01) 20%, rgba(12,12,12,0.98) 45%),
            #0e0e0e;
          border: 1px solid rgba(249,115,22,0.12);
          border-radius: 4px 20px 20px 4px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(249,115,22,0.04),
            0 40px 100px rgba(0,0,0,0.9),
            0 0 80px rgba(249,115,22,0.04),
            inset 0 1px 0 rgba(249,115,22,0.08);
        }

        /* Left orange accent bar */
        .wlv-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #f97316 0%, rgba(249,115,22,0.3) 60%, transparent 100%);
          z-index: 20;
        }

        .wlv-inner {
          padding: 24px 24px 20px 28px;
        }

        .orange-rule {
          height: 1px;
          background: linear-gradient(90deg, rgba(249,115,22,0.6) 0%, rgba(249,115,22,0.15) 60%, transparent 100%);
          margin: 0 0 0 -28px;
          width: calc(100% + 28px);
        }

        .stat-cell {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(249,115,22,0.08);
          border-radius: 6px;
          padding: 12px 14px;
        }

        .wlv-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 9px;
          letter-spacing: 0.3em;
          color: rgba(249,115,22,0.7);
          text-transform: uppercase;
        }

        .wlv-body {
          font-family: 'Barlow', sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: rgba(255,255,255,0.65);
          line-height: 1.65;
        }

        .notice-block {
          background: rgba(255,255,255,0.018);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 6px;
          padding: 12px 14px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
          margin-bottom: 16px;
        }
      `}</style>

      <div className="wlv-page">

        {/* Decorative claw scratches in background */}
        <ClawScratch x="-40px" y="10%" rotate={15} opacity={0.25} scale={1.8} />
        <ClawScratch x="75%" y="60%" rotate={-20} opacity={0.15} scale={2.2} />
        <ClawScratch x="60%" y="5%" rotate={5} opacity={0.12} scale={1.4} />

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: "100%",
            maxWidth: 500,
            position: "relative",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 12,
            padding: "0 4px",
          }}
        >
          {/* Logo image with claw-frame border */}
          <div
            style={{
              position: "relative",
              flexShrink: 0,
            }}
          >
            {/* Corner slashes */}
            <div style={{ position: "absolute", top: -4, left: -4, width: 14, height: 14, borderTop: "2px solid #f97316", borderLeft: "2px solid #f97316", borderRadius: "2px 0 0 0" }} />
            <div style={{ position: "absolute", bottom: -4, right: -4, width: 14, height: 14, borderBottom: "2px solid #f97316", borderRight: "2px solid #f97316", borderRadius: "0 0 2px 0" }} />
            <img
              src="/generated-image.png"
              style={{
                width: 60,
                height: 60,
                objectFit: "contain",
                borderRadius: 6,
                border: "1px solid rgba(249,115,22,0.2)",
                background: "rgba(249,115,22,0.05)",
                padding: 4,
                filter: "drop-shadow(0 0 10px rgba(249,115,22,0.25))",
              }}
            />
          </div>

          {/* Name + subtitle */}
          <div>
            <motion.h1
              custom={0}
              variants={slashReveal}
              initial="hidden"
              animate="visible"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 30,
                letterSpacing: "0.08em",
                color: "#f5f5f5",
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              WOLVERINE
              <span style={{ color: "#f97316", marginLeft: 6 }}>_22</span>
            </motion.h1>
            <motion.p
              custom={0.15}
              variants={slashReveal}
              initial="hidden"
              animate="visible"
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: 11,
                fontWeight: 400,
                color: "rgba(249,115,22,0.72)",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              Transfer Service
            </motion.p>
          </div>

          {/* Status pill */}
          <motion.div
            animate={!isFinished ? { opacity: [0.5, 1, 0.5] } : {}}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 4,
              background: isFinished ? "rgba(34,197,94,0.07)" : "rgba(249,115,22,0.07)",
              border: `1px solid ${isFinished ? "rgba(34,197,94,0.2)" : "rgba(249,115,22,0.2)"}`,
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: isFinished ? "#22c55e" : "#f97316",
                boxShadow: `0 0 8px ${isFinished ? "#22c55e" : "#f97316"}`,
              }}
            />
            <span
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 10,
                letterSpacing: "0.2em",
                color: isFinished ? "rgba(34,197,94,0.8)" : "rgba(249,115,22,0.8)",
                textTransform: "uppercase",
              }}
            >
              {isFinished ? "Done" : "Live"}
            </span>
          </motion.div>
        </motion.div>

        {/* ── MAIN CARD ── */}
        <motion.div
          className="wlv-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top orange rule */}
          <div className="orange-rule" />

          <div className="wlv-inner">

            {/* Card title */}
            <motion.div
              custom={0.2}
              variants={slashReveal}
              initial="hidden"
              animate="visible"
              style={{ marginBottom: 20 }}
            >
              <div className="wlv-label" style={{ marginBottom: 4 }}>Order Status</div>
              <h2
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontStyle: "italic",
                  fontSize: 32,
                  color: "#f5f5f5",
                  letterSpacing: "0.02em",
                  lineHeight: 1,
                }}
              >
                Transfer
                <span style={{ color: "#f97316", marginLeft: 8 }}>Tracker</span>
              </h2>
            </motion.div>

            {/* ── ALERTS ── */}
            {isWrongUserPass && (
              <AlertBlock accent={[239, 68, 68]} label="Credentials Invalid">
                Your EA email or password is incorrect. Please verify your credentials and provide the correct login information to continue.
              </AlertBlock>
            )}
            {isNoTransferMarket && (
              <AlertBlock accent={[249, 115, 22]} label="Transfer Market Locked">
                Your account has no Transfer Market access. Play matches on console until EA unlocks it, or contact support.
              </AlertBlock>
            )}
            {isWrongBackup && (
              <AlertBlock accent={[167, 139, 250]} label="Backup Code Required">
                One or more EA backup codes are invalid.{" "}
                <a
                  href="https://myaccount.ea.com/cp-ui/security/index"
                  target="_blank"
                  style={{ color: "rgba(167,139,250,0.8)", textDecoration: "underline", textUnderlineOffset: 3 }}
                >
                  EA Security Settings →
                </a>
              </AlertBlock>
            )}
            {showError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.15)",
                  borderRadius: 6,
                  padding: "10px 14px",
                  marginBottom: 14,
                  textAlign: "center",
                  fontFamily: "'Barlow',sans-serif",
                  fontSize: 12,
                  color: "rgba(239,68,68,0.7)",
                }}
              >
                Unknown error — contact support with your transfer ID.
              </motion.div>
            )}

            {/* ── NOTICES ── */}
            {!isFinished && (
              <motion.div
                className="notice-block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Info size={13} style={{ color: "rgba(249,115,22,0.72)", flexShrink: 0, marginTop: 2 }} />
                <p className="wlv-body" style={{ fontSize: 12 }}>
                  Stay logged out on console, web app, and mobile for the full duration of the transfer.
                </p>
              </motion.div>
            )}
            {isFinished && (
              <motion.div
                className="notice-block"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: "rgba(34,197,94,0.04)",
                  border: "1px solid rgba(34,197,94,0.12)",
                }}
              >
                <CheckCircle size={13} style={{ color: "rgba(34,197,94,0.6)", flexShrink: 0, marginTop: 2 }} />
                <p className="wlv-body" style={{ fontSize: 12 }}>
                  Transfer complete. Allow 30 minutes before resuming web app activity.
                </p>
              </motion.div>
            )}

            {/* ── COINS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              <div className="stat-cell">
                <div className="wlv-label" style={{ marginBottom: 8 }}>Delivered</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3, lineHeight: 1 }}>
                  <span
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 44,
                      color: "#f97316",
                      lineHeight: 1,
                      filter: "drop-shadow(0 0 12px rgba(249,115,22,0.5))",
                    }}
                  >
                    <AnimatedNumber value={order.alreadyDelivered} />
                  </span>
                  <span
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 22,
                      color: "rgba(249,115,22,0.5)",
                      marginBottom: 5,
                    }}
                  >
                    K
                  </span>
                </div>
              </div>

              <div className="stat-cell">
                <div className="wlv-label" style={{ marginBottom: 8 }}>Total Order</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3, lineHeight: 1 }}>
                  <span
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 44,
                      color: "rgba(255,255,255,0.3)",
                      lineHeight: 1,
                    }}
                  >
                    {order.totalAmount}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 22,
                      color: "rgba(255,255,255,0.15)",
                      marginBottom: 5,
                    }}
                  >
                    K
                  </span>
                </div>
              </div>
            </div>

            {/* Divider with claw marks */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 18,
              }}
            >
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(249,115,22,0.3), transparent)" }} />
              <div style={{ display: "flex", gap: 3 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 2,
                      height: 10,
                      background: "rgba(249,115,22,0.72)",
                      borderRadius: 1,
                      transform: `rotate(${[-8, 0, 8][i]}deg)`,
                    }}
                  />
                ))}
              </div>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.3))" }} />
            </div>

            {/* ── SCRATCH PROGRESS ── */}
            <div style={{ marginBottom: 20 }}>
              <ClawProgress progress={progress} />
            </div>

            {/* ── SCREENSHOT ── */}
            {order.lastTransferID && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{
                  borderRadius: 6,
                  border: "1px solid rgba(249,115,22,0.1)",
                  overflow: "hidden",
                  marginBottom: 16,
                }}
                whileHover={{ scale: 1.005 }}
              >
                <div
                  style={{
                    padding: "7px 14px",
                    borderBottom: "1px solid rgba(249,115,22,0.07)",
                  }}
                >
                  <span className="wlv-label">Last Transfer Proof</span>
                </div>
                <img
                  src={`/api/screenshot?transferID=${order.lastTransferID}`}
                  style={{ width: "100%", display: "block" }}
                />
              </motion.div>
            )}

            {/* ── FINISHED ── */}
            {isFinished && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: "rgba(249,115,22,0.04)",
                  border: "1px solid rgba(249,115,22,0.12)",
                  borderRadius: 6,
                  padding: "14px 16px",
                  marginBottom: 14,
                  textAlign: "center",
                }}
              >
                <div className="wlv-label" style={{ marginBottom: 6 }}>Final Result</div>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 24,
                    color: "#f97316",
                    letterSpacing: "0.06em",
                  }}
                >
                  {order.alreadyDelivered}K / {order.totalAmount}K — {progress}%
                </div>
              </motion.div>
            )}

            {/* ── ACTION REQUIRED ── */}
            {isActionRequired && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "rgba(249,115,22,0.05)",
                  border: "1px solid rgba(249,115,22,0.15)",
                  borderRadius: 6,
                  padding: "14px 16px",
                  marginBottom: 14,
                }}
              >
                <div className="wlv-label" style={{ color: "rgba(249,115,22,0.7)", marginBottom: 8 }}>
                  ⚠ Action Required
                </div>
                <p className="wlv-body" style={{ fontSize: 12, marginBottom: 14 }}>
                  You are logged in on the EA webapp. Please log out to resume the transfer.
                </p>
                <button
                  onClick={() => {
                    setShowError(true);
                    setTimeout(() => setShowError(false), 3000);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "10px 16px",
                    borderRadius: 4,
                    cursor: "pointer",
                    background: "rgba(249,115,22,0.1)",
                    border: "1px solid rgba(249,115,22,0.25)",
                    color: "#f97316",
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 13,
                    letterSpacing: "0.18em",
                    transition: "opacity 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = "0.7")}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <RotateCw size={13} />
                  Resume Transfer
                </button>
              </motion.div>
            )}

          </div>

          {/* ── BOTTOM BAR ── */}
          <div
            style={{
              padding: "10px 28px",
              borderTop: "1px solid rgba(249,115,22,0.07)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <motion.div
                animate={!isFinished ? { opacity: [0.3, 1, 0.3] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isFinished ? "#22c55e" : "#f97316",
                  boxShadow: `0 0 8px ${isFinished ? "#22c55e" : "#f97316"}`,
                }}
              />
              <span
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  color: isFinished ? "rgba(34,197,94,0.7)" : "rgba(249,115,22,0.7)",
                  textTransform: "uppercase",
                }}
              >
                {order.status}
              </span>
            </div>
            <span
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: 10,
                color: "rgba(255,255,255,0.45)",
              }}
            >
              {order.lastActivity}
            </span>
          </div>

          {/* Bottom orange rule */}
          <div
            style={{
              height: 2,
              background:
                "linear-gradient(90deg, #f97316 0%, rgba(249,115,22,0.72) 50%, transparent 100%)",
            }}
          />
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          style={{
            position: "relative",
            zIndex: 10,
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 9,
            letterSpacing: "0.35em",
            color: "rgba(249,115,22,0.2)",
            marginTop: 14,
            paddingBottom: 8,
          }}
        >
          WOLVERINE_22 — TRANSFER SYSTEM
        </motion.p>
      </div>
    </>
  );
}