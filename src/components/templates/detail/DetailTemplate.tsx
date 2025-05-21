import React, { ReactNode, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  AlertCircle, 
  ArrowLeft, 
  Edit, 
  Trash, 
  ChevronDown, 
  Loader2,
  User,
  CheckCircle2
} from 'lucide-react';

// Types for the detail template
export interface DetailTab {
  label: string;
  value: string;
  content: ReactNode;
  icon?: ReactNode;
}

export interface DetailAction {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  editPath?: string;
  className?: string;
}

export interface DetailTemplateProps {
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: ReactNode;
  backPath?: string;
  backLabel?: string;
  onBack?: () => void;
  isLoading?: boolean;
  error?: Error | string | null;
  editPath?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  actions?: DetailAction[];
  tabs?: DetailTab[];
  defaultTab?: string;
  children?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
  };
}

export const DetailTemplate: React.FC<DetailTemplateProps> = ({
  title,
  subtitle,
  description,
  avatar,
  backPath,
  backLabel,
  onBack,
  isLoading = false,
  error,
  editPath,
  onEdit,
  onDelete,
  actions = [],
  tabs,
  defaultTab,
  children,
  className,
  headerClassName,
  contentClassName,
  badge
}) => {
  // Default back label
  const finalBackLabel = backLabel || `Back to Dashboard`;
  
  // Prepare default actions
  const defaultActions: DetailAction[] = [];
  
  if (editPath) {
    defaultActions.push({
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      editPath
    });
  } else if (onEdit) {
    defaultActions.push({
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: onEdit
    });
  }
  
  if (onDelete) {
    defaultActions.push({
      label: 'Delete',
      icon: <Trash className="h-4 w-4" />,
      onClick: onDelete,
      variant: 'destructive'
    });
  }
  
  const allActions = [...defaultActions, ...actions];

  return (
    <div className={cn("container max-w-screen-xl py-6 space-y-6", className)}>
      <Helmet>
        <title>{title} | Admin Dashboard</title>
      </Helmet>
      
      {/* Back navigation */}
      {(backPath || onBack) && (
        <div className="mb-2">
          {backPath ? (
            <Button variant="ghost" size="sm" asChild className="group px-0 h-8 text-gray-500 hover:text-gray-900 hover:bg-transparent">
              <Link to={backPath} className="flex items-center gap-1.5">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                {finalBackLabel}
              </Link>
            </Button>
          ) : onBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="group px-0 h-8 text-gray-500 hover:text-gray-900 hover:bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5 transition-transform group-hover:-translate-x-0.5" />
              {finalBackLabel}
            </Button>
          )}
        </div>
      )}

      {/* Hero header with gradient background */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
        <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5", headerClassName)}>
          <div className="flex items-start sm:items-center gap-4">
            {avatar && (
              <div className="flex-shrink-0">
                {avatar}
              </div>
            )}
            
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                {badge && (
                  <Badge 
                    variant={badge.variant || "default"} 
                    className={cn(
                      "text-xs py-0.5 px-2 rounded-full font-medium", 
                      badge.variant === "success" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""
                    )}
                  >
                    {badge.text}
                  </Badge>
                )}
              </div>
              
              {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
              {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
            </div>
          </div>

          {/* Action buttons with improved styling */}
          {allActions.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
              {allActions.map((action, index) => {
                const isEdit = action.label === 'Edit';
                const isDelete = action.label === 'Delete';
                
                if (action.editPath) {
                  return (
                    <Button 
                      key={index}
                      asChild 
                      variant={isDelete ? "destructive" : "outline"}
                      size="sm" 
                      className={cn(
                        "h-9 px-4 font-medium transition-colors", 
                        action.className || (
                          isEdit 
                            ? "bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 text-blue-700 border-blue-200 hover:border-blue-300" 
                            : isDelete 
                              ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-red-400" 
                              : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
                        )
                      )}
                    >
                      <Link to={action.editPath} className="flex items-center">
                        {action.icon && <span className={cn("mr-1.5", isEdit ? "text-blue-600" : "")}>{action.icon}</span>}
                        {action.label}
                      </Link>
                    </Button>
                  );
                }
                
                return (
                  <Button 
                    key={index}
                    variant={isDelete ? "destructive" : "outline"}
                    size="sm" 
                    onClick={action.onClick}
                    className={cn(
                      "h-9 px-4 font-medium transition-colors", 
                      action.className || (
                        isEdit 
                          ? "bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 text-blue-700 border-blue-200 hover:border-blue-300" 
                          : isDelete 
                            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-red-400" 
                            : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
                      )
                    )}
                  >
                    {action.icon && <span className={cn("mr-1.5", isEdit ? "text-blue-600" : "")}>{action.icon}</span>}
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="space-y-6">
        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="border border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : String(error)}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center py-32 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading data...</p>
              <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
            </div>
          </div>
        ) : (
          <>
            {/* Tabbed content */}
            {tabs ? (
              <Tabs defaultValue={defaultTab || tabs[0]?.value} className="w-full">
                <div className="border-b border-gray-200">
                  <TabsList className="h-auto bg-transparent p-0 gap-6">
                    {tabs.map((tab) => (
                      <TabsTrigger 
                        key={tab.value} 
                        value={tab.value}
                        className="px-1 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary 
                                  data-[state=active]:text-primary data-[state=active]:shadow-none font-medium
                                  text-gray-600 hover:text-gray-900 rounded-none bg-transparent h-auto"
                      >
                        <div className="flex items-center gap-2">
                          {tab.icon && <span>{tab.icon}</span>}
                          {tab.label}
                        </div>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                
                <div className={cn("pt-6", contentClassName)}>
                  {tabs.map((tab) => (
                    <TabsContent key={tab.value} value={tab.value} className="mt-0 space-y-6">
                      {tab.content}
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            ) : (
              // Non-tabbed content
              <div className={cn("space-y-6", contentClassName)}>
                {children}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// MARK: - Detail Section Component

interface DetailSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  icon?: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  onEdit?: () => void;
  editPath?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
  };
}

export const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  description,
  children,
  icon,
  collapsible = false,
  defaultCollapsed = false,
  className,
  onEdit,
  editPath,
  badge,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  
  return (
    <Card className={cn("overflow-hidden border border-gray-200 shadow-sm", className)}>
      {/* Header with subtle gradient */}
      <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {icon && <span className="text-primary h-5 w-5">{icon}</span>}
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-medium text-gray-800">{title}</h3>
              
              {badge && (
                <Badge 
                  variant={badge.variant || "default"} 
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium", 
                    badge.variant === "success" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""
                  )}
                >
                  {badge.text}
                </Badge>
              )}
            </div>
            
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {editPath && (
            <Button 
              asChild 
              variant="outline"
              size="sm" 
              className="h-8 px-3 font-medium bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 text-blue-700 border-blue-200 hover:border-blue-300 transition-all"
            >
              <Link to={editPath} className="flex items-center">
                <Edit className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                Edit
              </Link>
            </Button>
          )}
          
          {onEdit && (
            <Button 
              variant="outline"
              size="sm" 
              onClick={onEdit}
              className="h-8 px-3 font-medium bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 text-blue-700 border-blue-200 hover:border-blue-300 transition-all"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
              Edit
            </Button>
          )}
          
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-200",
                collapsed ? "" : "transform rotate-180"
              )} />
            </Button>
          )}
        </div>
      </div>
      
      {/* Content */}
      {!collapsed && (
        <div className="p-5 bg-white">
          {children}
        </div>
      )}
    </Card>
  );
};

// MARK: - Detail Info Components

interface DetailInfoItemProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  badge?: ReactNode;
  className?: string;
  copyable?: boolean;
}

export const DetailInfoItem: React.FC<DetailInfoItemProps> = ({
  label,
  value,
  icon,
  badge,
  action,
  className,
  copyable = false
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    if (typeof value === 'string') {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div className={cn("flex flex-col", className)}>
      <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
        {icon && <span className="text-primary">{icon}</span>}
        {label}
      </p>
      <div className="flex items-center gap-2">
        <p className="font-medium text-gray-900">
          {value || <span className="text-gray-400 italic">Not provided</span>}
        </p>
        {badge && <div>{badge}</div>}
        
        {copyable && typeof value === 'string' && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopy}
            className="h-6 w-6 p-0 ml-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            {copied ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </Button>
        )}
        
        {action && <div className="ml-auto">{action}</div>}
      </div>
    </div>
  );
};

interface DetailInfoGridProps {
  children: ReactNode;
  className?: string;
}

export const DetailInfoGrid: React.FC<DetailInfoGridProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm p-6", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        {children}
      </div>
    </div>
  );
};

export default DetailTemplate;
