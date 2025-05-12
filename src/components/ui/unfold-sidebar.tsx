import * as React from "react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  icon: string;
  link: string;
  active?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SideNavProps {
  navigationSections: NavSection[];
  logo?: string;
  appName?: string;
  dashboardLink?: string;
  className?: string;
}

export function UnfoldSidebar({
  navigationSections,
  logo = "/logo.jpg",
  appName = "Joulepoint",
  dashboardLink = "/dashboard",
  className,
}: SideNavProps) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);

  // Filter navigation items based on search query
  const filteredSections = React.useMemo(() => {
    if (!searchQuery.trim()) return navigationSections;

    return navigationSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [navigationSections, searchQuery]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(!!query.trim());
  };

  return (
    <nav
      id="nav-sidebar"
      className={cn(
        "bg-gray-50 border-r border-gray-200 flex flex-col fixed max-h-screen min-h-screen min-w-[280px] w-[280px] transition-width dark:bg-gray-900 dark:border-gray-800",
        className
      )}
    >
      {/* Logo/Header Section */}
      <div className="border-b border-gray-200 mb-5 py-3 dark:border-gray-800">
        <div className="flex font-medium h-10 items-center px-6 text-gray-700 dark:text-gray-200">
          <Link to={dashboardLink}>
            <img
              src={logo}
              style={{ height: "60px", width: "auto", borderRadius: "8px" }}
              className="mr-4"
              alt="App Logo"
            />
          </Link>
          <h1>
            <Link to={dashboardLink}>{appName}</Link>
          </h1>
        </div>
      </div>

      {/* Search Box */}
      <div className="mb-5 mx-3 relative">
        <div className="bg-white border flex items-center overflow-hidden rounded-md shadow-sm focus-within:ring focus-within:ring-primary-300 focus-within:border-primary-600 dark:bg-gray-900 dark:border-gray-700 dark:focus-within:border-primary-600 dark:focus-within:ring-primary-700 dark:focus-within:ring-opacity-50">
          <span className="material-symbols-outlined md-18 pl-3 text-gray-400">
            manage_search
          </span>
          <input
            type="search"
            className="flex-grow font-medium overflow-hidden pl-2 pr-3 py-2 text-gray-500 text-sm focus:outline-none dark:bg-gray-900 dark:text-gray-400"
            placeholder="Search apps and models..."
            aria-label="Filter navigation items"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div
            className={cn(
              "absolute mt-0.5 right-2 top-2",
              isSearching ? "opacity-100" : "opacity-0"
            )}
          >
            <span className="animate-spin material-symbols-outlined md-18 text-gray-300">
              sync
            </span>
          </div>
        </div>
        <div id="search-results"></div>
      </div>

      {/* Navigation Sections */}
      <div className="overflow-auto">
        {filteredSections.map((section, sectionIndex) => (
          <React.Fragment key={`section-${sectionIndex}`}>
            <h3 className="font-medium my-3 px-6 text-gray-900 text-sm first:mt-0 dark:text-gray-200">
              {section.title}
            </h3>

            <ol className="px-6">
              {section.items.map((item, itemIndex) => {
                // Determine if the item is active based on the current route
                const isActive =
                  item.active || location.pathname === item.link;

                return (
                  <li key={`item-${sectionIndex}-${itemIndex}`}>
                    <Link
                      to={item.link}
                      className={cn(
                        "border border-transparent flex h-11 items-center -mx-3 px-3 py-2 rounded-md",
                        isActive
                          ? "bg-gray-100 font-semibold text-primary-600 dark:border dark:border-gray-800 dark:bg-white/[.02] dark:text-primary-500"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:dark:text-gray-200"
                      )}
                    >
                      <span className="material-symbols-outlined md-18 mr-3 w-4.5">
                        {item.icon}
                      </span>
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}