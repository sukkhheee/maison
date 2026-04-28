"use client";

import { Bell, Search, Plus } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Дашборд", subtitle: "Өнөөдрийн нийт үзүүлэлт" },
  "/calendar": { title: "Master Calendar", subtitle: "Бүх ажилчдын өнөөдрийн хуваарь" },
  "/bookings": { title: "Захиалгууд", subtitle: "Сүүлийн захиалгууд" },
  "/services": { title: "Үйлчилгээнүүд", subtitle: "Үнэ, үргэлжлэх хугацаа" },
  "/staff": { title: "Ажилчид", subtitle: "Мастерууд, эрх" },
  "/settings": { title: "Тохиргоо", subtitle: "Салон, төлбөр, мэдэгдэл" }
};

export function Topbar() {
  const pathname = usePathname();
  const meta = titles[pathname] ?? titles["/"];

  return (
    <header className="h-16 sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-border">
      <div className="h-full px-6 flex items-center gap-4">
        {/* Title */}
        <div className="min-w-0">
          <h1 className="text-base font-semibold tracking-tight truncate">
            {meta.title}
          </h1>
          <p className="text-xs text-fg-muted truncate">{meta.subtitle}</p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-md bg-surface border border-border w-72">
          <Search size={14} className="text-fg-muted shrink-0" />
          <input
            placeholder="Захиалга, үйлчлүүлэгч хайх…"
            className="bg-transparent flex-1 text-sm placeholder:text-fg-muted focus:outline-none"
          />
          <kbd className="text-[10px] text-fg-muted bg-surface-2 border border-border px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </div>

        {/* Actions */}
        <ThemeToggle />

        <button
          className="relative h-9 w-9 grid place-items-center rounded-md text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-accent" />
        </button>

        <Button variant="primary" size="sm">
          <Plus size={14} />
          Шинэ захиалга
        </Button>
      </div>
    </header>
  );
}
