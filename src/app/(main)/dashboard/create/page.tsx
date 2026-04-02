"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createInvite } from "@/lib/firestore/invites";
import { addGifts, type GiftInput } from "@/lib/firestore/gifts";
import {
  InviteForm,
  type InviteFormValues,
} from "@/components/invite-creation/invite-form";
import {
  TemplatePicker,
  type TemplateType,
} from "@/components/invite-creation/template-picker";
import { GiftAdder } from "@/components/invite-creation/gift-adder";
import { buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, PartyPopper } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Step = "details" | "template" | "gifts";

export default function CreateInvitePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [submitting, setSubmitting] = useState(false);

  const [formValues, setFormValues] = useState<InviteFormValues>({
    location: "",
    dateTime: "",
    heading: "",
    hostName: "",
  });
  const [template, setTemplate] = useState<TemplateType | null>(null);
  const [gifts, setGifts] = useState<GiftInput[]>([]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/");
  }, [user, authLoading, router]);

  async function handleCreate() {
    /* v8 ignore next -- template is always set before Gift step submits */
    if (!user || !template) return;
    setSubmitting(true);
    try {
      const inviteId = await createInvite(user.uid, {
        location: formValues.location,
        dateTime: new Date(formValues.dateTime),
        heading: formValues.heading,
        hostName: formValues.hostName,
        templateType: template,
      });

      if (gifts.length > 0) {
        await addGifts(inviteId, gifts);
      }

      toast.success("Invite created! Share the link with your guests.");
      router.push("/dashboard");
    } catch (err) {
      toast.error("Failed to create invite. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return null;

  const stepIndex = step === "details" ? 0 : step === "template" ? 1 : 2;

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-4 px-4">
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-primary" />
            <span className="font-heading font-bold">Create Invite</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-2">
          {["Details", "Template", "Gifts"].map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  i <= stepIndex
                    ? "party-gradient text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-sm font-medium hidden sm:block ${
                  i <= stepIndex ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
              {i < 2 && (
                <div
                  className={`flex-1 h-0.5 rounded ${
                    i < stepIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === "details" && (
              <InviteForm
                values={formValues}
                onChange={setFormValues}
                onNext={() => setStep("template")}
              />
            )}
            {step === "template" && (
              <TemplatePicker
                selected={template}
                onSelect={setTemplate}
                onNext={() => setStep("gifts")}
                onBack={() => setStep("details")}
              />
            )}
            {step === "gifts" && (
              <GiftAdder
                gifts={gifts}
                onGiftsChange={setGifts}
                onSubmit={handleCreate}
                onBack={() => setStep("template")}
                submitting={submitting}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
