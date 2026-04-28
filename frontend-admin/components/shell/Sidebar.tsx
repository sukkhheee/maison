"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Sparkles,
  Users,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthProvider";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Үндсэн",
    items: [
      { href: "/", label: "Дашборд", icon: LayoutDashboard },
      { href: "/calendar", label: "Календарь", icon: CalendarDays, badge: "12" },
      { href: "/bookings", label: "Захиалгууд", icon: ClipboardList }
    ]
  },
  {
    title: "Удирдлага",
    items: [
      { href: "/services", label: "Үйлчилгээ", icon: Sparkles },
      { href: "/staff", label: "Ажилчид", icon: Users },
      { href: "/settings", label: "Тохиргоо", icon: Settings }
    ]
  }
];

interface Props {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function Sidebar({ collapsed, onToggleCollapsed }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const initials = (user?.fullName ?? "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 shrink-0",
        "bg-surface border-r border-border",
        "flex flex-col transition-[width] duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Brand */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-border">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-fg text-bg grid place-items-center font-serif text-lg">
          {(user?.salonName ?? "M").charAt(0).toUpperCase()}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-serif text-base leading-tight truncate">
              {user?.salonName ?? "Maison Admin"}
            </p>
            <p className="text-[11px] text-fg-muted truncate">
              {user?.salonSlug ? `/${user.salonSlug}` : "Admin · v0.1"}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {groups.map((g) => (
          <div key={g.title}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] uppercase tracking-wider text-fg-muted font-semibold">
                {g.title}
              </p>
            )}
            <ul className="space-y-1">
              {g.items.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-accent-soft text-fg"
                          : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                        collapsed && "justify-center px-0"
                      )}
                    >
                      {/* Active marker */}
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-accent" />
                      )}
                      <Icon
                        size={18}
                        className={cn(
                          "shrink-0",
                          active ? "text-accent" : "text-fg-muted group-hover:text-fg"
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className="truncate flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-accent-fg font-semibold">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="border-t border-border p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-md p-2 transition-colors",
            collapsed && "justify-center"
          )}
        >
          <div
            className="h-9 w-9 shrink-0 rounded-full bg-accent-soft grid place-items-center text-sm font-semibold text-accent"
            title={user?.fullName}
          >
            {initials || "?"}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {user?.fullName ?? "—"}
                </p>
                <p className="text-[11px] text-fg-muted truncate">
                  {user?.salonName ?? roleLabel(user?.role)}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="h-7 w-7 grid place-items-center rounded-md text-fg-muted hover:text-fg hover:bg-border transition"
                aria-label="Гарах"
              >
                <LogOut size={14} />
              </button>
            </>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapsed}
          className={cn(
            "mt-2 w-full flex items-center justify-center gap-2 text-xs text-fg-muted hover:text-fg",
            "h-8 rounded-md hover:bg-surface-2 transition-colors"
          )}
        >
          {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
          {!collapsed && <span>Хумих</span>}
        </button>
      </div>
    </aside>
  );
}

function roleLabel(role: string | undefined): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "SALON_ADMIN":
      return "Salon Admin";
    case "STAFF":
      return "Мастер";
    case "CLIENT":
      return "Үйлчлүүлэгч";
    default:
      return "—";
  }
}
