import type { LoaderFunction } from "@remix-run/node";
import { google } from "googleapis";

const THUMB_MAX_AGE = 60 * 60 * 24;
const FULL_MAX_AGE = 60 * 60;

function getServiceAccountCredentials(): any | null {
    const raw =
        process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
        (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64
            ? Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64, "base64").toString("utf8")
            : undefined) ||
        (import.meta.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64
            ? Buffer.from(import.meta.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64, "base64").toString("utf8")
            : undefined);

    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function cacheControl(size: string) {
    return size === "thumb"
        ? `public, max-age=${THUMB_MAX_AGE}, stale-while-revalidate=86400`
        : `public, max-age=${FULL_MAX_AGE}, stale-while-revalidate=3600`;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const id = params.id;

    if (!id) {
        return new Response("Missing id", { status: 400 });
    }

    const url = new URL(request.url);
    const size = url.searchParams.get("size") === "full" ? "full" : "thumb";
    const { logErrorOnce } = await import("~/utils/errorLogger.server");

    try {
        const credentials = getServiceAccountCredentials();

        if (credentials) {
            const auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ["https://www.googleapis.com/auth/drive.readonly"],
            });

            const drive = google.drive({ version: "v3", auth });

            // Thumbnail mode: ask Drive for metadata and then fetch the generated
            // thumbnail server-side. Full mode streams the original file.
            if (size === "thumb") {
                const meta = await drive.files.get({
                    fileId: id,
                    fields: "thumbnailLink,mimeType,name",
                });

                const thumbnailUrl = meta.data.thumbnailLink;

                if (thumbnailUrl) {
                    const upstream = await fetch(thumbnailUrl);

                    if (upstream.ok && upstream.body) {
                        const headers = new Headers();
                        headers.set(
                            "content-type",
                            upstream.headers.get("content-type") || meta.data.mimeType || "image/jpeg"
                        );
                        headers.set("cache-control", cacheControl("thumb"));
                        headers.set("x-content-source", "google-drive-thumbnail");

                        return new Response(upstream.body, { status: 200, headers });
                    }
                }
            }

            const res = await drive.files.get(
                { fileId: id, alt: "media" },
                { responseType: "stream" as any }
            );

            const headers = new Headers();
            const ct =
                (res as any).headers?.["content-type"] ||
                (res as any).headers?.["Content-Type"] ||
                "application/octet-stream";

            headers.set("content-type", ct);
            headers.set("cache-control", cacheControl(size));

            return new Response((res as any).data as any, {
                status: 200,
                headers,
            });
        }

        // API-key fallback. This is useful for public Drive files.
        const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

        if (!apiKey) {
            return new Response("Google Drive credentials are not configured", {
                status: 503,
            });
        }

        // API-key mode cannot reliably expose authenticated thumbnailLink data,
        // so use Drive's media endpoint for the fallback.
        const apiUrl =
            `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}` +
            `?alt=media&key=${encodeURIComponent(apiKey)}`;

        const upstream = await fetch(apiUrl);

        if (!upstream.ok) {
            logErrorOnce(
                `drive-media-api-${upstream.status}`,
                `Drive API ${upstream.status} for ${id}`
            );
            return new Response(`Upstream error: ${upstream.status}`, {
                status: upstream.status,
            });
        }

        const headers = new Headers();
        const ct = upstream.headers.get("content-type");

        if (ct) headers.set("content-type", ct);
        headers.set("cache-control", cacheControl(size));

        return new Response(upstream.body, {
            status: 200,
            headers,
        });
    } catch (err: any) {
        const message = String(err?.message ?? err);

        logErrorOnce(
            `drive-media-exception-${id}-${message}`,
            `Drive media fetch failed for ${id}: ${message}`
        );

        return new Response("Failed to load image", { status: 502 });
    }
};
