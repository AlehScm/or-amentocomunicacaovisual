
'use client';

import React from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, FileText, TestTube2, Settings, Menu, PanelLeft, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './ui/button';

const AcmELetrasLogo = () => (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-sidebar-accent"
    >
      <path
        d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12L22 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12V22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12L2 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/', label: 'Painel', icon: LayoutDashboard },
    { href: '/materials', label: 'Materiais', icon: TestTube2 },
    { href: '/quotes', label: 'Orçamentos', icon: FileText },
    { href: '/settings', label: 'Configurações', icon: Settings },
  ];
  
  const getPageTitle = () => {
    if (pathname === '/quotes/new') return 'Novo Orçamento';
    if (pathname.startsWith('/quotes/')) return 'Detalhes do Orçamento';
    const current = navItems.find(item => pathname === item.href);
    return current?.label ?? 'Painel';
  }

  const showBackButton = pathname === '/quotes/new' || pathname.startsWith('/quotes/');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-secondary/30">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
                <AcmELetrasLogo />
                <h1 className="font-headline text-2xl font-bold text-sidebar-foreground group-data-[state=collapsed]:hidden">Acm E Letras</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton isActive={pathname.startsWith(item.href) && item.href !== '/'} tooltip={item.label}>
                      <item.icon className="size-5" />
                      <span className="font-body">{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
                <div className="flex items-center gap-4">
                  <div className="md:hidden">
                    <SidebarTrigger>
                      <Menu />
                    </SidebarTrigger>
                  </div>
                  {!showBackButton && (
                    <SidebarTrigger className="hidden md:flex">
                      <PanelLeft />
                    </SidebarTrigger>
                  )}
                  {showBackButton && (
                     <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => router.push('/quotes')}>
                        <ArrowLeft />
                     </Button>
                  )}
                  <h1 className="font-headline text-xl font-semibold md:text-2xl text-foreground">
                    {getPageTitle()}
                  </h1>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
