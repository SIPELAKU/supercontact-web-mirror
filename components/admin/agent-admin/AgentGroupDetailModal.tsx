"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Star, Trash2, UserPlus, Users } from "lucide-react";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { useUsers } from "@/lib/hooks/useUsers";
import {
  useAgentGroup,
  useAddGroupMember,
  useUpdateGroupMemberRole,
  useRemoveGroupMember,
} from "@/lib/hooks/useAgents";
import type { AgentGroupMember, AgentGroupRole } from "@/lib/types/agents";

interface AgentGroupDetailModalProps {
  groupId: string | null;
  open: boolean;
  onClose: () => void;
  /** Gates every write control; false = read-only viewer. */
  canManage: boolean;
}

interface UserOption {
  value: string;
  label: string;
  email: string;
}

const ROLE_OPTIONS: { value: AgentGroupRole; label: string }[] = [
  { value: "member", label: "Member" },
  { value: "lead", label: "Lead" },
];

// Group detail modal: shows the group's members and (for `agents:manage`)
// lets the admin add members via a user picker, toggle each member's role
// between member/lead, and remove members with a confirmation.
export default function AgentGroupDetailModal({
  groupId,
  open,
  onClose,
  canManage,
}: AgentGroupDetailModalProps) {
  const { data: group, isLoading, isError, refetch } = useAgentGroup(open ? groupId : null);

  const addMutation = useAddGroupMember();
  const roleMutation = useUpdateGroupMemberRole();
  const removeMutation = useRemoveGroupMember();

  // ---- Add-member control state ----
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [newRole, setNewRole] = useState<AgentGroupRole>("member");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((_event: any, value: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => setSearch(value), 300);
  }, []);

  const { data: usersData, isLoading: isLoadingUsers } = useUsers(1, 20, search);

  const members = group?.members ?? [];
  const memberIds = useMemo(() => new Set(members.map((m) => m.user_id)), [members]);

  // Candidate users for the picker: everyone from the search minus current members.
  const userOptions: UserOption[] = useMemo(
    () =>
      (usersData?.data?.users || [])
        .filter((u) => !memberIds.has(u.id))
        .map((u) => ({ value: u.id, label: u.fullname, email: u.email })),
    [usersData, memberIds]
  );

  // ---- Remove confirmation state ----
  const [removeTarget, setRemoveTarget] = useState<AgentGroupMember | null>(null);

  const resetAddControl = () => {
    setSelectedUser(null);
    setNewRole("member");
  };

  const handleAddMember = async () => {
    if (!groupId || !selectedUser) {
      notify.warning("Validation Error", { description: "Please select an agent to add." });
      return;
    }
    try {
      await addMutation.mutateAsync({
        groupId,
        data: { user_id: selectedUser.value, role: newRole },
      });
      notify.success("Member added");
      resetAddControl();
    } catch (error) {
      notify.error("Error", { description: handleError(error, "Add Group Member") });
    }
  };

  const handleRoleChange = (member: AgentGroupMember, role: AgentGroupRole) => {
    if (!groupId || role === member.role) return;
    roleMutation.mutate(
      { groupId, userId: member.user_id, role },
      {
        onSuccess: () =>
          notify.success(role === "lead" ? "Promoted to lead" : "Changed to member"),
        onError: (error) =>
          notify.error("Error", { description: handleError(error, "Update Member Role") }),
      }
    );
  };

  const handleConfirmRemove = async () => {
    if (!groupId || !removeTarget) return;
    try {
      await removeMutation.mutateAsync({ groupId, userId: removeTarget.user_id });
      notify.success("Member removed");
      setRemoveTarget(null);
    } catch (error) {
      notify.error("Error", { description: handleError(error, "Remove Group Member") });
    }
  };

  const closeModal = () => {
    if (addMutation.isPending) return;
    resetAddControl();
    setSearch("");
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => (next ? undefined : closeModal())} maxWidth="md">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{group ? group.name : "Group members"}</DialogTitle>
            {group?.description && (
              <p className="text-sm text-gray-500">{group.description}</p>
            )}
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-6 text-gray-400" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-gray-500">Failed to load group members.</p>
              <AppButton variantStyle="outline" color="gray" onClick={() => refetch()}>
                Retry
              </AppButton>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Add-member control */}
              {canManage && (
                <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                  <p className="mb-3 text-sm font-semibold text-gray-700">Add member</p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <AppAutocomplete<UserOption, false, false, false>
                        isBgWhite
                        label="Agent"
                        options={userOptions}
                        value={selectedUser}
                        onChange={(_e, value) => setSelectedUser(value)}
                        onInputChange={handleSearchChange}
                        loading={isLoadingUsers}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                        renderOption={(props, option) => (
                          <li {...props} key={option.value}>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-800">
                                {option.label}
                              </span>
                              <span className="text-xs text-gray-500">{option.email}</span>
                            </div>
                          </li>
                        )}
                        placeholder="Search agents…"
                        noOptionsText="No matching agents"
                      />
                    </div>
                    <div className="w-full sm:w-36">
                      <AppSelect
                        isBgWhite
                        label="Role"
                        options={ROLE_OPTIONS}
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as AgentGroupRole)}
                      />
                    </div>
                    <AppButton
                      onClick={handleAddMember}
                      disabled={!selectedUser || addMutation.isPending}
                      isLoading={addMutation.isPending}
                      startIcon={<UserPlus size={16} />}
                      className="shrink-0"
                    >
                      Add
                    </AppButton>
                  </div>
                </div>
              )}

              {/* Members list */}
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Members ({members.length})
                </p>
                {members.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No members yet"
                    description={
                      canManage
                        ? "Add agents to this group using the control above."
                        : "This group has no members."
                    }
                  />
                ) : (
                  <div className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
                    {members.map((member) => (
                      <div
                        key={member.user_id}
                        className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          {member.role === "lead" && (
                            <Star size={14} className="shrink-0 text-amber-500" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-800">
                              {member.fullname}
                            </p>
                            <p className="truncate text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:shrink-0">
                          {canManage ? (
                            <div className="w-32">
                              <AppSelect
                                isBgWhite
                                options={ROLE_OPTIONS}
                                value={member.role}
                                onChange={(e) =>
                                  handleRoleChange(member, e.target.value as AgentGroupRole)
                                }
                                disabled={roleMutation.isPending}
                              />
                            </div>
                          ) : (
                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold capitalize text-gray-600">
                              {member.role}
                            </span>
                          )}
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => setRemoveTarget(member)}
                              className="text-gray-300 hover:text-red-500"
                              aria-label={`Remove ${member.fullname}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmationPopup
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleConfirmRemove}
        title="Remove member"
        description={`Remove ${removeTarget?.fullname ?? "this member"} from the group? They will keep their account but lose this team membership.`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        isLoading={removeMutation.isPending}
      />
    </>
  );
}
