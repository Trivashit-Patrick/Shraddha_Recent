import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, FolderOpen, Inbox, Eye, Plus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "@/lib/api";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-medium text-[#111827]">{value}</p>
      <p className="text-xs text-[#4b5563] mt-1">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/stats").then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-xl h-28 animate-pulse border border-gray-200" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-[#111827]">Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/admin/products/add">
            <Button size="sm" className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl text-xs" data-testid="quick-add-product">
              <Plus className="w-3 h-3 mr-1" /> Add product
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total products" value={stats?.total_products || 0} color="bg-blue-50 text-blue-600" />
        <StatCard icon={FolderOpen} label="Total categories" value={stats?.total_categories || 0} color="bg-purple-50 text-purple-600" />
        <StatCard icon={Inbox} label="Total queries" value={stats?.total_queries || 0} color="bg-orange-50 text-[#f97316]" />
        <StatCard icon={Mail} label="Unread queries" value={stats?.unread_queries || 0} color="bg-red-50 text-red-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Queries */}
        <div className="bg-white rounded-xl border border-gray-200 p-5" data-testid="monthly-queries-chart">
          <h3 className="font-medium text-[#111827] text-sm mb-4">Queries per month</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.monthly_queries || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{fontSize: 12, fill: "#4b5563"}} />
              <YAxis tick={{fontSize: 12, fill: "#4b5563"}} />
              <Tooltip contentStyle={{borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12}} />
              <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Queried Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-5" data-testid="top-queried-chart">
          <h3 className="font-medium text-[#111827] text-sm mb-4">Most queried products</h3>
          <div className="space-y-3">
            {(stats?.top_queried || []).map((p, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs text-[#4b5563] w-5">{idx + 1}.</span>
                <div className="flex-1">
                  <p className="text-sm text-[#111827] truncate">{p.name}</p>
                  <div className="h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-[#f97316] rounded-full"
                      style={{width: `${Math.min(100, ((p.queries_count || 0) / Math.max(1, stats?.top_queried?.[0]?.queries_count || 1)) * 100)}%`}}
                    />
                  </div>
                </div>
                <span className="text-xs text-[#4b5563] font-medium">{p.queries_count || 0}</span>
              </div>
            ))}
            {(!stats?.top_queried || stats.top_queried.length === 0) && (
              <p className="text-sm text-[#4b5563] text-center py-4">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Queries */}
      <div className="bg-white rounded-xl border border-gray-200 p-5" data-testid="recent-queries">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-[#111827] text-sm">Recent queries</h3>
          <Link to="/admin/queries">
            <Button variant="ghost" size="sm" className="text-[#f97316] text-xs">View all</Button>
          </Link>
        </div>
        <div className="space-y-3">
          {(stats?.recent_queries || []).map(q => (
            <div key={q.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm text-[#111827]">{q.customer_name}</p>
                <p className="text-xs text-[#4b5563]">
                  {q.products?.map(p => p.product_name).join(", ") || q.type || "Contact"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!q.is_read && (
                  <span className="w-2 h-2 rounded-full bg-[#f97316]" />
                )}
                <span className="text-xs text-[#4b5563]">
                  {q.created_at ? new Date(q.created_at).toLocaleDateString() : ""}
                </span>
              </div>
            </div>
          ))}
          {(!stats?.recent_queries || stats.recent_queries.length === 0) && (
            <p className="text-sm text-[#4b5563] text-center py-4">No queries yet</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { to: "/admin/products/add", label: "Add product", icon: Plus },
          { to: "/admin/categories", label: "Add category", icon: FolderOpen },
          { to: "/admin/queries", label: "View queries", icon: Inbox },
          { to: "/", label: "View website", icon: Eye },
        ].map(action => (
          <Link key={action.to} to={action.to} target={action.to === "/" ? "_blank" : undefined}>
            <Button
              variant="outline"
              className="w-full border-gray-200 text-[#4b5563] hover:text-[#f97316] hover:border-[#f97316] rounded-xl text-xs justify-start"
              data-testid={`quick-${action.label.toLowerCase().replace(/\s/g, "-")}`}
            >
              <action.icon className="w-4 h-4 mr-2" /> {action.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
