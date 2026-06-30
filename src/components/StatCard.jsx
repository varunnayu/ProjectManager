import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function StatCard({
  icon,
  value,
  label,
  trend,
  trendUp = true,
  accentColor,
  iconBg,
  iconColor,
  index = 0,
  to,
}) {
  const CardContent = (
    <>
      {/* Accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-300 group-hover:h-[4px]"
        style={{
          background: accentColor
            ? `linear-gradient(90deg, ${accentColor}, transparent)`
            : "linear-gradient(90deg, var(--color-accent), var(--color-violet))",
        }}
      />

      {/* Icon */}
      {icon && (
        <div
          className="flex items-center justify-center flex-shrink-0 text-xl transition-transform duration-300 group-hover:scale-110"
          style={{
            width: 52,
            height: 52,
            borderRadius: "var(--radius-md)",
            background: iconBg || "rgba(99, 102, 241, 0.12)",
            color: iconColor || "var(--color-accent-hover)",
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      {/* Text */}
      <div className="flex flex-col gap-0.5 mt-auto relative z-10">
        <div className="text-[13px] font-semibold text-slate-400 group-hover:text-white transition-colors">{label}</div>
        <div className="text-[32px] leading-none font-extrabold text-white tracking-tight">{value}</div>
      </div>

      {/* Trend badge */}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trendUp ? "text-emerald-400" : "text-rose-400"}`}>
          <span aria-hidden="true">{trendUp ? "↑" : "↓"}</span>
          <span>{trend}</span>
        </div>
      )}
      
      {/* Interactive indicator for links */}
      {to && (
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-bold text-lg">
          →
        </div>
      )}
    </>
  );

  const containerProps = {
    className: `glass-card relative overflow-hidden flex flex-col justify-between group p-4 sm:p-6 ${to ? "cursor-pointer hover:bg-white/5" : "cursor-default"}`,
    style: {
      minHeight: 180,
      "--card-accent": accentColor,
    },
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * 0.08, duration: 0.4, ease: "easeOut" },
    whileHover: { y: -4, scale: 1.02 },
    whileTap: to ? { scale: 0.98 } : {},
  };

  if (to) {
    return (
      <motion.div {...containerProps}>
        <Link to={to} className="absolute inset-0 z-20" aria-label={`Go to ${label}`} />
        {CardContent}
      </motion.div>
    );
  }

  return <motion.div {...containerProps}>{CardContent}</motion.div>;
}
