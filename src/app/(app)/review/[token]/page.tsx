"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type BookingInfo = {
  bookingUserId: string;
  bookingRef: string;
  customerName: string;
  journeyDate: string;
  journeyTime: string;
  pickupName: string;
  dropName: string;
  driverName: string | null;
};

const TAGS = [
  "Great Driver", "On Time", "Clean Car", "Safe Driving",
  "Friendly", "Smooth Ride", "AC was great", "Professional",
];

function StarRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className="text-xl transition-transform hover:scale-110"
          >
            <span className={(hover || value) >= s ? "text-yellow-400" : "text-[var(--color-border)]"}>★</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m));
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function ReviewFormPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [info, setInfo] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ratingPunctuality, setRatingPunctuality] = useState(0);
  const [ratingCleanliness, setRatingCleanliness] = useState(0);
  const [ratingBehavior, setRatingBehavior] = useState(0);
  const [ratingDriving, setRatingDriving] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/review/${token}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) { setError(res.message ?? "Booking not found"); return; }
        setInfo(res.data);
      })
      .catch(() => setError("Failed to load booking details."))
      .finally(() => setLoading(false));
  }, [token]);

  // Auth + ownership guard — runs once both session and booking info are loaded
  useEffect(() => {
    if (sessionLoading || loading || error) return;
    if (!session?.user) {
      // Not logged in → redirect to login, come back after
      router.replace(`/login?redirect=/review/${token}`);
      return;
    }
    if (info && (session.user as any).id !== info.bookingUserId) {
      router.replace("/");
    }
  }, [sessionLoading, session, loading, info, error, token, router]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const tagComment = selectedTags.length > 0 ? selectedTags.join(", ") + (comment ? ". " + comment : "") : comment;
      const res = await fetch("/api/review/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          rating,
          comment: tagComment || undefined,
          ratingPunctuality: ratingPunctuality || undefined,
          ratingCleanliness: ratingCleanliness || undefined,
          ratingBehavior:    ratingBehavior    || undefined,
          ratingDriving:     ratingDriving     || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) { setSubmitted(true); }
      else { setSubmitError(data.message ?? "Failed to submit review"); }
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="w-7 h-7 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center bg-[var(--color-background)]">
        <div className="w-16 h-16 rounded-3xl bg-[var(--color-danger)]/10 flex items-center justify-center text-3xl">⚠</div>
        <p className="text-lg font-bold text-[var(--color-text-primary)]">Unable to load</p>
        <p className="text-sm text-[var(--color-text-tertiary)]">{error ?? "This review link is invalid or has already been used."}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center bg-[var(--color-background)]">
        <div className="w-20 h-20 rounded-3xl bg-[var(--color-success)]/10 flex items-center justify-center text-4xl">⭐</div>
        <div>
          <p className="text-xl font-black text-[var(--color-text-primary)]">Thank you, {info.customerName.split(" ")[0]}!</p>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-2">Your review helps us improve our service.</p>
        </div>
        <div className="flex gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className={s <= rating ? "text-yellow-400 text-3xl" : "text-[var(--color-border)] text-3xl"}>★</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-primary)] px-5 pt-12 pb-8">
        <p className="text-white/70 text-xs font-medium mb-1">Mohan Cabs — Rate Your Ride</p>
        <p className="text-white font-bold text-xl">#{info.bookingRef}</p>
        <p className="text-white/80 text-sm mt-1">{formatDate(info.journeyDate)} at {formatTime(info.journeyTime)}</p>
      </div>

      <div className="p-5 max-w-md mx-auto space-y-4 pb-24">

        {/* Trip summary */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-stretch gap-3">
            <div className="flex flex-col items-center py-0.5 shrink-0">
              <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-0.5" />
              <div className="flex-1 w-px bg-[var(--color-border)] my-1" />
              <div className="w-2 h-2 rounded-full bg-[var(--color-danger)] mb-0.5" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold">Pick Up</p>
                <p className="text-sm font-bold text-[var(--color-text-primary)]">{info.pickupName}</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold">Drop Off</p>
                <p className="text-sm font-bold text-[var(--color-text-primary)]">{info.dropName}</p>
              </div>
            </div>
          </div>
          {info.driverName && (
            <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold text-sm">
                {info.driverName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)]">Your Driver</p>
                <p className="text-sm font-bold text-[var(--color-text-primary)]">{info.driverName}</p>
              </div>
            </div>
          )}
        </div>

        {/* Main star rating */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4">
          <div className="text-center">
            <p className="text-base font-bold text-[var(--color-text-primary)]">How was your ride?</p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Tap a star to rate</p>
          </div>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-5xl transition-all hover:scale-110 active:scale-95"
              >
                <span className={(hoverRating || rating) >= s ? "text-yellow-400" : "text-[var(--color-border)]"}>★</span>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm font-semibold text-[var(--color-text-secondary)]">
              {["", "Poor", "Fair", "Good", "Great", "Excellent!"][rating]}
            </p>
          )}
        </div>

        {/* Tags */}
        {rating > 0 && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
            <p className="text-sm font-bold text-[var(--color-text-primary)]">What stood out?</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTags((prev) =>
                    prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                  )}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    selectedTags.includes(tag)
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/40"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Aspect ratings */}
        {rating > 0 && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
            <p className="text-sm font-bold text-[var(--color-text-primary)]">Rate specific aspects <span className="text-[var(--color-text-tertiary)] font-normal">(optional)</span></p>
            <StarRow label="Punctuality"  value={ratingPunctuality}  onChange={setRatingPunctuality} />
            <StarRow label="Cleanliness"  value={ratingCleanliness}  onChange={setRatingCleanliness} />
            <StarRow label="Behaviour"    value={ratingBehavior}     onChange={setRatingBehavior} />
            <StarRow label="Driving"      value={ratingDriving}      onChange={setRatingDriving} />
          </div>
        )}

        {/* Comment */}
        {rating > 0 && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-2">
            <p className="text-sm font-bold text-[var(--color-text-primary)]">Add a comment <span className="text-[var(--color-text-tertiary)] font-normal">(optional)</span></p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience…"
              rows={3}
              className="w-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
            />
          </div>
        )}

        {submitError && (
          <p className="text-sm text-[var(--color-danger)] font-medium text-center">{submitError}</p>
        )}
      </div>

      {/* Sticky submit */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--color-background)] border-t border-[var(--color-border)]">
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className={`w-full max-w-md mx-auto flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold transition-all ${
            rating > 0 && !submitting
              ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 active:scale-[0.98]"
              : "bg-[var(--color-surface-muted)] text-[var(--color-text-tertiary)] cursor-not-allowed"
          }`}
        >
          {submitting ? (
            <><span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Submitting…</>
          ) : (
            <>⭐ Submit Review</>
          )}
        </button>
      </div>
    </div>
  );
}
