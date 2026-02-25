"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { getUserOrders, Order } from "@/services/orderService";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import {
  IconPackage,
  IconTruck,
  IconCheck,
  IconX,
  IconClock,
  IconChevronRight,
  IconReceipt,
} from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/useCurrency";

type OrderStatus =
  | "all"
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export default function MyOrdersClient() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuthContext();
  const currencySymbol = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user?.id) {
      toast.error("Please login to view your orders");
      router.push("/signin?redirect=/my-orders");
      return;
    }

    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id, authLoading, selectedStatus, currentPage]);

  const loadOrders = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const status = selectedStatus === "all" ? undefined : selectedStatus;
      const response = await getUserOrders(user.id, currentPage, 10, status);
      setOrders(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "confirmed":
      case "processing":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <IconCheck size={16} />;
      case "shipped":
        return <IconTruck size={16} />;
      case "confirmed":
      case "processing":
        return <IconPackage size={16} />;
      case "cancelled":
        return <IconX size={16} />;
      default:
        return <IconClock size={16} />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
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

  const statusFilters: { value: OrderStatus; label: string }[] = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">My Orders</h1>
          <p className="text-sm sm:text-base text-gray-600">View and track all your orders</p>
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
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                selectedStatus === filter.value
                  ? "bg-[#e63946] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="h-52 sm:h-64 w-full rounded-lg bg-gray-200"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <IconPackage size={48} className="mx-auto text-gray-300 mb-3 sm:mb-4 sm:w-16 sm:h-16" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {selectedStatus === "all"
                ? "You haven't placed any orders yet"
                : `No ${selectedStatus} orders found`}
            </p>
            <Link
              href="/"
              className="inline-block bg-[#e63946] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-md hover:bg-[#c1121f] transition-colors font-medium text-sm sm:text-base"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div
                key={`${order.id}-${index}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5 sm:mb-1">
                          Order Number
                        </p>
                        <p className="font-semibold text-gray-900 text-sm sm:text-base break-all">
                          {order.orderNumber}
                        </p>
                      </div>
                      <div className="hidden sm:block h-8 w-px bg-gray-300" />
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5 sm:mb-1">Order Date</p>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5 sm:mb-1 sm:hidden">
                          Total Amount
                        </p>
                        <p className="font-semibold text-[#e63946] text-sm sm:text-base">
                          {currencySymbol}
                          {(order.total || 0).toFixed(2)}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {getStatusIcon(order.orderStatus)}
                        <span className="capitalize">{order.orderStatus}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="space-y-3 sm:space-y-4">
                    {order.items.slice(0, 2).map((item, index) => (
                      <div key={`${item.id}-${index}`} className="flex gap-3 sm:gap-4">
                        <Image
                          src={item.productImage || "/placeholder-product.png"}
                          alt={item.productName}
                          width={80}
                          height={80}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-contain bg-gray-50 flex-shrink-0"
                          unoptimized
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">{item.brand}</p>
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                            {item.productName}
                          </h4>
                          <p className="text-xs text-gray-600 mt-0.5 sm:mt-1">
                            {item.displayName || item.variantName}
                          </p>
                          {item.selectedCuttingStyle && (
                            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                              Cutting: {item.selectedCuttingStyle}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5 sm:mt-2">
                            <p className="text-sm text-gray-700">
                              Qty: {item.quantity}
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {currencySymbol}
                              {(item.total || (item.unitPrice * item.quantity) || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-sm text-gray-600">
                        +{order.items.length - 2} more item
                        {order.items.length - 2 > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        <IconReceipt size={18} className="text-gray-500 flex-shrink-0" />
                        <span className="text-gray-600">Payment:</span>
                        <span
                          className={`font-medium capitalize ${getPaymentStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                        <span className="text-gray-500">
                          ({order.paymentMethod.toUpperCase()})
                        </span>
                      </div>
                      {order.invoiceNumber && (
                        <div className="flex items-center gap-2 sm:gap-4">
                          <div className="hidden sm:block h-4 w-px bg-gray-300" />
                          <div className="text-gray-600">
                            Invoice:{" "}
                            <span className="font-medium text-gray-900">
                              {order.invoiceNumber}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/my-orders/${order.orderNumber}`}
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
        {!isLoading && orders.length > 0 && totalPages > 1 && (
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
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md font-medium transition-colors text-sm ${
                      currentPage === page
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
