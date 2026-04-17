import { useState, useEffect } from "react";
import { Search, Download, Mail, MailOpen, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/lib/api";

export default function AdminQueries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchQueries = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filter === "unread") params.set("is_read", "false");
    if (filter === "read") params.set("is_read", "true");
    params.set("page", page);
    params.set("limit", "15");
    api.get(`/queries?${params}`).then(r => {
      setQueries(r.data.queries || []);
      setTotalPages(r.data.pages || 1);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchQueries(); }, [page, search, filter]);

  const toggleRead = async (queryId) => {
    await api.put(`/queries/${queryId}/read`);
    fetchQueries();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await api.delete(`/queries/${deleteId}`);
    setDeleteId(null);
    if (selectedQuery?.id === deleteId) setSelectedQuery(null);
    fetchQueries();
  };

  const handleExport = () => {
    window.open(`${process.env.REACT_APP_BACKEND_URL}/api/queries/export`, "_blank");
  };

  return (
    <div className="space-y-6" data-testid="admin-queries-page">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-[#111827]">Queries</h1>
        <Button onClick={handleExport} variant="outline" className="border-[#f97316] text-[#f97316] hover:bg-orange-50 rounded-xl text-sm"
          data-testid="export-queries-btn">
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input data-testid="query-search-input" placeholder="Search by name or email..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 rounded-xl border-gray-200 focus:border-[#f97316]" />
        </div>
        <div className="flex gap-1">
          {[
            { v: "all", l: "All" },
            { v: "unread", l: "Unread" },
            { v: "read", l: "Read" }
          ].map(f => (
            <Button key={f.v} size="sm" variant={filter === f.v ? "default" : "outline"}
              onClick={() => { setFilter(f.v); setPage(1); }}
              data-testid={`filter-${f.v}`}
              className={`rounded-xl text-xs ${filter === f.v ? "bg-[#f97316] text-white" : "border-gray-200 text-[#4b5563]"}`}>
              {f.l}
            </Button>
          ))}
        </div>
      </div>

      {/* Query List */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 text-center text-[#4b5563]">Loading...</div>
        ) : queries.length === 0 ? (
          <div className="p-8 text-center text-[#4b5563]">No queries found</div>
        ) : (
          queries.map(q => (
            <div
              key={q.id}
              className={`flex items-start gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                !q.is_read ? "bg-orange-50/30" : ""
              }`}
              onClick={() => setSelectedQuery(q)}
              data-testid={`query-row-${q.id}`}
            >
              <div className="mt-1">
                {q.is_read ? (
                  <MailOpen className="w-4 h-4 text-gray-400" />
                ) : (
                  <Mail className="w-4 h-4 text-[#f97316]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-sm ${q.is_read ? "text-[#4b5563]" : "text-[#111827] font-medium"}`}>
                    {q.customer_name}
                  </p>
                  <Badge className={`text-[10px] px-1.5 py-0 rounded-full ${
                    q.type === "bulk_quote" ? "bg-purple-100 text-purple-700" :
                    q.type === "contact" ? "bg-blue-100 text-blue-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>
                    {q.type === "bulk_quote" ? "Bulk quote" : q.type === "contact" ? "Contact" : "Query"}
                  </Badge>
                </div>
                <p className="text-xs text-[#4b5563] truncate">
                  {q.products?.length > 0
                    ? q.products.map(p => `${p.product_name}${p.colour_selected ? ` (${p.colour_selected})` : ""}`).join(", ")
                    : q.message?.substring(0, 80) || "No message"
                  }
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-[#4b5563]">
                  {q.created_at ? new Date(q.created_at).toLocaleDateString() : ""}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{q.email}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <Button key={i} size="sm" variant={page === i + 1 ? "default" : "outline"}
              onClick={() => setPage(i + 1)}
              className={`rounded-xl ${page === i + 1 ? "bg-[#f97316] text-white" : "border-gray-200"}`}>
              {i + 1}
            </Button>
          ))}
        </div>
      )}

      {/* Query Detail Dialog */}
      <Dialog open={!!selectedQuery} onOpenChange={() => setSelectedQuery(null)}>
        <DialogContent className="sm:max-w-[480px] rounded-xl" data-testid="query-detail-dialog">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Query details</DialogTitle>
          </DialogHeader>
          {selectedQuery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-[#4b5563]">Name</p>
                  <p className="text-[#111827] font-medium">{selectedQuery.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#4b5563]">Email</p>
                  <p className="text-[#111827]">{selectedQuery.email}</p>
                </div>
                <div>
                  <p className="text-xs text-[#4b5563]">Phone</p>
                  <p className="text-[#111827]">{selectedQuery.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-[#4b5563]">Date</p>
                  <p className="text-[#111827]">
                    {selectedQuery.created_at ? new Date(selectedQuery.created_at).toLocaleString() : ""}
                  </p>
                </div>
              </div>

              {selectedQuery.products?.length > 0 && (
                <div>
                  <p className="text-xs text-[#4b5563] mb-2">Products</p>
                  <div className="space-y-1">
                    {selectedQuery.products.map((p, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
                        <span className="text-[#111827] font-medium">{p.product_name}</span>
                        {p.colour_selected && (
                          <span className="text-[#4b5563]"> — {p.colour_selected}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedQuery.message && (
                <div>
                  <p className="text-xs text-[#4b5563] mb-1">Message</p>
                  <p className="text-sm text-[#111827] bg-gray-50 rounded-lg p-3">{selectedQuery.message}</p>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => toggleRead(selectedQuery.id)}
                  className="rounded-xl text-xs" data-testid="toggle-read-btn">
                  {selectedQuery.is_read ? "Mark as unread" : "Mark as read"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setDeleteId(selectedQuery.id); }}
                  className="rounded-xl text-xs text-red-500 border-red-200 hover:bg-red-50" data-testid="delete-query-btn">
                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-[380px] rounded-xl" data-testid="delete-query-dialog">
          <DialogHeader>
            <DialogTitle>Delete query</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#4b5563]">Are you sure you want to delete this query?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white rounded-xl" data-testid="confirm-delete-query-btn">
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
