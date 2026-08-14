/**
 * google-drive.server.ts
 *
 * Google Drive folder browser for the Gallery.
 * - Shows child folders even when a folder has ZERO photos.
 * - Folders are clickable.
 * - Returns breadcrumb data for the current folder.
 * - Photos are paginated in batches of 50 for infinite scroll.
 * - Everything runs server-side; Google credentials never reach the browser.
 */

import { google } from "googleapis";

export const DRIVE_PAGE_SIZE = 50;
export const ROOT_FOLDER_ID = "16hQyDNOEMtiMi-SGQN4AU13n3SeIsuVY";

export interface DrivePhoto {
    id: string;
    name: string;
    thumbnailLink: string;
    webViewLink: string;
    folderId: string;
    imageMediaMetadata?: {
        width?: number;
        height?: number;
    };
}

export interface DriveFolder {
    id: string;
    name: string;
    childFolderCount?: number;
    photoCount?: number;
}

export interface BreadcrumbItem {
    id: string;
    name: string;
}

export interface DriveFolderPage {
    currentFolder: DriveFolder;
    folders: DriveFolder[];
    photos: DrivePhoto[];
    nextPageToken: string | null;
    breadcrumbs: BreadcrumbItem[];
}

/**
 * Service account credentials.
 */
function getServiceAccountCredentials(): any | null {
    const raw =

        (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64
            ? Buffer.from(
                process.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64,
                "base64"
            ).toString("utf8")
            : undefined) ||
        (import.meta.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64
            ? Buffer.from(
                import.meta.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64,
                "base64"
            ).toString("utf8")
            : undefined);

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch (err: any) {
        console.error(
            "[google-drive] Failed to parse service account key:",
            err?.message
        );

        return null;
    }
}

/**
 * Creates authenticated Google Drive client.
 *
 * Explicit return type avoids TypeScript circular inference issues
 * with googleapis.
 */
function createDriveClient(): ReturnType<typeof google.drive> | null {
    const credentials = getServiceAccountCredentials();

    if (!credentials) {
        return null;
    }

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    return google.drive({
        version: "v3",
        auth,
    });
}

/**
 * Converts a Google Drive file into our DrivePhoto format.
 */
function toDrivePhoto(
    file: any,
    folderId: string
): DrivePhoto {
    const id = String(file.id);

    return {
        id,
        name: file.name || "Untitled",

        // IMPORTANT:
        // Browser never contacts Google Drive directly.
        thumbnailLink:
            `/api/drive-media/${encodeURIComponent(id)}?size=thumb`,

        webViewLink:
            file.webViewLink ||
            `https://drive.google.com/file/d/${encodeURIComponent(
                id
            )}/view`,

        folderId,

        imageMediaMetadata:
            file.imageMediaMetadata,
    };
}

/**
 * Loads the current folder.
 *
 * IMPORTANT:
 * Child folders are returned independently from photos.
 * Therefore a folder containing ONLY folders will still display correctly.
 */
export async function listDriveFolder(
    folderId: string = ROOT_FOLDER_ID,
    pageToken?: string | null
): Promise<DriveFolderPage> {
    const drive = createDriveClient();

    if (!drive) {
        throw new Error(
            "GOOGLE_SERVICE_ACCOUNT_KEY is not configured"
        );
    }

    const [folderMeta, folders, photos] =
        await Promise.all([
            drive.files.get({
                fileId: folderId,
                fields: "id,name,mimeType,parents",
            }),

            listChildFolders(
                drive,
                folderId
            ),

            listChildPhotos(
                drive,
                folderId,
                pageToken
            ),
        ]);

    const breadcrumbs =
        await buildBreadcrumbs(
            drive,
            folderId
        );

    return {
        currentFolder: {
            id: String(
                folderMeta.data.id || folderId
            ),

            name:
                folderMeta.data.name ||
                "Folder",
        },

        folders,

        photos: photos.photos,

        nextPageToken:
            photos.nextPageToken,

        breadcrumbs,
    };
}

/**
 * Returns direct child folders.
 *
 * This function intentionally does NOT depend on photos.
 *
 * So:
 *
 * Folder
 * ├── Folder A
 * ├── Folder B
 * └── Folder C
 *
 * will still show A, B and C even if there are ZERO images.
 */
async function listChildFolders(
    drive: ReturnType<typeof google.drive>,
    folderId: string
): Promise<DriveFolder[]> {
    const folders: DriveFolder[] = [];

    let pageToken: string | undefined;

    do {
        /**
         * Explicit `any` prevents TS7022 caused by the
         * complex recursive/circular types inside googleapis.
         */
        const res: any = await drive.files.list({
            q:
                `'${folderId}' in parents ` +
                `and mimeType = 'application/vnd.google-apps.folder' ` +
                `and trashed = false`,

            fields:
                "nextPageToken,files(id,name)",

            orderBy: "name",

            pageSize: 1000,

            ...(pageToken
                ? { pageToken }
                : {}),
        });

        const files: any[] =
            res?.data?.files ?? [];

        for (const folder of files) {
            if (!folder?.id) {
                continue;
            }

            folders.push({
                id: String(folder.id),

                name:
                    folder.name ||
                    "Untitled",
            });
        }

        /**
         * Explicit string type prevents another inference
         * chain from leaking `any`.
         */
        const nextToken: string | undefined =
            typeof res?.data?.nextPageToken ===
                "string"
                ? res.data.nextPageToken
                : undefined;

        pageToken = nextToken;

    } while (pageToken);

    return folders;
}

/**
 * Returns images directly inside the current folder.
 *
 * This does NOT recursively search subfolders.
 * Subfolders are represented by `listChildFolders()`.
 */
async function listChildPhotos(
    drive: ReturnType<typeof google.drive>,
    folderId: string,
    pageToken?: string | null
): Promise<{
    photos: DrivePhoto[];
    nextPageToken: string | null;
}> {
    const res: any = await drive.files.list({
        q:
            `'${folderId}' in parents ` +
            `and mimeType contains 'image/' ` +
            `and trashed = false`,

        fields:
            "nextPageToken,files(id,name,webViewLink,imageMediaMetadata)",

        orderBy: "name",

        pageSize: DRIVE_PAGE_SIZE,

        ...(pageToken
            ? { pageToken }
            : {}),
    });

    const files: any[] =
        res?.data?.files ?? [];

    const photos: DrivePhoto[] =
        files.map((file: any) =>
            toDrivePhoto(
                file,
                folderId
            )
        );

    const nextPageToken: string | null =
        typeof res?.data?.nextPageToken ===
            "string"
            ? res.data.nextPageToken
            : null;

    return {
        photos,
        nextPageToken,
    };
}

/**
 * Builds:
 *
 * Gallery
 *   ↓
 * Acara 2026
 *   ↓
 * Pembukaan
 *
 * into breadcrumb data.
 */
async function buildBreadcrumbs(
    drive: ReturnType<typeof google.drive>,
    folderId: string
): Promise<BreadcrumbItem[]> {
    const chain: BreadcrumbItem[] = [];

    let currentId: string | null =
        folderId;

    const seen = new Set<string>();

    while (
        currentId &&
        !seen.has(currentId)
    ) {
        seen.add(currentId);

        /**
         * Explicit any fixes TS7022 around the
         * googleapis response inference.
         */
        const res: any =
            await drive.files.get({
                fileId: currentId,
                fields: "id,name,parents",
            });

        chain.unshift({
            id: String(
                res?.data?.id ||
                currentId
            ),

            name:
                res?.data?.name ||
                "Folder",
        });

        /**
         * Explicit type here is important.
         *
         * Previously TypeScript could infer this through
         * googleapis' circular types and produce TS7022.
         */
        const parents: string[] =
            Array.isArray(
                res?.data?.parents
            )
                ? res.data.parents.filter(
                    (parent: unknown): parent is string =>
                        typeof parent === "string"
                )
                : [];

        if (
            currentId ===
            ROOT_FOLDER_ID
        ) {
            break;
        }

        currentId =
            parents.length > 0
                ? parents[0]
                : null;

        /**
         * If the current folder's parent is our
         * configured root, stop here.
         *
         * The root itself is already included
         * by the next iteration.
         */
    }

    /**
     * Safety:
     *
     * If Drive's parent structure doesn't connect
     * to our configured root, don't expose unrelated
     * folders above the Gallery.
     */
    const rootIndex =
        chain.findIndex(
            (item) =>
                item.id ===
                ROOT_FOLDER_ID
        );

    if (rootIndex >= 0) {
        return chain.slice(rootIndex);
    }

    /**
     * We're at root itself.
     */
    if (
        folderId ===
        ROOT_FOLDER_ID
    ) {
        return chain;
    }

    /**
     * If the folder is not connected to our
     * configured root, return only the current folder.
     */
    return chain.slice(-1);
}

/**
 * Backward-compatible helper for existing imports.
 */
export async function listDrivePhotos(
    folderId: string
): Promise<DrivePhoto[]> {
    const page =
        await listDriveFolder(
            folderId,
            null
        );

    return page.photos;
}