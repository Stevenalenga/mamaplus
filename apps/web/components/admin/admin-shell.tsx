'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ADMIN_NAV_ITEMS, getAdminPageTitle, getNavItemsForRole } from '@/components/admin/admin-nav'
import { LogoutButton } from '@/components/auth/LogoutButton'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type AdminShellProps = {
  children: React.ReactNode
  userRole?: string
}

export function AdminShell({ children, userRole }: AdminShellProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const pageTitle = getAdminPageTitle(pathname)
  const navItems = getNavItemsForRole(userRole ?? session?.user?.role)

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-border/60">
        <SidebarHeader className="border-b border-border/60 p-4">
          <Link href="/dashboard/admin" className="flex items-center gap-2">
            <Image src="/logo.png" alt="MamaPlus" width={32} height={32} className="rounded" />
            <span className="font-semibold text-sm group-data-[collapsible=icon]:hidden">
              MamaPlus Admin
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive =
                    item.href === '/dashboard/admin'
                      ? pathname === '/dashboard/admin'
                      : pathname.startsWith(item.href)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-border/60 p-3">
          <div className="group-data-[collapsible=icon]:hidden space-y-2">
            <p className="truncate text-xs font-medium">{session?.user?.name ?? 'Admin'}</p>
            <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
            <LogoutButton variant="outline" size="sm" className="w-full" />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
        </header>
        <main className={cn('flex-1 bg-muted/30 p-4 md:p-6')}>
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
