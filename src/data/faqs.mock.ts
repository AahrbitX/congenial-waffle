import type { Faq } from "@/types/user.types";

export const MOCK_FAQS: Faq[] = [
  {
    q: "How do I cancel a ride?",
    a: "Open the active trip card on the Overview screen and tap Cancel. Cancellation charges may apply if the driver is already on the way.",
  },
  {
    q: "What if the driver doesn't show?",
    a: "If the driver doesn't arrive within 10 minutes, you can cancel for free. Use the SOS button if you feel unsafe.",
  },
  {
    q: "How is the fare calculated?",
    a: "Fare = Base Fare + (Per KM rate × distance) + any night surcharge. You'll see the exact fare on the booking confirmation.",
  },
  {
    q: "How do I get a refund?",
    a: "Refunds are processed within 5–7 working days to your original payment method. Contact support with your Trip ID.",
  },
  {
    q: "Can I book for someone else?",
    a: "Yes! When booking, enter the passenger's name and contact. The trip updates will go to both of you.",
  },
];
