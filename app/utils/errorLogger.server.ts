const lastLog = new Map<string, number>();

export function logErrorOnce(key: string, message: string, ttlMs = 5 * 60 * 1000) {
    try {
        const now = Date.now();
        const prev = lastLog.get(key) || 0;
        if (now - prev > ttlMs) {
            lastLog.set(key, now);
            console.error(`[deduped-error] ${message}`);
        }
    } catch (e) {
        // ignore logging problems
    }
}
