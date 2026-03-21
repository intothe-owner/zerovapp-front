"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
export default function Providers({ children }: { children: React.ReactNode }) {
    const [qc] = useState(() => new QueryClient());
  return <QueryClientProvider client={qc}><SessionProvider>{children}</SessionProvider></QueryClientProvider>;
}
