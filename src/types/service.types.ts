export interface ServiceLocation {
  id: string;
  serviceId: string;
  locationType: "pickup" | "drop" | "both";
  name: string;
  sublabel?: string | null;
  lat?: string | null;
  lng?: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: "ride" | "special";
  formType: string;
  serviceTab: "local" | "outstation" | "airport";
  vehicleCategories: string[];
  iconName: string;
  badge?: string | null;
  active: boolean;
  sortOrder: number;
  locations: ServiceLocation[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceBody {
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  category: "ride" | "special";
  formType: string;
  serviceTab: "local" | "outstation" | "airport";
  vehicleCategories: string[];
  iconName?: string;
  badge?: string;
  active?: boolean;
  sortOrder?: number;
}

export interface UpdateServiceBody {
  name?: string;
  tagline?: string;
  description?: string;
  category?: "ride" | "special";
  formType?: string;
  serviceTab?: "local" | "outstation" | "airport";
  vehicleCategories?: string[];
  iconName?: string;
  badge?: string;
  active?: boolean;
  sortOrder?: number;
}

export interface AddLocationBody {
  locationType: "pickup" | "drop" | "both";
  name: string;
  sublabel?: string;
  lat?: number;
  lng?: number;
  sortOrder?: number;
}
