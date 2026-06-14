"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";

/**
 * Client-side route guard (we use static export, so no server middleware).
 * Wrap protected pages with this. Redirects to /login if no session.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let active = true;
    (async () => {
      const u = await getCurrentUser();
      if (!active) return;
      setUser(u);
      setLoading(false);
      if (!u) router.replace("/login");
    })();
    return () => {
      active = false;
    };
  }, [router, setUser, setLoading]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      </div>
    );
  }

  return <>{children}</>;
}
