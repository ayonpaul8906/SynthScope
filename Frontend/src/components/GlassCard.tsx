import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type Props = HTMLMotionProps<"div"> & { hover?: boolean };

export const GlassCard = forwardRef<HTMLDivElement, Props>(function GlassCard(
  { className, hover = true, children, ...rest },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={cn(
        "glass rounded-2xl p-6 transition-shadow",
        hover && "hover:shadow-[0_20px_60px_-15px_oklch(0.65_0.24_300/40%)]",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
});
