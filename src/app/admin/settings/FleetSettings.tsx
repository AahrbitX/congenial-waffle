"use client";

import { useState } from "react";
import { Skeleton, toast } from "@heroui/react";
import type { FleetCategory } from "@/types/fleet.types";
import { useFleet, useCreateFleetVehicle, useUpdateFleetVehicle, useDeleteFleetVehicle } from "@/hooks/useFleet";
import { IconPlus, IconEdit, IconTrash, IconX, IconCar, IconLoader } from "@/constants/icons";

type CarCategory = Exclude<FleetCategory, "All">;
const CATEGORIES: CarCategory[] = ["Hatchback", "Sedan", "MUV", "Luxury", "Traveller"];

const CAT_BG: Record<string, string> = {
  Hatchback: "bg-blue-50   dark:bg-blue-950/30",
  Sedan:     "bg-violet-50 dark:bg-violet-950/30",
  MUV:       "bg-amber-50  dark:bg-amber-950/30",
  Luxury:    "bg-yellow-50 dark:bg-yellow-950/30",
  Traveller: "bg-teal-50   dark:bg-teal-950/30",
};
const CAT_ICON: Record<string, string> = {
  Hatchback: "text-blue-400",
  Sedan:     "text-violet-400",
  MUV:       "text-amber-400",
  Luxury:    "text-yellow-500",
  Traveller: "text-teal-400",
};
const CAT_PILL: Record<string, string> = {
  Hatchback: "bg-blue-100/90   text-blue-700   dark:bg-blue-900/70   dark:text-blue-300",
  Sedan:     "bg-violet-100/90 text-violet-700 dark:bg-violet-900/70 dark:text-violet-300",
  MUV:       "bg-amber-100/90  text-amber-700  dark:bg-amber-900/70  dark:text-amber-300",
  Luxury:    "bg-yellow-100/90 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-300",
  Traveller: "bg-teal-100/90   text-teal-700   dark:bg-teal-900/70   dark:text-teal-300",
};

interface FormState {
  name: string; tagline: string; category: string;
  image: string; seats: number; bags: number;
  ac: boolean; fuel: string; features: string[]; priceFrom: string;
}

const BLANK: FormState = {
  name: "", tagline: "", category: "Sedan",
  image: "", seats: 4, bags: 3, ac: true, fuel: "", features: [], priceFrom: "",
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
        {[...Array(6)].map((_, i) => <FleetCardSkeleton key={i} />)}
      </div>
    </div>
  );
}

/* ── Component ─────────────────────────────────────────────────────────────── */
interface Props { isLoading: boolean }

export default function FleetSettings({ isLoading }: Props) {
  const { data: vehicles = [], isLoading: fetching } = useFleet();
  const createVehicle = useCreateFleetVehicle();
  const updateVehicle = useUpdateFleetVehicle();
  const deleteVehicle = useDeleteFleetVehicle();

  const [modalOpen, setModalOpen]         = useState(false);
  const [editId, setEditId]               = useState<string | null>(null);
  const [form, setForm]                   = useState<FormState>(BLANK);
  const [featuresInput, setFeaturesInput] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isSaving  = createVehicle.isPending || updateVehicle.isPending;
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
      name: car.name, tagline: car.tagline ?? "",
      category: car.category, image: car.image ?? "",
      seats: car.seats, bags: car.bags, ac: car.ac,
      fuel: car.fuel, features: [...car.features],
      priceFrom: car.priceFrom ?? "",
    });
    setFeaturesInput(car.features.join(", "));
    setModalOpen(true);
  };

  const handleSave = async () => {
    const features = featuresInput.split(",").map((f) => f.trim()).filter(Boolean);
    const payload = {
      name:      form.name,
      tagline:   form.tagline || null,
      category:  form.category,
      image:     form.image || null,
      seats:     form.seats,
      bags:      form.bags,
      ac:        form.ac,
      fuel:      form.fuel,
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
    <div>
      {showSkeleton ? (
        <FleetSettingsSkeleton />
      ) : (
        <>
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-text-primary">Fleet Management</h2>
              <p className="text-sm text-text-secondary">{vehicles.length} vehicles in your fleet</p>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-sm shadow-primary/30"
            >
              <IconPlus size={15} />
              Add Vehicle
            </button>
          </div>

          {/* ── Card Grid ──────────────────────────────────────────────────── */}
          {vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-surface-muted flex items-center justify-center mb-4">
                <IconCar size={28} className="text-text-tertiary" />
              </div>
              <p className="text-sm font-semibold text-text-secondary">No vehicles yet</p>
              <p className="text-xs text-text-tertiary mt-1">Click &quot;Add Vehicle&quot; to add your first fleet vehicle.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {vehicles.map((car) => (
                <div
                  key={car.id}
                  className="group rounded-2xl border border-border bg-surface overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  {/* Image + gradient overlay */}
                  <div className="relative h-44 overflow-hidden">
                    {car.image ? (
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${CAT_BG[car.category] ?? "bg-surface-muted"}`}>
                        <IconCar size={52} className={CAT_ICON[car.category] ?? "text-text-tertiary"} />
                      </div>
                    )}
                    {car.image && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${CAT_PILL[car.category] ?? "bg-surface-muted text-text-secondary"}`}>
                        {car.category}
                      </span>
                    </div>
                    {car.ac && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/25">
                          AC
                        </span>
                      </div>
                    )}
                    {car.image && (
                      <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-6">
                        <p className="text-white font-bold text-[15px] leading-tight">{car.name}</p>
                        {car.priceFrom && <p className="text-white/75 text-xs font-semibold mt-0.5">From {car.priceFrom}</p>}
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-4 space-y-3">
                    {!car.image && (
                      <div>
                        <p className="font-bold text-sm text-text-primary">{car.name}</p>
                        {car.priceFrom && <p className="text-xs font-semibold text-primary">From {car.priceFrom}</p>}
                      </div>
                    )}
                    {car.tagline && <p className="text-xs text-text-secondary">{car.tagline}</p>}
                    <div className="flex flex-wrap gap-1.5">
                      {[`${car.seats} seats`, `${car.bags} bags`, car.fuel].filter(Boolean).map((spec) => (
                        <span key={spec} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-muted text-text-secondary">
                          {spec}
                        </span>
                      ))}
                    </div>
                    {car.features.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {car.features.slice(0, 3).map((f) => (
                          <span key={f} className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-primary/8 text-primary">{f}</span>
                        ))}
                        {car.features.length > 3 && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-surface-muted text-text-tertiary">
                            +{car.features.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-1 pt-1 border-t border-border">
                      {deleteConfirm === car.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <button onClick={() => handleDelete(car.id)} disabled={isDeleting}
                            className="flex-1 flex items-center justify-center gap-1.5 text-xs text-danger font-semibold py-1.5 rounded-lg border border-danger/30 bg-danger/5 hover:bg-danger/10 disabled:opacity-50 transition-colors">
                            {isDeleting ? <IconLoader size={11} className="animate-spin" /> : null}
                            Confirm delete
                          </button>
                          <button onClick={() => setDeleteConfirm(null)}
                            className="flex-1 text-xs text-text-secondary font-semibold py-1.5 rounded-lg border border-border hover:bg-surface-muted transition-colors">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => openEdit(car)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors">
                            <IconEdit size={13} /> Edit
                          </button>
                          <button onClick={() => setDeleteConfirm(car.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors">
                            <IconTrash size={13} /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Add / Edit Modal ────────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ring-1 ring-black/5">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0 bg-surface-muted/40">
              <div>
                <h3 className="font-bold text-base">{editId ? "Edit Vehicle" : "Add New Vehicle"}</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  {editId ? "Update the vehicle details below" : "Fill in the details to add a vehicle"}
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-surface-muted transition-colors">
                <IconX size={16} className="text-text-secondary" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Image */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Image URL</label>
                <input type="url" value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                {form.image && (
                  <div className="aspect-video rounded-xl overflow-hidden border border-border shadow-sm">
                    <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Name + Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Vehicle Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Maruti Dzire"
                    className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Category</label>
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Tagline</label>
                <input type="text" value={form.tagline} onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
                  placeholder="e.g. Comfortable · Popular · Reliable"
                  className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Seats", key: "seats" as const, min: 1, placeholder: "4" },
                  { label: "Bags",  key: "bags"  as const, min: 0, placeholder: "3" },
                ].map(({ label, key, min, placeholder }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">{label}</label>
                    <input type="number" min={min} value={form[key]}
                      onChange={(e) => setForm((p) => ({ ...p, [key]: Math.max(min, parseInt(e.target.value) || min) }))}
                      placeholder={placeholder}
                      className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                  </div>
                ))}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Fuel Type</label>
                  <input type="text" value={form.fuel} onChange={(e) => setForm((p) => ({ ...p, fuel: e.target.value }))}
                    placeholder="Petrol/CNG"
                    className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Price From</label>
                  <input type="text" value={form.priceFrom} onChange={(e) => setForm((p) => ({ ...p, priceFrom: e.target.value }))}
                    placeholder="₹12/km"
                    className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
              </div>

              {/* AC toggle */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted/50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Air Conditioning</p>
                  <p className="text-xs text-text-secondary mt-0.5">Affects category display on booking page</p>
                </div>
                <button type="button" onClick={() => setForm((p) => ({ ...p, ac: !p.ac }))}
                  className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 ${form.ac ? "bg-primary" : "bg-zinc-200 dark:bg-zinc-700"}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form.ac ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Features</label>
                <input type="text" value={featuresInput} onChange={(e) => setFeaturesInput(e.target.value)}
                  placeholder="Spacious Boot, Smooth Ride, Fuel Efficient"
                  className="w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                <p className="text-[11px] text-text-tertiary">Separate features with commas</p>
                {featuresInput && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {featuresInput.split(",").map((f) => f.trim()).filter(Boolean).map((f) => (
                      <span key={f} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{f}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0 bg-surface-muted/30">
              <button onClick={() => setModalOpen(false)} disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-surface-muted disabled:opacity-40 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={!form.name.trim() || isSaving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-all shadow-sm shadow-primary/30 active:scale-95">
                {isSaving && <IconLoader size={14} className="animate-spin" />}
                {editId ? "Save Changes" : "Add Vehicle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
