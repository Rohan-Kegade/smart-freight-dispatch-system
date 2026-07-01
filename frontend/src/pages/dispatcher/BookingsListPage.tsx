import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { bookingsApi } from "@/api";
import type { Booking } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate, formatCurrency, cn } from "@/lib/utils";

const PAGE_SIZE = 15;

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "proposed", label: "Proposed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export default function BookingsListPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    bookingsApi
      .list()
      .then(({ bookings }) => setBookings(bookings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(
    () => ({
      all: bookings.length,
      proposed: bookings.filter((b) => b.status === "proposed").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      rejected: bookings.filter((b) => b.status === "rejected").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    }),
    [bookings],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return bookings.filter((b) => {
      const matchStatus = statusFilter === "all" || b.status === statusFilter;
      const matchSearch =
        !q ||
        [
          b.pickup_location,
          b.drop_location,
          b.vehicle_number,
          b.driver_name,
          b.cargo_type,
        ].some((s) => s?.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [bookings, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 mx-auto" style={{ maxWidth: 1400 }}>
      {/* Status tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  statusFilter === tab.value
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
                {!loading && (
                  <span
                    className={cn(
                      "ml-1.5 text-xs tabular-nums",
                      statusFilter === tab.value
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50",
                    )}
                  >
                    {counts[tab.value]}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search route, vehicle, driver…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : paged.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No bookings found"
          description={
            search || statusFilter !== "all"
              ? "Try adjusting your filters."
              : "Create your first dispatch request."
          }
          action={{
            label: "New request",
            onClick: () => navigate("/app/request/new"),
          }}
        />
      ) : (
        <>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold text-foreground">
                    Route
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Vehicle
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Driver
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Start time
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Cost
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    View
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((b) => (
                  <TableRow
                    key={b.id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => navigate(`/app/bookings/${b.id}`)}
                  >
                    <TableCell>
                      <div className="font-medium text-sm flex items-center gap-1.5">
                        {b.is_emergency && (
                          <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                        )}
                        {b.pickup_location}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        → {b.drop_location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {b.vehicle_number}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {b.vehicle_type}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{b.driver_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(b.start_time)}
                    </TableCell>
                    <TableCell className="text-sm font-medium tabular-nums">
                      {b.cost_estimate != null
                        ? formatCurrency(b.cost_estimate)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/bookings/${b.id}`);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="text-xs">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
