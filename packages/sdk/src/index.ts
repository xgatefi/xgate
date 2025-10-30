/**
 * @xgate/sdk - Client SDK for xGate Protocol
 * 
 * Automatically handles HTTP 402 responses and x402 payment flow
 */

export { XGateClient } from './client';
export { MockWallet } from './wallet/mock';
export type {
  XGateClientConfig,
  RequestOptions,
  XGateResponse,
  WalletProvider,
} from '@xgate/shared';

