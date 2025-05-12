
import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DetailSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function DetailSection({
  title,
  children,
  className,
  headerActions,
  collapsed = false,
  onToggleCollapse,
}: DetailSectionProps) {
  return (
    <Card className={cn("mb-6", className)}>
      <CardHeader className="bg-gray-100 border-b border-gray-200 dark:bg-white/[.02] dark:border-gray-800 p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
      </CardHeader>
      <CardContent className={cn("p-4", collapsed && "hidden")}>{children}</CardContent>
    </Card>
  );
}
