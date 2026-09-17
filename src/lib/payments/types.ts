export type PaymentRequestStatus = "pending" | "succeeded" | "failed" | "cancelled";

export type InitiatePaymentParams = {
  orderId: string;
  amountCents: number;
  currency: string;
};

export type PaymentInitiation = {
  providerPaymentId: string;
  clientToken: string | null;
  clientUrl: string | null;
  status: PaymentRequestStatus;
};

export type PaymentVerification = {
  providerPaymentId: string;
  amountCents: number;
  currency: string;
  status: PaymentRequestStatus;
};

export type PaymentWebhookContext = {
  rawBody: string;
  signature: string | null;
};

export type PaymentWebhookEvent = {
  providerPaymentId: string;
  status: PaymentRequestStatus;
};