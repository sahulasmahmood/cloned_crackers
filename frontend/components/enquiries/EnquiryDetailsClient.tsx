"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { getLeadByNumber, Lead } from "@/services/online-services/frontendLeadService";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import {
    IconPackage,
    IconCheck,
    IconX,
    IconClock,
    IconChevronLeft,
    IconMapPin,
    IconPhone,
    IconFileText,
    IconMessageCircle,
} from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/useCurrency";

interface EnquiryDetailsClientProps {
    leadNumber: string;
}

export default function EnquiryDetailsClient({
    leadNumber,
}: EnquiryDetailsClientProps) {
    const router = useRouter();
    const { isAuthenticated, user, isLoading: authLoading } = useAuthContext();
    const currencySymbol = useCurrency();
    const [lead, setLead] = useState<Lead | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated || !user?.id) {
            toast.error("Please login to view enquiry details");
            router.push("/signin?redirect=/my-enquiries");
            return;
        }

        loadLead();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user?.id, authLoading, leadNumber]);

    const loadLead = async () => {
        try {
            setIsLoading(true);
            const response = await getLeadByNumber(leadNumber);

            // Verify the lead belongs to the logged-in user
            if (response.data.userId !== user?.id) {
                toast.error("Enquiry not found");
                router.push("/my-enquiries");
                return;
            }

            setLead(response.data);
        } catch (error: any) {
            console.error("Error loading enquiry:", error);
            toast.error("Failed to load enquiry details");
            router.push("/my-enquiries");
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
                return <IconCheck size={20} />;
            case "QUOTATION_SENT":
                return <IconFileText size={20} />;
            case "CONTACTED":
                return <IconMessageCircle size={20} />;
            case "LOST":
            case "CANCELLED":
                return <IconX size={20} />;
            default:
                return <IconClock size={20} />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <main className="container mx-auto px-4 py-8">
                    <Skeleton className="h-10 w-48 mb-6 bg-gray-200" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton className="h-64 w-full rounded-lg bg-gray-200" />
                            <Skeleton className="h-96 w-full rounded-lg bg-gray-200" />
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-64 w-full rounded-lg bg-gray-200" />
                            <Skeleton className="h-48 w-full rounded-lg bg-gray-200" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!lead) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Link
                    href="/my-enquiries"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-[#e63946] mb-6 transition-colors"
                >
                    <IconChevronLeft size={20} />
                    Back to Enquiries
                </Link>

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Enquiry Details
                            </h1>
                            <p className="text-gray-600">Enquiry #{lead.leadNumber}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Status Badge */}
                            <div
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                                    lead.status
                                )}`}
                            >
                                {getStatusIcon(lead.status)}
                                <span className="capitalize">{lead.status.replace('_', ' ').toLowerCase()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div key="enquiry-date">
                            <p className="text-sm text-gray-500 mb-1">Submitted On</p>
                            <p className="font-medium text-gray-900">
                                {formatDate(lead.createdAt)}
                            </p>
                        </div>
                        <div key="last-updated">
                            <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                            <p className="font-medium text-gray-900">
                                {formatDate(lead.updatedAt)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Items */}
                        <div
                            key="enquiry-items"
                            className="bg-white rounded-lg shadow-sm p-6"
                        >
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Items ({lead.items?.length || lead.products?.length || 0})
                            </h2>
                            <div className="space-y-4">
                                {(lead.items || lead.products || []).map((item: any, index: number) => (
                                    <div
                                        key={`${item.id || index}-${index}`}
                                        className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0"
                                    >
                                        <Image
                                            src={item.productImage || "/placeholder-product.png"}
                                            alt={item.productName || item.name || "Product"}
                                            width={100}
                                            height={100}
                                            className="rounded-lg object-contain bg-gray-50"
                                            unoptimized
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-500">{item.brand}</p>
                                            <h4 className="font-medium text-gray-900">
                                                {item.productName || item.name}
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {item.displayName || item.variantName}
                                            </p>
                                            {item.cuttingStyle && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Cutting Style: {item.cuttingStyle}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 mt-3">
                                                <p className="text-sm text-gray-700">
                                                    Qty: {item.quantity}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    Unit Price: {currencySymbol}
                                                    {(item.unitPrice || item.price || 0).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                {currencySymbol}
                                                {(item.total || ((item.unitPrice || item.price || 0) * item.quantity) || 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Contact Address */}
                        {lead.address && (
                            <div
                                key="contact-address"
                                className="bg-white rounded-lg shadow-sm p-6"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <IconMapPin size={20} className="text-[#e63946]" />
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Contact Details
                                    </h2>
                                </div>
                                <div className="space-y-2">
                                    <p key="name" className="font-medium text-gray-900">
                                        {lead.address.name || lead.name}
                                    </p>
                                    <p key="phone" className="text-gray-700 flex items-center gap-2">
                                        <IconPhone size={16} />
                                        {lead.address.phone || lead.phone}
                                    </p>
                                    <div className="pt-2 border-t border-gray-100 mt-2">
                                        <p key="address1" className="text-gray-700">
                                            {lead.address.addressLine1 || lead.location}
                                        </p>
                                        {lead.address.addressLine2 && (
                                            <p key="address2" className="text-gray-700">
                                                {lead.address.addressLine2}
                                            </p>
                                        )}
                                        <p key="city-state" className="text-gray-700">
                                            {lead.address.city}, {lead.address.state} -{" "}
                                            {lead.address.pincode}
                                        </p>
                                        <p key="country" className="text-gray-700">
                                            {lead.address.country}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        )}

                        {/* Application Summary */}
                        <div
                            key="enquiry-summary"
                            className="bg-white rounded-lg shadow-sm p-6"
                        >
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Enquiry Summary
                            </h2>
                            <div className="space-y-3">
                                <div key="total" className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-semibold text-gray-900">
                                            Total Estimated
                                        </span>
                                        <span className="text-lg font-bold text-[#e63946]">
                                            {currencySymbol}
                                            {(lead.totalBudget || lead.totalAmount || 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        * Final price may vary based on availability and shipping.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="font-medium text-gray-900 mb-3">Need Help?</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Have questions about your enquiry? Contact our support team.
                            </p>
                            <Link
                                href="/contact"
                                className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-md transition-colors"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
