import { motion } from "framer-motion";

/**
 * StatCard — displays a KPI metric with icon, value, label, and optional trend.
 *
 * @param {object} props
 * @param {React.ReactNode} props.icon       - Icon element
 * @param {string|number}   props.value      - Main metric value
 * @param {string}          props.label      - Metric name
 * @param {string}          [props.trend]    - e.g. "+12% this month"
 * @param {boolean}         [props.trendUp]  - true = green, false = red
 * @param {string}          [props.accentColor] - CSS gradient string for top bar
 * @param {string}          [props.iconBg]   - Background for icon box
 * @param {string}          [props.iconColor]- Icon color
 * @param {number}          [props.index]    - Animation stagger index
 */
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
}) {
  return (
    <motion.div
      className="glass-card relative overflow-hidden flex flex-col justify-between group cursor-default"
      style={{
        minHeight: 180,
        padding: "24px",
        "--card-accent": accentColor,
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      {/* Accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: accentColor
            ? `linear-gradient(90deg, ${accentColor}, transparent)`
            : "linear-gradient(90deg, var(--color-accent), var(--color-violet))",
        }}
      />

      {/* Icon */}
      {icon && (
        <div
          className="flex items-center justify-center flex-shrink-0 text-xl"
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
      <div className="flex flex-col gap-0.5 mt-auto">
        <div className="text-[13px] font-semibold text-slate-400">{label}</div>
        <div className="text-[32px] leading-none font-extrabold text-white tracking-tight">{value}</div>
      </div>

      {/* Trend badge */}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trendUp ? "text-emerald-400" : "text-rose-400"}`}>
          <span aria-hidden="true">{trendUp ? "↑" : "↓"}</span>
          <span>{trend}</span>
        </div>
      )}
    </motion.div>
  );
}
