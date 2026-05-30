import {
  IconCar,
  IconCheckCircle,
  IconLoader,
  IconMapPin,
  IconStar,
} from "@/constants/icons";
import { useDashboard } from "@/context/DashboardContext";
import { useSubmitReview } from "@/hooks/useRides";
import { Modal, Button, Chip, TextArea } from "@heroui/react";
import { useState } from "react";

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

const RATING_LABEL = ["", "Poor", "Fair", "Good", "Great", "Excellent!"];

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

export function RatingModal() {
  const { ratingRide, closeRatingModal } = useDashboard();
  const submitReview = useSubmitReview();

  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!ratingRide) return null;

  const handleSubmit = async () => {
    if (stars === 0) return;

    const tagStr = tags.length > 0 ? tags.join(", ") : "";
    const fullComment =
      [tagStr, comment.trim()].filter(Boolean).join(". ") || undefined;

    await submitReview.mutateAsync({
      bookingId: ratingRide.id,
      rating: stars,
      comment: fullComment,
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

  return (
    <Modal
      isOpen={!!ratingRide}
      onOpenChange={(open) => {
        if (!open) {
          closeRatingModal();
        }
      }}
    >
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 px-8 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                  <IconCheckCircle size={34} className="text-success" />
                </div>

                <div>
                  <p className="text-lg font-black">Thanks for the feedback!</p>

                  <p className="text-sm text-default-400 mt-1">
                    Your rating helps us improve the service.
                  </p>
                </div>

                {stars >= 4 && (
                  <p className="text-sm text-primary font-semibold bg-primary/10 px-4 py-2 rounded-full">
                    Glad you had a great ride
                    {ratingRide.driver !== "—"
                      ? ` with ${ratingRide.driver}`
                      : ""}
                    !
                  </p>
                )}
              </div>
            ) : (
              <>
                <Modal.Header>
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
                        {ratingRide.driver !== "—"
                          ? ratingRide.driver
                          : "Driver"}
                        {" · "}
                        {formatJourneyDate(
                          ratingRide.journeyDate,
                          ratingRide.journeyTime,
                        )}
                      </span>
                    </div>
                  </div>
                </Modal.Header>

                <Modal.Body>
                  <div className="space-y-4 mt-4">
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-sm font-semibold">
                        How was your driver?
                      </p>

                      <StarPicker value={stars} onChange={setStars} />
                    </div>

                    {stars > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-2">
                          What stood out?
                        </p>

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
                    <div className="px-1 ">
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

                <Modal.Footer>
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
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
