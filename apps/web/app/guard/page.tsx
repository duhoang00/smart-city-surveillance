"use client";

import { useState, useEffect } from "react";
import { Shield, Cctv, type LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/shadcn/card";
import type { Guard, Camera, GuardId, CameraId } from "@repo/types";

const StatCard = ({ label, value, Icon }: {
  label: string;
  value: number;
  Icon: LucideIcon;
}) => (
  <Card className="bg-neutral-900 border-neutral-700">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-400 tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white font-mono">{value}</p>
        </div>
        <Icon className="w-8 h-8 text-white" />
      </div>
    </CardContent>
  </Card>
);

export default function GuardNetworkPage() {
  const [guards, setGuards] = useState<Guard[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/guards`)
      .then((res) => res.json() as Promise<Guard[]>)
      .then((data) => setGuards(data));
  }, []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cameras`)
      .then((res) => res.json() as Promise<Camera[]>)
      .then((data) => setCameras(data));
  }, []);

  const handleSelectGuard = (guardId: GuardId) => {
    window.open(`/guard/${guardId}`, "_blank");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-wider">
        GUARD NETWORK
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <StatCard label="ACTIVE GUARDS" value={guards.length} Icon={Shield} />
        <StatCard label="ACTIVE CAMERAS" value={cameras.length} Icon={Cctv} />
      </div>

      {/* Roster */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
            GUARD ROSTER
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">
                    GUARD ID
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">
                    GUARD NAME
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">
                    CAMERA ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {guards.map((guard, index) => {
                  const rowStyle =
                    index % 2 === 0 ? "bg-neutral-900" : "bg-neutral-850";
                  return (
                    <tr
                      key={guard.id}
                      className={`border-b border-neutral-800 hover:bg-neutral-800 transition-colors cursor-pointer ${rowStyle}`}
                      onClick={() => handleSelectGuard(guard.id)}
                    >
                      <td className="py-3 px-4 text-sm text-white font-mono">
                        {guard.id}
                      </td>
                      <td className="py-3 px-4 text-sm text-white">
                        {guard.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-300">
                        {guard.camera as CameraId}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}