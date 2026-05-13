"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ListChecks,
    MapPin,
    Table2,
    Calculator,
    LogOut,
    Home,
} from "lucide-react";

import { logoutAdminAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/kriteria", label: "Kriteria", icon: ListChecks },
    { href: "/dashboard/alternatif", label: "Alternatif", icon: MapPin },
    { href: "/dashboard/penilaian", label: "Penilaian", icon: Table2 },
    { href: "/dashboard/hasil", label: "Hasil MOORA", icon: Calculator },
];

interface SidebarProps {
    username: string;
}

export function Sidebar({ username }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="w-72 border-r bg-card/60 backdrop-blur-sm flex flex-col sticky top-0 h-screen">
            <div className="border-b px-5 py-6">
                <p className="font-heading text-lg font-semibold tracking-tight">SPK MOORA</p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Admin panel pemilihan lokasi
                </p>
            </div>

            <nav className="space-y-1 p-4 flex-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="size-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="space-y-3 border-t px-4 py-4 mt-auto">
                <p className="text-xs text-muted-foreground">Login sebagai {username}</p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <Home className="size-4" />
                    Lihat Halaman Publik
                </Link>

                <form action={logoutAdminAction}>
                    <Button variant="outline" className="w-full justify-start" type="submit">
                        <LogOut className="size-4" />
                        Logout
                    </Button>
                </form>
            </div>
        </aside>
    );
}