"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FileText,
  User,
  ListChecks,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Zap,
  Bot,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

type SidebarProps = {
  user: {
    name: string;
    avatar?: string | null;
  };
};

export default function Sidebar({ user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation: NavItem[] = [
    { name: "Jobs", href: "/dashboard/jobs", icon: <Briefcase size={20} /> },
    { name: "Resume", href: "/dashboard/resume", icon: <FileText size={20} /> },
    { name: "Profile", href: "/dashboard/profile", icon: <User size={20} /> },
    { name: "Application Status", href: "/dashboard/status", icon: <ListChecks size={20} /> },
  ];

  const footerItems: NavItem[] = [
    { name: "Billing / Credits", href: "/dashboard/billing", icon: <CreditCard size={20} /> },
    { name: "Profile Settings", href: "/dashboard/settings", icon: <Settings size={20} /> },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={`
        relative flex flex-col border-r border-border bg-sidebar text-sidebar-foreground
        transition-all duration-300 ease-in-out overflow-hidden shrink-0
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      {/* ── Logo ── */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2.5 pl-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/30">
              <Bot size={16} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none tracking-tight text-sidebar-foreground">
                JobBuddy
              </p>
              <p className="text-[10px] font-medium text-primary leading-none mt-0.5">
                AI ✦
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/30">
            <Bot size={16} className="text-primary-foreground" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={`h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent ${collapsed ? "mx-auto mt-1" : ""}`}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      {/* ── User Card ── */}
      <div className={`flex items-center gap-3 px-3 py-3.5 ${collapsed ? "justify-center" : ""}`}>
        <Avatar className="h-9 w-9 ring-2 ring-primary/30 shrink-0">
          {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
          <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate leading-none">{user.name}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Pro Plan</p>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Menu
          </p>
        )}
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={`
                group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                transition-all duration-150
                ${collapsed ? "justify-center" : ""}
                ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                    : "text-sidebar-foreground/70 hover:bg-accent hover:text-sidebar-foreground"
                }
              `}
            >
              <span className={active ? "text-primary-foreground" : "text-primary"}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Credits Banner ── */}
      {!collapsed && (
        <div className="mx-3 mb-3 rounded-xl bg-primary/10 border border-primary/20 px-3 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-primary" />
            <p className="text-xs font-semibold text-primary">AI Credits</p>
          </div>
          <div className="w-full bg-primary/20 rounded-full h-1.5">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: "60%" }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">60 / 100 credits used</p>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="border-t border-border px-2 py-3 space-y-0.5">
        {footerItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={`
                flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                transition-all duration-150
                ${collapsed ? "justify-center" : ""}
                ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-accent hover:text-sidebar-foreground"
                }
              `}
            >
              <span className="text-primary">{item.icon}</span>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          title="Toggle theme"
          className={`
            w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
            text-sidebar-foreground/70 hover:bg-accent hover:text-sidebar-foreground
            transition-all duration-150
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <span className="text-primary">
            {!mounted ? (
              <div className="h-5 w-5 rounded bg-muted animate-pulse" />
            ) : resolvedTheme === "dark" ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )}
          </span>
          {!collapsed && (
            <span>
              {!mounted ? "Theme" : resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
