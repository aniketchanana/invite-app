"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { claimGifts, getAvailableGifts, type Gift } from "@/lib/firestore/gifts";
import { createRSVP } from "@/lib/firestore/rsvps";
import { cn } from "@/lib/utils";
import { Loader2, Minus, PartyPopper, Plus, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GiftSelector } from "./gift-selector";

export function RsvpDialog({
  inviteId,
  open,
  onOpenChange,
}: {
  inviteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loadingGifts, setLoadingGifts] = useState(true);
  const [selectedGiftIds, setSelectedGiftIds] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [pax, setPax] = useState(1);
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingGifts(true);
    getAvailableGifts(inviteId).then((g) => {
      setGifts(g);
      setLoadingGifts(false);
    });
  }, [inviteId, open]);

  function toggleGift(id: string) {
    setSelectedGiftIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    try {
      if (selectedGiftIds.length > 0) {
        const claimName = anonymous ? "Anonymous" : name.trim();
        await claimGifts(inviteId, selectedGiftIds, claimName);
      }

      await createRSVP(inviteId, name.trim(), pax);
      setSubmitted(true);
      toast.success("RSVP submitted! See you at the party!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      if (message.includes("already claimed")) {
        toast.error("One or more gifts were just claimed. Please re-select.");
        const fresh = await getAvailableGifts(inviteId);
        setGifts(fresh);
        setSelectedGiftIds([]);
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    onOpenChange(false);
    if (submitted) {
      setName("");
      setPax(1);
      setAnonymous(false);
      setSelectedGiftIds([]);
      setSubmitted(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex flex-col gap-0 overflow-x-hidden",
          // Mobile: nearly full viewport — fewer scroll surprises; inner region scrolls, not nested gift box
          submitted
            ? "overflow-y-auto"
            : "max-sm:overflow-hidden sm:overflow-y-auto",
          // Mobile-first: bottom sheet, edge-to-edge
          "max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:translate-x-0 max-sm:translate-y-0",
          "max-sm:w-full max-sm:max-w-none max-sm:rounded-t-3xl max-sm:rounded-b-none",
          "max-sm:border-x-0 max-sm:border-b-0",
          !submitted &&
            "max-sm:min-h-[min(92dvh,900px)] max-sm:max-h-[96dvh]",
          "max-sm:pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] max-sm:pt-3",
          "max-sm:shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.14)]",
          "max-sm:data-open:slide-in-from-bottom-8 max-sm:data-closed:slide-out-to-bottom-8",
          "sm:max-w-lg",
          "max-h-[min(90vh,800px)]",
          "p-5 sm:p-6",
        )}
      >
        <DialogClose
          render={
            <Button
              variant="ghost"
              size="icon-lg"
              className="absolute top-2 right-2 z-20 size-11 rounded-[min(var(--radius-md),12px)] sm:top-2 sm:right-2 sm:size-9"
            />
          }
        >
          <XIcon className="size-5 sm:size-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        {submitted ? (
          <div className="flex flex-col items-center py-6 text-center sm:py-8">
            <PartyPopper className="mb-4 h-16 w-16 text-primary sm:h-20 sm:w-20" />
            <DialogTitle className="font-heading mb-2 text-2xl font-bold sm:text-3xl">
              You&apos;re In!
            </DialogTitle>
            <p className="max-w-sm text-base text-muted-foreground sm:text-lg">
              Thanks for RSVPing. We can&apos;t wait to see you!
            </p>
            <Button
              className="mt-8 min-h-11 w-full max-w-xs party-gradient text-base font-semibold text-white sm:mt-6"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col max-sm:min-h-0">
            <DialogHeader className="shrink-0 gap-1.5 space-y-0 pb-1 text-left sm:pb-0">
              <DialogTitle className="font-heading text-2xl font-bold tracking-tight sm:text-xl">
                RSVP
              </DialogTitle>
              <DialogDescription className="text-base sm:text-sm">
                Let the host know you&apos;re coming!
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              className="mt-4 flex min-h-0 flex-1 flex-col sm:mt-2"
            >
              <div
                className={cn(
                  "min-h-0 space-y-6 sm:space-y-5",
                  "max-sm:flex-1 max-sm:space-y-4 max-sm:overflow-y-auto max-sm:overscroll-contain max-sm:pr-0.5",
                )}
              >
                {/* Gift selection */}
                {loadingGifts ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  gifts.length > 0 && (
                    <>
                      <GiftSelector
                        gifts={gifts}
                        selectedIds={selectedGiftIds}
                        onToggle={toggleGift}
                      />
                      <Separator />
                    </>
                  )
                )}

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="guest-name" className="text-base sm:text-sm">
                    Your Name
                  </Label>
                  <Input
                    id="guest-name"
                    placeholder="Enter your name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="min-h-11 px-3 text-base sm:min-h-8 sm:px-2.5 sm:text-sm"
                  />
                </div>

                {/* Anonymous checkbox */}
                {selectedGiftIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="anonymous"
                      checked={anonymous}
                      onCheckedChange={(c) => setAnonymous(c === true)}
                    />
                    <Label htmlFor="anonymous" className="text-base font-normal sm:text-sm">
                      Keep my name anonymous for the gift (surprise!)
                    </Label>
                  </div>
                )}

                {/* Pax */}
                <div className="space-y-3">
                  <Label className="text-base sm:text-sm">
                    Number of Guests (including you)
                  </Label>
                  <div className="flex items-center justify-center gap-6 sm:gap-4">
                    <button
                      type="button"
                      aria-label="Decrease guest count"
                      onClick={() => setPax(Math.max(1, pax - 1))}
                      disabled={pax <= 1}
                      className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-30 sm:h-10 sm:w-10"
                    >
                      <Minus className="h-6 w-6 sm:h-5 sm:w-5" />
                    </button>
                    <span className="min-w-12 text-center text-3xl font-bold tabular-nums sm:text-2xl">
                      {pax}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase guest count"
                      onClick={() => setPax(Math.min(20, pax + 1))}
                      disabled={pax >= 20}
                      className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-30 sm:h-10 sm:w-10"
                    >
                      <Plus className="h-6 w-6 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting || !name.trim()}
                className="mt-6 min-h-12 w-full shrink-0 text-base font-semibold party-gradient text-white max-sm:mt-4 sm:min-h-9 sm:text-sm"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Submit RSVP"
                )}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
