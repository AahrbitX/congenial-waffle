export interface Service {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  iconName: string;
  basePrice: string;
  availability: string;
  badge?: string;
  category: "ride" | "special";
}
