"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserSession,
  DEFAULT_ADMIN,
  clearClientSession,
} from "@/lib/auth";
import {
  APPOINTMENT_VOLUME_DATA,
  QUEUE_WAIT_TIME_DATA,
  DEPARTMENT_WORKLOAD_DATA,
} from "@/lib/operations-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  Calendar,
  Clock,
  TrendingUp,
  Download,
  Filter,
  Users,
  Activity,
  ChevronRight,
  ShieldAlert,
  Building2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface OperationalReportsViewProps {
  initialUser?: UserSession;
}

export default function OperationalReportsView({
  initialUser,
}: OperationalReportsViewProps) {
  const router = useRouter();
  const user: UserSession = initialUser || DEFAULT_ADMIN;

  const handleSignOut = () => {
    clearClientSession();
    router.push("/login");
  };

  const [dateRange, setDateRange] = useState("last-7-days");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // KPI calculations
  const totalWeeklyAppointments = APPOINTMENT_VOLUME_DATA.reduce(
    (acc, p) => acc + p.completed,
    0
  );
  const averageDailyWalkIn = Math.round(
    APPOINTMENT_VOLUME_DATA.reduce((acc, p) => acc + p.walkIn, 0) /
      APPOINTMENT_VOLUME_DATA.length
  );
  const peakWaitTime = Math.max(...QUEUE_WAIT_TIME_DATA.map((d) => d.totalWait));
  const avgWaitTime = Math.round(
    QUEUE_WAIT_TIME_DATA.reduce((acc, d) => acc + d.totalWait, 0) /
      QUEUE_WAIT_TIME_DATA.length
  );

  return (
    <div className="dashboard-theme font-body-md text-body-md text-[#1F2B46] antialiased bg-transparent w-full min-w-0 flex-1">
      <main className="relative bg-transparent w-full min-w-0 px-4 md:px-8 pt-2 pb-16">
        <div className="flex flex-col w-full min-w-0">
            {/* Toast Notification */}
            {toastMessage && (
              <div className="fixed top-20 right-8 z-50 bg-[#1F2B46] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4 border border-[#015CA9]">
                <CheckCircle2 className="w-5 h-5 text-[#DFEEA9] shrink-0" />
                <span className="font-card-heading text-sm font-medium">
                  {toastMessage}
                </span>
                <button
                  type="button"
                  onClick={() => setToastMessage(null)}
                  className="ml-2 text-white/70 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Breadcrumb & Sub-header */}
            <div className="w-full py-space-lg flex flex-col gap-space-sm">
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-space-xs text-[#5A6372] font-supporting text-supporting"
              >
                <Link
                  href="/dashboard"
                  className="hover:text-[#015CA9] transition-colors flex items-center gap-1 shrink-0"
                >
                  <span>Dashboard</span>
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#727783] shrink-0" />
                <span className="text-[#5A6372] whitespace-nowrap">Operations</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#727783] shrink-0" />
                <span className="text-[#015CA9] font-semibold whitespace-nowrap">
                  Operational Analytics &amp; Reports
                </span>
              </nav>

              {/* Title & Action Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-space-md flex-wrap">
                    <h1 className="font-headline-lg text-headline-lg text-[#015CA9] tracking-tight font-bold truncate">
                      Hospital Operational Analytics &amp; Reports
                    </h1>
                    <Badge variant="avocado" className="shadow-xs">
                      Module 8 • Operations &amp; Administration
                    </Badge>
                  </div>
                  <p className="font-body-md text-body-md text-[#5A6372] max-w-3xl">
                    Performance indicators, appointment throughput trends, average queue wait times,
                    and clinical department capacity distributions.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="h-10 px-3 bg-white border border-[#DDE6DA] rounded-xl text-xs font-semibold text-[#1F2B46] outline-none shadow-xs"
                  >
                    <option value="last-7-days">Last 7 Days (Oct 18–24)</option>
                    <option value="month-to-date">Month to Date (October 2025)</option>
                    <option value="last-quarter">Q3 Performance Review</option>
                  </select>

                  <Button
                    variant="outline"
                    onClick={() =>
                      showToast(
                        "Exporting comprehensive operational performance summary PDF..."
                      )
                    }
                    className="text-xs flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-[#015CA9]" />
                    <span>Export Report</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* KPI Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white border-[#DDE6DA] shadow-xs">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Weekly Appointments
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {totalWeeklyAppointments}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#DDE6DA] shadow-xs">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#DFEEA9] text-[#2d3a08] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Average Queue Wait
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {avgWaitTime} mins
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#DDE6DA] shadow-xs">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FAE193] text-[#5e4300] flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Peak Triage Wait
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {peakWaitTime} mins
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#DDE6DA] shadow-xs">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#A3C8B4]/40 text-[#173e2d] flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-[#214539]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Avg Daily Walk-Ins
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {averageDailyWalkIn}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── CHART SECTION 1: APPOINTMENT VOLUME TRENDS ──────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
              <Card className="lg:col-span-8 bg-white border-[#DDE6DA] shadow-sm">
                <CardHeader className="p-5 pb-2 border-b border-[#F3F6F0]">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base text-[#1F2B46] flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#015CA9]" />
                        <span>Appointment Throughput &amp; Volume Trends</span>
                      </CardTitle>
                      <CardDescription>
                        Completed vs Scheduled visits and Walk-in registrations across the past 7 days.
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Daily Aggregation</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={APPOINTMENT_VOLUME_DATA}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#015CA9" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#015CA9" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="colorWalkIn" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#DFEEA9" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#DFEEA9" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EDF2E9" />
                        <XAxis
                          dataKey="date"
                          stroke="#727783"
                          fontSize={11}
                          tickLine={false}
                        />
                        <YAxis stroke="#727783" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            borderColor: "#DDE6DA",
                            borderRadius: "12px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                            fontSize: "12px",
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="completed"
                          name="Completed Visits"
                          stroke="#015CA9"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorCompleted)"
                        />
                        <Area
                          type="monotone"
                          dataKey="walkIn"
                          name="Walk-in Triage"
                          stroke="#8fae32"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorWalkIn)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Highlights Card */}
              <Card className="lg:col-span-4 bg-white border-[#DDE6DA] shadow-sm flex flex-col justify-between">
                <CardHeader className="p-5 pb-3 border-b border-[#F3F6F0]">
                  <CardTitle className="text-base text-[#1F2B46]">
                    Throughput Key Highlights
                  </CardTitle>
                  <CardDescription>
                    Operational insights derived from current schedule trends.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-3.5 text-xs">
                  <div className="p-3 rounded-xl bg-[#E1F2FD]/50 border border-[#bce0fb] space-y-1">
                    <span className="font-bold text-[#003e7a] block">
                      Peak Patient Influx on Fridays
                    </span>
                    <p className="text-[#5A6372] leading-relaxed">
                      Friday recorded 96 scheduled consultations with 31 urgent walk-in triage additions.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#DFEEA9]/35 border border-[#c5dd80] space-y-1">
                    <span className="font-bold text-[#2d3a08] block">
                      93.8% Overall Fulfillment Rate
                    </span>
                    <p className="text-[#5A6372] leading-relaxed">
                      High patient adherence with cancellation rate maintained under 5% over the 7-day period.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAF6] border border-[#DDE6DA] space-y-1">
                    <span className="font-bold text-[#1F2B46] block">
                      Weekend Schedule Optimization
                    </span>
                    <p className="text-[#5A6372] leading-relaxed">
                      Saturday and Sunday morning special clinics absorbed 79 acute follow-ups relieving Monday volume.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── CHART SECTION 2 & 3: QUEUE WAIT TIMES & WORKLOAD ──────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Queue Wait Times Chart */}
              <Card className="lg:col-span-6 bg-white border-[#DDE6DA] shadow-sm">
                <CardHeader className="p-5 pb-2 border-b border-[#F3F6F0]">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base text-[#1F2B46] flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#015CA9]" />
                        <span>Average Queue Wait Times (by Hour)</span>
                      </CardTitle>
                      <CardDescription>
                        Time from patient check-in to triage and doctor consultation.
                      </CardDescription>
                    </div>
                    <Badge variant="avocado">Peak: 15:00 PM</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={QUEUE_WAIT_TIME_DATA}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#EDF2E9" />
                        <XAxis dataKey="hour" stroke="#727783" fontSize={11} tickLine={false} />
                        <YAxis stroke="#727783" fontSize={11} tickLine={false} unit="m" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            borderColor: "#DDE6DA",
                            borderRadius: "12px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                            fontSize: "12px",
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                        <Line
                          type="monotone"
                          dataKey="consultationWait"
                          name="Doctor Wait (mins)"
                          stroke="#015CA9"
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: "#015CA9" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="triageWait"
                          name="Triage Check-in (mins)"
                          stroke="#A3C8B4"
                          strokeWidth={2}
                          dot={{ r: 3, fill: "#A3C8B4" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Department Workload Distribution */}
              <Card className="lg:col-span-6 bg-white border-[#DDE6DA] shadow-sm">
                <CardHeader className="p-5 pb-2 border-b border-[#F3F6F0]">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base text-[#1F2B46] flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#015CA9]" />
                        <span>Department Workload &amp; Capacity Utilization</span>
                      </CardTitle>
                      <CardDescription>
                        Active patient census, physician staffing, and capacity utilization rates.
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">6 Clinical Units</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-3.5">
                    {DEPARTMENT_WORKLOAD_DATA.map((dept) => (
                      <div key={dept.departmentCode} className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: dept.color }}
                            />
                            <span className="font-bold text-[#1F2B46]">
                              {dept.name} ({dept.departmentCode})
                            </span>
                            <span className="text-[#727783]">
                              • {dept.physiciansOnDuty} Doctors on Duty
                            </span>
                          </div>

                          <span className="font-bold text-[#015CA9]">
                            {dept.activePatients} Patients ({dept.utilizationRate}%)
                          </span>
                        </div>

                        <div className="w-full h-2 bg-[#E2E8DE] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${dept.utilizationRate}%`,
                              backgroundColor: dept.color === "#DFEEA9" ? "#8fae32" : dept.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
      </main>
    </div>
  );
}
