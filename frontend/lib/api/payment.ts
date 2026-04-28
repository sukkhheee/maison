import { api } from "./client";

export interface BankLink {
  name: string;
  description: string | null;
  logo: string | null;
  link: string;
}

export interface InvoiceResponse {
  bookingId: number;
  invoiceId: string | null;
  qrText: string | null;
  qrImage: string | null;
  shortUrl: string | null;
  amount: number;
  currency: string;
  bankLinks: BankLink[];
}

export type PaymentStatus =
  | "UNPAID"
  | "PENDING"
  | "PAID"
  | "REFUNDED"
  | "FAILED";

export interface PaymentStatusResponse {
  bookingId: number;
  paymentStatus: PaymentStatus;
  qpayInvoiceId: string | null;
  qpayPaymentId: string | null;
}

export function createInvoice(bookingId: number) {
  return api<InvoiceResponse>(`/public/bookings/${bookingId}/invoice`, {
    method: "POST"
  });
}

export function checkPaymentStatus(bookingId: number) {
  return api<PaymentStatusResponse>(
    `/public/bookings/${bookingId}/payment/status`
  );
}
