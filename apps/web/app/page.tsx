"use client"

import { useState } from "react"
import { ChevronRight, Monitor, Settings, Shield, Target, Users} from "lucide-react"

import { Button } from "@repo/ui/components/shadcn/button"

import CCTVPage from "./cctv/page"

type Page = {
  id: "cctv" | "guards" | "operations" | "intelligence" | "systems";
  icon: any;
  label: string
}

const pageItem: Page[] = [
  { id: "cctv", icon: Monitor, label: "CCTV" },
  { id: "guards", icon: Users, label: "ON-DUTY GUARDS" },
  { id: "operations", icon: Target, label: "OPERATIONS" },
  { id: "intelligence", icon: Shield, label: "INTELLIGENCE" },
  { id: "systems", icon: Settings, label: "SYSTEMS" },
]

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState(pageItem[0])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-neutral-900">
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-70"} bg-neutral-900 border-r border-neutral-700 transition-all duration-300 fixed md:relative z-50 md:z-auto h-full md:h-auto ${!sidebarCollapsed ? "md:block" : ""}`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              <h1 className="text-orange-500 font-bold text-lg tracking-wider">SURVEILLANCE</h1>
              <p className="text-neutral-500 text-xs">v0.0.1 CLASSIFIED</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-neutral-400 hover:text-orange-500"
            >
              <ChevronRight
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`}
              />
            </Button>
          </div>

          <nav className="space-y-2">
            {pageItem.map((item:Page) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item)}
                className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${activeSection?.id === item.id
                    ? "bg-orange-500 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
              >
                <item.icon className="w-5 h-5 md:w-5 md:h-5 sm:w-6 sm:h-6" />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          {!sidebarCollapsed && (
            <div className="mt-8 p-4 bg-neutral-800 border border-neutral-700 rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-xs text-white">SYSTEM ONLINE</span>
              </div>
              <div className="text-xs text-neutral-500">
                <div>UPTIME: 1:15:59</div>
                <div>GUARDS: 20 ACTIVE</div>
                <div>MISSIONS: 5 ONGOING</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}

      <div className={`flex-1 flex flex-col ${!sidebarCollapsed ? "md:ml-0" : ""}`}>
        <div className="flex-1 overflow-auto">
          {activeSection?.id === "cctv" && <CCTVPage />}
        </div>
      </div>
    </div>
  )
}
