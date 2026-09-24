export interface CreateOrder {
  recipientName: string;
  shippingAddressLine: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingPostalCode?: string;
  phone: string;
}

export interface CancelOrder {
  cancelReason?: string;
}
