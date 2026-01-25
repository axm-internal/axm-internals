export const truncateString = (value: string | number | boolean | null | undefined, length: number = 50): string => {
    const stringValue = String(value ?? '');
    return stringValue.length > length ? `${stringValue.slice(0, length)}...` : stringValue;
};
