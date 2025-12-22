import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient } from "@tanstack/react-query";
import type { AppRouter } from "../../../server/routers";
import superjson from "superjson";

const getBackendUrl = () => {
  // En producción, usa VITE_BACKEND_URL
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  // En desarrollo local, usa localhost:3000
  return import.meta.env.DEV ? "http://localhost:3000" : window.location.origin;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBackendUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});

export { queryClient };
