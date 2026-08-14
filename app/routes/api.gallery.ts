import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import {
    ROOT_FOLDER_ID,
    listDriveFolder,
} from "~/utils/google-drive.server";

export async function loader({
    request,
}: LoaderFunctionArgs) {
    const url = new URL(request.url);

    const folderId =
        url.searchParams.get("folderId") ||
        ROOT_FOLDER_ID;

    const pageToken =
        url.searchParams.get("pageToken") || null;

    try {
        const page = await listDriveFolder(
            folderId,
            pageToken
        );

        return json(page, {
            headers: {
                "Cache-Control":
                    "private, max-age=30",
            },
        });
    } catch (error) {
        console.error(
            "[api/gallery] Failed:",
            error
        );

        return json(
            {
                error: "Failed to load Google Drive gallery",
                folders: [],
                photos: [],
                breadcrumbs: [],
                nextPageToken: null,
            },
            {
                status: 500,
            }
        );
    }
}