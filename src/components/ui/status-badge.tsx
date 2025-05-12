
import { Badge, BadgeProps } from "@/components/ui/badge";
import React from "react";

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: string;
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | BadgeProps["variant"];
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = "neutral",
  ...props
}) => {
  // Map custom variants to standard badge variants
  let badgeVariant: BadgeProps["variant"] = "secondary";
  
  switch (variant) {
    case "success":
      badgeVariant = "default";
      break;
    case "warning":
    case "danger":
      badgeVariant = "destructive";
      break;
    case "info":
      badgeVariant = "outline";
      break;
    case "neutral":
      badgeVariant = "secondary";
      break;
    default:
      // Check if it's a valid BadgeProps variant
      if (["secondary", "default", "outline", "destructive"].includes(variant as string)) {
        badgeVariant = variant as BadgeProps["variant"];
      } else {
        // Fallback to secondary if it's not a recognized variant
        badgeVariant = "secondary";
      }
      break;
  }

  return (
    <Badge 
      variant={badgeVariant} 
      className={`
        ${variant === "success" ? "bg-green-500 hover:bg-green-600" : ""}
        ${variant === "warning" ? "bg-amber-500 hover:bg-amber-600" : ""}
        ${variant === "danger" ? "bg-red-500 hover:bg-red-600" : ""}
        ${variant === "info" ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
      `}
      {...props}
    >
      {status}
    </Badge>
  );
};
