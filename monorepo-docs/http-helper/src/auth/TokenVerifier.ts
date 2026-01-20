import type { Context } from 'hono';
import type { AppEnv } from '../types';

export interface TokenVerifier<T extends AppEnv = AppEnv> {
    verify: (token: string, c: Context<T>) => Promise<boolean> | boolean;
}
