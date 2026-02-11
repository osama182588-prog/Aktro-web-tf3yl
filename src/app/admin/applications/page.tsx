"use client";

// صفحة إدارة الطلبات - Applications Management
// ============================================

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Search, 
  Filter,
  Users,
  Crown,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatRelativeTime } from "@/lib/utils";

interface Application {
  id: string;
  realName: string;
  age: number;
  characterName: string;
  status: string;
  isPriority: boolean;
  createdAt: string;
  user: {
    id: string;
    discordId: string;
    username: string;
    avatar?: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ApplicationsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    } else if (authStatus === "authenticated") {
      const user = session?.user as { isAdmin?: boolean };
      if (!user?.isAdmin) {
        router.push("/dashboard");
      } else {
        fetchApplications();
      }
    }
  }, [authStatus, session, router, pagination.page, filter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (filter) params.append("status", filter);

      const res = await fetch(`/api/applications?${params}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => 
    search === "" || 
    app.realName.toLowerCase().includes(search.toLowerCase()) ||
    app.characterName.toLowerCase().includes(search.toLowerCase()) ||
    app.user.username.toLowerCase().includes(search.toLowerCase())
  );

  const statusFilters = [
    { value: "", label: "الكل" },
    { value: "PENDING", label: "قيد الانتظار" },
    { value: "REVIEWING", label: "قيد المراجعة" },
    { value: "APPROVED", label: "مقبول" },
    { value: "REJECTED", label: "مرفوض" },
  ];

  const user = session?.user as { isAdmin?: boolean };
  if (authStatus === "loading" || !user?.isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-400" />
            إدارة الطلبات
          </h1>
          <p className="text-gray-400 mt-1">مراجعة وإدارة طلبات التفعيل</p>
        </div>
        <Button onClick={fetchApplications} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="بحث بالاسم أو اسم الشخصية..."
              icon={<Search className="w-5 h-5" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setFilter(f.value);
                  setPagination(p => ({ ...p, page: 1 }));
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f.value
                    ? "bg-blue-500 text-white"
                    : "bg-slate-800 text-gray-400 hover:bg-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Applications Table */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="loader mx-auto" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>لا توجد طلبات</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-right py-4 px-4 text-gray-400 font-medium">المتقدم</th>
                    <th className="text-right py-4 px-4 text-gray-400 font-medium">اسم الشخصية</th>
                    <th className="text-right py-4 px-4 text-gray-400 font-medium">العمر</th>
                    <th className="text-right py-4 px-4 text-gray-400 font-medium">الحالة</th>
                    <th className="text-right py-4 px-4 text-gray-400 font-medium">التاريخ</th>
                    <th className="text-right py-4 px-4 text-gray-400 font-medium">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {app.user.avatar ? (
                            <img src={app.user.avatar} alt="" className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-white font-medium flex items-center gap-2">
                              {app.realName}
                              {app.isPriority && <Crown className="w-4 h-4 text-yellow-400" />}
                            </div>
                            <div className="text-sm text-gray-400">@{app.user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-300">{app.characterName}</td>
                      <td className="py-4 px-4 text-gray-300">{app.age}</td>
                      <td className="py-4 px-4">
                        <StatusBadge status={app.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-sm">
                        {formatRelativeTime(app.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <Link href={`/admin/applications/${app.id}`}>
                          <Button size="sm" variant="outline">
                            مراجعة
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
                <div className="text-gray-400 text-sm">
                  عرض {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} من {pagination.total}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 text-white">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
