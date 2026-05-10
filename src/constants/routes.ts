export const ROUTES = {
  dashboard: {
    root:     "/dashboard",
    overview: "/dashboard/overview",
    rides:    "/dashboard/rides",
    wallet:   "/dashboard/wallet",
    profile: {
      root:          "/dashboard/profile",
      privacy:       "/dashboard/profile/privacy",
      notifications: "/dashboard/profile/notifications",
      help:          "/dashboard/profile/help",
      refer:         "/dashboard/profile/refer",
      preferences:   "/dashboard/profile/preferences",
    },
  },
} as const;
