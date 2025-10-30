/**
 * xGate Protocol - Shared Types
 * HTTP 402 and x402 payment protocol types
 */

// ============================================================================
// x402 Protocol Types
// ============================================================================

/**
 * x402 Payment Challenge (returned in 402 response)
 */
export interface X402Challenge {
  /** Protocol version */
  version: string;
  /** Amount required in USD or asset units */
  amount: string;
  /** Asset symbol (e.g., "USDC") */
  asset: string;
  /** Blockchain network (e.g., "base") */
  chain: string;
  /** Payment facilitator URL */
  facilitator: string;
  /** Recipient wallet address */
  recipient: string;
  /** Unique challenge ID */
  challengeId: string;
  /** Challenge expiration timestamp */
  expiresAt: number;
  /** Optional metadata */
  metadata?: Record<string, any>;
}

/**
 * x402 Payment Proof (sent in retry request header)
 */
export interface X402PaymentProof {
  /** Protocol version */
  version: string;
  /** Transaction hash on blockchain */
  txHash: string;
  /** Payer wallet address */
  payer: string;
  /** Amount paid */
  amount: string;
  /** Asset symbol */
  asset: string;
  /** Blockchain network */
  chain: string;
  /** Challenge ID this payment fulfills */
  challengeId: string;
  /** Timestamp of payment */
  timestamp: number;
  /** Optional signature */
  signature?: string;
}

// ============================================================================
// Gateway Types
// ============================================================================

/**
 * Price configuration for an endpoint
 */
export interface PriceConfig {
  endpoint: string;
  name: string;
  description?: string;
  priceUsd: number;
  pricingType: 'fixed' | 'metered' | 'tiered';
  meterUnit?: 'kb' | 'mb' | 'request' | 'token';
  meterRate?: number;
  enabled: boolean;
  requireAuth?: boolean;
}

/**
 * Payment verification result
 */
export interface PaymentVerification {
  valid: boolean;
  txHash?: string;
  payer?: string;
  amount?: string;
  error?: string;
  timestamp?: number;
}

/**
 * Gateway configuration
 */
export interface GatewayConfig {
  facilitatorUrl: string;
  recipientAddress: string;
  asset: string;
  chain: string;
  jwtSecret: string;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard error response
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  requestId?: string;
}

/**
 * 402 Payment Required response
 */
export interface PaymentRequiredResponse {
  error: 'payment_required';
  message: string;
  payment: X402Challenge;
}

/**
 * Payment receipt response
 */
export interface PaymentReceipt {
  id: string;
  txHash: string;
  payer: string;
  amount: string;
  asset: string;
  chain: string;
  endpoint: string;
  status: 'pending' | 'verified' | 'completed' | 'refunded' | 'failed';
  createdAt: string;
  verifiedAt?: string;
  completedAt?: string;
}

// ============================================================================
// SDK Types
// ============================================================================

/**
 * SDK configuration options
 */
export interface XGateClientConfig {
  /** Gateway base URL */
  gatewayUrl: string;
  /** Wallet provider for payments */
  wallet?: WalletProvider;
  /** Coinbase API credentials */
  coinbase?: {
    apiKey: string;
    apiSecret: string;
  };
  /** Auto-pay for 402 responses */
  autoPay?: boolean;
  /** Maximum price willing to pay (in USD) */
  maxPrice?: number;
  /** Request timeout in ms */
  timeout?: number;
}

/**
 * Wallet provider interface
 */
export interface WalletProvider {
  /** Get wallet address */
  getAddress(): Promise<string>;
  /** Sign a message */
  signMessage(message: string): Promise<string>;
  /** Send payment */
  sendPayment(params: PaymentParams): Promise<PaymentResult>;
}

/**
 * Payment parameters
 */
export interface PaymentParams {
  recipient: string;
  amount: string;
  asset: string;
  chain: string;
  metadata?: Record<string, any>;
}

/**
 * Payment result
 */
export interface PaymentResult {
  txHash: string;
  payer: string;
  amount: string;
  asset: string;
  chain: string;
  timestamp: number;
}

/**
 * Request options for SDK
 */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  autoPay?: boolean;
  maxPrice?: number;
}

/**
 * SDK request response
 */
export interface XGateResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
  payment?: PaymentReceipt;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * HTTP 402 header names
 */
export const X402_HEADERS = {
  /** Payment challenge (in 402 response) */
  CHALLENGE: 'X-402-Challenge',
  /** Payment proof (in retry request) */
  PROOF: 'X-402-Proof',
  /** Payment receipt ID */
  RECEIPT: 'X-402-Receipt',
  /** Price info */
  PRICE: 'X-402-Price',
} as const;

/**
 * Payment status enum
 */
export enum PaymentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

/**
 * Pricing type enum
 */
export enum PricingType {
  FIXED = 'fixed',
  METERED = 'metered',
  TIERED = 'tiered',
}

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  PAYMENT_REQUIRED: 402,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;

