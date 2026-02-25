"use client";

import React, { useState, useEffect } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Lead } from "@/types/lead";
import { leadService } from "@/services/admin/leadService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Assuming sonner is used for toasts

// Column component to render a Droppable area
function KanbanColumn({
    id,
    title,
    leads,
}: {
    id: string;
    title: string;
    leads: Lead[];
}) {
    const { setNodeRef } = useSortable({
        id: id,
        data: {
            type: "Column",
            status: id,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className="flex flex-col h-full bg-slate-100 dark:bg-slate-900 rounded-lg p-2 w-[300px] shrink-0 border border-slate-200 dark:border-slate-800"
        >
            <div className="flex items-center justify-between mb-3 px-2">
                <h3 className="font-semibold text-sm uppercase text-slate-500 dark:text-slate-400">
                    {title}
                </h3>
                <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
                    {leads.length}
                </Badge>
            </div>

            <ScrollArea className="flex-1">
                <SortableContext
                    items={leads.map((l) => l.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex flex-col gap-2 p-1 min-h-[100px]">
                        {leads.map((lead) => (
                            <SortableLeadCard key={lead.id} lead={lead} />
                        ))}
                    </div>
                </SortableContext>
            </ScrollArea>
        </div>
    );
}

// Draggable Card Component
function SortableLeadCard({ lead }: { lead: Lead }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: lead.id,
        data: {
            type: "Lead",
            lead,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-50 bg-slate-200 dark:bg-slate-800 border-dashed border-2 border-slate-400 h-[100px] rounded-md"
            />
        );
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow bg-white dark:bg-slate-950"
        >
            <CardContent className="p-3 space-y-2">
                <div className="flex justify-between items-start">
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                        {lead.leadNumber}
                    </Badge>
                    <span className="text-xs text-slate-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <div>
                    <h4 className="font-medium text-sm line-clamp-1">{lead.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <User className="w-3 h-3" />
                        <span>{lead.phone}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function LeadKanban() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [activeDragLead, setActiveDragLead] = useState<Lead | null>(null);

    const columns = [
        { id: "New", title: "New Lead" },
        { id: "Contacted", title: "Contacted" },
        { id: "Quotation", title: "Quotation Sent" },
        { id: "Negotiation", title: "Negotiation" },
        { id: "Confirmed", title: "Confirmed" },
        { id: "Converted", title: "Converted" },
        { id: "Rejected", title: "Rejected" },
    ];

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require movement of 8px before drag starts to prevent accidental drags
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const response = await leadService.getLeads({ limit: 100 }); // Fetch enough for board
            if (response.success) {
                setLeads(response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveDragId(active.id as string);
        const lead = leads.find((l) => l.id === active.id);
        if (lead) setActiveDragLead(lead);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        // We're just visualizing movement here, actual data update happens on DragEnd
        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveALead = active.data.current?.type === "Lead";
        const isOverAColumn = over.data.current?.type === "Column";
        // const isOverALead = over.data.current?.type === "Lead";

        if (isActiveALead && isOverAColumn) {
            // Moving a lead over a column - usually handled by SortableContext but good to be explicit
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragId(null);
        setActiveDragLead(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find the lead being dragged
        const activeLead = leads.find((l) => l.id === activeId);
        if (!activeLead) return;

        let newStatus = activeLead.status;

        // Case 1: Dropped directly over a column
        if (columns.some((col) => col.id === overId)) {
            newStatus = overId as Lead['status'];
        }
        // Case 2: Dropped over another lead in a different column
        else {
            const overLead = leads.find((l) => l.id === overId);
            if (overLead) {
                newStatus = overLead.status;
            }
        }

        // If status hasn't changed, do nothing
        if (newStatus === activeLead.status) return;

        // Optimistic Update
        const oldLeads = [...leads];
        setLeads((prev) =>
            prev.map((l) =>
                l.id === activeId ? { ...l, status: newStatus } : l
            )
        );

        // API Call
        try {
            await leadService.updateLead(activeId, { status: newStatus });
            toast.success(`Lead moved to ${newStatus}`);
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Failed to update lead status");
            setLeads(oldLeads); // Revert on failure
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-220px)] overflow-x-auto pb-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex h-full gap-4 min-w-fit">
                    {columns.map((col) => (
                        <KanbanColumn
                            key={col.id}
                            id={col.id}
                            title={col.title}
                            leads={leads.filter((l) => l.status === col.id)}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeDragLead ? (
                        <Card className="w-[280px] shadow-lg bg-white dark:bg-slate-950 opacity-90 cursor-grabbing">
                            <CardContent className="p-3 space-y-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                                        {activeDragLead.leadNumber}
                                    </Badge>
                                    <span className="text-xs text-slate-500">
                                        {new Date(activeDragLead.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm line-clamp-1">{activeDragLead.name}</h4>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                        <User className="w-3 h-3" />
                                        <span>{activeDragLead.phone}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
