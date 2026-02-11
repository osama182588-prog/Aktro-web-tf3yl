"use client";

// صفحة إدارة المستخدمين - Users Management
// ========================================

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Users as UsersIcon,
  Search,
  Shield,
  Crown,
  CheckCircle,
  Clock,
  RefreshCw
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatDate, translateAdminRole } from "@/lib/utils";

interface User {
  id: string;
  discordId: string;
  username: string;
  avatar?: string;
  isAdmin: boolean;
  adminRole: string;
  isPriority: boolean;
  createdAt: string;
  _count: {
    applications: number;
  };
}

export default function UsersPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    } else if (authStatus === "authenticated") {
      const user = session?.user as { isAdmin?: boolean; adminRole?: string };
      if (!user?.isAdmin || user.adminRole !== "SUPER_ADMIN") {
        router.push("/admin");
      } else {
        fetchUsers();
      }
    }
  }, [authStatus, session, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    search === "" ||
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.discordId.includes(search)
  );

  const user = session?.user as { isAdmin?: boolean; adminRole?: string };
  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  if (!user?.isAdmin || user.adminRole !== "SUPER_ADMIN") {
    return null;
  }

  const stats = {
    total: users.length,
    admins: users.filter(u => u.isAdmin).length,
    priority: users.filter(u => u.isPriority).length,
  };

  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-blue-400" />
            المستخدمين
          </h1>
          <p className="text-gray-400 mt-1">إدارة المستخدمين والصلاحيات</p>
        </div>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="text-center py-6" hover={false}>
          <UsersIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
          <div className="text-sm text-gray-400">إجمالي المستخدمين</div>
        </Card>
        <Card className="text-center py-6" hover={false}>
          <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white mb-1">{stats.admins}</div>
          <div className="text-sm text-gray-400">الإداريين</div>
        </Card>
        <Card className="text-center py-6" hover={false}>
          <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white mb-1">{stats.priority}</div>
          <div className="text-sm text-gray-400">أعضاء الأولوية</div>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <Input
          placeholder="بحث بالاسم أو معرف Discord..."
          icon={<Search className="w-5 h-5" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* Users List */}
      <Card>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <UsersIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>لا يوجد مستخدمين</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-right py-4 px-4 text-gray-400 font-medium">المستخدم</th>
                  <th className="text-right py-4 px-4 text-gray-400 font-medium">Discord ID</th>
                  <th className="text-right py-4 px-4 text-gray-400 font-medium">الصلاحية</th>
                  <th className="text-right py-4 px-4 text-gray-400 font-medium">الطلبات</th>
                  <th className="text-right py-4 px-4 text-gray-400 font-medium">التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img 
                            src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`} 
                            alt="" 
                            className="w-10 h-10 rounded-full" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                            <UsersIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-white font-medium flex items-center gap-2">
                            {user.username}
                            {user.isPriority && <Crown className="w-4 h-4 text-yellow-400" />}
                            {user.isAdmin && <Shield className="w-4 h-4 text-green-400" />}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-400 font-mono text-sm">
                      {user.discordId}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        user.adminRole === "SUPER_ADMIN" ? "bg-red-500/20 text-red-400" :
                        user.adminRole === "ACTIVATION_ADMIN" ? "bg-green-500/20 text-green-400" :
                        user.adminRole === "GENERAL_ADMIN" ? "bg-blue-500/20 text-blue-400" :
                        "bg-slate-700 text-gray-400"
                      }`}>
                        {translateAdminRole(user.adminRole)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {user._count.applications}
                    </td>
                    <td className="py-4 px-4 text-gray-400 text-sm">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
