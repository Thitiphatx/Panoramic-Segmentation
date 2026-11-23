import type React from 'react'
import { Activity, CircleHelp, Database, FolderOpen, Gauge, LayoutDashboard, Layers2, Settings2 } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import type { IAppSidebarProps } from './interface'

const AppSidebar: React.FC<IAppSidebarProps> = () => {
  const location = useLocation()
  const isSequencesActive = location.pathname === '/' || location.pathname.startsWith('/sequences')

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/50 p-4">
        <Link className="flex items-center gap-3" to="/">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-[#102035]">
            <Activity className="size-5" strokeWidth={2.5} />
          </div>
          <div className="leading-tight group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-bold tracking-[0.12em] text-sidebar-foreground">PANO</p>
            <p className="text-[10px] tracking-[0.16em] text-muted-foreground">SEGMENTATION LAB</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">
            WORKSPACE
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Overview">
                  <Link className="text-muted-foreground hover:text-sidebar-foreground" to="/">
                    <LayoutDashboard className="size-4" />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isSequencesActive} tooltip="Sequences">
                  <Link className={isSequencesActive ? 'font-medium text-cyan-700 dark:text-cyan-300' : 'text-muted-foreground hover:text-sidebar-foreground'} to="/">
                    <FolderOpen className="size-4" />
                    <span>Sequences</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuBadge className="bg-cyan-500/10 text-[10px] text-cyan-700 dark:text-cyan-300">
                  08
                </SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Models">
                  <button className="cursor-pointer text-muted-foreground hover:text-sidebar-foreground" type="button">
                    <Layers2 className="size-4" />
                    <span>Models</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Jobs">
                  <button className="cursor-pointer text-muted-foreground hover:text-sidebar-foreground" type="button">
                    <Gauge className="size-4" />
                    <span>Jobs</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/50 p-3 group-data-[collapsible=icon]:p-1.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-cyan-200">
            <Database className="size-4" />
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="text-xs font-medium text-sidebar-foreground">KITTI-360</p>
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">Local dataset</p>
          </div>
          <span className="size-1.5 shrink-0 rounded-full bg-emerald-400 group-data-[collapsible=icon]:hidden" />
        </div>
        <div className="mt-2 flex items-center justify-between px-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          <span className="flex items-center gap-2"><Settings2 className="size-3.5" /> Settings</span>
          <CircleHelp className="size-3.5" />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar
