import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { getPerformances, getPerformanceById, upsertPerformance, deletePerformance } from "~/data/performances.server";
import type { Performance } from "~/data/performances";

export const meta: MetaFunction = () => [{ title: "Admin Video Data" }];

export async function loader(_args: LoaderFunctionArgs) {
    const performances = await getPerformances();
    return json({ performances });
}

export async function action({ request }: ActionFunctionArgs) {
    const form = await request.formData();
    const intent = form.get("intent");

    if (intent === "delete") {
        const id = String(form.get("id") || "");
        if (id) {
            await deletePerformance(id);
        }
        return redirect("/admin");
    }

    const id = String(form.get("id") || "");
    const title = String(form.get("title") || "");
    const category = String(form.get("category") || "Non-Performance") as Performance["category"];
    const description = String(form.get("description") || "");
    const artist = String(form.get("artist") || "");
    const thumbnail = String(form.get("thumbnail") || "");
    const duration = String(form.get("duration") || "");
    const year = Number(form.get("year") || 2024);
    const featured = form.get("featured") === "on";
    const views = Number(form.get("views") || 0);
    const trendingScore = Number(form.get("trendingScore") || 0);
    const videoUrl = String(form.get("videoUrl") || "");
    const videoType = String(form.get("videoType") || "youtube") as Performance["videoType"];

    const performance: Performance = {
        id: id || `video-${Date.now()}`,
        title,
        category,
        description,
        artist,
        thumbnail,
        duration,
        year,
        featured,
        views,
        trendingScore,
        videoUrl,
        videoType,
    };

    await upsertPerformance(performance);
    return redirect("/admin");
}

export default function Admin() {
    const { performances } = useLoaderData<typeof loader>();

    return (
        <div className="min-h-screen bg-[#0A0804] text-[#F5E8C0]">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8 rounded-3xl border border-primary/25 bg-[#16130A]/90 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                    <h1 className="text-3xl font-black uppercase tracking-[0.12em] text-primary-soft">Admin Video Data</h1>
                    <p className="mt-2 max-w-2xl text-sm text-text-muted">Edit dan tambah metadata video di sini. Perubahan tersimpan langsung ke file JSON server-side.</p>
                </div>

                <section className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
                    <div className="space-y-6">
                        {performances.map((performance) => (
                            <div key={performance.id} className="rounded-3xl border border-primary/20 bg-[#0A0804]/80 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-xl font-semibold uppercase tracking-[0.08em] text-primary-soft">{performance.title}</h2>
                                        <p className="text-sm text-text-muted">{performance.category} • {performance.year} • {performance.duration}</p>
                                    </div>
                                    <Form method="post">
                                        <input type="hidden" name="id" value={performance.id} />
                                        <input type="hidden" name="intent" value="delete" />
                                        <button type="submit" className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20">Hapus</button>
                                    </Form>
                                </div>
                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-primary/70">URL Video</div>
                                        <div className="break-all text-sm text-text-secondary">{performance.videoUrl}</div>
                                    </div>
                                    <div>
                                        <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-primary/70">Thumbnail</div>
                                        <img src={performance.thumbnail} alt={performance.title} className="h-24 w-full rounded-2xl object-cover" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-3xl border border-primary/25 bg-[#16130A]/90 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                        <h2 className="text-xl font-semibold uppercase tracking-[0.08em] text-primary-soft">Tambah / Edit Video</h2>
                        <Form method="post" className="mt-6 space-y-4">
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-primary/70">ID Video</label>
                                <input name="id" type="text" className="mt-2 w-full rounded-2xl border border-primary/20 bg-[#0A0804] px-4 py-3 text-sm text-text-primary outline-none" placeholder="biarkan kosong untuk baru" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-primary/70">Judul</label>
                                <input name="title" required className="mt-2 w-full rounded-2xl border border-primary/20 bg-[#0A0804] px-4 py-3 text-sm text-text-primary outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-primary/70">Kategori</label>
                                <select name="category" defaultValue="Non-Performance" className="mt-2 w-full rounded-2xl border border-primary/20 bg-[#0A0804] px-4 py-3 text-sm text-text-primary outline-none">
                                    <option>Semi Musik</option>
                                    <option>Seni Musik</option>
                                    <option>Seni Tari</option>
                                    <option>Seni Rupa</option>
                                    <option>Seni Bahasa</option>
                                    <option>Non-Performance</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-primary/70">Artis</label>
                                <input name="artist" className="mt-2 w-full rounded-2xl border border-primary/20 bg-[#0A0804] px-4 py-3 text-sm text-text-primary outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-primary/70">Durasi</label>
                                <input name="duration" required className="mt-2 w-full rounded-2xl border border-primary/20 bg-[#0A0804] px-4 py-3 text-sm text-text-primary outline-none" placeholder="e.g. 14m" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-primary/70">Video URL</label>
                                <input name="videoUrl" required className="mt-2 w-full rounded-2xl border border-primary/20 bg-[#0A0804] px-4 py-3 text-sm text-text-primary outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-primary/70">Thumbnail</label>
                                <input name="thumbnail" required className="mt-2 w-full rounded-2xl border border-primary/20 bg-[#0A0804] px-4 py-3 text-sm text-text-primary outline-none" placeholder="https://..." />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-primary/70">Tahun</label>
                                <input name="year" type="number" required className="mt-2 w-full rounded-2xl border border-primary/20 bg-[#0A0804] px-4 py-3 text-sm text-text-primary outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-primary/70">Views</label>
                                <input name="views" type="number" className="mt-2 w-full rounded-2xl border border-primary/20 bg-[#0A0804] px-4 py-3 text-sm text-text-primary outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-primary/70">Trending Score</label>
                                <input name="trendingScore" type="number" className="mt-2 w-full rounded-2xl border border-primary/20 bg-[#0A0804] px-4 py-3 text-sm text-text-primary outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-primary/70">Tipe Video</label>
                                <select name="videoType" defaultValue="youtube" className="mt-2 w-full rounded-2xl border border-primary/20 bg-[#0A0804] px-4 py-3 text-sm text-text-primary outline-none">
                                    <option value="youtube">youtube</option>
                                    <option value="video/mp4">video/mp4</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <input id="featured" name="featured" type="checkbox" className="h-4 w-4 rounded border-primary text-primary focus:ring-primary" />
                                <label htmlFor="featured" className="text-sm uppercase tracking-[0.12em] text-text-muted">Beri tanda featured</label>
                            </div>
                            <button type="submit" className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#0A0804] transition hover:bg-primary-strong">Simpan Video</button>
                        </Form>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
