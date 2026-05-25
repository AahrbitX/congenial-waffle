export const ROUTES = {
  dashboard: {
    root:        "/dashboard",
    overview:    "/dashboard/overview",
    rides:       "/dashboard/rides",
    ride:        (id: string) => `/dashboard/rides/${id}`,
    transactions: "/dashboard/transactions",
    transaction:  (id: string) => `/dashboard/transactions/${id}`,
    profile: {
      root:          "/dashboard/profile",
      privacy:       "/dashboard/profile/privacy",
      notifications: "/dashboard/profile/notifications",
      help:          "/dashboard/profile/help",
      refer:         "/dashboard/profile/refer",
      preferences:   "/dashboard/profile/preferences",
    },
  },
  web: {
    services: "/services",
    service:  (slug: string) => `/services/${slug}`,
    fleet:    "/fleet",
    fleetCar: (id: string) => `/fleet/${id}`,
  },
} as const;
