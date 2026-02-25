"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Edit2 } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  isStatic: boolean;
}

interface BadgeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  staticBadges: Badge[];
  customBadges: Badge[];
  onAddBadge: (name: string) => Promise<void>;
  onEditBadge: (id: string, name: string) => Promise<void>;
  label: string;
  disabled?: boolean;
  allowCustomBadges?: boolean; // New prop to control custom badge creation
  showStaticBadgesHeading?: boolean; // New prop to control static badges heading
}

export function BadgeSelector({
  value,
  onChange,
  staticBadges,
  customBadges,
  onAddBadge,
  onEditBadge,
  label,
  disabled = false,
  allowCustomBadges = true, // Default to true for backward compatibility
  showStaticBadgesHeading = true, // Default to true for backward compatibility
}: BadgeSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newBadgeName, setNewBadgeName] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [editName, setEditName] = useState("");
  const [explicitlyClosing, setExplicitlyClosing] = useState(false);

  const handleAdd = async () => {
    await onAddBadge(newBadgeName);
    setNewBadgeName("");
    setShowAdd(false);
    setDropdownOpen(false);
    setExplicitlyClosing(true);
  };

  const handleEdit = async () => {
    if (editing) {
      await onEditBadge(editing.id, editName);
      setEditing(null);
      setEditName("");
      setDropdownOpen(false);
      setExplicitlyClosing(true);
    }
  };

  const handleCancel = () => {
    setShowAdd(false);
    setNewBadgeName("");
    setExplicitlyClosing(true);
    setDropdownOpen(false);
  };

  return (
    <div className="relative">
      <Label className="text-base font-medium">{label}</Label>
      <div className="mt-2 space-y-2">
        <Select
          value={value}
          onValueChange={(val) => {
            if (val === "add_new_badge") {
              setEditing(null);
              setEditName("");
              setShowAdd(true);
              setNewBadgeName("");
              setDropdownOpen(true);
            } else {
              onChange(val);
              setDropdownOpen(false);
            }
          }}
          open={dropdownOpen}
          onOpenChange={(open) => {
            if (!open && (editing || showAdd) && !explicitlyClosing) {
              setDropdownOpen(true);
              return;
            }
            setDropdownOpen(open);
            if (explicitlyClosing) {
              setExplicitlyClosing(false);
            }
            if (!open && !explicitlyClosing) {
              setShowAdd(false);
              setEditing(null);
              setNewBadgeName("");
              setEditName("");
            }
          }}
          disabled={disabled}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Select badge" />
          </SelectTrigger>
        <SelectContent className="z-50" data-no-search="true">
          <SelectItem value="none" className="cursor-pointer">No Badge</SelectItem>
          
          {/* Static Badges Section */}
          {staticBadges.length > 0 && (
            <>
              {showStaticBadgesHeading && (
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted mt-1">
                  STATIC BADGES
                </div>
              )}
              {staticBadges.map((badge) => (
                <SelectItem key={badge.id} value={badge.name} className="cursor-pointer">
                  {badge.name}
                </SelectItem>
              ))}
            </>
          )}

          {/* Custom Badges Section - Only show if allowCustomBadges is true and there are custom badges */}
          {allowCustomBadges && customBadges.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted mt-1">
                CUSTOM BADGES
              </div>
              {customBadges.map((badge) => (
                <div key={badge.id} className="flex items-center justify-between group">
                  <SelectItem value={badge.name} className="flex-1 cursor-pointer">
                    {badge.name}
                  </SelectItem>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 cursor-pointer p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAdd(false);
                        setNewBadgeName("");
                        setEditing({ id: badge.id, name: badge.name });
                        setEditName(badge.name);
                        setDropdownOpen(true);
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Add New Badge - Only show if allowCustomBadges is true */}
          {allowCustomBadges && (
            <div
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1.5 text-sm flex items-center text-gray-900 dark:text-gray-100 border-t border-gray-200 dark:border-gray-700 mt-1"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setEditing(null);
                setEditName("");
                setShowAdd(true);
                setNewBadgeName("");
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Badge
            </div>
          )}

          {showAdd && allowCustomBadges && (
            <div
              className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Add New Badge
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="hover:bg-gray-200 cursor-pointer dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newBadgeName}
                  onChange={(e) => setNewBadgeName(e.target.value)}
                  placeholder="Enter badge name"
                  className="flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAdd();
                    }
                    e.stopPropagation();
                  }}
                  onFocus={(e) => e.stopPropagation()}
                />
                <Button type="button" onClick={handleAdd} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          )}

          {editing && allowCustomBadges && (
            <div
              className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Edit Badge
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditing(null);
                    setEditName("");
                    setExplicitlyClosing(true);
                    setDropdownOpen(false);
                  }}
                  className="hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter badge name"
                  className="flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleEdit();
                    }
                    e.stopPropagation();
                  }}
                  onFocus={(e) => e.stopPropagation()}
                />
                <Button type="button" onClick={handleEdit} size="sm">
                  <Edit2 className="h-4 w-4 mr-1" />
                  Update
                </Button>
              </div>
            </div>
          )}
        </SelectContent>
        </Select>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        Add a promotional badge to attract attention
      </p>
    </div>
  );
}
