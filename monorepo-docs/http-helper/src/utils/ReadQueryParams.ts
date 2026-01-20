import { parseBooleanString } from '@repo/shared-types';
import type { HonoRequest } from 'hono';

const readString = (req: HonoRequest, key: string, defaultValue?: string): string | undefined => {
    const raw = req.query(key);
    if (typeof raw !== 'string') {
        return defaultValue;
    }

    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : defaultValue;
};

const readBoolean = (req: HonoRequest, key: string, defaultValue?: boolean): boolean | undefined => {
    const raw = req.query(key);
    if (raw === undefined) {
        return defaultValue;
    }

    try {
        return parseBooleanString(raw, { throwOnInvalid: true });
    } catch {
        return defaultValue;
    }
};

const readNumber = (req: HonoRequest, key: string, defaultValue?: number): number | undefined => {
    const raw = readString(req, key);
    if (raw === undefined) {
        return defaultValue;
    }

    const value = Number(raw);
    return Number.isFinite(value) ? value : defaultValue;
};

const readInt = (req: HonoRequest, key: string, defaultValue?: number): number | undefined => {
    const value = readNumber(req, key);
    if (value === undefined) {
        return defaultValue;
    }

    const intValue = Math.trunc(value);
    return Number.isFinite(intValue) ? intValue : defaultValue;
};

export const ReadQueryParams = {
    readBoolean,
    readInt,
    readNumber,
    readString,
};
