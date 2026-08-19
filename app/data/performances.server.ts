import fs from "fs";
import path from "path";
import type { Category, Performance } from "./performances";

const dataPath = path.resolve(process.cwd(), "data", "performances.json");

function getYouTubeVideoId(videoUrl: string): string | null {
    const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

function getYouTubeThumbnail(videoUrl: string): string | null {
    const videoId = getYouTubeVideoId(videoUrl);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
}

function normalizePerformance(performance: Performance): Performance {
    const normalized = { ...performance };

    if (normalized.videoType === "youtube" && normalized.videoUrl) {
        const thumbnail = getYouTubeThumbnail(normalized.videoUrl);
        if (thumbnail) {
            normalized.thumbnail = thumbnail;
        }
    }

    return normalized;
}


function readPerformancesJson(): Performance[] {
    const raw = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(raw) as Performance[];
}

function writePerformancesJson(items: Performance[]) {
    fs.writeFileSync(dataPath, JSON.stringify(items, null, 2) + "\n", "utf-8");
}

export function getPerformances(): Promise<Performance[]> {
    return Promise.resolve(readPerformancesJson().map((performance) => normalizePerformance(performance)));
}

export function getPerformanceById(id: string): Promise<Performance | null> {
    const all = readPerformancesJson();
    const match = all.find((item) => item.id === id);
    return Promise.resolve(match ? normalizePerformance(match) : null);
}

export function getPerformancesByCategory(category: Category | "Semua"): Promise<Performance[]> {
    const all = readPerformancesJson().map((performance) => normalizePerformance(performance));
    if (category === "Semua") return Promise.resolve(all);
    return Promise.resolve(all.filter((item) => item.category === category));
}

export function savePerformances(performances: Performance[]): Promise<Performance[]> {
    writePerformancesJson(performances.map((performance) => normalizePerformance(performance)));
    return Promise.resolve(performances.map((performance) => normalizePerformance(performance)));
}

export function upsertPerformance(performance: Performance): Promise<Performance> {
    const normalizedPerformance = normalizePerformance(performance);
    const all = readPerformancesJson();
    const existingIndex = all.findIndex((item) => item.id === performance.id);

    if (existingIndex >= 0) {
        all[existingIndex] = normalizedPerformance;
    } else {
        all.push(normalizedPerformance);
    }

    writePerformancesJson(all);
    return Promise.resolve(normalizedPerformance);
}

export function deletePerformance(id: string): Promise<void> {
    const all = readPerformancesJson();
    const filtered = all.filter((item) => item.id !== id);
    writePerformancesJson(filtered);
    return Promise.resolve();
}

export function getFeaturedPerformances(): Promise<Performance[]> {
    const all = readPerformancesJson().map((performance) => normalizePerformance(performance));
    const featuredItems = all.filter((performance) => performance.featured);

    if (featuredItems.length >= 10) {
        return Promise.resolve(featuredItems.slice(0, 10));
    }

    const remaining = all.filter((performance) => !performance.featured);
    return Promise.resolve([...featuredItems, ...remaining].slice(0, 10));
}

export function getRelatedPerformances(category: Category, excludeId: string): Promise<Performance[]> {
    const all = readPerformancesJson().map((performance) => normalizePerformance(performance));
    const sameCategory = all.filter((performance) => performance.category === category && performance.id !== excludeId);
    const otherPerformances = all.filter((performance) => performance.category !== category && performance.id !== excludeId);
    return Promise.resolve([...sameCategory, ...otherPerformances].slice(0, 4));
}
