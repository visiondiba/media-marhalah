import fs from "fs/promises";
import path from "path";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { logErrorOnce } from "~/utils/errorLogger.server";

const PROJECT_ROOT = path.resolve(process.cwd());
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"]);

function isImage(name: string) {
    return IMAGE_EXTS.has(path.extname(name).toLowerCase());
}

async function scanDir(relPath: string, recursive = false) {
    const abs = path.resolve(PROJECT_ROOT, relPath);
    if (!abs.startsWith(PROJECT_ROOT)) throw new Error("Invalid path");
    const dirents = await fs.readdir(abs, { withFileTypes: true });
    const items: Array<any> = [];
    for (const d of dirents) {
        if (d.isDirectory()) {
            const entry: any = { type: "dir", name: d.name, path: path.join(relPath, d.name) };
            if (recursive) {
                entry.children = await scanDir(path.join(relPath, d.name), true);
            }
            items.push(entry);
        } else {
            items.push({ type: "file", name: d.name, isImage: isImage(d.name), path: path.join(relPath, d.name) });
        }
    }
    return items;
}

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const folder = url.searchParams.get("folder") || "public";
    const recursive = url.searchParams.get("recursive") === "true";
    try {
        const items = await scanDir(folder, recursive);
        return json({ ok: true, folder, items });
    } catch (err: any) {
        logErrorOnce(`scan-folders-${folder}`, `scan-folders error for ${folder}: ${String(err)}`);
        return json({ ok: false, error: String(err) }, { status: 400 });
    }
};

export function headers() {
    return { "Cache-Control": "no-store" };
}
