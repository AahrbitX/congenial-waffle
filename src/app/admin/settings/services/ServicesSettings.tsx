"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button, Skeleton, toast } from "@heroui/react";

const LocationPickerMap = dynamic(
  () => import("@/components/map/LocationPickerMap").then((m) => m.LocationPickerMap),
  { ssr: false },
);
import {
  useServices,
  useUpdateService,
  useCreateService,
  useDeleteService,
  useAddServiceLocation,
  useDeleteServiceLocation,
} from "@/hooks/useServices";
import type {
  Service,
  ServiceLocation,
  CreateServiceBody,
  UpdateServiceBody,
  AddLocationBody,
} from "@/types/service.types";
import {
  IconPlus,
  IconX,
  IconCheck,
  IconLoader,
  IconTrash,
  IconMapPin,
} from "@/constants/icons";

/* ── Constants ─────────────────────────────────────────────────────────────── */

const FORM_TYPES = [
  { value: "standard", label: "Standard (City/Local)" },
  { value: "outstation", label: "Outstation" },
  { value: "airport", label: "Airport Transfer" },
  { value: "railway", label: "Railway Transfer" },
  { value: "hire", label: "Full Day Hire" },
  { value: "event", label: "Event" },
  { value: "group", label: "Group / Tempo" },
  { value: "inquiry", label: "Inquiry Only" },
] as const;

const SERVICE_TABS = [
  { value: "local", label: "Local" },
  { value: "outstation", label: "Outstation" },
  { value: "airport", label: "Airport" },
] as const;

const VEHICLE_CATEGORIES = [
  "Hatchback",
  "Sedan",
  "MUV",
  "Luxury",
  "Traveller",
] as const;

const CATEGORY_COLOR: Record<string, string> = {
  ride: "var(--color-primary)",
  special: "var(--color-purple)",
};

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ── Skeleton ──────────────────────────────────────────────────────────────── */
function ServicesSkeleton() {
  return (
    <div className="flex flex-col md:flex-row rounded-2xl border border-border overflow-hidden bg-surface">
      <div className="md:w-60 lg:w-72 shrink-0 border-b md:border-b-0 md:border-r border-border bg-surface-muted/40">
        <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
        <div className="p-2 space-y-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="px-3 py-3 rounded-xl flex items-center gap-2.5">
              <Skeleton className="w-2 h-2 rounded-full shrink-0" />
              <Skeleton className={`h-3.5 rounded flex-1 ${i % 2 === 0 ? "w-28" : "w-36"}`} />
              <Skeleton className="h-4 w-12 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 min-w-0 p-6 space-y-5">
        <Skeleton className="h-5 w-40 rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Add Service Modal ─────────────────────────────────────────────────────── */
interface AddServiceModalProps {
  onClose: () => void;
  onSubmit: (body: CreateServiceBody) => Promise<void>;
  isLoading: boolean;
}

function AddServiceModal({ onClose, onSubmit, isLoading }: AddServiceModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [category, setCategory] = useState<"ride" | "special">("ride");
  const [formType, setFormType] = useState("standard");
  const [serviceTab, setServiceTab] = useState<"local" | "outstation" | "airport">("local");
  const [iconName, setIconName] = useState("Car");
  const [selectedCats, setSelectedCats] = useState<string[]>(["Sedan"]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugManual) setSlug(slugify(val));
  };

  const toggleCat = (cat: string) =>
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    await onSubmit({
      slug: slug.trim(),
      name: name.trim(),
      category,
      formType,
      serviceTab,
      vehicleCategories: selectedCats,
      iconName: iconName.trim() || "Car",
      active: true,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface rounded-2xl border border-border shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-bold text-accent">Add New Service</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-muted transition-colors">
            <IconX size={16} className="text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">Service Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Airport Transfer"
              required
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              Slug <span className="text-text-tertiary font-normal">(unique identifier)</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
              placeholder="e.g. airport"
              required
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Category + Form Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as "ride" | "special")}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              >
                <option value="ride">Ride</option>
                <option value="special">Special</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">Form Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              >
                {FORM_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Service Tab + Icon */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">Service Tab</label>
              <select
                value={serviceTab}
                onChange={(e) => setServiceTab(e.target.value as "local" | "outstation" | "airport")}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              >
                {SERVICE_TABS.map((st) => (
                  <option key={st.value} value={st.value}>{st.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">Icon Name</label>
              <input
                type="text"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                placeholder="Car"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>

          {/* Vehicle Categories */}
          <div>
            <label className="block text-xs font-semibold text-muted mb-2">Vehicle Categories</label>
            <div className="flex flex-wrap gap-2">
              {VEHICLE_CATEGORIES.map((cat) => {
                const checked = selectedCats.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCat(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      checked
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-surface-muted border-border text-muted hover:border-primary/30"
                    }`}
                  >
                    {checked && <span className="mr-1">✓</span>}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-surface-muted text-accent border border-border hover:bg-surface"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isDisabled={isLoading || !name.trim() || !slug.trim()}
              className="flex-1 bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <IconLoader size={14} className="animate-spin" /> Creating…
                </span>
              ) : (
                "Create Service"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Fixed Locations Section ───────────────────────────────────────────────── */
interface LocationsSectionProps {
  service: Service;
}

function LocationsSection({ service }: LocationsSectionProps) {
  const addLocation = useAddServiceLocation();
  const deleteLocation = useDeleteServiceLocation();

  const [newName, setNewName] = useState("");
  const [newSublabel, setNewSublabel] = useState("");
  const [newLat, setNewLat] = useState("");
  const [newLng, setNewLng] = useState("");
  const [adding, setAdding] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const body: AddLocationBody = {
      locationType: "both",
      name: newName.trim(),
      sublabel: newSublabel.trim() || undefined,
      lat: newLat ? parseFloat(newLat) : undefined,
      lng: newLng ? parseFloat(newLng) : undefined,
    };
    try {
      await addLocation.mutateAsync({ slug: service.slug, body });
      setNewName("");
      setNewSublabel("");
      setNewLat("");
      setNewLng("");
      setAdding(false);
      setShowMap(false);
      toast.success("Location added");
    } catch {
      toast("Failed to add location", { variant: "danger" });
    }
  };

  const handleDelete = async (loc: ServiceLocation) => {
    try {
      await deleteLocation.mutateAsync({ slug: service.slug, locationId: loc.id });
      toast.success(`Removed "${loc.name}"`);
    } catch {
      toast("Failed to remove location", { variant: "danger" });
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-xs font-bold text-muted uppercase tracking-wider">
          Fixed Locations
        </p>
        <div className="flex-1 h-px bg-border" />
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:text-primary/80 transition-colors"
        >
          <IconPlus size={12} /> Add location
        </button>
      </div>

      {service.locations.length === 0 && !adding ? (
        <div className="flex flex-col items-center justify-center py-8 rounded-2xl border border-dashed border-border text-center">
          <IconMapPin size={20} className="text-muted mb-2" />
          <p className="text-sm font-semibold text-muted">No fixed locations yet</p>
          <p className="text-xs text-text-tertiary mt-0.5 mb-3">
            Add airports or stations for this service
          </p>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 text-xs text-primary font-semibold px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors"
          >
            <IconPlus size={12} /> Add first location
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {service.locations.map((loc) => (
            <div
              key={loc.id}
              className="group flex items-start gap-3 rounded-xl border border-border bg-surface-muted/30 hover:bg-surface-muted/60 px-4 py-3 transition-colors"
            >
              <IconMapPin size={14} className="text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-accent truncate">{loc.name}</p>
                {loc.sublabel && (
                  <p className="text-xs text-muted">{loc.sublabel}</p>
                )}
                {(loc.lat || loc.lng) && (
                  <p className="text-[10px] text-text-tertiary font-mono">
                    {loc.lat}, {loc.lng}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(loc)}
                disabled={deleteLocation.isPending}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-danger/10 transition-all shrink-0"
              >
                <IconTrash size={13} className="text-danger" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inline add form */}
      {adding && (
        <form
          onSubmit={handleAdd}
          className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3"
        >
          <p className="text-xs font-bold text-primary">New Location</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wide mb-1">
                Name *
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Trivandrum International Airport (TRV)"
                required
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wide mb-1">
                Sublabel
              </label>
              <input
                type="text"
                value={newSublabel}
                onChange={(e) => setNewSublabel(e.target.value)}
                placeholder="e.g. Terminal 1"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wide">
                  Coordinates{newLat && newLng ? ` · ${parseFloat(newLat).toFixed(5)}, ${parseFloat(newLng).toFixed(5)}` : ""}
                </label>
                <button
                  type="button"
                  onClick={() => setShowMap((v) => !v)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <IconMapPin size={11} />
                  {showMap ? "Hide map" : "Pick on map"}
                </button>
              </div>
              {showMap ? (
                <LocationPickerMap
                  onConfirm={(address, coords) => {
                    if (!newName) setNewName(address);
                    setNewLat(String(coords.lat));
                    setNewLng(String(coords.lng));
                    setShowMap(false);
                  }}
                  onCancel={() => setShowMap(false)}
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="any"
                    value={newLat}
                    onChange={(e) => setNewLat(e.target.value)}
                    placeholder="Latitude (8.4875)"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                  <input
                    type="number"
                    step="any"
                    value={newLng}
                    onChange={(e) => setNewLng(e.target.value)}
                    placeholder="Longitude (76.9203)"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-muted bg-surface border border-border hover:bg-surface-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addLocation.isPending || !newName.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-60 transition-all"
            >
              {addLocation.isPending ? (
                <IconLoader size={12} className="animate-spin" />
              ) : (
                <IconCheck size={12} />
              )}
              Save Location
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ── Right Panel ───────────────────────────────────────────────────────────── */
interface DetailPanelProps {
  service: Service;
}

function DetailPanel({ service }: DetailPanelProps) {
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [form, setForm] = useState<UpdateServiceBody>({});
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync form when service changes
  useEffect(() => {
    setForm({
      name: service.name,
      tagline: service.tagline ?? "",
      description: service.description ?? "",
      category: service.category,
      formType: service.formType,
      serviceTab: service.serviceTab,
      vehicleCategories: [...(service.vehicleCategories ?? [])],
      iconName: service.iconName ?? "",
      badge: service.badge ?? "",
      sortOrder: service.sortOrder,
      active: service.active,
    });
    setSaved(false);
    setConfirmDelete(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service.id]);

  const set = <K extends keyof UpdateServiceBody>(key: K, val: UpdateServiceBody[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const toggleCat = (cat: string) => {
    const prev = form.vehicleCategories ?? [];
    set(
      "vehicleCategories",
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async () => {
    try {
      await updateService.mutateAsync({ slug: service.slug, body: form });
      setSaved(true);
      toast.success(`${service.name} updated`);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast("Failed to save", { variant: "danger" });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    try {
      await deleteService.mutateAsync(service.slug);
      toast.success(`${service.name} deleted`);
    } catch {
      toast("Failed to delete", { variant: "danger" });
    }
  };

  const showLocations = form.formType === "airport" || form.formType === "railway";

  return (
    <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4 bg-surface-muted/20 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-accent">{service.name}</h2>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `color-mix(in srgb, ${CATEGORY_COLOR[service.category] ?? "var(--color-muted)"} 12%, transparent)`,
                color: CATEGORY_COLOR[service.category] ?? "var(--color-muted)",
              }}
            >
              {service.category}
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            /{service.slug} · {service.locations.length} location{service.locations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Active toggle */}
          <button
            onClick={() => set("active", !form.active)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              form.active ? "bg-success" : "bg-border"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                form.active ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-xs font-semibold text-muted">{form.active ? "Active" : "Inactive"}</span>
          <Button
            onClick={handleSave}
            isDisabled={updateService.isPending}
            className={`flex items-center gap-2 transition-all shadow-sm disabled:opacity-60 ${
              saved
                ? "bg-success text-white"
                : "bg-primary text-white hover:bg-primary/90 active:scale-95"
            }`}
          >
            {updateService.isPending ? (
              <><IconLoader size={14} className="animate-spin" /> Saving…</>
            ) : saved ? (
              <><IconCheck size={14} /> Saved!</>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Basic info */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <p className="text-xs font-bold text-muted uppercase tracking-wider">Basic Info</p>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wide mb-1.5">Name</label>
              <input
                type="text"
                value={form.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wide mb-1.5">Badge</label>
              <input
                type="text"
                value={form.badge ?? ""}
                onChange={(e) => set("badge", e.target.value)}
                placeholder="e.g. Popular"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wide mb-1.5">Tagline</label>
              <input
                type="text"
                value={form.tagline ?? ""}
                onChange={(e) => set("tagline", e.target.value)}
                placeholder="Short description shown on cards"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wide mb-1.5">Description</label>
              <textarea
                value={form.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="Longer description for the service page"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <p className="text-xs font-bold text-muted uppercase tracking-wider">Configuration</p>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wide mb-1.5">Category</label>
              <select
                value={form.category ?? service.category}
                onChange={(e) => set("category", e.target.value as "ride" | "special")}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              >
                <option value="ride">Ride</option>
                <option value="special">Special</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wide mb-1.5">Form Type</label>
              <select
                value={form.formType ?? service.formType}
                onChange={(e) => set("formType", e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              >
                {FORM_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wide mb-1.5">Service Tab</label>
              <select
                value={form.serviceTab ?? service.serviceTab}
                onChange={(e) => set("serviceTab", e.target.value as "local" | "outstation" | "airport")}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              >
                {SERVICE_TABS.map((st) => (
                  <option key={st.value} value={st.value}>{st.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wide mb-1.5">Icon Name</label>
              <input
                type="text"
                value={form.iconName ?? ""}
                onChange={(e) => set("iconName", e.target.value)}
                placeholder="Car"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wide mb-1.5">Sort Order</label>
              <input
                type="number"
                min={0}
                value={form.sortOrder ?? 0}
                onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Categories */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs font-bold text-muted uppercase tracking-wider">Vehicle Categories</p>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="flex flex-wrap gap-2">
            {VEHICLE_CATEGORIES.map((cat) => {
              const checked = (form.vehicleCategories ?? []).includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCat(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    checked
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-surface-muted border-border text-muted hover:border-primary/30"
                  }`}
                >
                  {checked && <span className="mr-1">✓</span>}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fixed Locations — only for airport/railway */}
        {showLocations && <LocationsSection service={service} />}

        {/* Danger zone */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs font-bold text-danger/70 uppercase tracking-wider">Danger Zone</p>
            <div className="flex-1 h-px bg-danger/20" />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-danger/20 bg-danger/5 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-accent">Delete this service</p>
              <p className="text-xs text-muted">This will remove the service and all its locations.</p>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleteService.isPending}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                confirmDelete
                  ? "bg-danger text-white hover:bg-danger/90"
                  : "border border-danger/30 text-danger hover:bg-danger/10"
              }`}
            >
              {deleteService.isPending ? (
                <IconLoader size={12} className="animate-spin" />
              ) : (
                <IconTrash size={12} />
              )}
              {confirmDelete ? "Confirm Delete" : "Delete"}
            </button>
          </div>
          {confirmDelete && (
            <p className="text-xs text-danger mt-2 text-center">
              Click &quot;Confirm Delete&quot; again to permanently delete.{" "}
              <button onClick={() => setConfirmDelete(false)} className="underline">Cancel</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────────────────── */
export default function ServicesSettings() {
  const { data: services, isLoading } = useServices();
  const createService = useCreateService();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Auto-select first service when data loads
  useEffect(() => {
    if (services?.length && !selectedId) {
      setSelectedId(services[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services]);

  const selected = services?.find((s) => s.id === selectedId);

  const handleCreate = async (body: CreateServiceBody) => {
    try {
      const created = await createService.mutateAsync(body);
      setShowModal(false);
      setSelectedId(created.id);
      toast.success(`${created.name} created`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create service";
      toast(msg, { variant: "danger" });
    }
  };

  if (isLoading) return <ServicesSkeleton />;

  return (
    <div className="pb-10">
      {showModal && (
        <AddServiceModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
          isLoading={createService.isPending}
        />
      )}

      <div className="flex flex-col md:flex-row rounded-2xl border border-border overflow-hidden bg-surface">
        {/* ── Left panel ─────────────────────────────────────────────────── */}
        <div className="md:w-60 lg:w-72 shrink-0 border-b md:border-b-0 md:border-r border-border bg-surface-muted/40 flex flex-col">
          <div className="px-4 py-3.5 border-b border-border flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold text-muted uppercase tracking-wider">
              Services
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
            >
              <IconPlus size={11} /> Add New
            </button>
          </div>

          <div className="p-2 space-y-0.5 overflow-y-auto flex-1">
            {(services ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <p className="text-sm font-semibold text-muted">No services yet</p>
                <p className="text-xs text-text-tertiary mt-1">Click &quot;Add New&quot; to create one</p>
              </div>
            ) : (
              (services ?? [])
                .slice()
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((svc) => {
                  const isActive = svc.id === selectedId;
                  return (
                    <button
                      key={svc.id}
                      onClick={() => setSelectedId(svc.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${
                        isActive
                          ? "bg-primary/10 border border-primary/20 shadow-sm"
                          : "hover:bg-surface-muted border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              CATEGORY_COLOR[svc.category] ?? "var(--color-muted)",
                          }}
                        />
                        <span
                          className={`text-sm truncate font-medium flex-1 min-w-0 ${
                            isActive ? "text-primary font-semibold" : "text-accent"
                          }`}
                        >
                          {svc.name}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                            svc.active
                              ? "bg-success/15 text-success"
                              : "bg-muted/15 text-muted"
                          }`}
                        >
                          {svc.active ? "On" : "Off"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 ml-4">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? "bg-primary/15 text-primary"
                              : "bg-surface text-muted"
                          }`}
                        >
                          {svc.formType}
                        </span>
                        {svc.locations.length > 0 && (
                          <span className="text-[10px] text-text-tertiary">
                            {svc.locations.length} loc{svc.locations.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        {/* ── Right panel ──────────────────────────────────────────────── */}
        {selected ? (
          <DetailPanel key={selected.id} service={selected} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-semibold text-muted">Select a service</p>
            <p className="text-xs text-text-tertiary mt-1">
              Choose from the list or create a new one
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
