import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
    return new Response(JSON.stringify({ ok: true, message: "drive-media root" }), {
        status: 200,
        headers: { "content-type": "application/json" },
    });
};

export const meta = () => ({ title: "Drive Media API Root" });
