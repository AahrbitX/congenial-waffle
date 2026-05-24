"use client";

import { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Button } from "@/components/ui/Button";
import {
  IconX,
  IconStar,
  IconAlert,
  IconChevronRight,
  IconCheckCircle,
} from "@/constants/icons";
import { TextArea } from "@heroui/react";

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
const TIP_OPTIONS = [10, 20, 50];

const ratingLabel = (r: number) =>
  ["", "Poor", "Fair", "Good", "Great", "Excellent!"][r] ?? "";
const ratingColor = (r: number) =>
  r >= 4
    ? "text-[var(--color-success)]"
    : r === 3
      ? "text-[var(--color-warning)]"
      : r > 0
        ? "text-[var(--color-danger)]"
        : "text-muted";

function StarPicker({
  value,
  hover,
  onHover,
  onLeave,
  onPick,
  size = 36,
}: {
  value: number;
  hover: number;
  onHover: (v: number) => void;
  onLeave: () => void;
  onPick: (v: number) => void;
  size?: number;
}) {
  return (
    <div className="flex justify-center gap-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          onMouseEnter={() => onHover(s)}
          onMouseLeave={onLeave}
          onClick={() => onPick(s)}
          className="transition-transform hover:scale-110"
        >
          <IconStar
            size={size}
            className={`transition-colors ${(hover || value) >= s ? "text-yellow-400 fill-yellow-400" : "text-[var(--color-border-strong)]"}`}
          />
        </button>
      ))}
    </div>
  );
}

export function RatingModal() {
  const { ratingRide, closeRatingModal } = useDashboard();
  const [driverStars, setDriverStars] = useState(0);
  const [hoverDriver, setHoverDriver] = useState(0);
  const [rideStars, setRideStars] = useState(0);
  const [hoverRide, setHoverRide] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [tip, setTip] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!ratingRide) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-3xl shadow-2xl w-full max-w-md max-h-[90svh] overflow-y-auto">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-14 px-8 gap-3">
            <div className="w-16 h-16 rounded-full bg-[var(--color-success-light)] flex items-center justify-center">
              <IconCheckCircle
                size={32}
                className="text-[var(--color-success)]"
              />
            </div>
            <p className="text-[18px] font-black text-primary">
              Thanks for the feedback!
            </p>
            <p className="text-[13px] text-muted text-center">
              Your rating helps us improve the service.
            </p>
            {driverStars >= 4 && (
              <p className="text-[13px] text-[var(--color-primary)] font-semibold bg-[var(--color-primary-light)] px-4 py-2 rounded-full">
                Glad you had a great ride with {ratingRide.driver}!
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="bg-[var(--color-surface-muted)] px-6 py-5 flex items-start justify-between">
              <div>
                <p className="text-xs text-muted">Rate your ride</p>
                <p className="text-base font-bold text-primary my-0.5">
                  {ratingRide.from} → {ratingRide.to}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {ratingRide.driver !== "—" ? ratingRide.driver : "—"} ·{" "}
                  {ratingRide.date}
                </p>
              </div>
              <button
                onClick={closeRatingModal}
                className="p-1.5 rounded-lg hover:bg-[var(--color-border)]"
              >
                <IconX size={16} />
              </button>
            </div>

            <div className="pt-0 p-4 space-y-5">
              <div>
                <p className="text-sm font-semibold text-center text-primary mb-1">
                  How was your driver?
                </p>
                <p className="text-xs text-muted text-center mb-3">
                  Tap a star to rate
                </p>
                <StarPicker
                  value={driverStars}
                  hover={hoverDriver}
                  onHover={setHoverDriver}
                  onLeave={() => setHoverDriver(0)}
                  onPick={setDriverStars}
                />
                {(hoverDriver || driverStars) > 0 && (
                  <p
                    className={`text-center text-xs font-semibold mt-1 ${ratingColor(hoverDriver || driverStars)}`}
                  >
                    {ratingLabel(hoverDriver || driverStars)}
                  </p>
                )}
              </div>

              <div className="">
                <p className="text-sm font-semibold text-center text-primary mb-3">
                  How was the overall ride?
                </p>
                <StarPicker
                  value={rideStars}
                  hover={hoverRide}
                  onHover={setHoverRide}
                  onLeave={() => setHoverRide(0)}
                  onPick={setRideStars}
                />
              </div>

              {driverStars > 0 && (
                <div>
                  <p className="text-sm font-semibold text-center text-primary mb-2">
                    What stood out?
                  </p>
                  <div className="flex flex-wrap gap-2 items-center justify-center">
                    {TAG_OPTIONS.map((t) => (
                      <button
                        key={t}
                        onClick={() =>
                          setTags((prev) =>
                            prev.includes(t)
                              ? prev.filter((x) => x !== t)
                              : [...prev, t],
                          )
                        }
                        className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition-all ${tags.includes(t) ? "bg-primary text-white border-[var(--color-primary)]" : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-strong)] hover:border-[var(--color-primary)]"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <TextArea
                rows={2}
                variant="secondary"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment (optional)..."
                className="w-full text-sm rounded-xl px-4 py-3 resize-none mb-2"
              />

              <div className="bg-[var(--color-primary-light)] rounded-xl p-4 border border-[var(--color-primary-light)]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-semibold">
                      &#x20b9;
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">
                      Tip your driver
                    </p>
                    <p className="text-xs text-muted">
                      100% goes to{" "}
                      {ratingRide.driver !== "—"
                        ? ratingRide.driver
                        : "the driver"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {TIP_OPTIONS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTip(tip === t ? null : t)}
                      className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold border transition-all ${tip === t ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-strong)] hover:border-[var(--color-primary)]"}`}
                    >
                      &#x20b9;{t}
                    </button>
                  ))}
                  <button
                    onClick={() => setTip(0)}
                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${tip === 0 ? "bg-[var(--color-border)] text-[var(--color-text-secondary)] border-[var(--color-border-strong)]" : "bg-[var(--color-surface)] text-muted border-[var(--color-border-strong)]"}`}
                  >
                    Skip
                  </button>
                </div>
              </div>

              <button className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--color-surface-muted)] rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-warning-light)] hover:border-[var(--color-warning)] transition-colors group text-left">
                <IconAlert
                  size={18}
                  className=" text-warning transition-colors shrink-0"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-warning group-hover:text-warning">
                    Report a safety issue
                  </p>
                  <p className="text-xs text-muted">
                    Something feel unsafe? Let us know.
                  </p>
                </div>
                <IconChevronRight size={14} className="text-muted" />
              </button>

              <div className="flex gap-3 pb-2">
                <Button
                  variant="secondary"
                  fullWidth
                  onPress={closeRatingModal}
                >
                  Skip for now
                </Button>
                <Button
                  fullWidth
                  variant="primary"
                  onPress={() => {
                    setSubmitted(true);
                    setTimeout(closeRatingModal, 2000);
                  }}
                  disabled={driverStars === 0}
                >
                  {driverStars === 0 ? "Rate driver first" : "Submit Rating"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
