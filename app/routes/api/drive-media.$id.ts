import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ params }) => {
    const id = params.id;
    if (!id) return new Response("Missing id", { status: 400 });

    const { logErrorOnce } = await import("~/utils/errorLogger.server");

    // If a service account key is provided, use it to fetch the file via Drive API authenticated as the service account.
    const saKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (saKey) {
        try {
            const { google } = await import('googleapis');
            const credentials = typeof saKey === 'string' ? JSON.parse(saKey) : saKey;
            const auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/drive.readonly'],
            });
            const client = await auth.getClient();
            const drive = google.drive({ version: 'v3', auth: client });

            const res = await drive.files.get({ fileId: id, alt: 'media' }, { responseType: 'stream' as any });
            const upstreamStream = (res as any).data;
            const headers = new Headers();
            const ct = (res as any).headers?.['content-type'] || (res as any).headers?.['Content-Type'];
            if (ct) headers.set('content-type', ct);
            headers.set('cache-control', 'public, max-age=3600');
            return new Response(upstreamStream as any, { status: 200, headers });
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
