"use client";

import { LeadTable } from "@/components/Dashboard/Leads/LeadTable";
import { LeadKanban } from "@/components/Dashboard/Leads/LeadKanban";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List, Users } from "lucide-react";

export default function LeadsPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Tabs defaultValue="list" className="space-y-4">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Lead Management</h2>
                    <TabsList>
                        <TabsTrigger value="list" className="flex items-center gap-2">
                            <List className="h-4 w-4" />
                            List View
                        </TabsTrigger>
                        <TabsTrigger value="kanban" className="flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4" />
                            Kanban Board
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="list" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Users className="h-6 w-6 text-primary" />
                                <div>
                                    <CardTitle>Enquiries & Leads</CardTitle>
                                    <CardDescription>
                                        Manage all incoming enquiries and track their conversion status.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <LeadTable />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="kanban" className="space-y-4">
                    <LeadKanban />
                </TabsContent>
            </Tabs>
        </div>
    );
}
