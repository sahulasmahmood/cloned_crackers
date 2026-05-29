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
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lead } from "@/types/lead";
import { leadService } from "@/services/admin/leadService";
import { getCompanySettings } from "@/services/online-services/webSettingsService";
import { format } from "date-fns";
import {
    Eye, Search, Phone, MessageSquare,
    MapPin, Package, FileText, Calendar, User, ShoppingCart,
} from "lucide-react";
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
import { toast } from "sonner";

export function LeadTable() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [companyPhone, setCompanyPhone] = useState<string>("");

    // View Lead State
    const [viewLead, setViewLead] = useState<Lead | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>("");

    // Reject State
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    
    // Conversion State
    const [convertLead, setConvertLead] = useState<Lead | null>(null);
    const [convertDialogOpen, setConvertDialogOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [converting, setConverting] = useState(false);

    const fetchLeadsAndSettings = async () => {
        setLoading(true);
        try {
            const [leadsResponse, settingsResponse] = await Promise.all([
                leadService.getLeads({
                    search,
                    status: statusFilter !== "all" ? statusFilter : undefined,
                }),
                getCompanySettings()
            ]);
            
            if (leadsResponse.success) {
                setLeads(leadsResponse.data);
            }
            if (settingsResponse.success && settingsResponse.data) {
                setCompanyPhone(settingsResponse.data.phone || "");
            }
        } catch (error) {
            console.error("Failed to fetch leads or settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewClick = (lead: Lead) => {
        setViewLead(lead);
        setSelectedStatus(lead.status);
        setViewDialogOpen(true);
    };

    const sendWhatsAppQuotation = (lead: Lead) => {
        const number = (lead.whatsapp || lead.phone).replace(/\D/g, "");
        const lines: string[] = [];
        lines.push(`🎆 *Firecrackers Quotation*`);
        lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
        lines.push(`👤 Dear *${lead.name}*,`);
        lines.push(`Thank you for your enquiry! Here is your quotation:\n`);
        if (lead.products && lead.products.length > 0) {
            lines.push(`📦 *Products:*`);
            lead.products.forEach((p, i) => {
                const price = p.price ? ` — ₹${p.price.toLocaleString()}` : "";
                lines.push(`  ${i + 1}. ${p.name} × ${p.quantity}${price}`);
            });
        }
        if (lead.totalBudget) {
            lines.push(`\n💰 *Total: ₹${lead.totalBudget.toLocaleString()}*`);
        }
        lines.push(`\n📍 *Lead #:* ${lead.leadNumber}`);
        if (companyPhone) {
            lines.push(`\n✅ Place your order now or call us at *${companyPhone}* for more details.`);
        } else {
            lines.push(`\n✅ Place your order now or call us for more details.`);
        }
        lines.push(`\n🔥 _Premium Quality, Lowest Prices!_ 🎇`);
        const msg = encodeURIComponent(lines.join("\n"));
        window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!viewLead) return;
        
        if (newStatus === "Rejected") {
            setRejectDialogOpen(true);
            return;
        }

        await processStatusUpdate(newStatus);
    };

    const processStatusUpdate = async (newStatus: string) => {
        if (!viewLead) return;
        setSelectedStatus(newStatus);
        setUpdatingStatus(true);
        try {
            const response = await leadService.updateLead(viewLead.id, {
                status: newStatus as Lead["status"],
            });
            if (response.success) {
                toast.success(`Status updated to ${newStatus}`);
                setViewLead({ ...viewLead, status: newStatus as Lead["status"] });
                fetchLeadsAndSettings();
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            toast.error(err.response?.data?.error || "Failed to update status");
            setSelectedStatus(viewLead.status); // revert on error
        } finally {
            setUpdatingStatus(false);
        }
    };

    const confirmReject = async () => {
        await processStatusUpdate("Rejected");
        setRejectDialogOpen(false);
    };

    const handleConvertClick = (lead: Lead) => {
        setConvertLead(lead);
        setConvertDialogOpen(true);
    };

    const confirmConvert = async () => {
        if (!convertLead) return;
        setConverting(true);
        try {
            const response = await leadService.convertLead(convertLead.id, { paymentMethod });
            if (response.success) {
                toast.success(`Lead converted to Order #${response.data.orderNumber}`);
                setConvertDialogOpen(false);
                setConvertLead(null);
                fetchLeadsAndSettings();
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            console.error("Conversion failed", err);
            toast.error(err.response?.data?.error || "Failed to convert lead");
        } finally {
            setConverting(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => { fetchLeadsAndSettings(); }, 500);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, statusFilter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "New":        return "bg-blue-100 text-blue-800";
            case "Contacted":  return "bg-yellow-100 text-yellow-800";
            case "Quotation":  return "bg-purple-100 text-purple-800";
            case "Negotiation":return "bg-orange-100 text-orange-800";
            case "Confirmed":  return "bg-blue-100 text-blue-800";
            case "Converted":  return "bg-green-100 text-green-800";
            case "Rejected":   return "bg-red-100 text-red-800";
            default:           return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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

            {/* Table */}
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
                            <TableSkeleton rows={6} columns={7} />
                        ) : leads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">No leads found.</TableCell>
                            </TableRow>
                        ) : (
                            leads.map((lead) => (
                                <TableRow key={lead.id}>
                                    <TableCell className="font-medium">{lead.leadNumber}</TableCell>
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
                                        <Badge variant="outline" className={getStatusColor(lead.status)}>
                                            {lead.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{format(new Date(lead.createdAt), "MMM d, yyyy")}</TableCell>
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
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="View Details"
                                                onClick={() => handleViewClick(lead)}
                                            >
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

            {/* ── View Lead Detail Modal ── */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            Lead Details —{" "}
                            <span className="text-muted-foreground font-mono">{viewLead?.leadNumber}</span>
                        </DialogTitle>
                        <DialogDescription>
                            Full information about this lead enquiry.
                        </DialogDescription>
                    </DialogHeader>

                    {viewLead && (
                        <div className="space-y-5 py-2">
                            {/* Status Row */}
                            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-muted-foreground">Current Status:</span>
                                    <Badge variant="outline" className={getStatusColor(viewLead.status)}>
                                        {viewLead.status}
                                    </Badge>
                                </div>
                                {viewLead.status !== "Converted" && (
                                    <Select
                                        value={selectedStatus}
                                        onValueChange={handleStatusUpdate}
                                        disabled={updatingStatus}
                                    >
                                        <SelectTrigger className="w-[160px] h-8 text-xs">
                                            <SelectValue placeholder={updatingStatus ? "Updating..." : "Select status"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="New">New</SelectItem>
                                            <SelectItem value="Contacted">Contacted</SelectItem>
                                            <SelectItem value="Quotation">Quotation Sent</SelectItem>
                                            <SelectItem value="Negotiation">Negotiation</SelectItem>
                                            <SelectItem value="Confirmed">Confirmed</SelectItem>
                                            <SelectItem value="Rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* Customer Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{viewLead.name}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>{format(new Date(viewLead.createdAt), "PPP")}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <a href={`tel:${viewLead.phone}`} className="text-blue-600 hover:underline">
                                            {viewLead.phone}
                                        </a>
                                    </div>
                                </div>
                                {viewLead.whatsapp && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">WhatsApp</p>
                                        <div className="flex items-center gap-2 text-sm">
                                            <MessageSquare className="h-4 w-4 text-green-600" />
                                            <a
                                                href={`https://wa.me/${viewLead.whatsapp.replace(/\D/g, "")}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-green-600 hover:underline"
                                            >
                                                {viewLead.whatsapp}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {(viewLead.city || viewLead.location) && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</p>
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>{viewLead.city || viewLead.location}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source</p>
                                    <span className="text-sm">{viewLead.source || "Website"}</span>
                                </div>
                            </div>

                            {/* Products */}
                            {viewLead.products && viewLead.products.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                        <Package className="h-3.5 w-3.5" /> Products Enquired
                                    </p>
                                    <div className="rounded-lg border divide-y overflow-hidden">
                                        {viewLead.products.map((p, i) => (
                                            <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                                <span className="font-medium">{p.name}</span>
                                                <div className="flex items-center gap-4 text-muted-foreground">
                                                    <span>Qty: <b className="text-foreground">{p.quantity}</b></span>
                                                    {p.price && <span>₹{p.price.toLocaleString()}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {viewLead.totalBudget && (
                                        <div className="text-sm font-semibold text-right pr-1">
                                            Total Budget:{" "}
                                            <span className="text-green-600">₹{viewLead.totalBudget.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Notes */}
                            {viewLead.notes && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                        <FileText className="h-3.5 w-3.5" /> Notes
                                    </p>
                                    <div className="rounded-lg border p-3 text-sm bg-muted/30 whitespace-pre-wrap">
                                        {viewLead.notes}
                                    </div>
                                </div>
                            )}

                            {/* Converted Order */}
                            {viewLead.convertedOrderId && (
                                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                                    ✅ This lead was converted. Order ID:{" "}
                                    <span className="font-mono font-bold">{viewLead.convertedOrderId}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="flex-wrap gap-2">
                        {viewLead && (viewLead.whatsapp || viewLead.phone) && (
                            <Button
                                variant="outline"
                                className="border-green-500 text-green-600 hover:bg-green-50"
                                onClick={() => sendWhatsAppQuotation(viewLead)}
                            >
                                <MessageSquare className="h-4 w-4 mr-2" /> Send WhatsApp Quotation
                            </Button>
                        )}
                        {viewLead && viewLead.status !== "Converted" && viewLead.status !== "Rejected" && (
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                    setViewDialogOpen(false);
                                    handleConvertClick(viewLead);
                                }}
                            >
                                <ShoppingCart className="h-4 w-4 mr-2" /> Convert to Order
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Convert Lead Modal ── */}
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
                                {convertLead?.totalBudget ? ` (Budget: ₹${convertLead.totalBudget.toLocaleString()})` : ""}
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
                        <Button
                            onClick={confirmConvert}
                            disabled={converting}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {converting ? "Converting..." : "Confirm Conversion"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Reject Lead Confirmation Modal ── */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Reject Lead?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to mark <strong>{viewLead?.name}</strong>&apos;s enquiry as rejected? 
                            This action can be reversed later by updating the status again.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmReject}
                            disabled={updatingStatus}
                        >
                            {updatingStatus ? "Rejecting..." : "Yes, Reject Lead"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
