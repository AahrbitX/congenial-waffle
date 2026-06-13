"use client";

import { useEffect, useState } from "react";
import {
  IconCheckCircle,
  IconMapPin,
  IconStar,
  IconCar,
  IconLoader,
  IconClock,
  IconSparkles,
  IconSmile,
} from "@/constants/icons";
import { useDashboard } from "@/context/DashboardContext";
import { useSubmitReview } from "@/hooks/useRides";
import { Drawer, Modal, Button, Chip, TextArea } from "@heroui/react";

const ASPECTS = [
  { key: "punctuality" as const, label: "Punctuality", icon: IconClock    },
  { key: "cleanliness" as const, label: "Cleanliness", icon: IconSparkles },
  { key: "behavior"    as const, label: "Behavior",    icon: IconSmile    },
  { key: "driving"     as const, label: "Driving",     icon: IconCar      },
] as const;

type AspectKey = (typeof ASPECTS)[number]["key"];

const RATING_LABEL = ["", "Poor", "Fair", "Good", "Great", "Excellent!"];

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

function formatJourneyDate(journeyDate: string, journeyTime: string) {
  try {
    const [year, month, day] = journeyDate.split("-").map(Number);
    const [hour, minute] = journeyTime.split(":").map(Number);
    const d = new Date(year, month - 1, day, hour, minute);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
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
              className={`transition-colors ${active >= s ? "text-warning fill-warning" : "text-default-200"}`}
            />
          </button>
        ))}
      </div>
      <p
        className={`text-sm font-bold min-h-[20px] transition-all ${active >= 4 ? "text-success" : active === 3 ? "text-warning" : active > 0 ? "text-danger" : "text-transparent"}`}
      >
        {RATING_LABEL[active] ?? ""}{" "}
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

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);


  const setAspect = (key: AspectKey, value: number) =>
    setAspects((prev) => ({ ...prev, [key]: value }));

  if (!ratingRide) return null;

  const handleSubmit = async () => {
    if (stars === 0) return;

    const tagStr = tags.length > 0 ? tags.join(", ") : "";
    const fullComment =
      [tagStr, comment.trim()].filter(Boolean).join(". ") || undefined;

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

    setTimeout(() => {
      setSubmitted(false);
      setStars(0);
      setTags([]);
      setComment("");
      closeRatingModal();
    }, 2500);
  };

  const toggleTag = (tag: string) =>
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag],
    );

  const sheetContent = (
    <div className="w-full flex flex-col max-h-[90vh]">
      {submitted ? (
        <div className="flex flex-col items-center justify-center py-12 px-8 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <IconCheckCircle size={34} className="text-success" />
          </div>
          <p className="text-lg font-black">Thanks for the feedback!</p>
          <p className="text-sm text-default-400">
            Your rating helps us improve the service.
          </p>
          {stars >= 4 && (
            <p className="text-sm text-primary font-semibold bg-primary/10 px-4 py-2 rounded-full">
              Glad you had a great ride
              {ratingRide.driver !== "—" ? ` with ${ratingRide.driver}` : ""}!
            </p>
          )}
        </div>
      ) : (
        <>
          <Modal.Header className="px-5 py-4">
            <div className="flex flex-col w-full">
              <p className="text-[11px] text-default-400 font-semibold uppercase tracking-wider">
                Rate your ride
              </p>
              <div className="flex items-center gap-1.5 text-sm font-semibold mt-2">
                <IconMapPin size={13} className="text-primary shrink-0" />
                <span className="truncate">{ratingRide.from}</span>
                <span className="text-default-400">→</span>
                <span className="truncate">{ratingRide.to}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <IconCar size={12} className="text-default-400" />
                <span className="text-xs text-default-400">
                  {ratingRide.driver !== "—" ? ratingRide.driver : "Driver"}
                  {" · "}
                  {formatJourneyDate(ratingRide.journeyDate, ratingRide.journeyTime)}
                </span>
              </div>
            </div>
          </Modal.Header>

          <Modal.Body className="overflow-y-auto flex-1 px-5 py-2">
            <div className="space-y-4 mt-4">
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm font-semibold">How was your driver?</p>
                <StarPicker value={stars} onChange={setStars} />
              </div>

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
                        {RATING_LABEL[aspects[key]] ?? ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {stars > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">What stood out?</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TAG_OPTIONS.map((tag) => (
                      <Chip
                        key={tag}
                        variant={tags.includes(tag) ? "primary" : "soft"}
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-1">
                <TextArea
                  rows={3}
                  fullWidth
                  value={comment}
                  variant="secondary"
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment (optional)..."
                />
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer className="px-5 pb-6 pt-3">
            <Button variant="secondary" onPress={closeRatingModal}>
              Skip
            </Button>
            <Button
              onPress={handleSubmit}
              isDisabled={stars === 0 || submitReview.isPending}
            >
              {submitReview.isPending ? (
                <>
                  <IconLoader size={14} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Rating"
              )}
            </Button>
          </Modal.Footer>
        </>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        isOpen={!!ratingRide}
        onOpenChange={(open) => { if (!open) closeRatingModal(); }}
      >
        <Drawer.Backdrop className="bg-black/40 backdrop-blur-sm">
          <Drawer.Content placement="bottom">
            <Drawer.Dialog className="p-0 pt-2">
              <Drawer.Handle />
              {sheetContent}
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    );
  }

  return (
    <Modal
      isOpen={!!ratingRide}
      onOpenChange={(open) => { if (!open) closeRatingModal(); }}
    >
      <Modal.Backdrop className="bg-black/40 backdrop-blur-sm">
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            {sheetContent}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
