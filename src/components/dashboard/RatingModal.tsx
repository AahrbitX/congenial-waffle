"use client";

import { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { useSubmitReview } from "@/hooks/useRides";
import { Button } from "@heroui/react";
import {
  IconStar,
  IconCheckCircle,
  IconX,
  IconMapPin,
  IconCar,
  IconLoader,
  IconClock,
  IconSparkles,
  IconSmile,
} from "@/constants/icons";

const ASPECTS = [
  { key: "punctuality" as const, label: "Punctuality", icon: IconClock    },
  { key: "cleanliness" as const, label: "Cleanliness", icon: IconSparkles },
  { key: "behavior"    as const, label: "Behavior",    icon: IconSmile    },
  { key: "driving"     as const, label: "Driving",     icon: IconCar      },
] as const;

type AspectKey = (typeof ASPECTS)[number]["key"];

const ASPECT_LABEL = ["", "Poor", "Fair", "Good", "Great", "Excellent!"];

const TAG_OPTIONS = [
  "Great Driver",
  "On Time",
  "Clean Car",
  "Safe Driving",
  "Friendly",
  "Smooth Ride",
  "AC was great",
  "Professional",
];

const RATING_LABEL = ["", "Poor", "Fair", "Good", "Great", "Excellent!"];

function formatJourneyDate(journeyDate: string, journeyTime: string) {
  try {
    const [year, month, day] = journeyDate.split("-").map(Number);
    const [hour, minute]     = journeyTime.split(":").map(Number);
    const d = new Date(year, month - 1, day, hour, minute);
    return d.toLocaleDateString("en-IN", {
      day:    "numeric",
      month:  "short",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
    });
  } catch {
    return journeyDate;
  }
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(s)}
            className="transition-transform hover:scale-110 active:scale-95 focus:outline-none p-1"
          >
            <IconStar
              size={40}
              className={`transition-colors ${
                active >= s
                  ? "text-warning fill-warning"
                  : "text-default-200"
              }`}
            />
          </button>
        ))}
      </div>
      <p
        className={`text-sm font-bold min-h-[20px] transition-all ${
          active >= 4
            ? "text-success"
            : active === 3
            ? "text-warning"
            : active > 0
            ? "text-danger"
            : "text-transparent"
        }`}
      >
        {RATING_LABEL[active] ?? ""}
      </p>
    </div>
  );
}

function MiniStarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
        >
          <IconStar
            size={22}
            className={`transition-colors ${
              active >= s ? "text-warning fill-warning" : "text-default-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function RatingModal() {
  const { ratingRide, closeRatingModal } = useDashboard();
  const submitReview = useSubmitReview();

  const [stars, setStars]         = useState(0);
  const [aspects, setAspects]     = useState<Record<AspectKey, number>>({
    punctuality: 0,
    cleanliness: 0,
    behavior:    0,
    driving:     0,
  });
  const [tags, setTags]           = useState<string[]>([]);
  const [comment, setComment]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  const setAspect = (key: AspectKey, value: number) =>
    setAspects((prev) => ({ ...prev, [key]: value }));

  if (!ratingRide) return null;

  const handleSubmit = async () => {
    if (!ratingRide || stars === 0) return;
    const tagStr      = tags.length > 0 ? tags.join(", ") : "";
    const fullComment = [tagStr, comment.trim()].filter(Boolean).join(". ") || undefined;

    await submitReview.mutateAsync({
      bookingId:         ratingRide.id,
      rating:            stars,
      comment:           fullComment,
      ratingPunctuality: aspects.punctuality || undefined,
      ratingCleanliness: aspects.cleanliness || undefined,
      ratingBehavior:    aspects.behavior    || undefined,
      ratingDriving:     aspects.driving     || undefined,
    });

    setSubmitted(true);
    setTimeout(closeRatingModal, 2500);
  };

  const toggleTag = (tag: string) =>
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag],
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) closeRatingModal(); }}
    >
      <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">

        {submitted ? (
          /* ── Success ── */
          <div className="flex flex-col items-center justify-center py-12 px-8 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <IconCheckCircle size={34} className="text-success" />
            </div>
            <div>
              <p className="text-lg font-black text-foreground">Thanks for the feedback!</p>
              <p className="text-sm text-default-400 mt-1">
                Your rating helps us improve the service.
              </p>
            </div>
            {stars >= 4 && (
              <p className="text-sm text-primary font-semibold bg-primary/10 px-4 py-2 rounded-full">
                Glad you had a great ride
                {ratingRide.driver !== "—" ? ` with ${ratingRide.driver}` : ""}!
              </p>
            )}
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-divider">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-default-400 font-semibold uppercase tracking-wider mb-1">
                  Rate your ride
                </p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground truncate">
                  <IconMapPin size={13} className="text-primary shrink-0" />
                  <span className="truncate">{ratingRide.from}</span>
                  <span className="text-default-400 shrink-0 text-xs">→</span>
                  <span className="truncate">{ratingRide.to}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <IconCar size={12} className="text-default-400 shrink-0" />
                  <p className="text-xs text-default-400">
                    {ratingRide.driver !== "—" ? ratingRide.driver : "Driver"}
                    {" · "}
                    {formatJourneyDate(ratingRide.journeyDate, ratingRide.journeyTime)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => closeRatingModal()}
                className="p-1.5 rounded-lg hover:bg-default-100 text-default-400 ml-3 shrink-0"
              >
                <IconX size={16} />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[70svh] overflow-y-auto">

              {/* ── Stars ── */}
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm font-semibold text-default-700 mb-1">
                  How was your driver?
                </p>
                <StarPicker value={stars} onChange={setStars} />
              </div>

              {/* ── Aspect ratings ── */}
              {stars > 0 && (
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-4 py-3 space-y-3">
                  <p className="text-xs font-semibold text-default-500 uppercase tracking-wide">
                    Rate each aspect{" "}
                    <span className="normal-case font-normal">(optional)</span>
                  </p>
                  {ASPECTS.map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 w-28 shrink-0">
                        <Icon size={14} className="text-default-400 shrink-0" />
                        <span className="text-sm font-medium text-foreground">{label}</span>
                      </div>
                      <MiniStarPicker
                        value={aspects[key]}
                        onChange={(v) => setAspect(key, v)}
                      />
                      <span className={`text-xs font-bold w-16 text-right shrink-0 ${
                        aspects[key] >= 4 ? "text-success"
                          : aspects[key] === 3 ? "text-warning"
                          : aspects[key] > 0 ? "text-danger"
                          : "text-transparent"
                      }`}>
                        {ASPECT_LABEL[aspects[key]] ?? ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Tags ── */}
              {stars > 0 && (
                <div>
                  <p className="text-xs font-semibold text-default-500 uppercase tracking-wide mb-2">
                    What stood out?{" "}
                    <span className="normal-case font-normal">(optional)</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {TAG_OPTIONS.map((tag) => {
                      const selected = tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors select-none
                            ${selected
                              ? "bg-primary text-white border-primary"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-primary hover:text-primary"
                            }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Comment ── */}
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment (optional)..."
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-none focus:outline-none focus:border-primary transition-colors"
              />

              {/* ── Actions ── */}
              <div className="flex gap-3 pb-1">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onPress={() => closeRatingModal()}
                >
                  Skip
                </Button>
                <button
                  onClick={handleSubmit}
                  disabled={stars === 0 || submitReview.isPending}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                    stars === 0 || submitReview.isPending
                      ? "bg-primary/40 text-white cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  {submitReview.isPending ? (
                    <><IconLoader size={14} className="animate-spin" /> Submitting…</>
                  ) : stars === 0 ? (
                    "Select a rating"
                  ) : (
                    "Submit Rating"
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
