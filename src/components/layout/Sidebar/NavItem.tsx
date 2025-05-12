
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface NavItemProps {
  href: string;
  icon: React.ElementType;
  title: string;
  isNested?: boolean;
  tooltipContent?: string;
}

export const NavItem = ({
  href,
  icon: Icon,
  title,
  isNested = false,
  tooltipContent,
}: NavItemProps) => {
  const baseClasses = cn(
    "flex items-center rounded-md text-sm font-medium transition-colors",
    isNested
      ? "h-8 px-2 py-1 hover:bg-gray-800/50"
      : "h-10 px-3 py-2 hover:bg-gray-800/50",
    "text-gray-200 hover:text-white"
  );

  const content = (
    <Link to={href} className={baseClasses}>
      <span className="flex items-center justify-center">
        <Icon className="h-4 w-4" />
      </span>
      {title && <span className="ml-3">{title}</span>}
    </Link>
  );

  if (tooltipContent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};
