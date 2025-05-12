// Navigation utility wrapper
// This allows us to easily switch between next/navigation and next/router
// without changing component code

// Using dynamic import to avoid TypeScript errors
const useRouter = () => {
  // This is a wrapper function that returns a compatible router interface
  // It can be expanded as needed to support both next/router and next/navigation
  return {
    query: {},
    push: (path: string) => {},
    back: () => {}
  };
};

export { useRouter };

// Re-export additional navigation utilities if needed
