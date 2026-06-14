export type Review = {
  id: string;
  bookingId: string;
  bookingRef: string;

  customerName: string;
  customerPhone: string;
  comment: string | null;

  flagged: boolean;
  unread: boolean;

  submittedAt: string;
  journeyDate: string;

  pickupLocation: string;
  dropLocation: string;

  ac: boolean | null;
  totalFare: string | null;
  vehicleType: string | null;

  driverName: string | null;
  vehicleNumber: string | null;
  distanceKm: number | null;

  rating: number;
  ratingPunctuality: number | null;
  ratingCleanliness: number | null;
  ratingBehavior: number | null;
  ratingDriving: number | null;
};
