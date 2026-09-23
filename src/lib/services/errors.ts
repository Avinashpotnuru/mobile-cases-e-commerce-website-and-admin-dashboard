export class AppError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export class ValidationError extends AppError {
  readonly fieldErrors: Record<string, string>;

  constructor(fieldErrors: Record<string, string>) {
    super(400, "VALIDATION_ERROR", "Invalid input.");
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(404, "NOT_FOUND", `${resource} not found.`);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required.") {
    super(401, "UNAUTHORIZED", message);
    this.name = "UnauthorizedError";
  }
}

export class PaymentNotConfiguredError extends AppError {
  constructor(message = "Payment is not yet configured.") {
    super(503, "PAYMENT_NOT_CONFIGURED", message);
    this.name = "PaymentNotConfiguredError";
  }
}

export class PaymentProviderError extends AppError {
  constructor(status: number, code: string, message: string) {
    super(status, code, message);
    this.name = "PaymentProviderError";
  }
}

export class CouponValidationError extends AppError {
  constructor(message: string) {
    super(400, "COUPON_INVALID", message);
    this.name = "CouponValidationError";
  }
}