"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Chip,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  Skeleton,
  Switch,
  toast,
  Tooltip,
} from "@heroui/react";
import type { FleetCategory } from "@/types/fleet.types";
import {
  useFleet,
  useCreateFleetVehicle,
  useUpdateFleetVehicle,
  useDeleteFleetVehicle,
} from "@/hooks/useFleet";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconX,
  IconCar,
  IconLoader,
} from "@/constants/icons";
import Image from "next/image";
import { BsQuestionCircle } from "react-icons/bs";
import { Snowflake } from "lucide-react";

type CarCategory = Exclude<FleetCategory, "All">;
const CATEGORIES: CarCategory[] = [
  "Hatchback",
  "Sedan",
  "MUV",
  "Luxury",
  "Traveller",
];

const CAT_BG: Record<string, string> = {
  Hatchback: "bg-blue-50   dark:bg-blue-950/30",
  Sedan: "bg-violet-50 dark:bg-violet-950/30",
  MUV: "bg-amber-50  dark:bg-amber-950/30",
  Luxury: "bg-yellow-50 dark:bg-yellow-950/30",
  Traveller: "bg-teal-50   dark:bg-teal-950/30",
};
const CAT_ICON: Record<string, string> = {
  Hatchback: "text-blue-400",
  Sedan: "text-violet-400",
  MUV: "text-amber-400",
  Luxury: "text-yellow-500",
  Traveller: "text-teal-400",
};
const CAT_PILL: Record<string, string> = {
  Hatchback:
    "bg-blue-100/90   text-blue-700   dark:bg-blue-900/70   dark:text-blue-300",
  Sedan:
    "bg-violet-100/90 text-violet-700 dark:bg-violet-900/70 dark:text-violet-300",
  MUV: "bg-amber-100/90  text-amber-700  dark:bg-amber-900/70  dark:text-amber-300",
  Luxury:
    "bg-yellow-100/90 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-300",
  Traveller:
    "bg-teal-100/90   text-teal-700   dark:bg-teal-900/70   dark:text-teal-300",
};

interface FormState {
  name: string;
  tagline: string;
  category: string;
  image: string;
  seats: number;
  bags: number;
  ac: boolean;
  fuel: string;
  features: string[];
  priceFrom: string;
}

const BLANK: FormState = {
  name: "",
  tagline: "",
  category: "Sedan",
  image: "",
  seats: 4,
  bags: 3,
  ac: true,
  fuel: "",
  features: [],
  priceFrom: "",
};

/* ── Skeleton ──────────────────────────────────────────────────────────────── */
function FleetCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <Skeleton className="h-44 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-2/3 rounded-md" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-4 w-12 rounded-md" />
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <Skeleton className="h-4 w-20 rounded" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-14 rounded-lg" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FleetSettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-40 rounded-lg" />
          <Skeleton className="h-3.5 w-28 rounded" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <FleetCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/* ── Component ─────────────────────────────────────────────────────────────── */
interface Props {
  isLoading: boolean;
}

export default function FleetSettings({ isLoading }: Props) {
  const { data: vehicles = [], isLoading: fetching } = useFleet();
  const createVehicle = useCreateFleetVehicle();
  const updateVehicle = useUpdateFleetVehicle();
  const deleteVehicle = useDeleteFleetVehicle();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(BLANK);
  const [featuresInput, setFeaturesInput] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isSaving = createVehicle.isPending || updateVehicle.isPending;
  const isDeleting = deleteVehicle.isPending;

  const openAdd = () => {
    setEditId(null);
    setForm({ ...BLANK });
    setFeaturesInput("");
    setModalOpen(true);
  };

  const openEdit = (car: (typeof vehicles)[0]) => {
    setEditId(car.id);
    setForm({
      name: car.name,
      tagline: car.tagline ?? "",
      category: car.category,
      image: car.image ?? "",
      seats: car.seats,
      bags: car.bags,
      ac: car.ac,
      fuel: car.fuel,
      features: [...car.features],
      priceFrom: car.priceFrom ?? "",
    });
    setFeaturesInput(car.features.join(", "));
    setModalOpen(true);
  };

  const handleSave = async () => {
    const features = featuresInput
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
    const payload = {
      name: form.name,
      tagline: form.tagline || null,
      category: form.category,
      image: form.image || null,
      seats: form.seats,
      bags: form.bags,
      ac: form.ac,
      fuel: form.fuel,
      features,
      priceFrom: form.priceFrom || null,
      sortOrder: 0,
    };

    try {
      if (editId) {
        await updateVehicle.mutateAsync({ id: editId, body: payload });
        toast.success("Vehicle updated");
      } else {
        await createVehicle.mutateAsync(payload);
        toast.success("Vehicle added");
      }
      setModalOpen(false);
    } catch {
      toast("Failed to save vehicle", { variant: "danger" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVehicle.mutateAsync(id);
      setDeleteConfirm(null);
      toast.success("Vehicle removed");
    } catch {
      toast("Failed to delete vehicle", { variant: "danger" });
    }
  };

  const showSkeleton = isLoading || fetching;

  return (
    <div className="pb-10">
      {showSkeleton ? (
        <FleetSettingsSkeleton />
      ) : (
        <>
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Fleet Management
              </h2>
              <p className="text-sm text-text-secondary">
                {vehicles.length} vehicles in your fleet
              </p>
            </div>
            <Button onClick={openAdd}>
              <IconPlus size={15} />
              Add Vehicle
            </Button>
          </div>

          {/* ── Card Grid ──────────────────────────────────────────────────── */}
          {vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-surface-muted flex items-center justify-center mb-4">
                <IconCar size={28} className="text-text-tertiary" />
              </div>
              <p className="text-sm font-semibold text-text-secondary">
                No vehicles yet
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                Click &quot;Add Vehicle&quot; to add your first fleet vehicle.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {vehicles.map((car) => (
                <Card key={car.id} className="p-0">
                  {/* Image + gradient overlay */}
                  <div className="relative h-44 overflow-hidden">
                    {car.image ? (
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-3xl"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center ${CAT_BG[car.category] ?? "bg-surface-muted"}`}
                      >
                        <IconCar
                          size={52}
                          className={
                            CAT_ICON[car.category] ?? "text-text-tertiary"
                          }
                        />
                      </div>
                    )}
                    {car.image && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    )}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${CAT_PILL[car.category] ?? "bg-surface-muted text-text-secondary"}`}
                      >
                        {car.category}
                      </span>
                    </div>
                    {car.ac && (
                      <div className="absolute top-3 right-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/25">
                          AC
                        </span>
                      </div>
                    )}
                    {car.image && (
                      <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-6">
                        <p className="text-white font-bold text-base leading-tight">
                          {car.name}
                        </p>
                        {car.priceFrom && (
                          <p className="text-white/75 text-xs font-semibold mt-0.5">
                            From {car.priceFrom}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="px-4 space-y-2">
                    {!car.image && (
                      <div>
                        <p className="font-bold text-sm text-text-primary">
                          {car.name}
                        </p>
                        {car.priceFrom && (
                          <p className="text-xs font-semibold text-primary">
                            From {car.priceFrom}
                          </p>
                        )}
                      </div>
                    )}
                    {car.tagline && (
                      <p className="text-sm text-muted font-semibold">
                        {car.tagline}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {[`${car.seats} seats`, `${car.bags} bags`, car.fuel]
                        .filter(Boolean)
                        .map((spec) => (
                          <Chip key={spec} color="accent" variant="primary">
                            {spec}
                          </Chip>
                        ))}
                    </div>
                    {car.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        {car.features.slice(0, 3).map((f) => (
                          <Chip variant="primary" key={f}>
                            {f}
                          </Chip>
                        ))}
                        {car.features.length > 3 && (
                          <span className="text-sm font-medium ml-2 text-muted">
                            +{car.features.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Card.Footer className="flex items-center justify-end gap-1 py-2 px-2">
                    {deleteConfirm === car.id ? (
                      <div className="flex items-center gap-2 w-full">
                        <Button
                          fullWidth
                          onClick={() => setDeleteConfirm(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="danger"
                          fullWidth
                          onClick={() => handleDelete(car.id)}
                          isDisabled={isDeleting}
                        >
                          {isDeleting ? (
                            <IconLoader size={11} className="animate-spin" />
                          ) : null}
                          Confirm delete
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          fullWidth
                          variant="danger-soft"
                          onClick={() => setDeleteConfirm(car.id)}
                        >
                          <IconTrash size={13} /> Delete
                        </Button>
                        <Button
                          fullWidth
                          variant="secondary"
                          onClick={() => openEdit(car)}
                        >
                          <IconEdit size={13} /> Edit
                        </Button>
                      </>
                    )}
                  </Card.Footer>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Modal.Backdrop isOpen={modalOpen} onOpenChange={setModalOpen}>
        <Modal.Container size="cover">
          <Modal.CloseTrigger />
          <Modal.Dialog>
            <Modal.Header className="">
              <div>
                <h3 className="font-bold text-base">
                  {editId ? "Edit Vehicle" : "Add New Vehicle"}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  {editId
                    ? "Update the vehicle details below"
                    : "Fill in the details to add a vehicle"}
                </p>
              </div>
            </Modal.Header>
            <div className="overflow-y-auto space-y-4 my-4 grid grid-cols-[1fr_0.85fr] gap-4 px-1">
              {/* Image */}
              <div>
                <Label htmlFor="url" className="block">
                  Image URL
                </Label>
                <Input
                  id="url"
                  fullWidth
                  variant="secondary"
                  type="url"
                  value={form.image}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, image: e.target.value }))
                  }
                  className={"mb-4"}
                  placeholder="https://images.unsplash.com/..."
                />
                {form.image && (
                  <div className="aspect-video rounded-xl overflow-hidden border border-border shadow-sm">
                    <img
                      src={form.image}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              {/* Name + Category */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="name">Vehicle Name</Label>
                    <Input
                      id="name"
                      type="text"
                      fullWidth
                      variant="secondary"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="e.g. Maruti Dzire"
                    />
                  </div>
                  <div className="space-y-2">
                    <Select
                      value={form.category}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, category: String(e) }))
                      }
                      variant="secondary"
                      placeholder="Select one"
                    >
                      <Label>Category</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {CATEGORIES.map((c) => (
                            <ListBox.Item key={c} textValue={c}>
                              {c}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>
                </div>
                {/* Tagline */}
                <div className="space-y-2">
                  <Label className="block">Tagline</Label>
                  <Input
                    type="text"
                    fullWidth
                    variant="secondary"
                    value={form.tagline}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, tagline: e.target.value }))
                    }
                  />
                </div>
                {/* Specs */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Seats",
                      key: "seats" as const,
                      min: 1,
                      placeholder: "4",
                    },
                    {
                      label: "Bags",
                      key: "bags" as const,
                      min: 0,
                      placeholder: "3",
                    },
                  ].map(({ label, key, min, placeholder }) => (
                    <div key={key} className="space-y-2">
                      <Label className="block">{label}</Label>
                      <Input
                        type="number"
                        min={min}
                        fullWidth
                        variant="secondary"
                        value={form[key]}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            [key]: Math.max(
                              min,
                              parseInt(e.target.value) || min,
                            ),
                          }))
                        }
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                  <div className="space-y-2">
                    <Label className="block">Fuel Type</Label>
                    <Input
                      type="text"
                      value={form.fuel}
                      fullWidth
                      variant="secondary"
                      onChange={(e) =>
                        setForm((p) => ({ ...p, fuel: e.target.value }))
                      }
                      placeholder="Petrol/CNG"
                    />
                  </div>
                  <div className="">
                    <div className="mb-2 flex items-center gap-2">
                      <Label>Price From</Label>
                      <Tooltip delay={0}>
                        <Tooltip.Trigger>
                          <BsQuestionCircle />
                        </Tooltip.Trigger>
                        <Tooltip.Content placement="left" className={""}>
                          <p>
                            Note: This price does not included in price
                            calculation, this will only be shown in the website
                          </p>
                          <p>For price changes kindly edit it in pricing tab</p>
                        </Tooltip.Content>
                      </Tooltip>
                    </div>
                    <Input
                      type="text"
                      value={form.priceFrom}
                      fullWidth
                      variant="secondary"
                      onChange={(e) =>
                        setForm((p) => ({ ...p, priceFrom: e.target.value }))
                      }
                      placeholder="₹12/km"
                    />
                  </div>
                </div>
                {/* AC toggle */}
                <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-muted/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Air Conditioning
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Affects category display on booking page
                    </p>
                  </div>
                  <Switch
                    isSelected={form.ac}
                    onChange={(checked) =>
                      setForm((prev) => ({
                        ...prev,
                        ac: checked,
                      }))
                    }
                  >
                    <Switch.Control>
                      <Switch.Thumb>
                        <Snowflake />
                      </Switch.Thumb>
                    </Switch.Control>
                    <Switch.Content>
                      <Label />
                    </Switch.Content>
                  </Switch>
                </div>
                {/* Features */}
                <div className="space-y-2">
                  <Label className="block">Features</Label>
                  <Input
                    type="text"
                    fullWidth
                    variant="secondary"
                    value={featuresInput}
                    onChange={(e) => setFeaturesInput(e.target.value)}
                    placeholder="Spacious Boot, Smooth Ride, Fuel Efficient"
                  />
                  <p className="text-xs text-muted">
                    Separate features with commas
                  </p>
                  {featuresInput && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {featuresInput
                        .split(",")
                        .map((f) => f.trim())
                        .filter(Boolean)
                        .map((f) => (
                          <span
                            key={f}
                            className="text-sm font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                          >
                            {f}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
                <Modal.Footer className="w-full flex items-center ">
                  <Button
                    onClick={() => setModalOpen(false)}
                    isDisabled={isSaving}
                    fullWidth
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    onClick={handleSave}
                    isDisabled={!form.name.trim() || isSaving}
                  >
                    {isSaving && (
                      <IconLoader size={14} className="animate-spin" />
                    )}
                    {editId ? "Save Changes" : "Add Vehicle"}
                  </Button>
                </Modal.Footer>
              </div>
            </div>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
