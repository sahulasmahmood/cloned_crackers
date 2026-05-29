"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { Plus, Edit, Trash, AlertTriangle, FileText } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { licenseService } from "@/services/admin/licenseService";
import { License } from "@/types/license";
import { toast } from "sonner";

export default function CompliancePage() {
    const [licenses, setLicenses] = useState<License[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingLicense, setEditingLicense] = useState<License | null>(null);
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [licenseToDelete, setLicenseToDelete] = useState<License | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [formErrors, setFormErrors] = useState<{ number?: string; expiryDate?: string }>({});
    const [formData, setFormData] = useState({
        type: "Shop",
        number: "",
        expiryDate: "",
        limitValue: "",
        alertDays: 30,
        documentUrl: ""
    });

    const fetchLicenses = async () => {
        setLoading(true);
        try {
            const response = await licenseService.getLicenses();
            if (response.success) {
                setLicenses(response.data);
            }
        } catch (error) {
            toast.error("Failed to load licenses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLicenses();
    }, []);

    const handleEdit = (license: License) => {
        setEditingLicense(license);
        setDocumentFile(null);
        setFormErrors({});
        setFormData({
            type: license.type,
            number: license.number,
            expiryDate: format(new Date(license.expiryDate), "yyyy-MM-dd"),
            limitValue: license.limitValue || "",
            alertDays: license.alertDays,
            documentUrl: license.documentUrl || ""
        });
        setDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingLicense(null);
        setDocumentFile(null);
        setFormErrors({});
        setFormData({
            type: "Shop",
            number: "",
            expiryDate: "",
            limitValue: "",
            alertDays: 30,
            documentUrl: ""
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (submitting) return;

        // Client-side validation for required fields
        const errors: { number?: string; expiryDate?: string } = {};
        if (!formData.number.trim()) errors.number = "License number is required";
        if (!formData.expiryDate) errors.expiryDate = "Expiry date is required";
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});

        setSubmitting(true);
        try {
            // Upload the document first (if a new file was chosen), then save the license
            let documentUrl = formData.documentUrl;
            if (documentFile) {
                documentUrl = await licenseService.uploadDocument(documentFile);
            }

            const payload = { ...formData, documentUrl };

            if (editingLicense) {
                await licenseService.updateLicense(editingLicense.id, payload);
                toast.success("License updated successfully");
            } else {
                await licenseService.createLicense(payload as any);
                toast.success("License added successfully");
            }
            setDialogOpen(false);
            fetchLicenses();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!licenseToDelete) return;
        setDeleting(true);
        try {
            await licenseService.deleteLicense(licenseToDelete.id);
            toast.success("License deleted");
            setLicenseToDelete(null);
            fetchLicenses();
        } catch (error) {
            toast.error("Failed to delete license");
        } finally {
            setDeleting(false);
        }
    };

    const getExpiryStatus = (expiryDate: string, alertDays: number) => {
        const daysLeft = differenceInDays(new Date(expiryDate), new Date());
        const expired = "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950/40";
        const warning = "text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-950/40";
        const active = "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-950/40";
        if (daysLeft < 0) return { label: "Expired", color: expired };
        if (daysLeft === 0) return { label: "Expires today", color: warning };
        if (daysLeft <= alertDays) return { label: `Expiring in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`, color: warning };
        return { label: "Active", color: active };
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Compliance & Licenses</h1>
                    <p className="text-muted-foreground">Manage explosive licenses and PESO approvals.</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Add License
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>License Registry</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>License Number</TableHead>
                                <TableHead>Limit / Capacity</TableHead>
                                <TableHead>Expiry Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableSkeleton rows={5} columns={6} />
                            ) : licenses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-12">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                                                <FileText className="h-7 w-7 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-lg font-semibold">No licenses added yet</h3>
                                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                                Track your Shop, Explosive and PESO licenses here and get alerted before they expire.
                                            </p>
                                            <Button className="mt-6" onClick={handleCreate}>
                                                <Plus className="mr-2 h-4 w-4" /> Add License
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                licenses.map((license) => {
                                    const status = getExpiryStatus(license.expiryDate, license.alertDays);
                                    return (
                                        <TableRow key={license.id}>
                                            <TableCell>
                                                <Badge variant="outline">{license.type}</Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">{license.number}</TableCell>
                                            <TableCell>{license.limitValue || "-"}</TableCell>
                                            <TableCell>{format(new Date(license.expiryDate), "MMM d, yyyy")}</TableCell>
                                            <TableCell>
                                                <Badge className={status.color} variant="secondary">
                                                    {status.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {license.documentUrl && (
                                                        <Button variant="ghost" size="icon" asChild title="View document">
                                                            <a href={license.documentUrl} target="_blank" rel="noopener noreferrer">
                                                                <FileText className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(license)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => setLicenseToDelete(license)} className="text-red-600 hover:text-red-700">
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingLicense ? "Edit License" : "Add New License"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>License Type <span className="text-destructive">*</span></Label>
                            <Select
                                value={formData.type}
                                onValueChange={(val) => setFormData({ ...formData, type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Shop">Shop License (Form LE-5)</SelectItem>
                                    <SelectItem value="Explosive">Explosive License</SelectItem>
                                    <SelectItem value="PESO">PESO Approval</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>License Number <span className="text-destructive">*</span></Label>
                            <Input
                                value={formData.number}
                                onChange={(e) => {
                                    setFormData({ ...formData, number: e.target.value });
                                    if (formErrors.number) setFormErrors({ ...formErrors, number: undefined });
                                }}
                                placeholder="E.g., E/HQ/TN/24/..."
                                aria-invalid={!!formErrors.number}
                            />
                            {formErrors.number && (
                                <p className="text-xs text-destructive">{formErrors.number}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label>Expiry Date <span className="text-destructive">*</span></Label>
                            <Input
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) => {
                                    setFormData({ ...formData, expiryDate: e.target.value });
                                    if (formErrors.expiryDate) setFormErrors({ ...formErrors, expiryDate: undefined });
                                }}
                                aria-invalid={!!formErrors.expiryDate}
                            />
                            {formErrors.expiryDate && (
                                <p className="text-xs text-destructive">{formErrors.expiryDate}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label>Storage Limit (Optional)</Label>
                            <Input
                                value={formData.limitValue}
                                onChange={(e) => setFormData({ ...formData, limitValue: e.target.value })}
                                placeholder="E.g., 500 kg"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Alert Days (Before Expiry)</Label>
                            <Input
                                type="number"
                                min={0}
                                value={formData.alertDays}
                                onChange={(e) => {
                                    const parsed = parseInt(e.target.value, 10);
                                    setFormData({ ...formData, alertDays: Number.isNaN(parsed) ? 0 : Math.max(0, parsed) });
                                }}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>License Document (Optional)</Label>
                            <FileDropzone
                                file={documentFile}
                                onFileChange={setDocumentFile}
                                existingUrl={formData.documentUrl}
                                disabled={submitting}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? "Saving..." : "Save License"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!licenseToDelete}
                onOpenChange={(open) => !open && setLicenseToDelete(null)}
                title="Delete this license?"
                description={
                    licenseToDelete ? (
                        <>
                            This will permanently remove{" "}
                            <span className="font-medium text-foreground">{licenseToDelete.type}</span> license{" "}
                            <span className="font-medium text-foreground">{licenseToDelete.number}</span>
                            {licenseToDelete.documentUrl ? " and its attached document" : ""}. This action cannot be undone.
                        </>
                    ) : null
                }
                variant="destructive"
                confirmLabel="Delete"
                loadingLabel="Deleting..."
                loading={deleting}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
