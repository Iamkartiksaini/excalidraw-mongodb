"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Globe, Lock, Users, Copy, Plus, Trash2, Loader2, AlertCircle, Check, RefreshCw
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateVisibility, inviteEmail, removeEmail, regenerateShareId } from "@/actions/shareActions";
import { cloneNote } from "@/actions/noteActions";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: "note" | "folder";
  initialVisibility: "private" | "public" | "restricted";
  initialInvitedEmails: string[];
  shareId?: string;
  folderId?: string; // Applicable for notes to check folder supremacy
  onUpdate?: (visibility: "private" | "public" | "restricted", invitedEmails: string[]) => void; // Triggered when updates occur to refetch/update parent view
}

export default function ShareDialog({
  isOpen,
  onClose,
  entityId,
  entityType,
  initialVisibility,
  initialInvitedEmails,
  shareId,
  folderId,
  onUpdate
}: ShareDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local state
  const [visibility, setVisibility] = useState<"private" | "public" | "restricted">(initialVisibility);
  const [invitedEmails, setInvitedEmails] = useState<string[]>(initialInvitedEmails);
  const [newEmail, setNewEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [currentShareId, setCurrentShareId] = useState(shareId);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Sync state with props on mount or change
  useEffect(() => {
    setVisibility(initialVisibility);
    setInvitedEmails(initialInvitedEmails);
    setCurrentShareId(shareId);
  }, [initialVisibility, initialInvitedEmails, shareId]);

  // Construct sharing URL
  const shareLink = typeof window !== "undefined" && currentShareId
    ? `${window.location.origin}/share/${entityType === "note" ? "note/" : ""}${currentShareId}`
    : "";

  const handleCopyLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Share link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVisibilityChange = (value: string) => {
    const nextVis = value as "private" | "public" | "restricted";

    startTransition(async () => {
      try {
        const updated = await updateVisibility(entityId, entityType, nextVis);
        setVisibility(nextVis);
        setCurrentShareId(updated.shareId);
        toast.success(`Access updated to ${nextVis}`);
        onUpdate?.(nextVis, invitedEmails);
      } catch (err: any) {
        toast.error(err.message || "Failed to update visibility");
      }
    });
  };

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleRegenerateLink = () => {
    setShowConfirmDialog(true);
  };

  const executeRegeneration = async () => {
    setShowConfirmDialog(false);
    setIsRegenerating(true);
    try {
      const res = await regenerateShareId(entityId, entityType);
      setCurrentShareId(res.shareId);
      toast.success("Sharing link regenerated successfully!");
      onUpdate?.(visibility, invitedEmails);
    } catch (err: any) {
      toast.error(err.message || "Failed to regenerate sharing link");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const emailToInvite = newEmail.trim().toLowerCase();

    if (!emailToInvite) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (invitedEmails.includes(emailToInvite)) {
      toast.info("User already invited");
      return;
    }

    startTransition(async () => {
      try {
        await inviteEmail(entityId, entityType, emailToInvite);
        const updatedList = [...invitedEmails, emailToInvite];
        setInvitedEmails(updatedList);
        setNewEmail("");
        toast.success(`${emailToInvite} added to invited users`);
        onUpdate?.(visibility, updatedList);
      } catch (err: any) {
        toast.error(err.message || "Failed to invite user");
      }
    });
  };

  const handleRemoveInvite = (emailToRemove: string) => {
    startTransition(async () => {
      try {
        await removeEmail(entityId, entityType, emailToRemove);
        const updatedList = invitedEmails.filter(e => e !== emailToRemove);
        setInvitedEmails(updatedList);
        toast.success(`Access revoked for ${emailToRemove}`);
        onUpdate?.(visibility, updatedList);
      } catch (err: any) {
        toast.error(err.message || "Failed to remove invited user");
      }
    });
  };

  const handleCloneAndShare = () => {
    if (entityType !== "note") return;

    startTransition(async () => {
      try {
        const cloned = await cloneNote(entityId);
        toast.success("Note cloned successfully without folder restrictions!");
        onClose();
        // Redirect to new cloned note's editor and present share settings
        router.push(`/notes/${cloned._id}?share=1`);
      } catch (err: any) {
        toast.error(err.message || "Failed to clone note");
      }
    });
  };

  // If the note belongs to a folder, show the "Clone & Share" screen
  const isManagedByFolder = entityType === "note" && folderId;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl border-2 border-[#e9ecef] shadow-xl font-sans" onClick={(e) => e.stopPropagation()}>
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-[#1e1e1e] flex items-center gap-2">
            <span>Share {entityType === "note" ? "Note" : "Folder"}</span>
          </DialogTitle>
        </DialogHeader>

        {isManagedByFolder ? (
          <div className="flex flex-col gap-5 py-4">
            <div className="flex gap-3 bg-[#f3f0ff] border border-[#d3c9fc] rounded-xl p-4 text-[#4c48b2]">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-bold mb-1">Access managed by folder</p>
                <p>This note belongs to a folder. It automatically inherits all sharing rules, visibility levels, and invite lists configured for that folder.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <p className="text-xs text-[#868e96] leading-relaxed">
                To share this specific note independently with different access rules, you can create a copy detached from this folder.
              </p>
              <Button
                onClick={handleCloneAndShare}
                disabled={isPending}
                className="w-full bg-[#6965db] hover:bg-[#5854c4] text-white flex items-center justify-center gap-2 py-5 rounded-xl font-semibold transition-all hover:scale-[1.01]"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                Clone and Share note
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full">
            <Tabs value={visibility} onValueChange={handleVisibilityChange} className="w-full">
              <TabsList className="flex gap-2 justify-evenly w-full bg-[#f8f9fa] border border-[#e9ecef] rounded-xl p-1">
                <TabsTrigger value="private" disabled={isPending} className="rounded-lg flex items-center gap-1.5 py-2 font-semibold">
                  <Lock className="w-3.5 h-3.5" /> Private
                </TabsTrigger>
                <TabsTrigger value="public" disabled={isPending} className="rounded-lg flex items-center gap-1.5 py-2 font-semibold">
                  <Globe className="w-3.5 h-3.5" /> Public
                </TabsTrigger>
                <TabsTrigger value="restricted" disabled={isPending} className="rounded-lg flex items-center gap-1.5 py-2 font-semibold">
                  <Users className="w-3.5 h-3.5" /> Invite
                </TabsTrigger>
              </TabsList>

              {/* Private Tab Content */}
              <TabsContent value="private" className="mt-0">
                <div className="flex flex-col items-center justify-center py-6 px-4 border border-dashed border-[#e9ecef] bg-[#fdfdfd] rounded-2xl gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#fff5f5] flex items-center justify-center text-[#ff8787]">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1e1e1e] text-sm mb-1">Strictly Private</h4>
                    <p className="text-xs text-[#868e96] max-w-[280px] leading-relaxed">
                      Only you have access to this {entityType}. Anyone else attempting to view it will receive an Unauthorized error.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Public Tab Content */}
              <TabsContent value="public" className="mt-0 flex flex-col gap-4">
                <div className="flex flex-col items-center justify-center py-5 px-4 border border-dashed border-[#e9ecef] bg-[#f8f9fa] rounded-2xl gap-3 text-center mb-1">
                  <div className="w-12 h-12 rounded-full bg-[#f3f0ff] flex items-center justify-center text-[#6965db]">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1e1e1e] text-sm mb-1">Public Sharing is Enabled</h4>
                    <p className="text-xs text-[#868e96] max-w-[280px] leading-relaxed">
                      Anyone on the internet with the link below can view this {entityType}.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Invite Tab Content */}
              <TabsContent value="restricted" className="mt-0 flex flex-col gap-4">
                <form onSubmit={handleInvite} className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#495057]">Add people by email</label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      disabled={isPending}
                      className="border-2 border-[#e9ecef] rounded-xl focus-visible:ring-0 focus-visible:border-[#6965db] text-xs py-5"
                    />
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="bg-[#6965db] hover:bg-[#5854c4] text-white shrink-0 px-4 h-auto rounded-xl flex items-center gap-1 font-semibold transition-all"
                    >
                      {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> Invite
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-[#495057]">Invited Users ({invitedEmails.length})</span>
                  {invitedEmails.length === 0 ? (
                    <p className="text-xs text-[#868e96] italic bg-[#f8f9fa] p-4 rounded-xl text-center border border-dashed border-[#e9ecef]">
                      No one has been invited yet.
                    </p>
                  ) : (
                    <div className="max-h-[160px] overflow-y-auto border border-[#e9ecef] rounded-xl divide-y divide-[#e9ecef] bg-[#fdfdfd] pr-1">
                      {invitedEmails.map((email) => (
                        <div key={email} className="flex items-center justify-between p-2.5 pl-3 group/item">
                          <span className="text-xs text-[#495057] font-medium truncate">{email}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveInvite(email)}
                            disabled={isPending}
                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg opacity-80 hover:opacity-100 transition-all shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {visibility !== "private" && currentShareId && (
              <div className="flex flex-col gap-1.5 pt-4 border-t border-[#e9ecef] mt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#495057]">
                    {visibility === "restricted" ? "Restricted Sharing Link (Invited users only)" : "Public Sharing Link"}
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleRegenerateLink}
                    disabled={isRegenerating || isPending}
                    className="text-[10px] text-[#6965db] hover:text-[#5854c4] flex items-center gap-1 h-auto p-1 font-semibold hover:bg-transparent"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                    Regenerate link
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={shareLink}
                    readOnly
                    className="bg-[#f8f9fa] border-2 border-[#e9ecef] rounded-xl focus-visible:ring-0 focus-visible:border-[#6965db] text-xs py-5"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="border-2 border-[#e9ecef] hover:border-[#6965db] hover:bg-[#f3f0ff] hover:text-[#6965db] shrink-0 p-3 h-auto rounded-xl transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[400px] p-6 rounded-2xl border-2 border-[#e9ecef] shadow-xl font-sans" onClick={(e) => e.stopPropagation()}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-bold text-[#1e1e1e] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>Regenerate Sharing Link?</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-5">
            <p className="text-xs text-[#868e96] leading-relaxed">
              Are you sure you want to regenerate the sharing link? Any previous links will be <strong>permanently broken</strong>, and anyone currently accessing this {entityType} using the old link will lose access immediately.
            </p>
            <div className="flex justify-end gap-3 mt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                className="border-2 border-[#e9ecef] rounded-xl text-xs py-3 px-4 font-semibold hover:bg-[#f8f9fa] hover:text-[#495057]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={executeRegeneration}
                className="bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs py-3 px-4 font-semibold flex items-center gap-1.5 transition-all hover:scale-[1.01]"
              >
                Regenerate Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
