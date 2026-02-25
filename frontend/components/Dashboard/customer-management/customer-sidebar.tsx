"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2, ArrowLeft } from "lucide-react";
import { customerService, type Customer } from "@/services/customerService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useDebounce from "@/hooks/use-debounce";

interface CustomerSidebarProps {
  selectedCustomerId: string;
  onSelectCustomer: (customerId: string) => void;
}

export default function CustomerSidebar({
  selectedCustomerId,
  onSelectCustomer,
}: CustomerSidebarProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch customers with pagination
  const fetchCustomers = useCallback(async (pageNum: number, search: string, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const result = await customerService.getAll(pageNum, 10, search);
      
      if (append) {
        setCustomers(prev => [...prev, ...result.customers]);
      } else {
        setCustomers(result.customers);
      }
      
      setTotalCustomers(result.pagination.total);
      setHasMore(pageNum < result.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCustomers(1, "");
  }, [fetchCustomers]);

  // Handle search
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchCustomers(1, debouncedSearch);
  }, [debouncedSearch, fetchCustomers]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchCustomers(nextPage, debouncedSearch, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget && hasMore) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadingMore, page, debouncedSearch, fetchCustomers]);

  const handleCustomerClick = (customerId: string) => {
    onSelectCustomer(customerId);
  };

  const handleBack = () => {
    router.push("/dashboard/customer-management");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-80 border-r flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <h2 className="font-semibold text-lg">Customers</h2>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Customers List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No customers found" : "No customers"}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {customers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => handleCustomerClick(customer.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all hover:bg-accent ${
                  selectedCustomerId === customer.id
                    ? "bg-accent border-primary shadow-sm"
                    : "bg-background border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="size-10">
                    <AvatarImage src={customer.image} alt={customer.name} />
                    <AvatarFallback className="text-xs">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {customer.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {customer.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate">
                    {customer.phone || "No phone"}
                  </span>
                  <span className="font-medium text-primary">
                    View →
                  </span>
                </div>
              </button>
            ))}
            
            {/* Infinite scroll trigger */}
            {hasMore && (
              <div ref={observerTarget} className="py-4 flex justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Loading more...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Footer Stats */}
      {!loading && customers.length > 0 && (
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground">
            <div className="flex justify-between mb-1">
              <span>Total Customers:</span>
              <span className="font-medium text-foreground">
                {totalCustomers}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Showing:</span>
              <span className="font-medium text-foreground">
                {customers.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
