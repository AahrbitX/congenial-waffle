"use client";

import { Accordion } from "@heroui/react";
import { useFaqs } from "@/hooks/useUser";
import {
  IconPhone,
  IconMessageCircle,
  IconBellRing,
  IconShare,
  IconLoader,
} from "@/constants/icons";

const CONTACT_CARDS = [
  {
    icon: IconPhone,
    label: "Call Support",
    sub: "+91 79043 77385",
    bg: "bg-[var(--color-success-light)]",
    text: "text-[var(--color-success)]",
  },
  {
    icon: IconMessageCircle,
    label: "Live Chat",
    sub: "Usually replies in 2 min",
    bg: "bg-[var(--color-purple-light)]",
    text: "text-[var(--color-purple)]",
  },
  {
    icon: IconBellRing,
    label: "Email Us",
    sub: "Reply within 24 hrs",
    bg: "bg-[var(--color-primary-light)]",
    text: "text-[var(--color-primary)]",
  },
  {
    icon: IconShare,
    label: "WhatsApp",
    sub: "+91 79043 77385",
    bg: "bg-[var(--color-success-light)]",
    text: "text-[var(--color-success)]",
  },
];

export function HelpSupport() {
  const { data: faqs = [], isLoading } = useFaqs();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {CONTACT_CARDS.map(({ icon: Icon, label, sub, bg, text }) => (
          <button
            key={label}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 text-center hover:shadow-md transition-all"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-2 ${bg}`}
            >
              <Icon size={20} className={text} />
            </div>
            <p className="text-[13px] font-bold text-primary">{label}</p>
            <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1">
              {sub}
            </p>
          </button>
        ))}
      </div>

      <div>
        <p className="text-[14px] font-black text-primary mb-3">
          Frequently Asked Questions
        </p>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <IconLoader
              size={24}
              className="animate-spin text-[var(--color-primary)]"
            />
          </div>
        ) : (
          <Accordion className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
            {faqs.map((faq, i) => (
              <Accordion.Item key={`faq-${i}`} id={`faq-${i}`}>
                <Accordion.Heading>
                  <Accordion.Trigger className="flex items-center gap-3 px-5 py-4 w-full text-left hover:bg-[var(--color-surface-muted)] transition-colors">
                    <span className="flex-1 text-[13px] font-semibold text-primary">
                      {faq.q}
                    </span>
                    <Accordion.Indicator />
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body className="px-5 pb-4 text-[13px] text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)]">
                    {faq.a}
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
