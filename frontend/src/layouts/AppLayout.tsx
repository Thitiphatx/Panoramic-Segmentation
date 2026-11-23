import type React from 'react'
import { Bell, Sparkles } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import AppSidebar from './AppSidebar'
import type { IAppLayoutProps } from './interface'

const AppLayout: React.FC<IAppLayoutProps> = ({ children }) => {
  const location = useLocation()
  const isDetailPage = location.pathname.startsWith('/sequences/')

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-8">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 text-slate-600 hover:bg-slate-100" />
              <Separator className="h-4" orientation="vertical" />
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Workspace</span>
                <span className="text-slate-300">/</span>
                <Link className="font-medium text-slate-700 hover:text-cyan-700" to="/">Sequences</Link>
                {isDetailPage && (
                  <>
                    <span className="text-slate-300">/</span>
                    <span className="font-medium text-slate-700">Detail</span>
                  </>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-3 sm:gap-5">
              <Badge className="hidden gap-1.5 border-0 bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 sm:flex" variant="secondary">
                <Sparkles className="size-3.5" /> Sample data
              </Badge>
              <Button aria-label="Notifications" className="relative size-9 cursor-pointer rounded-lg p-0 text-slate-500 hover:bg-slate-100" size="icon" variant="ghost">
                <Bell className="size-4.5" />
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-cyan-500" />
              </Button>
              <Avatar className="size-8">
                <AvatarFallback className="bg-[#dcebf0] text-xs font-semibold text-[#315768]">TP</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <div className="flex-1 bg-[#f5f7fb]">
            {children ?? <Outlet />}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default AppLayout
