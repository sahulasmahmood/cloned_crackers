"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldAlert, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { LicenseData } from "@/types/dashboard";
import Link from "next/link";
import { format } from "date-fns";

interface LicenseWarningsProps {
    data: LicenseData;
}

export function LicenseWarnings({ data }: LicenseWarningsProps) {
    // If no data, show a placeholder or nothing
    if (!data) return null;

    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                    License & Compliance
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                    Expiry tracking and compliance alerts
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 flex items-center gap-3">
                        <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-full">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{data.active}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Active Licenses</div>
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex items-center gap-3">
                        <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-full">
                            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{data.expiringSoon + data.expired}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Attention Needed</div>
                        </div>
                    </div>
                </div>

                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Critical Alerts</h4>
                <ScrollArea className="h-[240px] pr-4">
                    <div className="space-y-3">
                        {data.details && data.details
                            .filter(l => l.status !== 'valid') // Show only expiring or expired
                            .sort((a, b) => a.daysToExpiry - b.daysToExpiry) // Sort by urgency
                            .map((license) => (
                                <div
                                    key={license.id}
                                    className={`p-3 rounded-lg border flex items-start gap-3 transition-colors
                  ${license.status === 'expired'
                                            ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30'
                                            : 'bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30'}
                `}
                                >
                                    {license.status === 'expired' ? (
                                        <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate pr-2">
                                                {license.type}
                                            </h5>
                                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded
                      ${license.status === 'expired' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'}
                    `}>
                                                {license.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-2">
                                            License #: {license.number}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-medium">
                                            <Clock className="w-3 h-3" />
                                            {license.daysToExpiry < 0
                                                ? `Expired ${Math.abs(license.daysToExpiry)} days ago`
                                                : `Expires in ${license.daysToExpiry} days`
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))}

                        {data.details && data.details.filter(l => l.status !== 'valid').length === 0 && (
                            <div className="text-center py-8">
                                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2 opacity-50" />
                                <p className="text-sm text-slate-500">All licenses are valid & up to date</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
