"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, Edit, Loader2, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getDeliveryPartners,
  type DeliveryPartner,
} from "@/services/deliveryPartnerService";

interface DeliveryPartnerListProps {
  status: string;
  searchQuery?: string;
  onDataChange?: () => void;
}

export default function DeliveryPartnerList({
  status,
  searchQuery = "",
  onDataChange,
}: DeliveryPartnerListProps) {
  const router = useRouter();
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionNote, setRejectionNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch partners
  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page: 1,
        limit: 100,
      };

      if (status !== "all") {
        params.status = status;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await getDeliveryPartners(params);
      setPartners(response.data);
      setCurrentPage(1); // Reset to first page on filter change
    } catch (error: unknown) {
      console.error("Error fetching partners:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error("Failed to fetch delivery partners", {
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [status, searchQuery]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const getStatusBadge = (status: string, partner: DeliveryPartner) => {
    const variants: Record<
      string,
      { className: string; label: string }
    > = {
      pending: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", label: "Pending" },
      verified: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", label: "Verified" },
      approved: { className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", label: "Approved" },
      rejected: { className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", label: "Rejected" },
    };

    const config = variants[status] || variants.pending;

    // If status is final (approved or rejected), show non-clickable badge
    if (status === "approved" || status === "rejected") {
      return (
        <Badge className={config.className}>
          {config.label}
        </Badge>
      );
    }

    // Otherwise, show dropdown with next status options
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`${config.className} h-6 px-2 hover:opacity-80`}
          >
            {config.label}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {status === "pending" && (
            <DropdownMenuItem
              onClick={() => handleStatusChange(partner, "verified")}
              className="text-blue-600"
            >
              Mark as Verified
            </DropdownMenuItem>
          )}
          {status === "verified" && (
            <>
              <DropdownMenuItem
                onClick={() => handleStatusChange(partner, "approved")}
                className="text-green-600"
              >
                Approve Partner
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange(partner, "rejected")}
                className="text-destructive"
              >
                Reject Partner
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const handleStatusChange = async (partner: DeliveryPartner, newStatus: "pending" | "verified" | "approved" | "rejected") => {
    // If rejecting, open modal instead
    if (newStatus === "rejected") {
      setSelectedPartner(partner);
      setRejectModalOpen(true);
      return;
    }

    try {
      const { updateApplicationStatus } = await import("@/services/deliveryPartnerService");
      
      await updateApplicationStatus(partner.id, {
        status: newStatus as "verified" | "approved" | "rejected",
      });
      
      toast.success(`Partner status updated to ${newStatus}`);
      await fetchPartners();
      onDataChange?.();
    } catch (error: unknown) {
      console.error("Error updating status:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error("Failed to update status", {
        description: err.response?.data?.message || err.message,
      });
    }
  };

  const confirmReject = async () => {
    if (!selectedPartner) return;

    if (!rejectionReason) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { updateApplicationStatus } = await import("@/services/deliveryPartnerService");
      
      await updateApplicationStatus(selectedPartner.id, {
        status: "rejected",
        reason: rejectionReason,
        note: rejectionNote,
      });
      
      toast.success("Partner application rejected", {
        description: "Rejection email has been sent to the partner",
      });
      
      // Close modal and reset form
      setRejectModalOpen(false);
      setRejectionReason("");
      setRejectionNote("");
      setSelectedPartner(null);
      
      // Refresh data
      await fetchPartners();
      onDataChange?.();
    } catch (error: unknown) {
      console.error("Error rejecting partner:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error("Failed to reject partner", {
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(partners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPartners = partners.slice(startIndex, endIndex);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis-start");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("ellipsis-end");
      pages.push(totalPages);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPartners.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-muted-foreground"
                >
                  No delivery partners found
                </TableCell>
              </TableRow>
            ) : (
              currentPartners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell className="font-medium">{partner.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{partner.phone}</div>
                      <div className="text-muted-foreground text-xs">
                        {partner.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="capitalize">{partner.vehicleType}</div>
                      <div className="text-muted-foreground text-xs">
                        {partner.vehicleNumber}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{partner.city || "N/A"}</div>
                      <div className="text-muted-foreground text-xs">
                        {partner.state || "N/A"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(partner.applicationStatus, partner)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Deliveries: {partner.totalDeliveries}</div>
                      <div className="text-muted-foreground text-xs">
                        Rating: {partner.rating.toFixed(1)} ⭐
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/delivery-partner/profile/${partner.id}`)
                          }
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/delivery-partner/edit/${partner.id}`)
                          }
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Partner
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, partners.length)} of{" "}
            {partners.length} partners
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "ellipsis-start" || page === "ellipsis-end" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => setCurrentPage(page as number)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Partner Application</DialogTitle>
            <DialogDescription>
              Reject application for <strong>{selectedPartner?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Invalid Documents">Invalid Documents</SelectItem>
                  <SelectItem value="Incomplete Information">Incomplete Information</SelectItem>
                  <SelectItem value="Failed Verification">Failed Verification</SelectItem>
                  <SelectItem value="License Issues">License Issues</SelectItem>
                  <SelectItem value="Vehicle Not Suitable">Vehicle Not Suitable</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Additional Note (Optional)</Label>
              <Textarea
                id="note"
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="Provide additional details..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="bg-red-50 dark:bg-red-950 p-3 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200">
                ⚠️ Partner will be notified via email about the rejection.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectModalOpen(false);
                setRejectionReason("");
                setRejectionNote("");
                setSelectedPartner(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectionReason || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
