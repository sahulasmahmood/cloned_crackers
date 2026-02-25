"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Phone, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { LeadsData } from "@/types/dashboard";
import Link from "next/link";
import { format } from "date-fns";

interface LeadsAnalyticsProps {
    data: LeadsData;
}

export function LeadsAnalytics({ data }: LeadsAnalyticsProps) {
    // If no data, show a placeholder or nothing
    if (!data) return null;

    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        Leads Overview
                    </CardTitle>
                    <Link href="/admin/leads" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        View All <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                    Recent enquiries and conversion status
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-center">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</div>
                        <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{data.total}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 text-center">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">New</div>
                        <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{data.new}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 text-center">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Converted</div>
                        <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{data.converted}</div>
                    </div>
                </div>

                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Recent Enquiries</h4>
                <ScrollArea className="h-[240px] pr-4">
                    <div className="space-y-3">
                        {data.recent && data.recent.length > 0 ? (
                            data.recent.map((lead) => (
                                <div
                                    key={lead.id}
                                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-mono text-slate-500">#{lead.leadNumber}</span>
                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded
                      ${lead.status === 'New' ? 'bg-blue-100 text-blue-700' : ''}
                      ${lead.status === 'Converted' ? 'bg-green-100 text-green-700' : ''}
                      ${!['New', 'Converted'].includes(lead.status) ? 'bg-slate-100 text-slate-700' : ''}
                    `}>
                                            {lead.status}
                                        </span>
                                    </div>
                                    <div className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-1 truncate">
                                        {lead.name}
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(lead.createdAt), 'MMM dd')}
                                        </div>
                                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                                            ₹{lead.totalBudget.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-neutral-500 text-sm">No recent leads found</div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
