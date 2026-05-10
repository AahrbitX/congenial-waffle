"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard, Car, Wallet, User, Bell, Star, MapPin,
  ChevronRight, ChevronLeft, Plus, CreditCard, Phone, Navigation,
  X, LogOut, Shield, BellRing, HelpCircle, Gift, Settings,
  Edit3, Camera, AlertTriangle, Calendar, CheckCircle2, XCircle,
  Loader2, Search, Share2, Check, MessageCircle,
} from "lucide-react";
import { Button, Switch, Accordion, Avatar, Chip, Label } from "@heroui/react";
import { authClient } from "@/lib/auth-client";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "overview" | "rides" | "wallet" | "profile";
type RideFilter = "all" | "completed" | "cancelled";
type SettingsView = "main" | "privacy" | "notifications" | "help" | "refer" | "preferences";

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_RIDES = [
  {
    id: "TRP-1001", status: "completed", date: "Today, 9:14 AM",
    from: "Kowdiar Junction", to: "Trivandrum Central Railway Station",
    driver: "Rajesh Kumar", driverPhone: "+91 98765 43210",
    vehicle: "Maruti Dzire", plate: "KL-01-AB-1234",
    fare: 180, distance: "8.2 km", duration: "24 min", rating: 4, payment: "UPI", tip: 20,
  },
  {
    id: "TRP-0999", status: "completed", date: "Yesterday, 6:40 PM",
    from: "Technopark Phase 3", to: "Pettah",
    driver: "Suresh Nair", driverPhone: "+91 87654 32109",
    vehicle: "Toyota Etios", plate: "KL-05-CD-5678",
    fare: 240, distance: "11.4 km", duration: "35 min", rating: 5, payment: "Cash", tip: 0,
  },
  {
    id: "TRP-0994", status: "cancelled", date: "2 May, 2:10 PM",
    from: "Kazhakootam", to: "Museum",
    driver: "—", driverPhone: "", vehicle: "—", plate: "—",
    fare: 0, distance: "—", duration: "—", rating: 0, payment: "—", tip: 0,
  },
  {
    id: "TRP-0981", status: "completed", date: "1 May, 8:00 AM",
    from: "Palayam", to: "Trivandrum Airport",
    driver: "Mohan Das", driverPhone: "+91 76543 21098",
    vehicle: "Innova Crysta", plate: "KL-09-EF-9101",
    fare: 520, distance: "17 km", duration: "40 min", rating: 5, payment: "Card", tip: 50,
  },
];

const MOCK_TRANSACTIONS = [
  { id: "t1", type: "credit", label: "Wallet Top-up",       amount: 500, date: "Today"     },
  { id: "t2", type: "debit",  label: "Ride to Railway Stn", amount: 180, date: "Today"     },
  { id: "t3", type: "debit",  label: "Ride to Pettah",      amount: 240, date: "Yesterday" },
  { id: "t4", type: "credit", label: "Refund – Cancelled",   amount: 0,   date: "2 May"     },
  { id: "t5", type: "debit",  label: "Ride to Airport",     amount: 520, date: "1 May"     },
];

const PAYMENT_METHODS = [
  { id: "pm1", label: "UPI – Google Pay", sub: "Linked",     primary: true  },
  { id: "pm2", label: "HDFC Debit Card",  sub: "•••• 4321",  primary: false },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "ride",    title: "Ride Completed",     body: "Your trip to Railway Station is done. Fare: ₹180.", time: "9:38 AM",   group: "today",   read: false },
  { id: 2, type: "payment", title: "Wallet Credited",    body: "₹500 added to your Mohan Cabs wallet.",           time: "8:00 AM",   group: "today",   read: false },
  { id: 3, type: "promo",   title: "You earned ₹100!",   body: "Friend Amit joined via your referral code.",      time: "Yesterday", group: "earlier", read: true  },
  { id: 4, type: "ride",    title: "Ride Cancelled",     body: "Your booking on 2 May was cancelled.",            time: "2 May",     group: "earlier", read: true  },
  { id: 5, type: "safety",  title: "Safety check",       body: "Rate your recent trip to help driver quality.",   time: "3 May",     group: "earlier", read: true  },
];

const VEHICLES = [
  { type: "Mini",   seats: 4, fare: 120, eta: "3 min", desc: "Economy · AC" },
  { type: "Sedan",  seats: 4, fare: 180, eta: "2 min", desc: "Comfort · AC" },
  { type: "MPV",    seats: 7, fare: 260, eta: "5 min", desc: "Family · AC"  },
  { type: "SUV",    seats: 6, fare: 340, eta: "8 min", desc: "Premium · AC" },
];

const RECENT_PLACES = [
  { label: "Technopark Phase 3", sub: "IT Park" },
  { label: "Trivandrum Airport", sub: "Airport"  },
  { label: "East Fort",          sub: "Market"   },
];

const FAQS = [
  { q: "How do I cancel a ride?",           a: "Open the active trip card on the Overview screen and tap Cancel. Cancellation charges may apply if the driver is already on the way." },
  { q: "What if the driver doesn't show?",  a: "If the driver doesn't arrive within 10 minutes, you can cancel for free. Use the SOS button if you feel unsafe." },
  { q: "How is the fare calculated?",       a: "Fare = Base Fare + (Per KM rate × distance) + any night surcharge. You'll see the exact fare on the booking confirmation." },
  { q: "How do I get a refund?",            a: "Refunds are processed within 5–7 working days to your original payment method. Contact support with your Trip ID." },
  { q: "Can I book for someone else?",      a: "Yes! When booking, enter the passenger's name and contact. The trip updates will go to both of you." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name?: string | null) {
  if (!name || name === "—") return "?";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Map Placeholder ──────────────────────────────────────────────────────────
function MapPlaceholder({ height = 140 }: { height?: number }) {
  return (
    <div
      className="w-full rounded-xl bg-gradient-to-br from-green-100 to-blue-100 border border-gray-200 flex items-center justify-center relative overflow-hidden"
      style={{ height }}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
        <path d="M10 40 C 25 30 40 22 55 18 C 70 14 80 10 90 8" stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="4 2" strokeLinecap="round" />
      </svg>
      <div className="absolute left-[9%] top-[72%] w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" />
      <div className="absolute left-[86%] top-[12%] w-3 h-3 rounded bg-gray-800 border-2 border-white shadow" />
      <div className="absolute left-[48%] top-[32%] w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
        <Car size={14} className="text-blue-500" />
      </div>
      <Navigation size={18} className="text-blue-300 opacity-30" />
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, Icon, color }: {
  label: string; value: string; sub?: string; Icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-[22px] font-black text-[#0f0f0f] leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Ride Status Badge ────────────────────────────────────────────────────────
function RideStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: "success" | "danger" | "primary" | "warning" }> = {
    completed: { label: "Completed", color: "success" },
    cancelled:  { label: "Cancelled",  color: "danger"  },
    ongoing:    { label: "Ongoing",    color: "primary"  },
  };
  const s = map[status] ?? { label: status, color: "warning" };
  return (
    <Chip color={s.color} variant="flat" size="sm" className="text-[11px] font-bold">
      {s.label}
    </Chip>
  );
}

// ─── Active Trip Card ─────────────────────────────────────────────────────────
function ActiveTripCard({ onEnd }: { onEnd: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const secs = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="bg-white rounded-2xl border border-blue-200 shadow-md overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-[14px] font-bold">Ride In Progress</span>
        </div>
        <span className="text-white text-[15px] font-black tabular-nums">{mins}:{secs}</span>
      </div>
      <MapPlaceholder height={140} />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
          <Avatar size="md">
            <Avatar.Fallback className="bg-blue-500 text-white font-bold">RK</Avatar.Fallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-[#0f0f0f]">Ravi Kumar</p>
            <p className="text-[12px] text-gray-400">Sedan · KL-01-AB-1234</p>
          </div>
          <div className="flex gap-2">
            <a href="tel:+919876543210" className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors">
              <Phone size={14} className="text-white" />
            </a>
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center shadow-md hover:opacity-90 transition-opacity">
              <MessageCircle size={14} className="text-white" />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: "2 km",  l: "Driver Away" },
            { v: "~18 min", l: "To Dropoff" },
            { v: "₹340",  l: "Fare" },
          ].map((s) => (
            <div key={s.l} className="bg-gray-50 rounded-xl p-2.5 text-center">
              <p className="text-[14px] font-black text-[#0f0f0f]">{s.v}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
        <Button
          variant="primary"
          fullWidth
          onPress={onEnd}
          className="bg-blue-500 text-white font-bold rounded-xl"
        >
          <Star size={14} className="mr-1.5" /> End Trip & Rate Driver
        </Button>
      </div>
    </div>
  );
}

// ─── Book Ride Modal ──────────────────────────────────────────────────────────
function BookRideModal({ isOpen, onClose, onBooked }: {
  isOpen: boolean; onClose: () => void; onBooked: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [vehicle, setVehicle] = useState("Sedan");
  const [payment, setPayment] = useState("UPI");
  const [confirmed, setConfirmed] = useState(false);

  function reset() { setStep(1); setPickup(""); setDropoff(""); setVehicle("Sedan"); setPayment("UPI"); setConfirmed(false); }
  function handleClose() { reset(); onClose(); }
  function handleConfirm() {
    setConfirmed(true);
    setTimeout(() => { reset(); onBooked(); onClose(); }, 1800);
  }

  const selectedV = VEHICLES.find((v) => v.type === vehicle)!;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {confirmed ? (
          <div className="flex flex-col items-center justify-center py-14 px-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <p className="text-[20px] font-black text-[#0f0f0f]">Ride Booked!</p>
            <p className="text-[13px] text-gray-400">Looking for a driver nearby…</p>
            <div className="bg-blue-50 text-blue-500 text-[13px] font-bold px-4 py-2 rounded-full flex items-center gap-1.5">
              <MapPin size={13} /> {pickup || "Your pickup"}
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {step === 2 && (
                  <button onClick={() => setStep(1)} className="p-1.5 rounded-lg hover:bg-gray-100 mr-1">
                    <ChevronLeft size={16} />
                  </button>
                )}
                <p className="text-[16px] font-black text-[#0f0f0f]">
                  {step === 1 ? "Where to?" : "Choose Ride"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {[1, 2].map((s) => (
                    <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? "w-5 bg-blue-500" : "w-1.5 bg-gray-200"}`} />
                  ))}
                </div>
                <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-gray-100">
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <div className="p-5 space-y-4">
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">Pick Up</p>
                    <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 shadow-sm border border-transparent focus-within:border-blue-300">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                      <input
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        placeholder="Tap to set pickup…"
                        className="flex-1 text-[14px] outline-none text-[#0f0f0f] bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="w-px h-4 bg-gray-300 ml-[5px]" />
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">Drop Off</p>
                    <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 shadow-sm border border-transparent focus-within:border-blue-300">
                      <div className="w-2.5 h-2.5 rounded bg-[#0f0f0f] shrink-0" />
                      <input
                        value={dropoff}
                        onChange={(e) => setDropoff(e.target.value)}
                        placeholder="Where are you going?"
                        className="flex-1 text-[14px] outline-none text-[#0f0f0f] bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">Recent Places</p>
                  <div className="space-y-1.5">
                    {RECENT_PLACES.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => setDropoff(p.label)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                          <MapPin size={14} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[#0f0f0f]">{p.label}</p>
                          <p className="text-[11px] text-gray-400">{p.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  onPress={() => {
                    if (!pickup) setPickup("Current Location");
                    if (!dropoff) setDropoff("Technopark Phase 3");
                    setStep(2);
                  }}
                  className="bg-blue-500 text-white font-bold py-3.5 rounded-xl"
                >
                  See Available Rides →
                </Button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="p-5 space-y-4">
                {/* Route summary */}
                <div className="grid grid-cols-2 divide-x divide-gray-100 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">From</p>
                    <p className="text-[13px] font-bold text-blue-500 truncate mt-0.5">{pickup}</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">To</p>
                    <p className="text-[13px] font-bold text-[#0f0f0f] truncate mt-0.5">{dropoff}</p>
                  </div>
                </div>

                {/* Vehicle selection */}
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">Choose Vehicle</p>
                  <div className="space-y-2">
                    {VEHICLES.map((v) => (
                      <button
                        key={v.type}
                        onClick={() => setVehicle(v.type)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all text-left ${
                          vehicle === v.type
                            ? "bg-blue-50 border-blue-400 shadow-sm shadow-blue-100"
                            : "bg-white border-gray-100 hover:border-blue-200"
                        }`}
                      >
                        <Car size={20} className={vehicle === v.type ? "text-blue-500" : "text-gray-400"} />
                        <div className="flex-1">
                          <p className="text-[14px] font-bold text-[#0f0f0f]">{v.type}</p>
                          <p className="text-[12px] text-gray-400">{v.desc} · {v.seats} seats · ETA {v.eta}</p>
                        </div>
                        <p className="text-[16px] font-black text-blue-500">₹{v.fare}</p>
                        {vehicle === v.type && (
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check size={11} className="text-white" strokeWidth={2.5} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment */}
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">Payment Method</p>
                  <div className="flex gap-2">
                    {["UPI", "Cash", "Card", "Wallet"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setPayment(m)}
                        className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold border transition-all ${
                          payment === m
                            ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                            : "bg-gray-50 text-gray-600 border-gray-100 hover:border-blue-300"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  onPress={handleConfirm}
                  className="bg-blue-500 text-white font-bold py-3.5 rounded-xl"
                >
                  <Check size={16} className="mr-1.5" /> Confirm Booking · ₹{selectedV.fare}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Notification Panel ───────────────────────────────────────────────────────
function NotificationPanel({
  notifications, onClose, onMarkAll,
}: {
  notifications: typeof MOCK_NOTIFICATIONS;
  onClose: () => void;
  onMarkAll: () => void;
}) {
  const iconMap: Record<string, { Icon: React.ElementType; cls: string }> = {
    ride:    { Icon: Car,          cls: "bg-blue-50 text-blue-500"   },
    payment: { Icon: Wallet,       cls: "bg-green-50 text-green-500" },
    promo:   { Icon: Gift,         cls: "bg-purple-50 text-purple-500"},
    safety:  { Icon: Shield,       cls: "bg-red-50 text-red-400"     },
    info:    { Icon: Bell,         cls: "bg-gray-50 text-gray-500"   },
  };
  const today   = notifications.filter((n) => n.group === "today");
  const earlier = notifications.filter((n) => n.group === "earlier");
  const unread  = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[390px] bg-white h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-black text-[#0f0f0f]">Notifications</h2>
              {unread > 0 && (
                <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unread} new</span>
              )}
            </div>
            <p className="text-[12px] text-gray-400 mt-0.5">Stay up to date</p>
          </div>
          <div className="flex items-center gap-3">
            {unread > 0 && (
              <button onClick={onMarkAll} className="text-[12px] font-semibold text-blue-500 hover:text-blue-600">
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          {[{ label: "Today", items: today }, { label: "Earlier", items: earlier }].map(({ label, items }) =>
            items.length === 0 ? null : (
              <div key={label}>
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase px-5 py-2">{label}</p>
                {items.map((n) => {
                  const { Icon, cls } = iconMap[n.type] ?? iconMap.info;
                  return (
                    <div key={n.id} className={`flex gap-3 px-5 py-3.5 border-b border-gray-50 ${!n.read ? "bg-blue-50/40" : "hover:bg-gray-50"}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative ${cls}`}>
                        <Icon size={18} />
                        {!n.read && (
                          <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] text-[#0f0f0f] ${!n.read ? "font-bold" : "font-semibold"}`}>{n.title}</p>
                        <p className="text-[12px] text-gray-500 leading-snug mt-0.5">{n.body}</p>
                        <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
          {notifications.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Bell size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-[14px] font-semibold">No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Rating Modal ─────────────────────────────────────────────────────────────
function RatingModal({ ride, onClose }: { ride: (typeof MOCK_RIDES)[0]; onClose: () => void }) {
  const [driverStars, setDriverStars] = useState(0);
  const [hoverDriver, setHoverDriver] = useState(0);
  const [rideStars, setRideStars] = useState(0);
  const [hoverRide, setHoverRide] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [tip, setTip] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const TAG_OPTIONS = ["Great Driver", "On Time", "Clean Car", "Safe Driving", "Friendly", "Smooth Ride", "AC was great", "Professional"];
  const TIP_OPTIONS = [10, 20, 50];
  const ratingLabel = (r: number) => ["", "Poor", "Fair", "Good", "Great", "Excellent!"][r] ?? "";
  const ratingColor = (r: number) => r >= 4 ? "text-green-500" : r === 3 ? "text-yellow-500" : r > 0 ? "text-red-500" : "text-gray-400";

  function StarPicker({ value, hover, onHover, onLeave, onPick, size = 36 }: {
    value: number; hover: number; onHover: (v: number) => void;
    onLeave: () => void; onPick: (v: number) => void; size?: number;
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
            <Star
              size={size}
              className={`transition-colors ${(hover || value) >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
            />
          </button>
        ))}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-14 px-8 gap-3">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <p className="text-[18px] font-black text-[#0f0f0f]">Thanks for the feedback!</p>
            <p className="text-[13px] text-gray-400 text-center">Your rating helps us improve the service.</p>
            {driverStars >= 4 && (
              <p className="text-[13px] text-blue-500 font-semibold bg-blue-50 px-4 py-2 rounded-full">
                Glad you had a great ride with {ride.driver}!
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-gray-50 px-6 py-5 flex items-start justify-between">
              <div>
                <p className="text-[12px] text-gray-400">Rate your ride</p>
                <p className="text-[15px] font-black text-[#0f0f0f] mt-0.5">{ride.from} → {ride.to}</p>
                <p className="text-[12px] text-gray-400 mt-0.5">{ride.driver !== "—" ? ride.driver : "—"} · {ride.date}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200"><X size={16} /></button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Driver rating */}
              <div>
                <p className="text-[13px] font-bold text-center text-[#0f0f0f] mb-1">How was your driver?</p>
                <p className="text-[11px] text-gray-400 text-center mb-3">Tap a star to rate</p>
                <StarPicker value={driverStars} hover={hoverDriver} onHover={setHoverDriver} onLeave={() => setHoverDriver(0)} onPick={setDriverStars} />
                {(hoverDriver || driverStars) > 0 && (
                  <p className={`text-center text-[14px] font-bold mt-2 ${ratingColor(hoverDriver || driverStars)}`}>
                    {ratingLabel(hoverDriver || driverStars)}
                  </p>
                )}
              </div>

              {/* Overall ride rating */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[13px] font-bold text-center text-[#0f0f0f] mb-3">How was the overall ride?</p>
                <StarPicker value={rideStars} hover={hoverRide} onHover={setHoverRide} onLeave={() => setHoverRide(0)} onPick={setRideStars} size={30} />
              </div>

              {/* Quick tags */}
              {driverStars > 0 && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">What stood out?</p>
                  <div className="flex flex-wrap gap-2">
                    {TAG_OPTIONS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])}
                        className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                          tags.includes(t)
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-gray-500 border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        {tags.includes(t) && "✓ "}{t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Comment */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment (optional)…"
                rows={2}
                className="w-full text-[13px] border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-300"
              />

              {/* Tip */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-[12px] font-bold">₹</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#0f0f0f]">Tip your driver</p>
                    <p className="text-[11px] text-gray-400">100% goes to {ride.driver !== "—" ? ride.driver : "the driver"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {TIP_OPTIONS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTip(tip === t ? null : t)}
                      className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold border transition-all ${
                        tip === t ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      ₹{t}
                    </button>
                  ))}
                  <button
                    onClick={() => setTip(0)}
                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${
                      tip === 0 ? "bg-gray-100 text-gray-600 border-gray-300" : "bg-white text-gray-400 border-gray-200"
                    }`}
                  >
                    Skip
                  </button>
                </div>
              </div>

              {/* Safety report */}
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-orange-50 hover:border-orange-200 transition-colors group text-left">
                <AlertTriangle size={16} className="text-gray-400 group-hover:text-orange-500 transition-colors shrink-0" />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-gray-600 group-hover:text-orange-600">Report a safety issue</p>
                  <p className="text-[11px] text-gray-400">Something feel unsafe? Let us know.</p>
                </div>
                <ChevronRight size={14} className="text-gray-300" />
              </button>

              {/* Submit */}
              <div className="flex gap-3 pb-2">
                <Button variant="ghost" onPress={onClose} className="flex-1">Skip for now</Button>
                <Button
                  variant="primary"
                  onPress={() => { setSubmitted(true); setTimeout(onClose, 2000); }}
                  isDisabled={driverStars === 0}
                  className="flex-1 bg-blue-500 text-white font-bold rounded-xl"
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

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({
  user, onRateRide, activeTrip, onEndTrip,
}: {
  user: any;
  onRateRide: (r: (typeof MOCK_RIDES)[0]) => void;
  activeTrip: boolean;
  onEndTrip: () => void;
}) {
  const [bookOpen, setBookOpen] = useState(false);
  const [booked, setBooked] = useState(false);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-blue-500 rounded-2xl p-6 flex items-center justify-between overflow-hidden relative">
        <div className="absolute right-0 top-0 w-48 h-full bg-blue-400/30 rounded-bl-[60px]" />
        <div className="relative z-10">
          <p className="text-blue-100 text-[13px] font-medium">{greeting()},</p>
          <p className="text-white text-[22px] font-black tracking-tight">{user?.name ?? "Traveller"} 👋</p>
          <p className="text-blue-100 text-[13px] mt-1">Ready for your next ride?</p>
        </div>
        <Button
          variant="secondary"
          onPress={() => setBookOpen(true)}
          className="relative z-10 bg-white/20 hover:bg-white/30 text-white border-white/30 border font-bold rounded-xl px-5 py-3"
        >
          Book a Ride →
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Rides"  value="24"    sub="All time"    Icon={Car}      color="bg-blue-500"    />
        <StatCard label="This Month"   value="6"     sub="May 2026"    Icon={Calendar} color="bg-violet-500"  />
        <StatCard label="Wallet"       value="₹820"  sub="Available"   Icon={Wallet}   color="bg-green-500"   />
        <StatCard label="Your Rating"  value="4.8 ★" sub="18 ratings"  Icon={Star}     color="bg-yellow-500"  />
      </div>

      {/* Active trip */}
      {(activeTrip || booked) && <ActiveTripCard onEnd={() => { onEndTrip(); setBooked(false); }} />}

      {/* Pending feedback nudge */}
      {!activeTrip && !booked && (
        <button
          onClick={() => onRateRide(MOCK_RIDES[1])}
          className="w-full flex items-center gap-3 bg-gradient-to-r from-blue-50 to-white rounded-2xl p-4 border border-blue-100 hover:border-blue-300 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
            <Star size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-bold text-[#0f0f0f]">Rate your last ride</p>
            <p className="text-[12px] text-gray-400">Technopark Phase 3 → Pettah · Yesterday</p>
          </div>
          <ChevronRight size={15} className="text-blue-400" />
        </button>
      )}

      {/* Recent rides */}
      <div>
        <p className="text-[15px] font-black text-[#0f0f0f] mb-3">Recent Rides</p>
        <div className="space-y-3">
          {MOCK_RIDES.slice(0, 3).map((ride) => (
            <div key={ride.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ride.status === "completed" ? "bg-green-50" : ride.status === "cancelled" ? "bg-red-50" : "bg-blue-50"}`}>
                <Car size={18} className={ride.status === "completed" ? "text-green-500" : ride.status === "cancelled" ? "text-red-400" : "text-blue-500"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="text-[13px] font-bold text-[#0f0f0f] truncate">{ride.from} → {ride.to}</p>
                  <RideStatusBadge status={ride.status} />
                </div>
                <p className="text-[12px] text-gray-400">{ride.date}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[14px] font-black text-[#0f0f0f]">{ride.fare > 0 ? `₹${ride.fare}` : "—"}</p>
                {ride.status === "completed" && ride.rating === 0 && (
                  <button onClick={() => onRateRide(ride)} className="text-[11px] text-blue-500 font-semibold hover:underline mt-0.5">Rate</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Book Ride",    Icon: Car,      action: () => setBookOpen(true) },
          { label: "Add Money",    Icon: Plus,     action: () => {} },
          { label: "My Promotions",Icon: Gift,     action: () => {} },
        ].map(({ label, Icon, action }) => (
          <button key={label} onClick={action} className="flex flex-col items-center gap-2 py-4 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Icon size={18} className="text-blue-500" />
            </div>
            <span className="text-[12px] font-semibold text-gray-600">{label}</span>
          </button>
        ))}
      </div>

      <BookRideModal
        isOpen={bookOpen}
        onClose={() => setBookOpen(false)}
        onBooked={() => setBooked(true)}
      />
    </div>
  );
}

// ─── Rides Tab ────────────────────────────────────────────────────────────────
function RidesTab({ onRateRide }: { onRateRide: (r: (typeof MOCK_RIDES)[0]) => void }) {
  const [filter, setFilter] = useState<RideFilter>("all");
  const [selected, setSelected] = useState<(typeof MOCK_RIDES)[0] | null>(null);
  const rides = filter === "all" ? MOCK_RIDES : MOCK_RIDES.filter((r) => r.status === filter);

  return (
    <div className="flex gap-5">
      <div className="flex-1 space-y-4 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-black text-[#0f0f0f]">My Rides</p>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {(["all", "completed", "cancelled"] as RideFilter[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all ${filter === f ? "bg-white text-[#0f0f0f] shadow-sm" : "text-gray-500"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {rides.map((ride) => (
            <button
              key={ride.id}
              onClick={() => setSelected(ride)}
              className={`w-full text-left bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all ${selected?.id === ride.id ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-100"}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${ride.status === "completed" ? "bg-green-50" : "bg-red-50"}`}>
                  <Car size={18} className={ride.status === "completed" ? "text-green-500" : "text-red-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-[13px] font-bold text-[#0f0f0f]">{ride.from} → {ride.to}</p>
                    <RideStatusBadge status={ride.status} />
                  </div>
                  <p className="text-[12px] text-gray-400">{ride.date}</p>
                  <p className="text-[12px] text-gray-400">{ride.vehicle !== "—" ? `${ride.vehicle} · ${ride.plate}` : "No vehicle"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[15px] font-black text-[#0f0f0f]">{ride.fare > 0 ? `₹${ride.fare}` : "—"}</p>
                  {ride.rating > 0 && <p className="text-[11px] text-yellow-500">{"★".repeat(ride.rating)}</p>}
                </div>
              </div>
            </button>
          ))}
          {rides.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Car size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-[14px] font-semibold">No rides found</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className={`w-[340px] shrink-0 transition-all duration-300 ${selected ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {selected && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden sticky top-0">
            <div className="bg-gray-50 px-5 py-4 flex items-start justify-between">
              <div>
                <p className="text-[11px] text-gray-400 font-medium">Trip Detail · {selected.id}</p>
                <p className="text-[14px] font-black text-[#0f0f0f] mt-0.5">{selected.date}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-200"><X size={14} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Route */}
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full border-2 border-blue-500 shrink-0" />
                  <div><p className="text-[10px] text-gray-400">PICKUP</p><p className="text-[13px] font-semibold text-[#0f0f0f]">{selected.from}</p></div>
                </div>
                <div className="ml-[4px] w-px h-4 bg-gray-200" />
                <div className="flex items-start gap-3">
                  <MapPin size={10} className="text-blue-500 mt-1 shrink-0" />
                  <div><p className="text-[10px] text-gray-400">DROP-OFF</p><p className="text-[13px] font-semibold text-[#0f0f0f]">{selected.to}</p></div>
                </div>
              </div>
              <MapPlaceholder height={120} />
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Distance", value: selected.distance },
                  { label: "Duration", value: selected.duration },
                  { label: "Payment",  value: selected.payment  },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl px-2 py-2.5 text-center">
                    <p className="text-[10px] text-gray-400">{label}</p>
                    <p className="text-[12px] font-bold text-[#0f0f0f]">{value}</p>
                  </div>
                ))}
              </div>
              {selected.driver !== "—" && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Avatar size="sm">
                    <Avatar.Fallback className="bg-blue-500 text-white font-bold text-[12px]">{initials(selected.driver)}</Avatar.Fallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#0f0f0f]">{selected.driver}</p>
                    <p className="text-[11px] text-gray-400">{selected.vehicle} · {selected.plate}</p>
                  </div>
                  <a href={`tel:${selected.driverPhone}`} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-blue-50 transition-colors">
                    <Phone size={13} className="text-blue-500" />
                  </a>
                </div>
              )}
              <div className="space-y-1.5 text-[13px]">
                <div className="flex justify-between text-gray-500"><span>Base fare</span><span>₹{Math.max(0, selected.fare - selected.tip)}</span></div>
                {selected.tip > 0 && <div className="flex justify-between text-gray-500"><span>Tip</span><span>₹{selected.tip}</span></div>}
                <div className="flex justify-between font-black text-[#0f0f0f] border-t border-gray-100 pt-1.5"><span>Total</span><span>₹{selected.fare}</span></div>
              </div>
              {selected.status === "completed" && (
                <Button variant="primary" fullWidth onPress={() => onRateRide(selected)} className="bg-blue-500 text-white font-bold rounded-xl">
                  <Star size={14} className="mr-1.5" /> Rate this Ride
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Wallet Tab ───────────────────────────────────────────────────────────────
function WalletTab() {
  const [addOpen, setAddOpen] = useState(false);
  const [amount, setAmount] = useState("");

  return (
    <div className="space-y-6">
      <div className="bg-blue-500 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-36 h-full bg-blue-400/30 rounded-bl-[50px]" />
        <div className="relative z-10">
          <p className="text-blue-100 text-[13px] font-medium">Wallet Balance</p>
          <p className="text-white text-[42px] font-black tracking-tight leading-tight">₹820</p>
          <p className="text-blue-100 text-[12px] mt-1">Last topped up: Today, 8:00 AM</p>
          <Button variant="secondary" onPress={() => setAddOpen(true)} className="mt-4 bg-white text-blue-500 font-bold rounded-full px-5 py-2.5">
            <Plus size={14} className="mr-1.5" /> Add Money
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Payment methods */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-black text-[#0f0f0f]">Payment Methods</p>
            <Button variant="ghost" size="sm" className="text-blue-500 text-[12px] font-semibold">
              <Plus size={12} className="mr-1" /> Add
            </Button>
          </div>
          <div className="space-y-3">
            {PAYMENT_METHODS.map(({ id, label, sub, primary }) => (
              <div key={id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center">
                  <CreditCard size={16} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[#0f0f0f]">{label}</p>
                  <p className="text-[11px] text-gray-400">{sub}</p>
                </div>
                {primary
                  ? <Chip color="primary" variant="flat" size="sm" className="text-[10px] font-bold">Default</Chip>
                  : <div className="w-2 h-2 rounded-full bg-green-400" />}
              </div>
            ))}
            <button className="w-full mt-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-[13px] font-semibold text-gray-400 hover:border-blue-300 hover:text-blue-400 transition-colors">
              + Add Payment Method
            </button>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[14px] font-black text-[#0f0f0f] mb-4">Recent Transactions</p>
          <div className="space-y-3">
            {MOCK_TRANSACTIONS.map(({ id, type, label, amount: amt, date }) => (
              <div key={id} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${type === "credit" ? "bg-green-50" : "bg-gray-50"}`}>
                  {type === "credit" ? <Plus size={15} className="text-green-500" /> : <Car size={15} className="text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#0f0f0f] truncate">{label}</p>
                  <p className="text-[11px] text-gray-400">{date}</p>
                </div>
                <p className={`text-[13px] font-black shrink-0 ${type === "credit" ? "text-green-500" : "text-[#0f0f0f]"}`}>
                  {amt > 0 ? (type === "credit" ? `+₹${amt}` : `-₹${amt}`) : "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Money Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-[16px] font-black text-[#0f0f0f]">Add Money to Wallet</p>
              <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div>
              <p className="text-[12px] text-gray-400 mb-2">Enter amount</p>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-300">
                <span className="text-[18px] font-black text-gray-400">₹</span>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="flex-1 text-[22px] font-black text-[#0f0f0f] focus:outline-none" />
              </div>
            </div>
            <div>
              <p className="text-[12px] text-gray-400 mb-2">Quick add</p>
              <div className="grid grid-cols-4 gap-2">
                {[100, 250, 500, 1000].map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(String(a))}
                    className={`py-2 rounded-xl text-[12px] font-bold border transition-colors ${amount === String(a) ? "bg-blue-500 text-white border-blue-500" : "bg-gray-50 text-gray-600 border-gray-100 hover:border-blue-300"}`}
                  >
                    +₹{a}
                  </button>
                ))}
              </div>
            </div>
            <Button
              variant="primary"
              fullWidth
              isDisabled={!amount || Number(amount) <= 0}
              onPress={() => setAddOpen(false)}
              className="bg-blue-500 text-white font-bold rounded-xl py-3"
            >
              Proceed to Pay
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Settings Sub-screens ──────────────────────────────────────────────────────

function PrivacySettings({ onBack }: { onBack: () => void }) {
  const [locationShare, setLocationShare] = useState(true);
  const [sos, setSos] = useState(true);
  const [tripShare, setTripShare] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="outline" size="sm" onPress={onBack} className="flex items-center gap-1.5 text-[13px]">
          <ChevronLeft size={14} /> Back
        </Button>
        <p className="text-[16px] font-black text-[#0f0f0f]">Privacy & Safety</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50 shadow-sm overflow-hidden">
        {[
          { label: "Share Live Location", sub: "Let trusted contacts track your ride", on: locationShare, set: setLocationShare },
          { label: "Emergency SOS",       sub: "One-tap alert to contacts & police",   on: sos,           set: setSos           },
          { label: "Trip Sharing",        sub: "Auto-share trip details via WhatsApp", on: tripShare,     set: setTripShare     },
        ].map(({ label, sub, on, set }) => (
          <div key={label} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-[#0f0f0f]">{label}</p>
              <p className="text-[12px] text-gray-400 mt-0.5">{sub}</p>
            </div>
            <Switch isSelected={on} onChange={set} size="sm">
              <Switch.Control className={on ? "bg-blue-500" : "bg-gray-200"}>
                <Switch.Thumb />
              </Switch.Control>
            </Switch>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <p className="text-[13px] font-bold text-[#0f0f0f] mb-3 flex items-center gap-2"><Shield size={15} className="text-blue-500" /> Emergency Contacts</p>
        {["Amit Sharma (+91 98001 23456)", "Sunita Sharma (+91 99887 65432)"].map((c, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0 border-gray-50">
            <Avatar size="sm">
              <Avatar.Fallback className="bg-blue-100 text-blue-600 font-bold text-[11px]">{c.slice(0, 2).toUpperCase()}</Avatar.Fallback>
            </Avatar>
            <span className="flex-1 text-[13px] text-gray-600">{c}</span>
            <button className="text-[12px] text-red-500 font-semibold">Remove</button>
          </div>
        ))}
        <button className="w-full mt-3 py-2.5 border-2 border-dashed border-blue-200 rounded-xl text-[13px] font-semibold text-blue-400 hover:border-blue-400 transition-colors">
          + Add Contact
        </button>
      </div>
    </div>
  );
}

function NotificationSettings({ onBack }: { onBack: () => void }) {
  const [prefs, setPrefs] = useState({ rideUpdates: true, promos: true, payments: true, whatsapp: false, email: true });
  const toggle = (k: keyof typeof prefs) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  const items = [
    { key: "rideUpdates" as const, label: "Ride Updates",      sub: "Driver assigned, arriving, trip started" },
    { key: "promos"      as const, label: "Offers & Promos",   sub: "Discounts, promo codes, new features"   },
    { key: "payments"    as const, label: "Payment Alerts",    sub: "Receipts, wallet top-ups, deductions"   },
    { key: "whatsapp"    as const, label: "WhatsApp Alerts",   sub: "Get ride updates on WhatsApp"           },
    { key: "email"       as const, label: "Email Notifications",sub: "Receipts and weekly summaries"         },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="outline" size="sm" onPress={onBack} className="flex items-center gap-1.5 text-[13px]"><ChevronLeft size={14} /> Back</Button>
        <p className="text-[16px] font-black text-[#0f0f0f]">Notifications</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50 shadow-sm overflow-hidden">
        {items.map(({ key, label, sub }) => (
          <div key={key} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-[#0f0f0f]">{label}</p>
              <p className="text-[12px] text-gray-400 mt-0.5">{sub}</p>
            </div>
            <Switch isSelected={prefs[key]} onChange={() => toggle(key)} size="sm">
              <Switch.Control className={prefs[key] ? "bg-blue-500" : "bg-gray-200"}>
                <Switch.Thumb />
              </Switch.Control>
            </Switch>
          </div>
        ))}
      </div>
    </div>
  );
}

function HelpSupport({ onBack }: { onBack: () => void }) {
  const contactCards = [
    { Icon: Phone,         label: "Call Support",  sub: "Mon–Sat, 8am–8pm",        color: "bg-green-50 text-green-500"  },
    { Icon: MessageCircle, label: "Live Chat",     sub: "Usually replies in 2 min", color: "bg-purple-50 text-purple-500"},
    { Icon: BellRing,      label: "Email Us",      sub: "Reply within 24 hrs",      color: "bg-blue-50 text-blue-500"    },
    { Icon: Share2,        label: "WhatsApp",      sub: "+91 98765 00000",           color: "bg-green-50 text-green-600"  },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="outline" size="sm" onPress={onBack} className="flex items-center gap-1.5 text-[13px]"><ChevronLeft size={14} /> Back</Button>
        <p className="text-[16px] font-black text-[#0f0f0f]">Help & Support</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {contactCards.map(({ Icon, label, sub, color }) => (
          <button key={label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:shadow-md transition-all">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-2 ${color.split(" ")[0]}`}>
              <Icon size={20} className={color.split(" ")[1]} />
            </div>
            <p className="text-[13px] font-bold text-[#0f0f0f]">{label}</p>
            <p className="text-[11px] text-gray-400 mt-1">{sub}</p>
          </button>
        ))}
      </div>
      <div>
        <p className="text-[14px] font-black text-[#0f0f0f] mb-3">Frequently Asked Questions</p>
        <Accordion className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {FAQS.map((faq, i) => (
            <Accordion.Item key={`faq-${i}`} id={`faq-${i}`}>
              <Accordion.Heading>
                <Accordion.Trigger className="flex items-center gap-3 px-5 py-4 w-full text-left hover:bg-gray-50 transition-colors">
                  <span className="flex-1 text-[13px] font-semibold text-[#0f0f0f]">{faq.q}</span>
                  <Accordion.Indicator />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body className="px-5 pb-4 text-[13px] text-gray-500 leading-relaxed border-t border-gray-50">
                  {faq.a}
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

function ReferEarn({ onBack }: { onBack: () => void }) {
  const [copied, setCopied] = useState(false);
  const code = "MOHAN100";
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="outline" size="sm" onPress={onBack} className="flex items-center gap-1.5 text-[13px]"><ChevronLeft size={14} /> Back</Button>
        <p className="text-[16px] font-black text-[#0f0f0f]">Refer & Earn</p>
      </div>
      <div className="bg-blue-500 rounded-2xl p-6 text-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-36 h-full bg-blue-400/30 rounded-bl-[50px]" />
        <div className="relative z-10">
          <p className="text-[42px] mb-3">🎁</p>
          <p className="text-[20px] font-black text-white mb-2">Give ₹100, Get ₹100</p>
          <p className="text-blue-100 text-[13px] mb-5 leading-relaxed max-w-sm mx-auto">
            Invite friends to Mohan Cabs. When they complete their first ride, you both get ₹100 off.
          </p>
          <div className="bg-white/20 rounded-xl p-3 flex items-center gap-3 mb-4">
            <p className="flex-1 text-[22px] font-black text-white tracking-widest">{code}</p>
            <Button
              variant="secondary"
              size="sm"
              onPress={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className={`font-bold rounded-lg transition-all ${copied ? "bg-green-500 text-white" : "bg-white text-blue-500"}`}
            >
              {copied ? "✓ Copied!" : "Copy"}
            </Button>
          </div>
          <Button variant="outline" fullWidth className="border-white/40 text-white hover:bg-white/20 font-semibold rounded-xl">
            <Share2 size={15} className="mr-2" /> Share via WhatsApp
          </Button>
        </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <p className="text-[14px] font-black text-[#0f0f0f] mb-3">Your Referrals</p>
        {[
          { name: "Amit Tiwari",  status: "Completed first ride",        earned: "₹100",   color: "text-green-500" },
          { name: "Sunita Nair",  status: "Signed up, not ridden yet",   earned: "Pending", color: "text-yellow-500" },
        ].map((r, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0 border-gray-50">
            <Avatar size="sm">
              <Avatar.Fallback className="bg-blue-100 text-blue-600 font-bold text-[11px]">{initials(r.name)}</Avatar.Fallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-[#0f0f0f]">{r.name}</p>
              <p className="text-[12px] text-gray-400">{r.status}</p>
            </div>
            <p className={`text-[14px] font-black ${r.color}`}>{r.earned}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreferencesSettings({ onBack }: { onBack: () => void }) {
  const [lang, setLang] = useState("English");
  const [ac, setAc] = useState(true);
  const [compact, setCompact] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="outline" size="sm" onPress={onBack} className="flex items-center gap-1.5 text-[13px]"><ChevronLeft size={14} /> Back</Button>
        <p className="text-[16px] font-black text-[#0f0f0f]">Preferences</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">Language</p>
          <div className="flex flex-wrap gap-2">
            {["English", "हिन्दी", "മലയാളം", "தமிழ்"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold border transition-all ${lang === l ? "bg-blue-500 text-white border-blue-500" : "bg-gray-50 text-gray-600 border-gray-100 hover:border-blue-300"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        {[
          { label: "Prefer AC rides",    sub: "Always book AC vehicles when available", on: ac,      set: setAc      },
          { label: "Compact trip cards", sub: "Show shorter cards in ride history",     on: compact, set: setCompact },
        ].map(({ label, sub, on, set }) => (
          <div key={label} className="flex items-center gap-4 px-5 py-4 border-b last:border-0 border-gray-50">
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-[#0f0f0f]">{label}</p>
              <p className="text-[12px] text-gray-400 mt-0.5">{sub}</p>
            </div>
            <Switch isSelected={on} onChange={set} size="sm">
              <Switch.Control className={on ? "bg-blue-500" : "bg-gray-200"}>
                <Switch.Thumb />
              </Switch.Control>
            </Switch>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ user }: { user: any }) {
  const [view, setView] = useState<SettingsView>("main");
  const [editing, setEditing] = useState(false);
  const [name,  setName]  = useState(user?.name ?? "");
  const [phone, setPhone] = useState((user as any)?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [showSignOut, setShowSignOut] = useState(false);

  if (view === "privacy")       return <PrivacySettings      onBack={() => setView("main")} />;
  if (view === "notifications") return <NotificationSettings onBack={() => setView("main")} />;
  if (view === "help")          return <HelpSupport          onBack={() => setView("main")} />;
  if (view === "refer")         return <ReferEarn            onBack={() => setView("main")} />;
  if (view === "preferences")   return <PreferencesSettings  onBack={() => setView("main")} />;

  const menuItems = [
    { Icon: Shield,   label: "Privacy & Safety",  sub: "Location sharing, emergency contacts", view: "privacy"       as SettingsView },
    { Icon: BellRing, label: "Notifications",      sub: "Ride alerts, promos",                  view: "notifications" as SettingsView },
    { Icon: HelpCircle,label: "Help & Support",   sub: "FAQs, chat with us",                   view: "help"          as SettingsView },
    { Icon: Gift,     label: "Refer & Earn",       sub: "Invite friends, get ₹100",             view: "refer"         as SettingsView },
    { Icon: Settings, label: "Preferences",        sub: "Language, AC preference",              view: "preferences"   as SettingsView },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left: Profile card */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-3">
          <div className="relative">
            <Avatar size="lg">
              <Avatar.Fallback className="bg-blue-500 text-white text-[24px] font-black">{initials(user?.name)}</Avatar.Fallback>
            </Avatar>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100 hover:bg-gray-50">
              <Camera size={12} className="text-gray-500" />
            </button>
          </div>
          <div>
            <p className="text-[16px] font-black text-[#0f0f0f]">{user?.name ?? "User"}</p>
            <p className="text-[12px] text-gray-400">{user?.email ?? ""}</p>
          </div>
          <div className="flex gap-4 w-full pt-2 border-t border-gray-100">
            {[{ v: "24", l: "Rides" }, { v: "4.8", l: "Rating" }, { v: "₹820", l: "Wallet" }].map(({ v, l }) => (
              <div key={l} className="flex-1 text-center">
                <p className="text-[18px] font-black text-[#0f0f0f]">{v}</p>
                <p className="text-[11px] text-gray-400">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <Button variant="danger" fullWidth onPress={() => setShowSignOut(true)} className="rounded-2xl font-semibold py-3">
          <LogOut size={15} className="mr-2" /> Sign Out
        </Button>
      </div>

      {/* Right: Edit form + Settings */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-black text-[#0f0f0f]">Personal Information</p>
            <Button variant="ghost" size="sm" onPress={() => setEditing((v) => !v)} className="text-blue-500 text-[12px] font-semibold">
              <Edit3 size={12} className="mr-1" /> {editing ? "Cancel" : "Edit"}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Full Name",    value: name,  set: setName,  type: "text"  },
              { label: "Phone Number", value: phone, set: setPhone, type: "tel"   },
              { label: "Email Address",value: email, set: setEmail, type: "email" },
            ].map(({ label, value, set, type }) => (
              <div key={label}>
                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{label}</label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  disabled={!editing}
                  className="w-full mt-1 text-[14px] font-semibold text-[#0f0f0f] bg-gray-50 disabled:bg-transparent border border-transparent disabled:border-transparent focus:border-blue-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
                />
              </div>
            ))}
          </div>
          {editing && (
            <Button variant="primary" onPress={() => setEditing(false)} className="mt-4 bg-blue-500 text-white font-bold rounded-xl px-6">
              Save Changes
            </Button>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase px-5 pt-4 pb-2">Account Settings</p>
          {menuItems.map(({ Icon, label, sub, view: v }, i) => (
            <button
              key={label}
              onClick={() => setView(v)}
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left border-t border-gray-50 first:border-0 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors shrink-0">
                <Icon size={16} className="text-gray-500 group-hover:text-blue-500 transition-colors" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#0f0f0f]">{label}</p>
                <p className="text-[11px] text-gray-400">{sub}</p>
              </div>
              <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Sign out confirm */}
      {showSignOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <LogOut size={28} className="text-red-500" />
            </div>
            <p className="text-[18px] font-black text-[#0f0f0f]">Sign out?</p>
            <p className="text-[13px] text-gray-400 leading-relaxed">You'll need to log in again with your phone number to access your account.</p>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" fullWidth onPress={() => setShowSignOut(false)} className="rounded-xl font-semibold">Cancel</Button>
              <Button variant="danger" fullWidth onPress={() => { setShowSignOut(false); authClient.signOut(); }} className="rounded-xl font-bold">
                Yes, Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data, isPending } = authClient.useSession();
  const user = data?.user;

  const [activeTab, setActiveTab]     = useState<Tab>("overview");
  const [notifOpen, setNotifOpen]     = useState(false);
  const [ratingRide, setRatingRide]   = useState<(typeof MOCK_RIDES)[0] | null>(null);
  const [activeTrip, setActiveTrip]   = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unread = notifications.filter((n) => !n.read).length;

  const tabs: { key: Tab; label: string; Icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", Icon: LayoutDashboard },
    { key: "rides",    label: "My Rides", Icon: Car             },
    { key: "wallet",   label: "Wallet",   Icon: Wallet          },
    { key: "profile",  label: "Profile",  Icon: User            },
  ];

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fe]">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fe] flex">
      {/* Sidebar */}
      <aside className="w-[240px] shrink-0 bg-white border-r border-gray-100 min-h-screen flex flex-col sticky top-0 h-screen">
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Car size={15} className="text-white" />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-gray-900">Mohan Cabs</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">My Dashboard</p>
        </div>

        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <Avatar size="sm">
              <Avatar.Fallback className="bg-blue-500 text-white font-black text-[12px]">{initials(user?.name)}</Avatar.Fallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-[#0f0f0f] truncate">{user?.name ?? "User"}</p>
              <p className="text-[11px] text-gray-400 truncate">{user?.email ?? ""}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {tabs.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                activeTab === key
                  ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={() => setNotifOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors relative"
          >
            <Bell size={16} />
            Notifications
            {unread > 0 && (
              <span className="ml-auto w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-black text-[#0f0f0f] tracking-tight">
              {tabs.find((t) => t.key === activeTab)?.label}
            </h1>
            <p className="text-[13px] text-gray-400 mt-0.5">
              {activeTab === "overview" && `${greeting()}, ${user?.name?.split(" ")[0] ?? "there"}`}
              {activeTab === "rides"    && "View and manage your trip history"}
              {activeTab === "wallet"   && "Manage your balance and payments"}
              {activeTab === "profile"  && "Manage your account details"}
            </p>
          </div>
          <button
            onClick={() => setNotifOpen(true)}
            className="relative p-2.5 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
          >
            <Bell size={18} className="text-gray-500" />
            {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />}
          </button>
        </div>

        {activeTab === "overview" && (
          <OverviewTab
            user={user}
            onRateRide={setRatingRide}
            activeTrip={activeTrip}
            onEndTrip={() => { setActiveTrip(false); setRatingRide(MOCK_RIDES[0]); }}
          />
        )}
        {activeTab === "rides"   && <RidesTab   onRateRide={setRatingRide} />}
        {activeTab === "wallet"  && <WalletTab  />}
        {activeTab === "profile" && <ProfileTab user={user} />}
      </main>

      {/* Overlays */}
      {notifOpen && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setNotifOpen(false)}
          onMarkAll={() => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })))}
        />
      )}
      {ratingRide && <RatingModal ride={ratingRide} onClose={() => setRatingRide(null)} />}
    </div>
  );
}
