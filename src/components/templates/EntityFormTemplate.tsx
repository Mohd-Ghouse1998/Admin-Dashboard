// import React, { ReactNode } from 'react';
// import { Helmet } from 'react-helmet-async';
// import { useNavigate } from 'react-router-dom';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { ArrowLeft, AlertCircle } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { BaseEntityTemplateProps } from './types';

// export const FormSection = ({ 
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

// export interface EntityFormTemplateProps extends BaseEntityTemplateProps {
//   // Navigation
//   backPath?: string;
  
//   // Form state
//   isSubmitting?: boolean;
//   submitError?: Error | null | string;
  
//   // Form actions
//   onSubmit?: () => void;
//   submitButtonText?: string;
  
//   // Content
//   children?: ReactNode;
// }

// export function EntityFormTemplate({
//   // Page metadata
//   title,
//   description,
//   className,
  
//   // Data and state
//   isLoading,
//   error,
  
//   // Navigation
//   backPath,
  
//   // Form state
//   isSubmitting = false,
//   submitError,
  
//   // Form actions
//   onSubmit,
//   submitButtonText = 'Save',
  
//   // Content
//   children,
// }: EntityFormTemplateProps) {
//   const navigate = useNavigate();
  
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
//       <div>
//         <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
//         {description && (
//           <p className="text-muted-foreground mt-1">{description}</p>
//         )}
//       </div>
      
//       {/* Error state */}
//       {error && (
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertTitle>Error</AlertTitle>
//           <AlertDescription>
//             {error instanceof Error ? error.message : error}
//           </AlertDescription>
//         </Alert>
//       )}
      
//       {/* Submit error */}
//       {submitError && (
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertTitle>Failed to submit</AlertTitle>
//           <AlertDescription>
//             {submitError instanceof Error ? submitError.message : submitError}
//           </AlertDescription>
//         </Alert>
//       )}
      
//       {/* Main content */}
//       {isLoading ? (
//         <div className="flex justify-center items-center py-20">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-opacity-50"></div>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {children}
          
//           {/* Submit button */}
//           {onSubmit && (
//             <div className="flex justify-end">
//               <Button 
//                 type="submit" 
//                 disabled={isSubmitting}
//                 onClick={onSubmit}
//                 className="min-w-[120px]"
//               >
//                 {isSubmitting ? (
//                   <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-opacity-50"></div>
//                 ) : (
//                   submitButtonText
//                 )}
//               </Button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
