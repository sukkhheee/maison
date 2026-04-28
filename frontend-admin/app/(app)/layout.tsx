import { AdminShell } from "@/components/shell/AdminShell";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      <AdminShell>{children}</AdminShell>
    </RouteGuard>
  );
}
