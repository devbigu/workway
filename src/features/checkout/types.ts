export type CheckoutAddress = {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  type: "HOME" | "WORK" | "OTHER";
  isSaved: boolean;
  isDefault: boolean;
};
