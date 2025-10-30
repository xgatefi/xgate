/**
 * xGate Client - Automatic HTTP 402 and x402 payment handling
 */

import {
  XGateClientConfig,
  RequestOptions,
  XGateResponse,
  X402_HEADERS,
  PaymentRequiredResponse,
  X402Challenge,
  X402PaymentProof,
  decodeChallenge,
  encodePaymentProof,
  HTTP_STATUS,
} from '@xgate/shared';
import { WalletProvider } from '@xgate/shared';

export class XGateClient {
  private config: Required<XGateClientConfig>;

  constructor(config: XGateClientConfig) {
    this.config = {
      gatewayUrl: config.gatewayUrl,
      wallet: config.wallet,
      autoPay: config.autoPay ?? true,
      maxPrice: config.maxPrice ?? 1.0, // Default max $1.00
      timeout: config.timeout ?? 30000,
      coinbase: config.coinbase,
    };
  }

  /**
   * Make a GET request
   */
  async get<T = any>(
    path: string,
    options?: RequestOptions
  ): Promise<XGateResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * Make a POST request
   */
  async post<T = any>(
    path: string,
    body?: any,
    options?: RequestOptions
  ): Promise<XGateResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body,
    });
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(
    path: string,
    body?: any,
    options?: RequestOptions
  ): Promise<XGateResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body,
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(
    path: string,
    options?: RequestOptions
  ): Promise<XGateResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Make a request with automatic 402 handling
   */
  async request<T = any>(
    path: string,
    options: RequestOptions = {}
  ): Promise<XGateResponse<T>> {
    const url = `${this.config.gatewayUrl}${path}`;
    const autoPay = options.autoPay ?? this.config.autoPay;
    const maxPrice = options.maxPrice ?? this.config.maxPrice;

    // Prepare request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const requestInit: RequestInit = {
      method: options.method || 'GET',
      headers,
      signal: AbortSignal.timeout(this.config.timeout),
    };

    if (options.body) {
      requestInit.body = JSON.stringify(options.body);
    }

    // Make initial request
    let response = await fetch(url, requestInit);

    // Handle 402 Payment Required
    if (response.status === HTTP_STATUS.PAYMENT_REQUIRED) {
      if (!autoPay) {
        throw new Error('Payment required but autoPay is disabled');
      }

      // Extract payment challenge
      const paymentData = (await response.json()) as PaymentRequiredResponse;
      const challenge = paymentData.payment;

      // Check price against max
      const price = parseFloat(challenge.amount);
      if (price > maxPrice) {
        throw new Error(
          `Price $${price} exceeds maxPrice $${maxPrice}. Set a higher maxPrice to proceed.`
        );
      }

      // Make payment
      console.log(`💳 Payment required: $${price} for ${path}`);
      const paymentProof = await this.makePayment(challenge);

      // Retry request with payment proof
      headers[X402_HEADERS.PROOF] = encodePaymentProof(paymentProof);
      requestInit.headers = headers;

      response = await fetch(url, requestInit);

      // Check if payment was accepted
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          `Payment failed: ${error.message || response.statusText}`
        );
      }

      console.log(`✅ Payment verified! Response received.`);
    }

    // Handle other errors
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Request failed: ${error.message || response.statusText}`
      );
    }

    // Parse response
    const data = await response.json();
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      data,
      status: response.status,
      headers: responseHeaders,
      payment: responseHeaders[X402_HEADERS.RECEIPT]
        ? { id: responseHeaders[X402_HEADERS.RECEIPT] } as any
        : undefined,
    };
  }

  /**
   * Make payment via x402 protocol
   */
  private async makePayment(
    challenge: X402Challenge
  ): Promise<X402PaymentProof> {
    if (!this.config.wallet) {
      throw new Error(
        'Wallet provider is required for payments. Configure a wallet in XGateClientConfig.'
      );
    }

    // Execute payment via wallet
    const paymentResult = await this.config.wallet.sendPayment({
      recipient: challenge.recipient,
      amount: challenge.amount,
      asset: challenge.asset,
      chain: challenge.chain,
      metadata: {
        challengeId: challenge.challengeId,
        endpoint: challenge.metadata?.endpoint,
      },
    });

    // Create payment proof
    const proof: X402PaymentProof = {
      version: '1.0',
      txHash: paymentResult.txHash,
      payer: paymentResult.payer,
      amount: paymentResult.amount,
      asset: paymentResult.asset,
      chain: paymentResult.chain,
      challengeId: challenge.challengeId,
      timestamp: paymentResult.timestamp,
    };

    return proof;
  }

  /**
   * Get current wallet address
   */
  async getWalletAddress(): Promise<string | null> {
    if (!this.config.wallet) {
      return null;
    }
    return this.config.wallet.getAddress();
  }

  /**
   * Check if auto-pay is enabled
   */
  isAutoPayEnabled(): boolean {
    return this.config.autoPay;
  }

  /**
   * Set auto-pay preference
   */
  setAutoPay(enabled: boolean): void {
    this.config.autoPay = enabled;
  }

  /**
   * Get max price
   */
  getMaxPrice(): number {
    return this.config.maxPrice;
  }

  /**
   * Set max price
   */
  setMaxPrice(price: number): void {
    this.config.maxPrice = price;
  }
}

