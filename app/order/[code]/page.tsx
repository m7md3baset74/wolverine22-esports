"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";
import { CheckCircle, Info, Coins, RotateCw, Zap, Shield, Clock } from "lucide-react";

// ─── Animated Counter ──────────────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (ref.current) ref.current.textContent = Math.floor(v).toString();
      },
    });
    return controls.stop;
  }, [value]);
  return <span ref={ref}>0</span>;
}

// ─── Floating Particles ────────────────────────────────────────────
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            background: `rgba(212, 175, 55, ${Math.random() * 0.4 + 0.1})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Live Pulse ────────────────────────────────────────────────────
function LivePulse() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center w-3 h-3">
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-400"
          animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
      </div>
      <span className="text-xs font-semibold text-emerald-400 tracking-widest uppercase">Live</span>
    </div>
  );
}

// ─── Step Timeline ─────────────────────────────────────────────────
function Timeline({ status, progress }: { status: string; progress: number }) {
  const steps = [
    { label: "Order Received", icon: Shield, done: true },
    { label: "Processing", icon: Zap, done: progress > 0 },
    { label: "Transferring", icon: Coins, done: progress >= 50 },
    { label: "Completed", icon: CheckCircle, done: status === "finished" },
  ];

  return (
    <div className="relative flex items-center justify-between px-2 py-4">
      {/* Line */}
      <div className="absolute top-1/2 left-6 right-6 h-px bg-white/10 -translate-y-1/2" />
      <motion.div
        className="absolute top-1/2 left-6 h-px -translate-y-1/2 origin-left"
        style={{
          background: "linear-gradient(90deg, #d4af37, #f5d020)",
          boxShadow: "0 0 8px rgba(212,175,55,0.6)",
        }}
        initial={{ width: "0%" }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.15 + 0.3 }}
            className="relative flex flex-col items-center gap-2 z-10"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-500 ${
                step.done
                  ? "bg-gradient-to-br from-amber-400 to-yellow-600 border-amber-400 shadow-[0_0_14px_rgba(212,175,55,0.6)]"
                  : "bg-[#1a1a2e] border-white/10"
              }`}
            >
              <Icon size={15} className={step.done ? "text-[#0f0f1a]" : "text-white/30"} />
            </div>
            <span className={`text-[10px] font-semibold tracking-wide text-center leading-tight ${step.done ? "text-amber-400" : "text-white/20"}`}>
              {step.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────
export default function OrderPage() {
  const params = useParams();
  const code = params.code as string;

  const [showError, setShowError] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const fetchOrder = async () => {
    const res = await fetch(`/api/order?code=${code}`);
    const data = await res.json();
    setOrder(data[0]);
  };

  useEffect(() => {
    setMounted(true);
    if (!code) return;
    fetchOrder();
    const interval = setInterval(() => {
      if (!document.hidden && order?.status !== "finished") fetchOrder();
    }, 60000);
    return () => clearInterval(interval);
  }, [code]);

  if (!order || !mounted)
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#0f0f1a" }}>
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="w-14 h-14 rounded-full border-2 border-amber-400/30 border-t-amber-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white/40 text-sm tracking-widest uppercase font-semibold">Loading Order</p>
        </div>
      </div>
    );

  const progress = Number(order.percentDelivered);
  const isFinished = order.status === "finished";
  const isActionRequired = order.economyState === "interrupted" && order.accountCheck === "FailLoggedInConsoleTo";
  const isWrongUserPass = order.accountCheck === "wrongUserPass";
  const isNoTransferMarket = order.accountCheck === "noTM";
  const isWrongBackup = order.accountCheck === "wrongBA";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 gap-5 pb-12 relative"
      style={{
        background: "radial-gradient(ellipse at 30% 0%, #1c1830 0%, #0f0f1a 55%, #0a0a14 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .gold-text {
          background: linear-gradient(135deg, #d4af37 0%, #f5d020 50%, #d4af37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glass {
          background: rgba(255,255,255,0.035);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .glass-warm {
          background: rgba(212,175,55,0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212,175,55,0.12);
        }
      `}</style>

      {/* Ambient glow top */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]"
        style={{ background: "radial-gradient(ellipse, rgba(212,175,55,0.07) 0%, transparent 70%)" }}
      />

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[500px] glass-warm rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden mt-4"
      >
        <Particles />
        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-amber-400/20"
          style={{ background: "rgba(212,175,55,0.08)" }}>
          <img src="/generated-image.png" className="w-full h-full object-contain p-1.5" />
        </div>
        <div className="flex-1">
          <div className="text-white font-semibold text-base" style={{ fontFamily: "'Sora', sans-serif" }}>
            WOLVERINE_22
          </div>
          <div className="text-white/40 text-xs tracking-wide">Transfer Service</div>
        </div>
        <LivePulse />
      </motion.div>

      {/* ── MAIN CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[500px] glass rounded-2xl overflow-hidden relative"
      >
        {/* Top gradient stripe */}
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)" }} />

        <div className="p-6 sm:p-8">

          {/* Title */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
              Order <span className="gold-text">Status</span>
            </h1>
            <div className="text-xs text-white/25 font-mono">#{code?.slice(0, 8)?.toUpperCase()}</div>
          </div>

          {/* ── ERROR BANNERS ── */}
          {isWrongUserPass && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 mb-6 border border-red-500/20"
              style={{ background: "rgba(239,68,68,0.07)" }}>
              <div className="flex items-center gap-2 text-red-400 font-semibold text-sm mb-1">⚠️ Action Required</div>
              <p className="text-white/50 text-xs leading-relaxed">Your EA email or password is incorrect. Please verify your credentials to continue the transfer.</p>
            </motion.div>
          )}

          {isNoTransferMarket && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 mb-6 border border-amber-400/20"
              style={{ background: "rgba(212,175,55,0.06)" }}>
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-1">⚠️ Transfer Market Locked</div>
              <p className="text-white/50 text-xs leading-relaxed">Your account has no access to the EA Transfer Market. Please play matches on console until EA unlocks it.</p>
            </motion.div>
          )}

          {isWrongBackup && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 mb-6 border border-violet-400/20"
              style={{ background: "rgba(139,92,246,0.07)" }}>
              <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm mb-1">⚠️ Backup Code Required</div>
              <p className="text-white/50 text-xs leading-relaxed mb-2">One or more of your EA backup codes are invalid.</p>
              <a href="https://myaccount.ea.com/cp-ui/security/index" target="_blank"
                className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">
                EA Security Settings →
              </a>
            </motion.div>
          )}

          {showError && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-xl p-3 mb-4 border border-red-500/20 text-center text-xs text-red-400"
              style={{ background: "rgba(239,68,68,0.07)" }}>
              Unknown error. Contact support with your transfer ID.
            </motion.div>
          )}

          {/* ── INFO ── */}
          {!isFinished && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="rounded-xl p-4 mb-6 border border-blue-400/10"
              style={{ background: "rgba(96,165,250,0.05)" }}>
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-1">
                <Info size={14} /> Order Information
              </div>
              <p className="text-white/40 text-xs leading-relaxed">
                Stay logged out from console, web and mobile app during the transfer to avoid interruptions.
              </p>
            </motion.div>
          )}

          {/* ── COMPLETED ── */}
          {isFinished && (
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="rounded-xl p-4 mb-6 border border-emerald-400/20"
              style={{ background: "rgba(52,211,153,0.06)" }}>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
                <CheckCircle size={14} /> Order Completed!
              </div>
              <p className="text-white/40 text-xs leading-relaxed">
                30-minute cooldown before using the web app again. Or login on console and log out. Thank you!
              </p>
            </motion.div>
          )}

          {/* ── SCREENSHOT ── */}
          {order.lastTransferID && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6 rounded-xl overflow-hidden border border-white/8 hover:border-amber-400/20 transition-colors cursor-pointer group">
              <img src={`/api/screenshot?transferID=${order.lastTransferID}`}
                className="w-full group-hover:scale-[1.01] transition-transform duration-500" />
            </motion.div>
          )}

          {/* ── COINS DASHBOARD ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl p-5 mb-5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(245,208,32,0.04) 100%)",
              border: "1px solid rgba(212,175,55,0.15)",
            }}
          >
            {/* Glow orb */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)" }} />

            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-white/40 text-xs tracking-widest uppercase mb-1">Coins Delivered</div>
                <div className="text-4xl sm:text-5xl font-bold gold-text" style={{ fontFamily: "'Sora', sans-serif" }}>
                  <AnimatedNumber value={order.alreadyDelivered} />
                  <span className="text-2xl ml-1">K</span>
                </div>
                <div className="text-white/30 text-xs mt-1">of {order.totalAmount}K total</div>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.2)" }}>
                <Coins size={22} className="text-amber-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Delivered", value: `${order.alreadyDelivered}K`, color: "text-emerald-400" },
                { label: "Remaining", value: `${order.totalAmount - order.alreadyDelivered}K`, color: "text-amber-400" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl p-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="text-white/30 text-[10px] uppercase tracking-widest mb-1">{stat.label}</div>
                  <div className={`text-lg font-bold ${stat.color}`} style={{ fontFamily: "'Sora', sans-serif" }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── PROGRESS BAR ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mb-6"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/40 text-xs tracking-wide uppercase">Transfer Progress</span>
              <motion.span
                className="text-sm font-bold gold-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {progress}%
              </motion.span>
            </div>

            <div className="relative w-full h-2.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #d4af37, #f5d020, #ffe066)",
                  boxShadow: "0 0 16px rgba(212,175,55,0.7), 0 0 4px rgba(212,175,55,0.4)",
                }}
              />
              {/* shimmer */}
              <motion.div
                className="absolute top-0 h-full w-16 rounded-full"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
                animate={{ left: ["-10%", "110%"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
              />
            </div>
          </motion.div>

          {/* ── TIMELINE ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-4 mb-5"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Transfer Timeline</div>
            <Timeline status={order.status} progress={progress} />
          </motion.div>

          {/* ── ACTION REQUIRED ── */}
          {isActionRequired && (
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="rounded-xl p-4 mb-5 border border-amber-400/20"
              style={{ background: "rgba(212,175,55,0.06)" }}>
              <div className="text-amber-400 font-semibold text-sm mb-1">⚠️ Action Required</div>
              <p className="text-white/50 text-xs mb-3 leading-relaxed">
                You are logged in on the EA webapp. Please log out and try again.
              </p>
              <button
                onClick={() => { setShowError(true); setTimeout(() => setShowError(false), 3000); }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-[#0f0f1a] flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95"
                style={{ background: "linear-gradient(135deg, #d4af37, #f5d020)" }}
              >
                <RotateCw size={15} /> Resume Transfer
              </button>
            </motion.div>
          )}

          {/* ── STATUS BADGE ── */}
          {!showError && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: isFinished ? "rgba(52,211,153,0.1)" : "rgba(212,175,55,0.08)",
                  border: `1px solid ${isFinished ? "rgba(52,211,153,0.25)" : "rgba(212,175,55,0.2)"}`,
                }}>
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: isFinished ? "#34d399" : "#d4af37" }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className={`text-xs font-semibold capitalize tracking-wide ${isFinished ? "text-emerald-400" : "text-amber-400"}`}>
                  {order.status}
                </span>
              </div>
            </motion.div>
          )}

          {/* ── LAST ACTIVITY ── */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            <Clock size={10} className="text-white/20" />
            <span className="text-[10px] text-white/25 font-mono">{order.lastActivity}</span>
          </div>

        </div>

        {/* Bottom gradient stripe */}
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)" }} />
      </motion.div>
    </div>
  );
}