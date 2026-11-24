"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserSession,
  DEFAULT_ADMIN,
  clearClientSession,
} from "@/lib/auth";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  INITIAL_STAFF_TASKS,
  INITIAL_STAFF_MEMBERS,
} from "@/lib/operations-data";
import {
  StaffTask,
  TaskPriority,
  TaskStatus,
  UserRole,
} from "@/types/operations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckSquare,
  Search,
  Filter,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  ChevronRight,
  LayoutGrid,
  List,
  X,
  Trash2,
  ArrowRight,
  AlertTriangle,
  Stethoscope,
  Building,
  Check,
  Sparkles,
} from "lucide-react";

interface TasksManagementViewProps {
  initialUser?: UserSession;
}

export default function TasksManagementView({
  initialUser,
}: TasksManagementViewProps) {
  const router = useRouter();
  const user: UserSession = initialUser || DEFAULT_ADMIN;

  const handleSignOut = () => {
    clearClientSession();
    router.push("/login");
  };

  // State
  const [tasks, setTasks] = useState<StaffTask[]>(INITIAL_STAFF_TASKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Task Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    category: "Patient Follow-up" as StaffTask["category"],
    assignedToName: INITIAL_STAFF_MEMBERS[1].name,
    assignedToRole: INITIAL_STAFF_MEMBERS[1].role,
    priority: "high" as TaskPriority,
    dueDate: "Today, 17:00",
    patientName: "Eleanor Vance",
    patientId: "PT-89402",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignedToName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.patientName &&
          t.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === "all" || t.status === statusFilter;

      const matchPriority =
        priorityFilter === "all" || t.priority === priorityFilter;

      const matchRole =
        roleFilter === "all" || t.assignedToRole === roleFilter;

      return matchSearch && matchStatus && matchPriority && matchRole;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, roleFilter]);

  // Task Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const urgent = tasks.filter((t) => t.priority === "urgent" || t.priority === "high").length;
    return { total, pending, inProgress, completed, urgent };
  }, [tasks]);

  // Handle Status Update
  const handleToggleStatus = (taskId: string, nextStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: nextStatus,
              completedAt:
                nextStatus === "completed"
                  ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : undefined,
            }
          : t
      )
    );
    showToast(`Task marked as ${nextStatus.replace("_", " ")}`);
  };

  // Handle Delete Task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast("Task removed from active board");
  };

  // Handle Create Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!taskForm.title.trim()) errs.title = "Task title is required";
    if (!taskForm.description.trim()) errs.description = "Task description is required";

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    const newTask: StaffTask = {
      id: `TSK-${1000 + tasks.length + 1}`,
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      category: taskForm.category,
      assignedToName: taskForm.assignedToName,
      assignedToRole: taskForm.assignedToRole,
      priority: taskForm.priority,
      status: "pending",
      dueDate: taskForm.dueDate,
      patientName: taskForm.patientName || undefined,
      patientId: taskForm.patientId || undefined,
      createdAt: "Just now",
    };

    setTasks((prev) => [newTask, ...prev]);
    setIsCreateOpen(false);
    setTaskForm({
      title: "",
      description: "",
      category: "Patient Follow-up",
      assignedToName: INITIAL_STAFF_MEMBERS[1].name,
      assignedToRole: INITIAL_STAFF_MEMBERS[1].role,
      priority: "high",
      dueDate: "Today, 17:00",
      patientName: "Eleanor Vance",
      patientId: "PT-89402",
    });
    setFormErrors({});
    showToast(`Created task: ${newTask.title}`);
  };

  // Priority Badge
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] border border-[#f5b8b2]">
            <AlertCircle className="w-3 h-3" />
            Urgent
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAE193] text-[#5e4300] border border-[#eed072]">
            High
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E1F2FD] text-[#015CA9] border border-[#bce0fb]">
            Medium
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3F6F0] text-[#727783] border border-[#DDE6DA]">
            Low
          </span>
        );
    }
  };

  // Status Badge
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#DFEEA9] text-[#2d3a08] border border-[#c5dd80]">
            <Check className="w-3 h-3 text-[#526524]" />
            Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E1F2FD] text-[#015CA9] border border-[#bce0fb]">
            <Clock className="w-3 h-3" />
            In Progress
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAE193] text-[#5e4300] border border-[#eed072]">
            Pending
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a]">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="dashboard-theme font-body-md text-body-md text-[#1F2B46] min-h-screen antialiased bg-[#EDF2E9]">
      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <DashboardSidebar
        user={user}
        activeNav="tasks"
        onSignOut={handleSignOut}
      />

      {/* ── TOP HEADER & MAIN VIEWPORT ────────────────────── */}
      <div className="pl-72">
        <DashboardHeader user={user} />

        <main className="relative pt-16 bg-[#EDF2E9] min-h-screen w-full px-8 pb-16">
          <div className="flex flex-col w-full max-w-[1650px] mx-auto">
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
                  <X className="w-4 h-4" />
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
                  Staff Task Management
                </span>
              </nav>

              {/* Title & Action Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-space-md flex-wrap">
                    <h1 className="font-headline-lg text-headline-lg text-[#015CA9] tracking-tight font-bold truncate">
                      Staff Task &amp; Patient Follow-up Board
                    </h1>
                    <Badge variant="avocado" className="shadow-xs">
                      Module 8 • Operations
                    </Badge>
                  </div>
                  <p className="font-body-md text-body-md text-[#5A6372] max-w-3xl">
                    Coordinate follow-up actions, doctor clinical reviews, patient outreach,
                    and facility maintenance across administrative and clinical teams.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Task</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Statistics KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white border-[#DDE6DA] shadow-xs">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center shrink-0">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Total Tasks
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {stats.total}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#DDE6DA] shadow-xs">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FAE193] text-[#5e4300] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Pending Action
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {stats.pending + stats.inProgress}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#DDE6DA] shadow-xs">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Urgent / High Priority
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {stats.urgent}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#DDE6DA] shadow-xs">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#DFEEA9] text-[#2d3a08] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Completed
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {stats.completed}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white border border-[#DDE6DA] rounded-2xl p-4 shadow-sm mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#727783]" />
                <Input
                  type="text"
                  placeholder="Search tasks by title, patient, assignee, or task ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-sm text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-sm text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-sm text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Nursing Staff">Nursing Staff</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Hospital Administrator">Administrator</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center rounded-xl border border-[#DDE6DA] bg-[#F8FAF6] p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("board")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "board"
                        ? "bg-white text-[#015CA9] shadow-xs"
                        : "text-[#727783] hover:text-[#1F2B46]"
                    }`}
                    title="Kanban Board View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "list"
                        ? "bg-white text-[#015CA9] shadow-xs"
                        : "text-[#727783] hover:text-[#1F2B46]"
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Task Content: Board vs List */}
            {filteredTasks.length === 0 ? (
              <div className="bg-white border border-[#DDE6DA] rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                <CheckSquare className="w-12 h-12 text-[#015CA9] mb-3" />
                <h3 className="font-bold text-base text-[#1F2B46]">No tasks found</h3>
                <p className="text-xs text-[#5A6372] max-w-sm mt-1 mb-4">
                  No staff tasks matched your filters. You can clear your filters or
                  assign a new operational follow-up.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setPriorityFilter("all");
                    setRoleFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : viewMode === "board" ? (
              /* KANBAN BOARD VIEW */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: PENDING */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white border border-[#DDE6DA] rounded-xl shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FAE193]" />
                      <span className="font-bold text-sm text-[#1F2B46]">
                        Pending Action
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F3F6F0] text-[#5A6372]">
                      {filteredTasks.filter((t) => t.status === "pending").length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {filteredTasks
                      .filter((t) => t.status === "pending")
                      .map((task) => (
                        <Card
                          key={task.id}
                          className="hover:shadow-md transition-all border-[#DDE6DA]"
                        >
                          <CardContent className="p-4 space-y-3 text-xs">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] font-bold text-[#015CA9] uppercase tracking-wider">
                                {task.category}
                              </span>
                              {getPriorityBadge(task.priority)}
                            </div>

                            <h4 className="font-bold text-sm text-[#1F2B46] leading-snug">
                              {task.title}
                            </h4>

                            <p className="text-[#5A6372] line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>

                            {task.patientName && (
                              <div className="p-2 rounded-lg bg-[#F8FAF6] border border-[#DDE6DA] flex items-center justify-between text-[11px]">
                                <span className="text-[#727783]">Patient:</span>
                                <span className="font-bold text-[#1F2B46]">
                                  {task.patientName} ({task.patientId})
                                </span>
                              </div>
                            )}

                            <div className="pt-2 border-t border-[#F3F6F0] flex items-center justify-between text-[11px] text-[#5A6372]">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-[#015CA9]" />
                                <span className="font-medium text-[#1F2B46]">
                                  {task.assignedToName}
                                </span>
                              </div>
                              <span className="text-[#ba1a1a] font-semibold">
                                Due: {task.dueDate}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleToggleStatus(task.id, "in_progress")}
                                className="w-full text-xs"
                              >
                                Start Task
                              </Button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>

                {/* Column 2: IN PROGRESS */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white border border-[#DDE6DA] rounded-xl shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#015CA9]" />
                      <span className="font-bold text-sm text-[#1F2B46]">
                        In Progress
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F3F6F0] text-[#5A6372]">
                      {filteredTasks.filter((t) => t.status === "in_progress").length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {filteredTasks
                      .filter((t) => t.status === "in_progress")
                      .map((task) => (
                        <Card
                          key={task.id}
                          className="hover:shadow-md transition-all border-[#015CA9]/40 bg-[#FAFDF8]"
                        >
                          <CardContent className="p-4 space-y-3 text-xs">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] font-bold text-[#015CA9] uppercase tracking-wider">
                                {task.category}
                              </span>
                              {getPriorityBadge(task.priority)}
                            </div>

                            <h4 className="font-bold text-sm text-[#1F2B46] leading-snug">
                              {task.title}
                            </h4>

                            <p className="text-[#5A6372] line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>

                            {task.patientName && (
                              <div className="p-2 rounded-lg bg-white border border-[#DDE6DA] flex items-center justify-between text-[11px]">
                                <span className="text-[#727783]">Patient:</span>
                                <span className="font-bold text-[#1F2B46]">
                                  {task.patientName} ({task.patientId})
                                </span>
                              </div>
                            )}

                            <div className="pt-2 border-t border-[#DDE6DA]/60 flex items-center justify-between text-[11px] text-[#5A6372]">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-[#015CA9]" />
                                <span className="font-medium text-[#1F2B46]">
                                  {task.assignedToName}
                                </span>
                              </div>
                              <span className="text-[#ba1a1a] font-semibold">
                                Due: {task.dueDate}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                size="sm"
                                onClick={() => handleToggleStatus(task.id, "completed")}
                                className="w-full text-xs"
                              >
                                Mark Completed
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>

                {/* Column 3: COMPLETED */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white border border-[#DDE6DA] rounded-xl shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#526524]" />
                      <span className="font-bold text-sm text-[#1F2B46]">
                        Completed Today
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F3F6F0] text-[#5A6372]">
                      {filteredTasks.filter((t) => t.status === "completed").length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {filteredTasks
                      .filter((t) => t.status === "completed")
                      .map((task) => (
                        <Card
                          key={task.id}
                          className="border-[#c5dd80] bg-[#FAFDF8] opacity-85"
                        >
                          <CardContent className="p-4 space-y-3 text-xs">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] font-bold text-[#526524] uppercase tracking-wider">
                                {task.category}
                              </span>
                              <Badge variant="success">Completed</Badge>
                            </div>

                            <h4 className="font-bold text-sm text-[#1F2B46] line-through leading-snug">
                              {task.title}
                            </h4>

                            <p className="text-[#727783] line-clamp-1">
                              {task.description}
                            </p>

                            <div className="pt-2 border-t border-[#DDE6DA] flex items-center justify-between text-[11px] text-[#5A6372]">
                              <span>Done by {task.assignedToName}</span>
                              <span className="font-bold text-[#526524]">
                                {task.completedAt || "Finished"}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              /* LIST / TABLE VIEW */
              <div className="bg-white border border-[#DDE6DA] rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FAFDF8] border-b border-[#DDE6DA] text-xs font-semibold text-[#5A6372] uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Task Details</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Priority</th>
                        <th className="py-3.5 px-4">Assigned Staff</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Due Date</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DDE6DA]">
                      {filteredTasks.map((task) => (
                        <tr
                          key={task.id}
                          className="hover:bg-[#F8FAF6] transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="min-w-0">
                              <span className="font-bold text-[#1F2B46] block truncate">
                                {task.title}
                              </span>
                              <span className="text-xs text-[#5A6372] block truncate">
                                {task.id} {task.patientName && `• Patient: ${task.patientName}`}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant="secondary">{task.category}</Badge>
                          </td>
                          <td className="py-3.5 px-4">
                            {getPriorityBadge(task.priority)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-[#1F2B46] block">
                              {task.assignedToName}
                            </span>
                            <span className="text-xs text-[#5A6372] block">
                              {task.assignedToRole}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {getStatusBadge(task.status)}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-[#ba1a1a]">
                            {task.dueDate}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {task.status !== "completed" ? (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleToggleStatus(task.id, "completed")}
                                  className="text-xs"
                                >
                                  Complete
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleStatus(task.id, "pending")}
                                  className="text-xs"
                                >
                                  Reopen
                                </Button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── CREATE TASK MODAL ─────────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader onClose={() => setIsCreateOpen(false)}>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#015CA9]" />
              <DialogTitle>Assign Staff Task / Follow-up</DialogTitle>
            </div>
            <DialogDescription>
              Assign clinical reviews, nursing triage checks, or administrative follow-ups
              to hospital team members.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-4 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#1F2B46] block">
                Task Title <span className="text-error">*</span>
              </label>
              <Input
                placeholder="e.g. Follow-up phone call for medication adherence"
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, title: e.target.value })
                }
              />
              {formErrors.title && (
                <span className="text-[#ba1a1a]">{formErrors.title}</span>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#1F2B46] block">
                Description &amp; Action Items <span className="text-error">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Detailed instructions for assigned staff..."
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, description: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-xs text-[#1F2B46] focus:ring-2 focus:ring-[#015CA9] outline-none"
              />
              {formErrors.description && (
                <span className="text-[#ba1a1a]">{formErrors.description}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[#1F2B46] block">Category</label>
                <select
                  value={taskForm.category}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      category: e.target.value as StaffTask["category"],
                    })
                  }
                  className="w-full h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-xs text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none"
                >
                  <option value="Patient Follow-up">Patient Follow-up</option>
                  <option value="Clinical Review">Clinical Review</option>
                  <option value="Lab Specimen">Lab Specimen</option>
                  <option value="Discharge">Discharge</option>
                  <option value="Facility Maintenance">Facility Maintenance</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1F2B46] block">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      priority: e.target.value as TaskPriority,
                    })
                  }
                  className="w-full h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-xs text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[#1F2B46] block">
                  Assign Staff Member
                </label>
                <select
                  value={taskForm.assignedToName}
                  onChange={(e) => {
                    const memberName = e.target.value;
                    const member = INITIAL_STAFF_MEMBERS.find(
                      (m) => m.name === memberName
                    );
                    setTaskForm({
                      ...taskForm,
                      assignedToName: memberName,
                      assignedToRole: member ? member.role : "Nursing Staff",
                    });
                  }}
                  className="w-full h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-xs text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none"
                >
                  {INITIAL_STAFF_MEMBERS.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1F2B46] block">Due Deadline</label>
                <Input
                  value={taskForm.dueDate}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, dueDate: e.target.value })
                  }
                  placeholder="e.g. Today, 18:00"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#1F2B46] block">
                Associate Patient (Optional)
              </label>
              <Input
                value={taskForm.patientName}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, patientName: e.target.value })
                }
                placeholder="e.g. Eleanor Vance (PT-89402)"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Assign Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
