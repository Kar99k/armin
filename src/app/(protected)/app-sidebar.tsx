"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  MessageSquare,
  Calendar,
  CreditCard,
  PlusIcon,
  BotMessageSquare,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SidebarGroupItems = [
  {
    label: "Dashboard",
    icon: <HomeIcon />,
    href: "/dashboard",
  },
  {
    label: "QnA",
    icon: <MessageSquare />,
    href: "/qna",
  },
  {
    label: "Meetings",
    icon: <Calendar />,
    href: "/meetings",
  },
  {
    label: "Billing",
    icon: <CreditCard />,
    href: "/billing",
  },
] as const;

const Projects = [
  {
    label: "Project 1",
    href: "/projects/1",
  },
  {
    label: "Project 2",
    href: "/projects/2",
  },
  {
    label: "Project 3",
    href: "/projects/3",
  },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="bg-sidebar-background border-sidebar-border"
    >
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <BotMessageSquare color="purple" size={24} />
          {open && <h1 className="text-sm font-medium">Armin</h1>}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-1">
            {SidebarGroupItems.map((item) => (
              <SidebarMenuItem key={item.label} className="list-none">
                <SidebarMenuButton asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2",
                      pathname === item.href && "!bg-primary !text-white",
                    )}
                  >
                    {item.icon}

                    {item.label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-1">
            {Projects.map((project) => (
              <SidebarMenuItem key={project.label} className="list-none">
                <SidebarMenuButton asChild>
                  <Link href={project.href}>
                    <div className="-ml-1.5 flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-md border p-3",
                          pathname === project.href && "bg-primary text-white",
                        )}
                      >
                        {project.label[0]?.toUpperCase()}
                      </div>
                      <p className="text-sm font-medium">{project.label}</p>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenuItem className="list-none">
              <SidebarMenuButton asChild variant="outline" className="max-w-48">
                <Link href="/create" className="flex items-center gap-2 p-4">
                  <PlusIcon />
                  <div className="text-sm font-medium">Create new Project</div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
