"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { getUserLeads, Lead, LeadStatus } from "@/services/online-services/frontendLeadService";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import {
    IconPackage,
    IconCheck,
    IconX,
    IconClock,
    IconChevronRight,
    IconMessageCircle,
    IconFileText,
} from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/useCurrency";

export default function MyEnquiriesClient() {
    const router = useRouter();
    const { isAuthenticated, user, isLoading: authLoading } = useAuthContext();
    const currencySymbol = useCurrency();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<LeadStatus | "ALL">("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated || !user?.id) {
            toast.error("Please login to view your enquiries");
            router.push("/signin?redirect=/my-enquiries");
            return;
        }

        loadLeads();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user?.id, authLoading, selectedStatus, currentPage]);

    const loadLeads = async () => {
        if (!user?.id) return;

        try {
            setIsLoading(true);
            const status = selectedStatus === "ALL" ? undefined : selectedStatus;
            const response = await getUserLeads(user.id, currentPage, 10, status);
            // Ensure response.data is an array, handle if backend returns something else
            const leadsData = Array.isArray(response.data) ? response.data :
                (response.data as any).leads ? (response.data as any).leads : [];
            setLeads(leadsData);

            // Handle pagination if available
            if (response.pagination) {
                setTotalPages(response.pagination.totalPages);
            } else {
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Error loading enquiries:", error);
            toast.error("Failed to load enquiries");
            setLeads([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "CONVERTED":
                return "bg-green-100 text-green-700 border-green-200";
            case "QUOTATION_SENT":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "CONTACTED":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "LOST":
            case "CANCELLED":
                return "bg-red-100 text-red-700 border-red-200";
            default: // PENDING
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "CONVERTED":
                return <IconCheck size={16} />;
            case "QUOTATION_SENT":
                return <IconFileText size={16} />;
            case "CONTACTED":
                return <IconMessageCircle size={16} />;
            case "LOST":
            case "CANCELLED":
                return <IconX size={16} />;
            default:
                return <IconClock size={16} />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const statusFilters: { value: LeadStatus | "ALL"; label: string }[] = [
        { value: "ALL", label: "All Enquiries" },
        { value: "PENDING", label: "Pending" },
        { value: "CONTACTED", label: "Contacted" },
        { value: "QUOTATION_SENT", label: "Quotation Sent" },
        { value: "CONVERTED", label: "Converted" },
    ];

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
                    <Skeleton className="h-8 sm:h-10 w-40 sm:w-48 mb-4 sm:mb-6 bg-gray-200" />
                    <div className="space-y-3 sm:space-y-4">
                        <Skeleton className="h-40 sm:h-48 w-full rounded-lg bg-gray-200" />
                        <Skeleton className="h-40 sm:h-48 w-full rounded-lg bg-gray-200" />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
                {/* Header */}
                <div className="mb-4 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">My Enquiries</h1>
                    <p className="text-sm sm:text-base text-gray-600">Track status of your enquiries</p>
                </div>

                {/* Status Filters */}
                <div className="mb-4 sm:mb-6 flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
                    {statusFilters.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => {
                                setSelectedStatus(filter.value);
                                setCurrentPage(1);
                            }}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${selectedStatus === filter.value
                                ? "bg-[#e63946] text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Enquiries List */}
                {isLoading ? (
                    <div className="space-y-3 sm:space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton
                                key={i}
                                className="h-52 sm:h-64 w-full rounded-lg bg-gray-200"
                            />
                        ))}
                    </div>
                ) : leads.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
                        <IconPackage size={48} className="mx-auto text-gray-300 mb-3 sm:mb-4 sm:w-16 sm:h-16" />
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                            No enquiries found
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                            {selectedStatus === "ALL"
                                ? "You haven't submitted any enquiries yet"
                                : `No ${selectedStatus.toLowerCase().replace('_', ' ')} enquiries found`}
                        </p>
                        <Link
                            href="/"
                            className="inline-block bg-[#e63946] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-md hover:bg-[#c1121f] transition-colors font-medium text-sm sm:text-base"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {leads.map((lead, index) => (
                            <div
                                key={`${lead.id}-${index}`}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                            >
                                {/* Lead Header */}
                                <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5 sm:mb-1">
                                                    Enquiry Number
                                                </p>
                                                <p className="font-semibold text-gray-900 text-sm sm:text-base break-all">
                                                    {lead.leadNumber}
                                                </p>
                                            </div>
                                            <div className="hidden sm:block h-8 w-px bg-gray-300" />
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5 sm:mb-1">Submitted On</p>
                                                <p className="font-medium text-gray-900 text-sm sm:text-base">
                                                    {formatDate(lead.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-3">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5 sm:mb-1 sm:hidden">
                                                    Estimated Value
                                                </p>
                                                <p className="font-semibold text-[#e63946] text-sm sm:text-base">
                                                    {currencySymbol}
                                                    {(lead.totalAmount || (lead as any).totalBudget || 0).toFixed(2)}
                                                </p>
                                            </div>
                                            <div
                                                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                                                    lead.status
                                                )}`}
                                            >
                                                {getStatusIcon(lead.status)}
                                                <span className="capitalize">{lead.status.replace('_', ' ').toLowerCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Lead Items Preview */}
                                <div className="px-4 sm:px-6 py-3 sm:py-4">
                                    <div className="space-y-3 sm:space-y-4">
                                        {(lead.items || (lead as any).products || []).slice(0, 2).map((item: any, idx: number) => (
                                            <div key={`${item.id || idx}-${idx}`} className="flex gap-3 sm:gap-4">
                                                <Image
                                                    src={item.productImage || "/placeholder-product.png"}
                                                    alt={item.productName || item.name || "Product"}
                                                    width={80}
                                                    height={80}
                                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-contain bg-gray-50 flex-shrink-0"
                                                    unoptimized
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500">{item.brand}</p>
                                                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                                                        {item.productName || item.name}
                                                    </h4>
                                                    <p className="text-xs text-gray-600 mt-0.5 sm:mt-1">
                                                        {item.displayName || item.variantName}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1.5 sm:mt-2">
                                                        <p className="text-sm text-gray-700">
                                                            Qty: {item.quantity}
                                                        </p>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {currencySymbol}
                                                            {(item.total || ((item.unitPrice || item.price || 0) * item.quantity) || 0).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(lead.items || (lead as any).products || []).length > 2 && (
                                            <p className="text-sm text-gray-600">
                                                +{(lead.items || (lead as any).products || []).length - 2} more item
                                                {(lead.items || (lead as any).products || []).length - 2 > 1 ? "s" : ""}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Lead Footer */}
                                <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 sm:gap-4">
                                        <Link
                                            href={`/my-enquiries/${lead.leadNumber}`}
                                            className="flex items-center gap-2 text-[#e63946] hover:text-[#c1121f] font-medium text-sm transition-colors"
                                        >
                                            View Details
                                            <IconChevronRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && leads.length > 0 && totalPages > 1 && (
                    <div className="mt-6 sm:mt-8 flex justify-center gap-1.5 sm:gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                            Prev
                        </button>
                        <div className="flex items-center gap-1 sm:gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                (page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md font-medium transition-colors text-sm ${currentPage === page
                                            ? "bg-[#e63946] text-white"
                                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                )
                            )}
                        </div>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
