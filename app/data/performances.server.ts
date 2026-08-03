import fs from "fs";
import path from "path";
import type { Category, Performance } from "./performances";

const dataPath = path.resolve(process.cwd(), "data", "performances.json");

function readPerformancesJson(): Performance[] {
    const raw = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(raw) as Performance[];
}

function writePerformancesJson(items: Performance[]) {
    fs.writeFileSync(dataPath, JSON.stringify(items, null, 2) + "\n", "utf-8");
}

export function getPerformances(): Promise<Performance[]> {
    return Promise.resolve(readPerformancesJson());
}

export function getPerformanceById(id: string): Promise<Performance | null> {
    const all = readPerformancesJson();
    const match = all.find((item) => item.id === id);
    return Promise.resolve(match ?? null);
}

export function getPerformancesByCategory(category: Category | "Semua"): Promise<Performance[]> {
    const all = readPerformancesJson();
    if (category === "Semua") return Promise.resolve(all);
    return Promise.resolve(all.filter((item) => item.category === category));
}

export function savePerformances(performances: Performance[]): Promise<Performance[]> {
    writePerformancesJson(performances);
    return Promise.resolve(performances);
}

export function upsertPerformance(performance: Performance): Promise<Performance> {
    const all = readPerformancesJson();
    const existingIndex = all.findIndex((item) => item.id === performance.id);

    if (existingIndex >= 0) {
        all[existingIndex] = performance;
    } else {
        all.push(performance);
    }

    writePerformancesJson(all);
    return Promise.resolve(performance);
}

export function deletePerformance(id: string): Promise<void> {
    const all = readPerformancesJson();
    const filtered = all.filter((item) => item.id !== id);
    writePerformancesJson(filtered);
    return Promise.resolve();
}

export function getFeaturedPerformances(): Promise<Performance[]> {
    const all = readPerformancesJson();
    const categories: Category[] = ["Non-Performance", "Seni Musik", "Seni Tari", "Seni Rupa", "Seni Bahasa"];
    const featuredByCategory = new Map<Category, Performance>();

    for (const performance of all) {
        const isFeatured = performance.featured || (performance.trendingScore ?? 0) > 90;
        if (!isFeatured) continue;

        const current = featuredByCategory.get(performance.category);
        const currentScore = current?.trendingScore ?? 0;
        const candidateScore = performance.trendingScore ?? 0;

        if (!current || candidateScore > currentScore) {
            featuredByCategory.set(performance.category, performance);
        }
    }

    return Promise.resolve(
        categories
            .map((category) => featuredByCategory.get(category) ?? all.find((performance) => performance.category === category))
            .filter((performance): performance is Performance => Boolean(performance))
    );
}

export function getRelatedPerformances(category: Category, excludeId: string): Promise<Performance[]> {
    const all = readPerformancesJson();
    const sameCategory = all.filter((performance) => performance.category === category && performance.id !== excludeId);
    const otherPerformances = all.filter((performance) => performance.category !== category && performance.id !== excludeId);
    return Promise.resolve([...sameCategory, ...otherPerformances].slice(0, 4));
}
