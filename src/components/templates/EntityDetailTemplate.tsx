// import React, { ReactNode } from 'react';
// import { Helmet } from 'react-helmet-async';
// import { Link, useNavigate } from 'react-router-dom';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { ArrowLeft, Pencil, Trash2, AlertCircle } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { BaseEntityTemplateProps } from './types';

// // Section component for organizing entity details
// export const EntitySection = ({ 
//   title, 
//   description, 
//   children, 
//   className 
// }: { 
//   title: string; 
//   description?: string; 
//   children: ReactNode; 
//   className?: string;
// }) => {
//   return (
//     <Card className={cn("border border-border shadow-sm", className)}>
//       <CardHeader className="py-4 border-b">
//         <CardTitle className="text-lg font-semibold">{title}</CardTitle>
//         {description && (
//           <CardDescription>{description}</CardDescription>
//         )}
//       </CardHeader>
//       <CardContent className="p-4">
//         {children}
//       </CardContent>
//     </Card>
//   );
// };

// export interface EntityDetailTemplateProps extends BaseEntityTemplateProps {
//   // Entity information
//   entityName?: string;
//   entityId?: string;
//   icon?: ReactNode;
  
//   // Navigation
//   backPath?: string;
//   editPath?: string;
//   onEdit?: () => void;
  
//   // Data
//   data?: any;
//   entity?: any; // Backward compatibility
//   customErrorContent?: ReactNode;
  
//   // Actions
//   onDelete?: () => void;
//   hideDeleteButton?: boolean;
//   hideEditButton?: boolean;
//   deleteDialogTitle?: string;
//   deleteDialogDescription?: string;
  
//   // Content layouts
//   children?: ReactNode;
//   leftColumnContent?: ReactNode;
//   rightColumnContent?: ReactNode;
//   mainContent?: ReactNode;
//   headerActions?: ReactNode;
//   sidebarContent?: ReactNode;
//   layout?: 'default' | 'wide' | 'full' | 'sidebar';
// }

// export function EntityDetailTemplate({
//   // Page metadata
//   title,
//   description,
//   className,
//   icon,
  
//   // Entity information
//   entityName,
//   entityId,
  
//   // Data and state
//   data,
//   entity, // Backward compatibility
//   isLoading,
//   error,
//   customErrorContent,
  
//   // Navigation
//   backPath,
//   editPath,
//   onEdit,
  
//   // Actions
//   onDelete,
//   hideDeleteButton = false,
//   hideEditButton = false,
//   deleteDialogTitle,
//   deleteDialogDescription,
  
//   // Content
//   children,
//   leftColumnContent,
//   rightColumnContent,
//   mainContent,
//   headerActions,
//   sidebarContent,
//   layout = 'default',
// }: EntityDetailTemplateProps) {
//   const navigate = useNavigate();
  
//   // Handle backward compatibility
//   const entityData = data || entity;
  
//   return (
//     <div className={cn("container py-6 space-y-6", className)}>
//       <Helmet>
//         <title>{title} | Admin Dashboard</title>
//       </Helmet>
      
//       {/* Back button */}
//       {backPath && (
//         <Button 
//           variant="ghost" 
//           className="flex items-center gap-1.5 pl-2" 
//           onClick={() => navigate(backPath)}
//         >
//           <ArrowLeft className="h-4 w-4" />
//           Back
//         </Button>
//       )}
      
//       {/* Page header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div className="flex items-center gap-3">
//           {icon && (
//             <div className="flex-shrink-0 rounded-full bg-primary/10 p-2">
//               {icon}
//             </div>
//           )}
//           <div>
//             <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
//             {description && (
//               <p className="text-muted-foreground">{description}</p>
//             )}
//           </div>
//         </div>
        
//         {/* Action buttons */}
//         <div className="flex items-center gap-2 flex-shrink-0">
//           {/* Custom header actions */}
//           {headerActions}
          
//           {/* Edit button */}
//           {!hideEditButton && (editPath || onEdit) && (
//             editPath ? (
//               <Button asChild variant="outline">
//                 <Link to={editPath} className="flex items-center gap-1.5">
//                   <Pencil className="h-4 w-4" />
//                   Edit
//                 </Link>
//               </Button>
//             ) : (
//               <Button variant="outline" onClick={onEdit} className="flex items-center gap-1.5">
//                 <Pencil className="h-4 w-4" />
//                 Edit
//               </Button>
//             )
//           )}
          
//           {/* Delete button */}
//           {!hideDeleteButton && onDelete && (
//             <Button 
//               variant="outline" 
//               size="sm" 
//               className="text-destructive border-destructive/30 hover:bg-destructive/10"
//               onClick={onDelete}
//             >
//               <Trash2 className="mr-2 h-4 w-4" />
//               Delete
//             </Button>
//           )}
//         </div>
//       </div>
      
//       {/* Error state */}
//       {error && (
//         customErrorContent || (
//           <Alert variant="destructive">
//             <AlertCircle className="h-4 w-4" />
//             <AlertTitle>Error</AlertTitle>
//             <AlertDescription>
//               {error instanceof Error ? error.message : 'An error occurred'}
//             </AlertDescription>
//           </Alert>
//         )
//       )}
      
//       {/* Loading state */}
//       {isLoading && (
//         <div className="py-8 flex justify-center items-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//         </div>
//       )}
      
//       {/* Content */}
//       {!isLoading && !error && (entityData || mainContent || leftColumnContent || rightColumnContent || sidebarContent) && (
//         <div className="space-y-6">
//           {mainContent && (
//             <div className="space-y-6">
//               {mainContent}
//             </div>
//           )}
          
//           {layout === 'sidebar' && sidebarContent ? (
//             // Sidebar layout
//             <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//               <div className="lg:col-span-1">
//                 {sidebarContent}
//               </div>
//               <div className="lg:col-span-3 space-y-6">
//                 {children}
//               </div>
//             </div>
//           ) : (leftColumnContent || rightColumnContent) ? (
//             // Two column layout
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {leftColumnContent && (
//                 <div className="md:col-span-1 space-y-6">
//                   {leftColumnContent}
//                 </div>
//               )}
              
//               {rightColumnContent && (
//                 <div className="md:col-span-2 space-y-6">
//                   {rightColumnContent}
//                 </div>
//               )}
//             </div>
//           ) : children ? (
//             // Default content
//             <div className="space-y-6">
//               {children}
//             </div>
//           ) : null}
//         </div>
//       )}
//     </div>
//   );
// }
