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
import { Plus, Edit, Trash, AlertTriangle, FileText } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { licenseService } from "@/services/admin/licenseService";
import { License } from "@/types/license";
import { toast } from "sonner";

export default function CompliancePage() {
    const [licenses, setLicenses] = useState<License[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingLicense, setEditingLicense] = useState<License | null>(null);
    const [formData, setFormData] = useState({
        type: "Shop",
        number: "",
        expiryDate: "",
        limitValue: "",
        alertDays: 30
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
        setFormData({
            type: license.type,
            number: license.number,
            expiryDate: format(new Date(license.expiryDate), "yyyy-MM-dd"),
            limitValue: license.limitValue || "",
            alertDays: license.alertDays
        });
        setDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingLicense(null);
        setFormData({
            type: "Shop",
            number: "",
            expiryDate: "",
            limitValue: "",
            alertDays: 30
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        try {
            if (editingLicense) {
                await licenseService.updateLicense(editingLicense.id, formData);
                toast.success("License updated successfully");
            } else {
                await licenseService.createLicense(formData as any);
                toast.success("License added successfully");
            }
            setDialogOpen(false);
            fetchLicenses();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Operation failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this license?")) return;
        try {
            await licenseService.deleteLicense(id);
            toast.success("License deleted");
            fetchLicenses();
        } catch (error) {
            toast.error("Failed to delete license");
        }
    };

    const getExpiryStatus = (expiryDate: string, alertDays: number) => {
        const daysLeft = differenceInDays(new Date(expiryDate), new Date());
        if (daysLeft < 0) return { label: "Expired", color: "text-red-600 bg-red-100" };
        if (daysLeft <= alertDays) return { label: `Expiring in ${daysLeft} days`, color: "text-yellow-600 bg-yellow-100" };
        return { label: "Active", color: "text-green-600 bg-green-100" };
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
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">Loading...</TableCell>
                                </TableRow>
                            ) : licenses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">No licenses found.</TableCell>
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
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(license)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(license.id)} className="text-red-600 hover:text-red-700">
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
                            <Label>License Type</Label>
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
                            <Label>License Number</Label>
                            <Input
                                value={formData.number}
                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                placeholder="E.g., E/HQ/TN/24/..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Expiry Date</Label>
                            <Input
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            />
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
                                value={formData.alertDays}
                                onChange={(e) => setFormData({ ...formData, alertDays: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>Save License</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
