"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lead } from "@/types/lead";
import { leadService } from "@/services/admin/leadService";
import { format } from "date-fns";
import { Eye, Search, Phone, MessageSquare } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Check, X, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export function LeadTable() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Conversion State
    const [convertLead, setConvertLead] = useState<Lead | null>(null);
    const [convertDialogOpen, setConvertDialogOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [converting, setConverting] = useState(false);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const response = await leadService.getLeads({
                search,
                status: statusFilter !== "all" ? statusFilter : undefined,
            });
            if (response.success) {
                setLeads(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch leads:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConvertClick = (lead: Lead) => {
        setConvertLead(lead);
        setConvertDialogOpen(true);
    };

    const confirmConvert = async () => {
        if (!convertLead) return;

        setConverting(true);
        try {
            const response = await leadService.convertLead(convertLead.id, {
                paymentMethod,
                // We can add city/state override inputs here later if needed
            });

            if (response.success) {
                toast.success(`Lead converted to Order #${response.data.orderNumber}`);
                setConvertDialogOpen(false);
                setConvertLead(null);
                fetchLeads(); // Refresh list
            }
        } catch (error: any) {
            console.error("Conversion failed", error);
            toast.error(error.response?.data?.error || "Failed to convert lead");
        } finally {
            setConverting(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLeads();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, statusFilter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "New":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            case "Contacted":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
            case "Quotation":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
            case "Negotiation":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
            case "Confirmed":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            case "Converted":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "Rejected":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search leads..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value)}
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Contacted">Contacted</SelectItem>
                        <SelectItem value="Quotation">Quotation Sent</SelectItem>
                        <SelectItem value="Negotiation">Negotiation</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Converted">Converted</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Lead #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Loading leads...
                                </TableCell>
                            </TableRow>
                        ) : leads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No leads found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            leads.map((lead) => (
                                <TableRow key={lead.id}>
                                    <TableCell className="font-medium">
                                        {lead.leadNumber}
                                    </TableCell>
                                    <TableCell>{lead.name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1 text-xs">
                                                <Phone className="h-3 w-3" /> {lead.phone}
                                            </div>
                                            {lead.whatsapp && (
                                                <div className="flex items-center gap-1 text-xs text-green-600">
                                                    <MessageSquare className="h-3 w-3" /> {lead.whatsapp}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{lead.source || "Website"}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={getStatusColor(lead.status)}
                                        >
                                            {lead.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(lead.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {lead.status !== "Converted" && lead.status !== "Rejected" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    onClick={() => handleConvertClick(lead)}
                                                    title="Convert to Order"
                                                >
                                                    <ShoppingCart className="h-4 w-4 mr-1" /> Convert
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" title="View Details">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Convert Lead to Order</DialogTitle>
                        <DialogDescription>
                            Create a new order for <strong>{convertLead?.name}</strong>.
                            Stock will be deducted and an invoice will be generated.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="text-sm font-medium text-right col-span-1">Products</span>
                            <span className="col-span-3 text-sm">
                                {convertLead?.products?.length || 0} items
                                (Budget: ₹{convertLead?.totalBudget?.toLocaleString()})
                            </span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="text-sm font-medium text-right col-span-1">Payment</span>
                            <div className="col-span-3">
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cod">Cash on Delivery (COD)</SelectItem>
                                        <SelectItem value="upi">UPI / Online</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>Cancel</Button>
                        <Button onClick={confirmConvert} disabled={converting} className="bg-green-600 hover:bg-green-700">
                            {converting ? "Converting..." : "Confirm Conversion"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
