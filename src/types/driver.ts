export interface Driver {
  id: string;
  userId: string;
  vehicleNumber: string;
  vehicleType: string;
  ac: boolean;
  isAvailable: boolean;
  createdAt: string | Date;
  name: string;
  phoneNumber: string | null;
  dob: string | null;
}
