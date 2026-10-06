export type CartItem = {
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantSku: string;
  variantName: string;
  variantLabel: string;
  image?: string;
  packPricePaise: number;
  packSize: number;
  quantity: number;
  stock?: number;
};

export type AddCartItemInput = Omit<CartItem, "quantity"> & {
  initialQuantity?: number;
};

export type CartState = {
  items: CartItem[];
  hasHydrated: boolean;
  /** False for staff/admin sessions: they cannot hold a cart or order. */
  cartEnabled: boolean;
  addItem: (item: AddCartItemInput) => void;
  removeItem: (cartKey: string) => void;
  incrementItem: (cartKey: string) => void;
  decrementItem: (cartKey: string) => void;
  setItemQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotalPaise: () => number;
  getTotalPacks: () => number;
  getTotalPieces: () => number;
};
