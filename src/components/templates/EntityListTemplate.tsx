// import React, { ReactNode } from 'react';
// import { Helmet } from 'react-helmet-async';
// import { Link, useNavigate } from 'react-router-dom';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { Search, Plus, AlertCircle, ChevronDown, Calendar, Filter, Settings, Download, ArrowUpDown } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { BaseEntityTemplateProps, EntityColumnConfig } from './types';

// export interface EntityListTemplateProps<T> extends BaseEntityTemplateProps {
//   // Page metadata
//   icon?: ReactNode;

//   // Data props
//   data: T[];
//   isLoading?: boolean;
//   error?: Error | string | null;
//   totalItems?: number;
  
//   // Search props
//   searchQuery?: string;
//   onSearchChange?: (query: string) => void;
//   searchPlaceholder?: string;
  
//   // Filtering props
//   filterComponent?: ReactNode;
  
//   // Columns and rendering
//   columns?: EntityColumnConfig<T>[];
//   renderItem?: (item: T, index: number) => ReactNode;
//   renderHeader?: () => ReactNode;
  
//   // Create entity options
//   createPath?: string;
//   createButtonText?: string;
//   createConfig?: {
//     onClick: () => void;
//     buttonText?: string;
//   };
  
//   // Pagination options
//   currentPage?: number;
//   totalPages?: number;
//   onPageChange?: (page: number) => void;
  
//   // Classes
//   className?: string;
// }

// export function EntityListTemplate<T>({ 
//   // Page metadata
//   title,
//   description,
//   icon,
  
//   // Data props
//   data = [],
//   isLoading = false,
//   error,
//   totalItems = 0,
  
//   // Search props
//   searchQuery = '',
//   onSearchChange,
//   searchPlaceholder,
  
//   // Filtering props
//   filterComponent,
  
//   // Columns and rendering
//   columns = [],
//   renderItem,
//   renderHeader,
  
//   // Create entity options
//   createPath,
//   createButtonText,
//   createConfig,
  
//   // Pagination options
//   currentPage = 1,
//   totalPages = 1,
//   onPageChange,
  
//   // Classes
//   className,
// }: EntityListTemplateProps<T>) {
//   const navigate = useNavigate();
  
//   // Default values
//   const finalCreatePath = createPath || '';
//   const finalCreateButtonText = createButtonText || createConfig?.buttonText || `New ${title.endsWith('s') ? title.slice(0, -1) : title}`;
//   const finalSearchPlaceholder = searchPlaceholder || `Search ${title.toLowerCase()}...`;

//   // Helper function for status styling
//   const getStatusStyle = (status?: string) => {
//     if (!status) return 'bg-gray-50 text-gray-700';
//     switch (status.toLowerCase()) {
//       case 'active':
//         return 'bg-green-50 text-green-700';
//       case 'pending':
//         return 'bg-yellow-50 text-yellow-700';
//       case 'cancelled':
//       case 'canceled':
//         return 'bg-red-50 text-red-700';
//       default:
//         return 'bg-gray-50 text-gray-700';
//     }
//   };

//   // Default empty state renderer
//   const defaultEmptyState = () => (
//     <div className="flex flex-col items-center justify-center py-12">
//       <div className="rounded-full bg-primary/10 p-3 mb-3">
//         <Search className="h-6 w-6 text-primary" />
//       </div>
//       <h3 className="text-lg font-medium mb-2">No {title.toLowerCase()} found</h3>
//       <p className="text-muted-foreground text-sm text-center max-w-xs">
//         {searchQuery 
//           ? `No ${title.toLowerCase()} found for "${searchQuery}". Try adjusting your search.` 
//           : `There are no ${title.toLowerCase()} available. Create one to get started.`
//         }
//       </p>
//       {finalCreatePath && !searchQuery && (
//         <Button asChild className="mt-4">
//           <Link to={finalCreatePath}>
//             <Plus className="mr-2 h-4 w-4" />
//             {finalCreateButtonText}
//           </Link>
//         </Button>
//       )}
//     </div>
//   );

//   return (
//     <div className={cn("container py-6 space-y-6", className)}>
//       <Helmet>
//         <title>{title} | Admin Dashboard</title>
//       </Helmet>

//       <div className="space-y-6">
//         {/* Header section with title and actions */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-semibold">{title}</h1>
//             {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
//           </div>

//           <div className="flex items-center gap-3">
//             {/* Filter dropdown */}
//             <Button variant="outline" size="sm" className="rounded-md h-9 px-3 text-sm font-medium">
//               <Filter className="mr-2 h-4 w-4" /> 
//               Filter
//               <ChevronDown className="ml-2 h-4 w-4" />
//             </Button>

//             {/* Date range */}
//             <Button variant="outline" size="sm" className="rounded-md h-9 px-3 text-sm font-medium">
//               <Calendar className="mr-2 h-4 w-4" /> 
//               Date Range
//               <ChevronDown className="ml-2 h-4 w-4" />
//             </Button>

//             {/* Create button */}
//             {finalCreatePath ? (
//               <Button size="sm" className="h-9 rounded-md">
//                 <Link to={finalCreatePath} className="flex items-center gap-1.5">
//                   <Plus className="h-4 w-4" />
//                   {finalCreateButtonText}
//                 </Link>
//               </Button>
//             ) : createConfig?.onClick ? (
//               <Button size="sm" className="h-9 rounded-md" onClick={createConfig.onClick}>
//                 <Plus className="h-4 w-4 mr-1.5" />
//                 {finalCreateButtonText}
//               </Button>
//             ) : null}
//           </div>
//         </div>

//         {/* Search and advanced filters section */}
//         <div className="flex flex-col sm:flex-row items-center gap-3">
//           <div className="relative flex-grow max-w-md">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//             <Input
//               type="search"
//               placeholder={finalSearchPlaceholder}
//               value={searchQuery}
//               onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
//               className="pl-9 h-9 rounded-md"
//             />
//           </div>

//           {filterComponent && (
//             <div className="flex-shrink-0">
//               {filterComponent}
//             </div>
//           )}
          
//           <div className="flex-shrink-0 ml-auto flex items-center gap-2">
//             <Button variant="outline" size="sm" className="h-9 w-9 p-0">
//               <Download className="h-4 w-4" />
//             </Button>
//             <Button variant="outline" size="sm" className="h-9 w-9 p-0">
//               <Settings className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         {/* Main content card with table */}
//         <Card className="overflow-hidden border rounded-lg shadow-sm">
//           <CardContent className="p-0">
//             {/* Error state */}
//             {error ? (
//               <div className="p-6">
//                 <Alert variant="destructive">
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertTitle>Error</AlertTitle>
//                   <AlertDescription>
//                     {error instanceof Error ? error.message : String(error)}
//                   </AlertDescription>
//                 </Alert>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="bg-gray-50 border-b border-gray-200">
//                       <th className="py-3.5 px-4 text-left">
//                         <input type="checkbox" className="rounded border-gray-300" />
//                       </th>
//                       {renderHeader ? renderHeader() : columns.map((column, idx) => (
//                         <th 
//                           key={idx} 
//                           className="py-3.5 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
//                         >
//                           <div className="flex items-center gap-1.5">
//                             {column.header}
//                             <button className="opacity-60 hover:opacity-100">
//                               <ArrowUpDown className="h-3.5 w-3.5" />
//                             </button>
//                           </div>
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
                  
//                   {/* Loading state */}
//                   {isLoading ? (
//                     <tbody>
//                       <tr>
//                         <td colSpan={columns.length + 1} className="text-center py-20">
//                           <div className="flex justify-center">
//                             <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
//                           </div>
//                         </td>
//                       </tr>
//                     </tbody>
//                   ) : !data || data.length === 0 ? (
//                     <tbody>
//                       <tr>
//                         <td colSpan={columns.length + 1} className="text-center py-10">
//                           {defaultEmptyState()}
//                         </td>
//                       </tr>
//                     </tbody>
//                   ) : (
//                     <tbody>
//                       {data.map((item, index) => (
//                         <tr 
//                           key={index} 
//                           className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
//                         >
//                           <td className="py-3.5 px-4 whitespace-nowrap">
//                             <input type="checkbox" className="rounded border-gray-300" />
//                           </td>
                          
//                           {renderItem ? (
//                             <td colSpan={columns.length} className="py-3.5 px-4 text-sm font-medium text-gray-800">
//                               {renderItem(item, index)}
//                             </td>
//                           ) : (
//                             // Use the provided columns to render data
//                             columns.map((column, colIdx) => {
//                               const alignClass = column.key === 'members' || column.key === 'membersCount' || column.key === 'impressions' || 
//                                                 column.key === 'count' || column.key?.includes('number') ? 'text-center' : '';
                              
//                               return (
//                                 <td key={colIdx} className={`py-3.5 px-4 text-sm font-medium text-gray-800 whitespace-nowrap ${alignClass}`}>
//                                   {column.key ? 
//                                     // Display formatted status if it's a status field
//                                     (column.key === 'status' ? (
//                                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle((item as any)[column.key])}`}>                                
//                                         • {(item as any)[column.key] || 'inactive'}
//                                       </span>
//                                     ) : (item as any)[column.key])
//                                   : null}
//                                 </td>
//                               );
//                             })
//                           )}
//                         </tr>
//                       ))}
//                     </tbody>
//                   )}
//                 </table>
//               </div>
//             )}
            
//             {/* Pagination */}
//             {!isLoading && data && data.length > 0 && onPageChange && (
//               <div className="flex items-center justify-between py-4 px-4 border-t border-gray-200">
//                 <div className="text-sm text-gray-500">
//                   Showing <span className="font-medium">{data.length}</span> of <span className="font-medium">{totalItems}</span> {title.toLowerCase()}
//                 </div>
                
//                 <div className="flex items-center space-x-2">
//                   <Button 
//                     variant="outline" 
//                     size="sm" 
//                     disabled={currentPage === 1}
//                     onClick={() => onPageChange(Math.max(1, currentPage - 1))}
//                     className="h-8 px-3 text-sm"
//                   >
//                     Previous
//                   </Button>
//                   <Button 
//                     variant="outline" 
//                     size="sm" 
//                     disabled={currentPage >= totalPages}
//                     onClick={() => onPageChange(currentPage + 1)}
//                     className="h-8 px-3 text-sm"
//                   >
//                     Next
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
