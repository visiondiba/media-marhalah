import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ params }) => {
    const id = params.id;
    console.log(`[drive-media] loader invoked for id=${id}`);
    if (!id) return new Response("Missing id", { status: 400 });

    const { logErrorOnce } = await import("~/utils/errorLogger.server");

    // If a service account key is provided, use it to fetch the file via Drive API authenticated as the service account.
    // Accept raw JSON in `GOOGLE_SERVICE_ACCOUNT_KEY` or base64-encoded JSON in `GOOGLE_SERVICE_ACCOUNT_KEY_B64`.
    const saKeyRaw = (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64 ? Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64, 'base64').toString('utf8') : undefined) ?? (import.meta.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64 ? Buffer.from(import.meta.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64, 'base64').toString('utf8') : undefined);
    if (saKeyRaw) {
        try {
            const { google } = await import('googleapis');
            let credentials: any = undefined;
            try {
                credentials = JSON.parse(saKeyRaw as string);
            } catch (parseErr: any) {
                logErrorOnce(`drive-media-sa-parse-error-${String(parseErr?.message ?? parseErr)}`, `Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY: ${String(parseErr)}`);
                credentials = undefined;
            }

            if (credentials) {
                const auth = new google.auth.GoogleAuth({
                    credentials,
                    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
                });
                // Pass the GoogleAuth instance to the client factory to avoid client-type mismatches
                const drive = google.drive({ version: 'v3', auth });

                const res = await drive.files.get({ fileId: id, alt: 'media' }, { responseType: 'stream' as any });
                const upstreamStream = (res as any).data;
                const headers = new Headers();
                const ct = (res as any).headers?.['content-type'] || (res as any).headers?.['Content-Type'];
                if (ct) headers.set('content-type', ct);
                headers.set('cache-control', 'public, max-age=3600');
                return new Response(upstreamStream as any, { status: 200, headers });
            }
        } catch (err: any) {
            logErrorOnce(`drive-media-sa-exception-${String(err?.message ?? err)}`, `Service-account drive fetch failed for ${id}: ${String(err)}`);
            // fallthrough to API-key / uc fallback below
        }
    }

    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
    const apiUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media${apiKey ? `&key=${encodeURIComponent(apiKey)}` : ""}`;

    try {
        let upstream = await fetch(apiUrl);

        // If API returns non-ok, try direct public URL fallback
        if (!upstream.ok) {
            logErrorOnce(`drive-media-api-${upstream.status}`, `Drive API ${upstream.status} for ${id}, trying uc fallback`);
            const fallback = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
            upstream = await fetch(fallback);
            if (!upstream.ok) {
                logErrorOnce(`drive-media-fallback-${upstream.status}`, `Fallback uc returned ${upstream.status} for ${id}`);
                return new Response(`Upstream error: ${upstream.status}`, { status: upstream.status });
            }
        }

        const headers = new Headers();
        const ct = upstream.headers.get("content-type");
        if (ct) headers.set("content-type", ct);
        headers.set("cache-control", "public, max-age=3600");

        return new Response(upstream.body, { status: upstream.status, headers });
    } catch (err: any) {
        logErrorOnce(`drive-media-exception-${String(err?.message ?? err)}`, `drive-media fetch failed for ${id}: ${String(err)}`);
        return new Response(String(err || "fetch_failed"), { status: 502 });
    }
};
