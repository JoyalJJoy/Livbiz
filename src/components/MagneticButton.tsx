import type { ButtonHTMLAttributes, ReactNode } from "react";

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export default function MagneticButton({
  children,
  className = "",
  ...props
}: MagneticButtonProps) {
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}
