import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { Link, Links, Meta, Outlet, RemixServer, Scripts, ScrollRestoration, useLocation, useParams } from "@remix-run/react";
import * as isbotModule from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region node_modules/.pnpm/@remix-run+dev@2.17.5_@remi_bf8292424268d4b53d41e2dd7cdacd31/node_modules/@remix-run/dev/dist/config/defaults/entry.server.node.tsx
var entry_server_node_exports = /* @__PURE__ */ __exportAll({ default: () => handleRequest });
var ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
	return isBotRequest(request.headers.get("user-agent")) || remixContext.isSpaMode ? handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) : handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext);
}
function isBotRequest(userAgent) {
	if (!userAgent) return false;
	if ("isbot" in isbotModule && typeof isbotModule.isbot === "function") return isbotModule.isbot(userAgent);
	if ("default" in isbotModule && typeof isbotModule.default === "function") return isbotModule.default(userAgent);
	return false;
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		const { pipe, abort } = renderToPipeableStream(/* @__PURE__ */ jsx(RemixServer, {
			context: remixContext,
			url: request.url,
			abortDelay: ABORT_DELAY
		}), {
			onAllReady() {
				shellRendered = true;
				const body = new PassThrough();
				const stream = createReadableStreamFromReadable(body);
				responseHeaders.set("Content-Type", "text/html");
				resolve(new Response(stream, {
					headers: responseHeaders,
					status: responseStatusCode
				}));
				pipe(body);
			},
			onShellError(error) {
				reject(error);
			},
			onError(error) {
				responseStatusCode = 500;
				if (shellRendered) console.error(error);
			}
		});
		setTimeout(abort, ABORT_DELAY);
	});
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		const { pipe, abort } = renderToPipeableStream(/* @__PURE__ */ jsx(RemixServer, {
			context: remixContext,
			url: request.url,
			abortDelay: ABORT_DELAY
		}), {
			onShellReady() {
				shellRendered = true;
				const body = new PassThrough();
				const stream = createReadableStreamFromReadable(body);
				responseHeaders.set("Content-Type", "text/html");
				resolve(new Response(stream, {
					headers: responseHeaders,
					status: responseStatusCode
				}));
				pipe(body);
			},
			onShellError(error) {
				reject(error);
			},
			onError(error) {
				responseStatusCode = 500;
				if (shellRendered) console.error(error);
			}
		});
		setTimeout(abort, ABORT_DELAY);
	});
}
//#endregion
//#region node_modules/.pnpm/plyr@3.8.4/node_modules/plyr/dist/plyr.css?url
var plyr_default = "/assets/plyr-BV0mtPOj.css";
//#endregion
//#region app/root.tsx
var root_exports = /* @__PURE__ */ __exportAll({
	Layout: () => Layout,
	default: () => App,
	links: () => links,
	meta: () => meta$1
});
var links = () => [
	{
		rel: "preconnect",
		href: "https://fonts.googleapis.com"
	},
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous"
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Lato:wght@300;400;500;600;700&display=swap"
	},
	{
		rel: "stylesheet",
		href: plyr_default
	}
];
var meta$1 = () => [
	{ charSet: "utf-8" },
	{
		name: "viewport",
		content: "width=device-width, initial-scale=1"
	},
	{ title: "Impermedia — Panggung Gembira" },
	{
		name: "description",
		content: "Platform media Panggung Gembira 6101"
	}
];
function Layout({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "id",
		children: [/* @__PURE__ */ jsxs("head", { children: [/* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})] }), /* @__PURE__ */ jsxs("body", { children: [
			children,
			/* @__PURE__ */ jsx(ScrollRestoration, {}),
			/* @__PURE__ */ jsx(Scripts, {})
		] })]
	});
}
function App() {
	return /* @__PURE__ */ jsx(Outlet, {});
}
//#endregion
//#region app/utils/auth.ts
var VALID_KEYS = {
	"MARHALAH-2024": "VIP Golden Ticket Pass",
	"PG-VIP-8888": "Executive Producer Pass",
	"GOLDEN-SPECTACLE": "All-Access Lifetime Pass",
	"DEMO-PASS": "Standard Access Ticket"
};
var STORAGE_KEY = "media_marhalah_license";
function validateLicenseKey(code) {
	const cleanCode = code.trim().toUpperCase();
	if (!cleanCode) return {
		success: false,
		error: "Kode lisensi tidak boleh kosong."
	};
	if (VALID_KEYS[cleanCode]) {
		saveLicense({
			code: cleanCode,
			planName: VALID_KEYS[cleanCode],
			activatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			isValid: true
		});
		return {
			success: true,
			planName: VALID_KEYS[cleanCode]
		};
	}
	return {
		success: false,
		error: "Kode lisensi tidak valid atau telah kadaluarsa."
	};
}
function saveLicense(license) {
	if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(license));
}
function getStoredLicense() {
	if (typeof window === "undefined") return null;
	try {
		const data = localStorage.getItem(STORAGE_KEY);
		if (!data) return null;
		return JSON.parse(data);
	} catch {
		return null;
	}
}
//#endregion
//#region app/components/LicenseModal.tsx
function LicenseModal({ isOpen, onClose, onSuccess }) {
	const [code, setCode] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	if (!isOpen) return null;
	const handleSubmit = (e) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);
		setTimeout(() => {
			const result = validateLicenseKey(code);
			setIsLoading(false);
			if (result.success && result.planName) {
				onSuccess(result.planName);
				onClose();
			} else setError(result.error || "Kode lisensi salah.");
		}, 600);
	};
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-[80] flex items-center justify-center bg-[#0A0804]/85 px-4 py-8 backdrop-blur-sm",
		onClick: onClose,
		children: /* @__PURE__ */ jsxs("div", {
			className: "w-full max-w-lg rounded-[28px] border border-primary/25 bg-[#16130A] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:p-8",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ jsx("button", {
					className: "ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 text-text-muted transition hover:border-primary/50 hover:text-text-primary",
					onClick: onClose,
					"aria-label": "Close modal",
					children: /* @__PURE__ */ jsxs("svg", {
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "1.8",
						className: "h-5 w-5",
						children: [/* @__PURE__ */ jsx("path", { d: "M18 6 6 18" }), /* @__PURE__ */ jsx("path", { d: "m6 6 12 12" })]
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-2 text-center",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-strong",
							children: [/* @__PURE__ */ jsxs("svg", {
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "1.8",
								className: "h-3.5 w-3.5",
								children: [/* @__PURE__ */ jsx("path", { d: "M12 3v18" }), /* @__PURE__ */ jsx("path", { d: "M3 12h18" })]
							}), /* @__PURE__ */ jsx("span", { children: "Tiket Akses Digital" })]
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "text-2xl font-semibold uppercase tracking-[0.08em] text-primary-soft",
							children: "Aktivasi Kode Akses"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 text-sm leading-6 text-text-muted",
							children: "Masukkan kode tiket / lisensi eksklusif Panggung Gembira untuk membuka seluruh video penampilannya."
						})
					]
				}),
				/* @__PURE__ */ jsxs("form", {
					onSubmit: handleSubmit,
					className: "mt-6 space-y-4",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							htmlFor: "license-code",
							className: "mb-2 block text-sm font-medium uppercase tracking-[0.12em] text-[#D9C08F]",
							children: "Kode Lisensi / Access Key"
						}), /* @__PURE__ */ jsx("input", {
							id: "license-code",
							type: "text",
							placeholder: "Contoh: MARHALAH-2024",
							value: code,
							onChange: (e) => setCode(e.target.value),
							autoFocus: true,
							className: "w-full rounded-2xl border border-primary/20 bg-[#0A0804] px-4 py-3 text-sm text-text-primary outline-none ring-0 placeholder:text-text-muted focus:border-primary/60"
						})] }),
						error && /* @__PURE__ */ jsx("div", {
							className: "rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300",
							children: error
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3 text-sm text-text-secondary",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "font-semibold",
									children: "Kode Pengujian Pengembang:"
								}),
								/* @__PURE__ */ jsx("span", {
									className: "ml-2 rounded bg-[#0A0804]/60 px-2 py-1 font-mono text-xs text-primary-soft",
									children: "MARHALAH-2024"
								}),
								/* @__PURE__ */ jsx("span", {
									className: "mx-1",
									children: "•"
								}),
								/* @__PURE__ */ jsx("span", {
									className: "rounded bg-[#0A0804]/60 px-2 py-1 font-mono text-xs text-primary-soft",
									children: "PG-VIP-8888"
								})
							]
						}),
						/* @__PURE__ */ jsx("button", {
							type: "submit",
							className: "flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#0A0804] transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-70",
							disabled: isLoading,
							children: isLoading ? "Verifikasi Kode..." : "Buka Akses Konten"
						})
					]
				})
			]
		})
	});
}
//#endregion
//#region app/components/Navbar.tsx
function Navbar() {
	const [scrolled, setScrolled] = useState(false);
	const [license, setLicense] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const location = useLocation();
	const isHome = location.pathname === "/";
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 50);
		};
		window.addEventListener("scroll", handleScroll);
		setLicense(getStoredLicense());
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);
	const handleSuccess = (planName) => {
		setLicense(getStoredLicense());
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("nav", {
			className: `fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-3 transition sm:px-8 lg:px-10 ${scrolled || !isHome ? "border-b border-primary/25 bg-[#080603]/95 backdrop-blur-xl" : "bg-transparent"}`,
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-1 items-center justify-start gap-3",
				children: [/* @__PURE__ */ jsxs(Link, {
					to: "/",
					className: "flex items-center gap-2 rounded-full border border-primary/20 bg-[rgba(201,168,76,0.12)] px-2 py-1.5 shadow-[0_0_20px_rgba(201,168,76,0.08)]",
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-[#0A0804]/80",
						children: /* @__PURE__ */ jsxs("svg", {
							viewBox: "0 0 24 24",
							fill: "none",
							xmlns: "http://www.w3.org/2000/svg",
							className: "h-[18px] w-[18px] text-primary-strong",
							children: [
								/* @__PURE__ */ jsx("path", {
									d: "M12 2L2 7L12 12L22 7L12 2Z",
									fill: "url(#paint0_linear)"
								}),
								/* @__PURE__ */ jsx("path", {
									d: "M2 17L12 22L22 17",
									stroke: "url(#paint1_linear)",
									strokeWidth: "2",
									strokeLinecap: "round",
									strokeLinejoin: "round"
								}),
								/* @__PURE__ */ jsx("path", {
									d: "M2 12L12 17L22 12",
									stroke: "url(#paint2_linear)",
									strokeWidth: "2",
									strokeLinecap: "round",
									strokeLinejoin: "round"
								}),
								/* @__PURE__ */ jsxs("defs", { children: [
									/* @__PURE__ */ jsxs("linearGradient", {
										id: "paint0_linear",
										x1: "12",
										y1: "2",
										x2: "12",
										y2: "12",
										gradientUnits: "userSpaceOnUse",
										children: [/* @__PURE__ */ jsx("stop", { stopColor: "#E8C96A" }), /* @__PURE__ */ jsx("stop", {
											offset: "1",
											stopColor: "#A07830"
										})]
									}),
									/* @__PURE__ */ jsxs("linearGradient", {
										id: "paint1_linear",
										x1: "12",
										y1: "17",
										x2: "12",
										y2: "22",
										gradientUnits: "userSpaceOnUse",
										children: [/* @__PURE__ */ jsx("stop", { stopColor: "#E8C96A" }), /* @__PURE__ */ jsx("stop", {
											offset: "1",
											stopColor: "#A07830"
										})]
									}),
									/* @__PURE__ */ jsxs("linearGradient", {
										id: "paint2_linear",
										x1: "12",
										y1: "12",
										x2: "12",
										y2: "17",
										gradientUnits: "userSpaceOnUse",
										children: [/* @__PURE__ */ jsx("stop", { stopColor: "#E8C96A" }), /* @__PURE__ */ jsx("stop", {
											offset: "1",
											stopColor: "#A07830"
										})]
									})
								] })
							]
						})
					}), /* @__PURE__ */ jsx("span", {
						className: "hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F0D06A] sm:inline",
						children: "MEDIA PANGGUNG GEMBIRA"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "hidden items-center gap-1 rounded-full border border-primary/20 bg-surface/70 p-1 sm:flex",
					children: [/* @__PURE__ */ jsx(Link, {
						to: "/",
						className: `rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${location.pathname === "/" ? "bg-[rgba(201,168,76,0.18)] text-primary-strong" : "text-text-muted hover:text-text-primary"}`,
						children: "Beranda"
					}), /* @__PURE__ */ jsx(Link, {
						to: "/browse",
						className: `rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${location.pathname === "/browse" ? "bg-[rgba(201,168,76,0.18)] text-primary-strong" : "text-text-muted hover:text-text-primary"}`,
						children: "Browse"
					})]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex flex-1 items-center justify-end gap-2",
				children: [license ? /* @__PURE__ */ jsxs("div", {
					className: "hidden rounded-full border border-primary/40 bg-primary/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-strong sm:flex sm:items-center sm:gap-2",
					title: `Kode: ${license.code}`,
					children: [/* @__PURE__ */ jsx("span", { children: "✨" }), /* @__PURE__ */ jsx("span", { children: license.planName })]
				}) : /* @__PURE__ */ jsxs("button", {
					className: "hidden rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-strong transition hover:bg-primary/20 sm:flex sm:items-center sm:gap-2",
					onClick: () => setIsModalOpen(true),
					children: [/* @__PURE__ */ jsx("span", { children: "🔒" }), /* @__PURE__ */ jsx("span", { children: "Aktivasi Lisensi" })]
				}), /* @__PURE__ */ jsx(Link, {
					to: "/browse",
					className: "flex h-9 w-9 items-center justify-center rounded-full border border-primary/25 bg-white/5 text-text-muted transition hover:border-primary/50 hover:text-primary-strong",
					"aria-label": "Search",
					children: /* @__PURE__ */ jsxs("svg", {
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "2",
						strokeLinecap: "round",
						strokeLinejoin: "round",
						className: "h-4 w-4",
						children: [/* @__PURE__ */ jsx("circle", {
							cx: "11",
							cy: "11",
							r: "8"
						}), /* @__PURE__ */ jsx("line", {
							x1: "21",
							y1: "21",
							x2: "16.65",
							y2: "16.65"
						})]
					})
				})]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "fixed inset-x-3 bottom-3 z-[60] flex items-center justify-around rounded-full border border-[#C9A84C]/25 bg-[#0A0804]/95 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:hidden",
			children: [
				/* @__PURE__ */ jsxs(Link, {
					to: "/",
					className: `flex flex-1 flex-col items-center rounded-full px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] ${location.pathname === "/" ? "bg-primary/15 text-primary-strong" : "text-text-muted"}`,
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-base",
						children: "🏠"
					}), /* @__PURE__ */ jsx("small", { children: "Beranda" })]
				}),
				/* @__PURE__ */ jsxs(Link, {
					to: "/browse",
					className: `flex flex-1 flex-col items-center rounded-full px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] ${location.pathname === "/browse" ? "bg-primary/15 text-primary-strong" : "text-text-muted"}`,
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-base",
						children: "🎬"
					}), /* @__PURE__ */ jsx("small", { children: "Browse" })]
				}),
				/* @__PURE__ */ jsxs("button", {
					className: "flex flex-1 flex-col items-center rounded-full px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted",
					onClick: () => setIsModalOpen(true),
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-base",
						children: "🔑"
					}), /* @__PURE__ */ jsx("small", { children: "Lisensi" })]
				})
			]
		}),
		/* @__PURE__ */ jsx(LicenseModal, {
			isOpen: isModalOpen,
			onClose: () => setIsModalOpen(false),
			onSuccess: handleSuccess
		})
	] });
}
//#endregion
//#region app/components/Footer.tsx
function Footer() {
	return /* @__PURE__ */ jsx("footer", {
		className: "border-t border-[#C9A84C]/20 bg-[linear-gradient(180deg,rgba(10,8,4,0.95),rgba(12,10,6,1))] px-4 py-12 text-center sm:px-8 lg:px-10",
		children: /* @__PURE__ */ jsxs("div", {
			className: "mx-auto flex max-w-6xl flex-col items-center gap-4",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ jsx("div", { className: "h-px w-12 bg-primary/30" }),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ jsx("div", { className: "h-2.5 w-2.5 rotate-45 bg-primary-strong shadow-[0_0_10px_rgba(232,201,106,0.35)]" }),
								/* @__PURE__ */ jsx("div", { className: "h-2.5 w-2.5 rotate-45 border border-primary/50" }),
								/* @__PURE__ */ jsx("div", { className: "h-2.5 w-2.5 rotate-45 bg-primary" })
							]
						}),
						/* @__PURE__ */ jsx("div", { className: "h-px w-12 bg-primary/30" })
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "text-xl font-semibold uppercase tracking-[0.24em] text-primary-soft",
					children: "Panggung Gembira"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "text-sm uppercase tracking-[0.3em] text-primary-strong",
					children: "The Absolute Spectacle"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "max-w-2xl text-sm leading-7 text-text-muted",
					children: [
						"© ",
						(/* @__PURE__ */ new Date()).getFullYear(),
						" Impervious Generation - Panggung Gembira. Semua hak cipta dilindungi."
					]
				})
			]
		})
	});
}
//#endregion
//#region app/components/VideoPlayer.tsx
function getYouTubeVideoId(url) {
	const trimmedUrl = url.trim();
	for (const pattern of [/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/, /youtube-nocookie\.com\/embed\/([a-zA-Z0-9_-]{11})/]) {
		const match = trimmedUrl.match(pattern);
		if (match) return match[1];
	}
	return null;
}
function VideoPlayer({ sourceUrl, posterUrl, title }) {
	const videoRef = useRef(null);
	const youtubeRef = useRef(null);
	const youtubeId = getYouTubeVideoId(sourceUrl);
	useEffect(() => {
		let player;
		const target = youtubeId ? youtubeRef.current : videoRef.current;
		if (typeof window !== "undefined" && target) import("plyr").then((PlyrModule) => {
			const PlyrConstructor = PlyrModule.default || PlyrModule;
			if (target) player = new PlyrConstructor(target, {
				autoplay: false,
				controls: [
					"play-large",
					"play",
					"progress",
					"current-time",
					"duration",
					"mute",
					"volume",
					"captions",
					"settings",
					"pip",
					"airplay",
					"fullscreen"
				]
			});
		}).catch((err) => {
			console.error("Error loading Plyr:", err);
		});
		return () => {
			if (player && typeof player.destroy === "function") player.destroy();
		};
	}, [
		youtubeId,
		sourceUrl,
		title
	]);
	if (youtubeId) return /* @__PURE__ */ jsx("div", {
		className: "plyr-wrapper",
		children: /* @__PURE__ */ jsx("div", {
			ref: youtubeRef,
			className: "plyr",
			"data-plyr-provider": "youtube",
			"data-plyr-embed-id": youtubeId,
			title
		})
	});
	return /* @__PURE__ */ jsx("div", {
		className: "plyr-wrapper",
		children: /* @__PURE__ */ jsx("video", {
			ref: videoRef,
			className: "plyr",
			playsInline: true,
			controls: true,
			poster: posterUrl,
			src: sourceUrl,
			width: "100%",
			children: /* @__PURE__ */ jsx("source", {
				src: sourceUrl,
				type: "video/mp4"
			})
		})
	});
}
//#endregion
//#region app/data/performances.ts
var performances = [
	{
		id: "pg-01",
		title: "Grand Opening Ceremony",
		category: "Non-Performance",
		description: "Pembukaan megah Panggung Gembira dengan pidato, kembang api, dan parade seluruh panitia. Sebuah awal untuk malam yang tak terlupakan.",
		artist: "Panitia PG",
		thumbnail: "https://placehold.co/600x400",
		duration: "45m",
		year: 2024,
		featured: true,
		views: 12500,
		trendingScore: 98,
		videoUrl: "https://lorem.video/720p",
		videoType: "video/mp4"
	},
	{
		id: "pg-02",
		title: "Symphony of The Stars",
		category: "Seni Musik",
		description: "Orkestra simfoni memainkan aransemen lagu-lagu epik dari berbagai era, memadukan instrumen klasik dengan sentuhan modern.",
		artist: "Music Marhalah Team",
		thumbnail: "https://placehold.co/600x400",
		duration: "15m",
		year: 2024,
		featured: true,
		views: 8900,
		trendingScore: 94,
		videoUrl: "https://lorem.video/720p",
		videoType: "video/mp4"
	},
	{
		id: "pg-03",
		title: "Tari Saman Harmoni",
		category: "Seni Tari",
		description: "Tarian tradisional dari Aceh yang dibawakan dengan kecepatan dan kekompakan luar biasa oleh puluhan penari.",
		artist: "Dance Club",
		thumbnail: "https://placehold.co/600x400",
		duration: "12m",
		year: 2024,
		featured: true,
		views: 15400,
		trendingScore: 99,
		videoUrl: "https://lorem.video/720p",
		videoType: "video/mp4"
	},
	{
		id: "pg-04",
		title: "Puisi Berantai",
		category: "Seni Bahasa",
		description: "Penampilan teatrikal puisi yang saling menyambung dengan emosi dan intonasi yang mendalam.",
		artist: "Language Ambassador",
		thumbnail: "https://placehold.co/600x400",
		duration: "8m",
		year: 2024,
		views: 4200,
		trendingScore: 82,
		videoUrl: "https://lorem.video/720p",
		videoType: "video/mp4"
	},
	{
		id: "pg-05",
		title: "Pesan Ketiga : Negosiasi",
		category: "Seni Musik",
		description: "Lantunan sholawat dengan iringan musik rebana khas Al-Banjari yang menyejukkan jiwa.",
		artist: "Tim Hadroh 6101",
		thumbnail: "https://placehold.co/600x400",
		duration: "20m",
		year: 2024,
		featured: true,
		views: 11200,
		trendingScore: 91,
		videoUrl: "https://www.youtube.com/watch?v=lepVoBRvhN8",
		videoType: "video/mp4"
	},
	{
		id: "pg-06",
		title: "Live Painting: Golden Era",
		category: "Seni Rupa",
		description: "Pertunjukan melukis langsung di atas kanvas besar dengan tema masa keemasan.",
		artist: "Art Studio",
		thumbnail: "https://placehold.co/600x400",
		duration: "30m",
		year: 2024,
		views: 6300,
		trendingScore: 86,
		videoUrl: "youtube.com/watch?v=-tKVN2mAKRI",
		videoType: "video/mp4"
	}
];
function getPerformancesByCategory(category) {
	if (category === "Semua") return performances;
	return performances.filter((p) => p.category === category);
}
function getPerformanceById(id) {
	return performances.find((p) => p.id === id);
}
function getFeaturedPerformances() {
	return performances.filter((p) => p.featured || p.trendingScore && p.trendingScore > 90);
}
//#endregion
//#region app/routes/watch.$id.tsx
var watch_$id_exports = /* @__PURE__ */ __exportAll({ default: () => Watch });
function Watch() {
	const { id } = useParams();
	const performance = getPerformanceById(id || "");
	const [license, setLicense] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	useEffect(() => {
		setLicense(getStoredLicense());
	}, []);
	if (!performance) return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-[#0A0804] pt-16 text-[#F5E8C0]",
		children: [
			/* @__PURE__ */ jsx(Navbar, {}),
			/* @__PURE__ */ jsxs("div", {
				className: "mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "mb-4 text-6xl font-black tracking-[0.2em] text-[#C9A84C]",
						children: "404"
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "mb-6 text-2xl font-semibold uppercase tracking-[0.12em] text-[#F5DFA0]",
						children: "Penampilan tidak ditemukan"
					}),
					/* @__PURE__ */ jsx(Link, {
						to: "/browse",
						className: "rounded-full bg-[#C9A84C] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#0A0804] transition hover:bg-[#E8C96A]",
						children: "Kembali ke Browse"
					})
				]
			}),
			/* @__PURE__ */ jsx(Footer, {})
		]
	});
	const related = getPerformancesByCategory(performance.category).filter((p) => p.id !== performance.id).slice(0, 4);
	const handleLicenseSuccess = () => {
		setLicense(getStoredLicense());
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-[#0A0804] pt-16 text-[#F5E8C0]",
		children: [
			/* @__PURE__ */ jsx(Navbar, {}),
			/* @__PURE__ */ jsxs("div", {
				className: "mx-auto max-w-7xl px-4 pb-24 pt-4 sm:px-8 lg:px-12 lg:pt-8",
				children: [/* @__PURE__ */ jsx("div", {
					className: "overflow-hidden rounded-[28px] border border-[#C9A84C]/20 bg-[#16130A] shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
					children: license ? performance.videoUrl ? /* @__PURE__ */ jsx(VideoPlayer, {
						sourceUrl: performance.videoUrl,
						posterUrl: performance.thumbnail,
						title: performance.title
					}) : /* @__PURE__ */ jsxs("div", {
						className: "relative aspect-video overflow-hidden bg-[#0A0804]",
						children: [
							/* @__PURE__ */ jsx("img", {
								src: performance.thumbnail,
								alt: performance.title,
								className: "h-full w-full object-cover"
							}),
							/* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-[#0A0804]/80 to-transparent" }),
							/* @__PURE__ */ jsx("div", {
								className: "absolute inset-0 flex items-center justify-center",
								children: /* @__PURE__ */ jsx("button", {
									className: "flex h-16 w-16 items-center justify-center rounded-full bg-[#C9A84C] text-[#0A0804] shadow-[0_0_30px_rgba(201,168,76,0.35)]",
									children: /* @__PURE__ */ jsx("svg", {
										viewBox: "0 0 24 24",
										fill: "currentColor",
										className: "ml-1 h-7 w-7",
										children: /* @__PURE__ */ jsx("path", { d: "M8 5v14l11-7z" })
									})
								})
							})
						]
					}) : /* @__PURE__ */ jsxs("div", {
						className: "relative aspect-video overflow-hidden bg-[#0A0804]",
						children: [
							/* @__PURE__ */ jsx("img", {
								src: performance.thumbnail,
								alt: performance.title,
								className: "h-full w-full object-cover opacity-70"
							}),
							/* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[#0A0804]/70" }),
							/* @__PURE__ */ jsx("div", {
								className: "absolute inset-0 flex items-center justify-center px-4",
								children: /* @__PURE__ */ jsxs("div", {
									className: "w-full max-w-md rounded-[24px] border border-[#C9A84C]/20 bg-[#16130A]/90 p-6 text-center shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur",
									children: [
										/* @__PURE__ */ jsx("div", {
											className: "mb-4 flex justify-center",
											children: /* @__PURE__ */ jsx("div", {
												className: "flex h-12 w-12 items-center justify-center rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#E8C96A]",
												children: /* @__PURE__ */ jsxs("svg", {
													viewBox: "0 0 24 24",
													fill: "none",
													stroke: "currentColor",
													strokeWidth: "1.8",
													className: "h-6 w-6",
													children: [/* @__PURE__ */ jsx("rect", {
														x: "3",
														y: "7",
														width: "18",
														height: "13",
														rx: "2"
													}), /* @__PURE__ */ jsx("path", { d: "M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })]
												})
											})
										}),
										/* @__PURE__ */ jsx("h3", {
											className: "text-lg font-semibold uppercase tracking-[0.16em] text-[#F5DFA0]",
											children: "Konten Terkunci"
										}),
										/* @__PURE__ */ jsx("p", {
											className: "mt-2 text-sm leading-6 text-[#B8A57A]",
											children: "Masukkan kode tiket / lisensi eksklusif Anda untuk memutar video pertunjukan ini."
										}),
										/* @__PURE__ */ jsx("button", {
											className: "mt-5 rounded-full bg-[#C9A84C] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#0A0804] transition hover:bg-[#E8C96A]",
											onClick: () => setIsModalOpen(true),
											children: "Masukkan Kode Akses"
										})
									]
								})
							})
						]
					})
				}), /* @__PURE__ */ jsxs("div", {
					className: "mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]",
					children: [/* @__PURE__ */ jsxs("main", { children: [
						/* @__PURE__ */ jsx("h1", {
							className: "text-3xl font-semibold uppercase tracking-[0.08em] text-[#F5DFA0] sm:text-4xl",
							children: performance.title
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-4 flex flex-wrap items-center gap-3 text-sm text-[#B8A57A]",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E8C96A]",
									children: performance.category
								}),
								/* @__PURE__ */ jsx("span", { children: "•" }),
								/* @__PURE__ */ jsx("span", { children: performance.year }),
								/* @__PURE__ */ jsx("span", { children: "•" }),
								/* @__PURE__ */ jsx("span", { children: performance.duration })
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-6 flex flex-wrap gap-3",
							children: [license ? /* @__PURE__ */ jsxs("button", {
								className: "inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#0A0804] transition hover:bg-[#E8C96A]",
								children: [/* @__PURE__ */ jsx("svg", {
									viewBox: "0 0 24 24",
									fill: "currentColor",
									className: "h-4 w-4",
									children: /* @__PURE__ */ jsx("path", { d: "M8 5v14l11-7z" })
								}), "Putar"]
							}) : /* @__PURE__ */ jsxs("button", {
								className: "inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#0A0804] transition hover:bg-[#E8C96A]",
								onClick: () => setIsModalOpen(true),
								children: [/* @__PURE__ */ jsxs("svg", {
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "1.8",
									className: "h-4 w-4",
									children: [/* @__PURE__ */ jsx("rect", {
										x: "3",
										y: "7",
										width: "18",
										height: "13",
										rx: "2"
									}), /* @__PURE__ */ jsx("path", { d: "M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })]
								}), "Masukkan Kode Lisensi"]
							}), /* @__PURE__ */ jsxs("button", {
								className: "inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/25 bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#F5E8C0] transition hover:border-[#C9A84C]/50 hover:bg-white/10",
								children: [/* @__PURE__ */ jsx("svg", {
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "1.8",
									className: "h-4 w-4",
									children: /* @__PURE__ */ jsx("path", { d: "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" })
								}), "Simpan"]
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-6 max-w-2xl text-base leading-8 text-[#D9C08F]",
							children: performance.description
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-8 rounded-[24px] border border-[#C9A84C]/15 bg-[#16130A]/80 p-5",
							children: [/* @__PURE__ */ jsx("div", {
								className: "text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A07830]",
								children: "Menampilkan"
							}), /* @__PURE__ */ jsx("div", {
								className: "mt-2 text-lg font-semibold uppercase tracking-[0.08em] text-[#E8C96A]",
								children: performance.artist
							})]
						})
					] }), /* @__PURE__ */ jsxs("aside", {
						className: "rounded-[24px] border border-[#C9A84C]/15 bg-[#16130A]/80 p-5",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "text-sm font-semibold uppercase tracking-[0.16em] text-[#F5E8C0]",
							children: "Rekomendasi Terkait"
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-4 space-y-3",
							children: related.length > 0 ? related.map((item) => /* @__PURE__ */ jsxs(Link, {
								to: `/watch/${item.id}`,
								className: "flex gap-3 rounded-[18px] border border-transparent p-2 transition hover:border-[#C9A84C]/20 hover:bg-[#C9A84C]/10",
								children: [/* @__PURE__ */ jsx("div", {
									className: "h-20 w-24 shrink-0 overflow-hidden rounded-[14px] bg-[#0A0804]",
									children: /* @__PURE__ */ jsx("img", {
										src: item.thumbnail,
										alt: item.title,
										className: "h-full w-full object-cover"
									})
								}), /* @__PURE__ */ jsxs("div", {
									className: "min-w-0",
									children: [
										/* @__PURE__ */ jsx("div", {
											className: "text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A07830]",
											children: item.category
										}),
										/* @__PURE__ */ jsx("h4", {
											className: "mt-1 line-clamp-2 text-sm font-semibold uppercase tracking-[0.02em] text-[#F5E8C0]",
											children: item.title
										}),
										/* @__PURE__ */ jsx("div", {
											className: "mt-1 text-xs text-[#8E7546]",
											children: item.artist
										})
									]
								})]
							}, item.id)) : /* @__PURE__ */ jsx("div", {
								className: "text-sm text-[#8E7546]",
								children: "Belum ada rekomendasi terkait."
							})
						})]
					})]
				})]
			}),
			/* @__PURE__ */ jsx(Footer, {}),
			/* @__PURE__ */ jsx(LicenseModal, {
				isOpen: isModalOpen,
				onClose: () => setIsModalOpen(false),
				onSuccess: handleLicenseSuccess
			})
		]
	});
}
//#endregion
//#region app/components/CategoryFilter.tsx
function CategoryFilter({ categories, activeCategory, onSelect }) {
	return /* @__PURE__ */ jsx("div", {
		className: "sticky top-16 z-40 border-y border-primary/20 bg-[#0A0804]/90 backdrop-blur-xl",
		children: /* @__PURE__ */ jsx("div", {
			className: "mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-8 lg:px-12",
			children: categories.map((cat) => /* @__PURE__ */ jsx("button", {
				className: `shrink-0 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${activeCategory === cat ? "border-primary bg-primary/20 text-primary-strong" : "border-transparent bg-white/5 text-text-muted hover:border-primary/25 hover:text-text-primary"}`,
				onClick: () => onSelect(cat),
				children: cat
			}, cat))
		})
	});
}
//#endregion
//#region app/components/ContentCard.tsx
function ContentCard({ performance, index }) {
	return /* @__PURE__ */ jsxs(Link, {
		to: `/watch/${performance.id}`,
		className: "group mx-auto w-[85vw] max-w-[260px] shrink-0 overflow-hidden rounded-[24px] border border-primary/20 bg-[rgba(18,16,10,0.92)] shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_16px_45px_rgba(201,168,76,0.18)] sm:mx-0 sm:w-[260px]",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "relative aspect-video overflow-hidden",
			children: [
				/* @__PURE__ */ jsx("img", {
					src: performance.thumbnail,
					alt: performance.title,
					loading: "lazy",
					className: "h-full w-full object-cover transition duration-500 group-hover:scale-105"
				}),
				/* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-[#0A0804]/95 via-[#0A0804]/20 to-transparent" }),
				/* @__PURE__ */ jsx("div", {
					className: "absolute left-3 top-3 rounded-full border border-primary/30 bg-[#0A0804]/75 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-strong backdrop-blur",
					children: String(index + 1).padStart(2, "0")
				}),
				/* @__PURE__ */ jsx("div", {
					className: "absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100",
					children: /* @__PURE__ */ jsx("div", {
						className: "flex h-14 w-14 items-center justify-center rounded-full bg-primary text-[#0A0804] shadow-[0_0_30px_rgba(201,168,76,0.35)]",
						children: /* @__PURE__ */ jsx("svg", {
							viewBox: "0 0 24 24",
							fill: "currentColor",
							className: "ml-1 h-6 w-6",
							children: /* @__PURE__ */ jsx("path", { d: "M8 5v14l11-7z" })
						})
					})
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "p-4",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-strong/80",
					children: performance.category
				}),
				/* @__PURE__ */ jsx("h3", {
					className: "mb-2 line-clamp-2 text-sm font-semibold uppercase tracking-[0.02em] text-text-primary",
					children: performance.title
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 text-xs text-text-muted",
					children: [
						/* @__PURE__ */ jsx("span", { children: performance.duration }),
						/* @__PURE__ */ jsx("span", { children: "•" }),
						/* @__PURE__ */ jsx("span", { children: performance.artist })
					]
				})
			]
		})]
	});
}
//#endregion
//#region app/routes/browse.tsx
var browse_exports = /* @__PURE__ */ __exportAll({ default: () => Browse });
var CATEGORIES = [
	"Semua",
	"Seni Musik",
	"Seni Tari",
	"Seni Rupa",
	"Seni Bahasa",
	"Non-Performance"
];
function Browse() {
	const [activeCategory, setActiveCategory] = useState("Semua");
	const [searchQuery, setSearchQuery] = useState("");
	const performances = useMemo(() => {
		let filtered = getPerformancesByCategory(activeCategory);
		if (searchQuery.trim() !== "") {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter((p) => p.title.toLowerCase().includes(query) || p.artist.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
		}
		return filtered;
	}, [activeCategory, searchQuery]);
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-[#0A0804] pt-16",
		children: [
			/* @__PURE__ */ jsx(Navbar, {}),
			/* @__PURE__ */ jsxs("header", {
				className: "px-4 py-10 text-center sm:px-8 lg:px-12",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mx-auto max-w-4xl",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "mb-3 inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#E8C96A]",
							children: [/* @__PURE__ */ jsxs("svg", {
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "1.8",
								className: "h-3.5 w-3.5",
								children: [
									/* @__PURE__ */ jsx("path", { d: "M4 7h16" }),
									/* @__PURE__ */ jsx("path", { d: "M7 3v4" }),
									/* @__PURE__ */ jsx("path", { d: "M17 3v4" }),
									/* @__PURE__ */ jsx("rect", {
										x: "4",
										y: "5",
										width: "16",
										height: "15",
										rx: "2"
									})
								]
							}), /* @__PURE__ */ jsx("span", { children: "Jelajahi Koleksi" })]
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "mb-3 text-3xl font-black uppercase tracking-[0.12em] text-[#F5DFA0] sm:text-4xl",
							children: "Jelajahi"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-sm text-[#B8A57A] sm:text-base",
							children: "Temukan penampilan luar biasa dari Panggung Gembira"
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "mx-auto mt-6 flex max-w-2xl items-center gap-3 rounded-full border border-[#C9A84C]/20 bg-[#16130A]/80 px-4 py-3 shadow-[0_6px_24px_rgba(0,0,0,0.28)]",
					children: [/* @__PURE__ */ jsxs("svg", {
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "2",
						strokeLinecap: "round",
						strokeLinejoin: "round",
						className: "h-5 w-5 text-[#E8C96A]",
						children: [/* @__PURE__ */ jsx("circle", {
							cx: "11",
							cy: "11",
							r: "8"
						}), /* @__PURE__ */ jsx("line", {
							x1: "21",
							y1: "21",
							x2: "16.65",
							y2: "16.65"
						})]
					}), /* @__PURE__ */ jsx("input", {
						type: "text",
						placeholder: "Cari penampilan, seniman, atau kategori...",
						value: searchQuery,
						onChange: (e) => setSearchQuery(e.target.value),
						className: "w-full border-none bg-transparent text-sm text-[#F5E8C0] outline-none placeholder:text-[#7A6845]"
					})]
				})]
			}),
			/* @__PURE__ */ jsx(CategoryFilter, {
				categories: CATEGORIES,
				activeCategory,
				onSelect: setActiveCategory
			}),
			/* @__PURE__ */ jsx("main", {
				className: "px-4 py-8 pb-24 sm:px-8 sm:pb-10 lg:px-12",
				children: performances.length > 0 ? /* @__PURE__ */ jsx("div", {
					className: "grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
					children: performances.map((perf, idx) => /* @__PURE__ */ jsx(ContentCard, {
						performance: perf,
						index: idx
					}, perf.id))
				}) : /* @__PURE__ */ jsx("div", {
					className: "rounded-[24px] border border-[#C9A84C]/20 bg-[#16130A]/80 px-8 py-16 text-center text-[#B8A57A]",
					children: /* @__PURE__ */ jsx("p", { children: "Tidak ada penampilan yang sesuai dengan pencarian Anda." })
				})
			}),
			/* @__PURE__ */ jsx(Footer, {})
		]
	});
}
//#endregion
//#region app/components/HeroSection.tsx
function HeroSection({ featuredItems }) {
	const [currentIndex, setCurrentIndex] = useState(0);
	useEffect(() => {
		if (!featuredItems || featuredItems.length <= 1) return;
		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
		}, 7e3);
		return () => clearInterval(interval);
	}, [featuredItems]);
	if (!featuredItems || featuredItems.length === 0) return null;
	const current = featuredItems[currentIndex];
	return /* @__PURE__ */ jsxs("section", {
		className: "relative isolate min-h-[88vh] overflow-hidden bg-[#080603] sm:min-h-[90vh] lg:min-h-[88vh]",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "absolute inset-0",
				children: [
					/* @__PURE__ */ jsx("img", {
						src: current.thumbnail,
						alt: current.title,
						className: "h-full w-full object-cover object-center"
					}),
					/* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.22),transparent_35%)]" }),
					/* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[linear-gradient(90deg,rgba(7,5,3,0.96)_0%,rgba(7,5,3,0.78)_45%,rgba(7,5,3,0.25)_100%)]" }),
					/* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[linear-gradient(180deg,rgba(7,5,3,0.08)_0%,rgba(7,5,3,0.72)_85%,rgba(7,5,3,1)_100%)]" })
				]
			}, current.id),
			/* @__PURE__ */ jsx("div", {
				className: "relative z-10 mx-auto flex min-h-[88vh] max-w-7xl items-center px-4 pb-16 pt-24 sm:min-h-[90vh] sm:items-end sm:px-8 lg:px-10 lg:pb-14 xl:px-0",
				children: /* @__PURE__ */ jsxs("div", {
					className: "w-full max-w-2xl text-center sm:text-left",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "mb-4 inline-flex items-center gap-2 rounded-full border border-primary/35 bg-[rgba(201,168,76,0.12)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary-strong shadow-[0_0_25px_rgba(201,168,76,0.12)]",
							children: [/* @__PURE__ */ jsxs("svg", {
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "1.8",
								className: "h-3.5 w-3.5",
								children: [
									/* @__PURE__ */ jsx("path", { d: "M4 7h16" }),
									/* @__PURE__ */ jsx("path", { d: "M7 3v4" }),
									/* @__PURE__ */ jsx("path", { d: "M17 3v4" }),
									/* @__PURE__ */ jsx("rect", {
										x: "4",
										y: "5",
										width: "16",
										height: "15",
										rx: "2"
									})
								]
							}), /* @__PURE__ */ jsxs("span", { children: [
								current.category,
								" • ",
								current.id
							] })]
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "mb-4 text-4xl font-black uppercase leading-[0.95] tracking-[0.04em] text-primary-soft drop-shadow-[0_4px_24px_rgba(201,168,76,0.18)] sm:text-5xl lg:text-7xl",
							children: current.title
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mb-5 flex flex-wrap items-center justify-center gap-3 text-sm text-text-muted sm:justify-start",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "rounded-full border border-primary/30 bg-[rgba(201,168,76,0.16)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-strong",
									children: current.category
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-text-muted",
									children: "•"
								}),
								/* @__PURE__ */ jsx("span", { children: current.year }),
								/* @__PURE__ */ jsx("span", {
									className: "text-text-muted",
									children: "•"
								}),
								/* @__PURE__ */ jsx("span", { children: current.duration }),
								current.views && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
									className: "text-text-muted",
									children: "•"
								}), /* @__PURE__ */ jsxs("span", { children: [current.views.toLocaleString(), " Penonton"] })] })
							]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mx-auto mb-8 max-w-xl text-base leading-7 text-[#D9C08F] sm:mx-0 sm:text-lg",
							children: current.description
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap justify-center gap-3 sm:justify-start",
							children: [/* @__PURE__ */ jsxs(Link, {
								to: `/watch/${current.id}`,
								className: "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary via-primary-strong to-primary-soft px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#0A0804] shadow-[0_10px_30px_rgba(201,168,76,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(201,168,76,0.34)]",
								children: [/* @__PURE__ */ jsx("svg", {
									viewBox: "0 0 24 24",
									fill: "currentColor",
									className: "h-4 w-4",
									children: /* @__PURE__ */ jsx("path", { d: "M8 5v14l11-7z" })
								}), "Putar Sekarang"]
							}), /* @__PURE__ */ jsxs(Link, {
								to: `/watch/${current.id}`,
								className: "inline-flex items-center gap-2 rounded-full border border-primary/35 bg-surface/70 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-text-primary backdrop-blur-sm transition hover:border-primary/60 hover:bg-[#1A150E]",
								children: [/* @__PURE__ */ jsxs("svg", {
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "1.8",
									className: "h-4 w-4",
									children: [
										/* @__PURE__ */ jsx("circle", {
											cx: "12",
											cy: "12",
											r: "9"
										}),
										/* @__PURE__ */ jsx("path", { d: "M12 8v4" }),
										/* @__PURE__ */ jsx("path", { d: "M12 16h.01" })
									]
								}), "Info Selengkapnya"]
							})]
						})
					]
				})
			}, `content-${current.id}`),
			featuredItems.length > 1 && /* @__PURE__ */ jsx("div", {
				className: "absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2",
				children: featuredItems.map((item, idx) => /* @__PURE__ */ jsx("button", {
					className: `h-2.5 rounded-full transition ${idx === currentIndex ? "w-8 bg-primary shadow-[0_0_16px_rgba(201,168,76,0.35)]" : "w-2.5 bg-white/45"}`,
					onClick: () => setCurrentIndex(idx),
					"aria-label": `Slide ${idx + 1}`
				}, item.id))
			})
		]
	});
}
//#endregion
//#region app/components/ContentRow.tsx
function ContentRow({ title, performances, seeAllLink }) {
	const rowRef = useRef(null);
	const scroll = (direction) => {
		if (rowRef.current) {
			const { scrollLeft, clientWidth } = rowRef.current;
			const scrollTo = direction === "left" ? scrollLeft - clientWidth + 40 : scrollLeft + clientWidth - 40;
			rowRef.current.scrollTo({
				left: scrollTo,
				behavior: "smooth"
			});
		}
	};
	if (performances.length === 0) return null;
	return /* @__PURE__ */ jsxs("section", {
		className: "mx-auto mb-10 max-w-7xl px-4 sm:px-8 lg:px-12",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "mb-5 flex items-start justify-between gap-3 sm:items-center",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "text-base font-semibold uppercase tracking-[0.18em] text-primary-soft sm:text-lg",
				children: title
			}), seeAllLink && /* @__PURE__ */ jsx(Link, {
				to: seeAllLink,
				className: "rounded-full border border-primary/25 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-strong transition hover:bg-primary/10",
				children: "Lihat Semua"
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ jsx("button", {
					className: "absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-primary/25 bg-[#0A0804]/90 text-primary-strong shadow-lg backdrop-blur sm:flex",
					onClick: () => scroll("left"),
					"aria-label": "Scroll left",
					children: /* @__PURE__ */ jsx("svg", {
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "2",
						strokeLinecap: "round",
						strokeLinejoin: "round",
						className: "h-4 w-4",
						children: /* @__PURE__ */ jsx("polyline", { points: "15 18 9 12 15 6" })
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto pb-2 pl-0 pr-0 sm:pl-10 sm:pr-10",
					ref: rowRef,
					children: /* @__PURE__ */ jsx("div", {
						className: "flex justify-center gap-4 sm:justify-start",
						children: performances.map((perf, index) => /* @__PURE__ */ jsx(ContentCard, {
							performance: perf,
							index
						}, perf.id))
					})
				}),
				/* @__PURE__ */ jsx("button", {
					className: "absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-primary/25 bg-[#0A0804]/90 text-primary-strong shadow-lg backdrop-blur sm:flex",
					onClick: () => scroll("right"),
					"aria-label": "Scroll right",
					children: /* @__PURE__ */ jsx("svg", {
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "2",
						strokeLinecap: "round",
						strokeLinejoin: "round",
						className: "h-4 w-4",
						children: /* @__PURE__ */ jsx("polyline", { points: "9 18 15 12 9 6" })
					})
				})
			]
		})]
	});
}
//#endregion
//#region app/routes/_index.tsx
var _index_exports = /* @__PURE__ */ __exportAll({
	default: () => Index,
	meta: () => meta
});
var meta = () => {
	return [{ title: "Impermedia — Panggung Gembira" }, {
		name: "description",
		content: "Platform streaming eksklusif Panggung Gembira"
	}];
};
function Index() {
	const featuredItems = getFeaturedPerformances();
	const musicPerformances = getPerformancesByCategory("Seni Musik");
	const dancePerformances = getPerformancesByCategory("Seni Tari");
	const artPerformances = getPerformancesByCategory("Seni Rupa");
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-[#0A0804]",
		children: [
			/* @__PURE__ */ jsx(Navbar, {}),
			/* @__PURE__ */ jsx(HeroSection, { featuredItems }),
			/* @__PURE__ */ jsxs("main", {
				className: "mx-auto max-w-7xl pb-24 sm:pb-10",
				children: [
					/* @__PURE__ */ jsx(ContentRow, {
						title: "Seni Musik",
						performances: musicPerformances,
						seeAllLink: "/browse"
					}),
					/* @__PURE__ */ jsx(ContentRow, {
						title: "Seni Tari",
						performances: dancePerformances,
						seeAllLink: "/browse"
					}),
					/* @__PURE__ */ jsx(ContentRow, {
						title: "Seni Rupa & Lainnya",
						performances: artPerformances,
						seeAllLink: "/browse"
					})
				]
			}),
			/* @__PURE__ */ jsx(Footer, {})
		]
	});
}
//#endregion
//#region \0virtual:remix/server-manifest
var server_manifest_default = {
	"entry": {
		"module": "/assets/entry.client-qR4UwPpV.js",
		"imports": ["/assets/jsx-runtime-CeYRphe3.js"],
		"css": []
	},
	"routes": {
		"root": {
			"id": "root",
			"parentId": void 0,
			"path": "",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasErrorBoundary": false,
			"module": "/assets/root-Cy9QBNU_.js",
			"imports": ["/assets/jsx-runtime-CeYRphe3.js"],
			"css": ["/assets/root-BiRcmymD.css"]
		},
		"routes/watch.$id": {
			"id": "routes/watch.$id",
			"parentId": "root",
			"path": "watch/:id",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasErrorBoundary": false,
			"module": "/assets/watch._id-tCBr6pmy.js",
			"imports": ["/assets/jsx-runtime-CeYRphe3.js", "/assets/performances-Bix_D3Kl.js"],
			"css": []
		},
		"routes/browse": {
			"id": "routes/browse",
			"parentId": "root",
			"path": "browse",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasErrorBoundary": false,
			"module": "/assets/browse-DOIOUMxZ.js",
			"imports": [
				"/assets/jsx-runtime-CeYRphe3.js",
				"/assets/performances-Bix_D3Kl.js",
				"/assets/ContentCard-CLuWq7wL.js"
			],
			"css": []
		},
		"routes/_index": {
			"id": "routes/_index",
			"parentId": "root",
			"path": void 0,
			"index": true,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasErrorBoundary": false,
			"module": "/assets/_index-C3Zoek0p.js",
			"imports": [
				"/assets/jsx-runtime-CeYRphe3.js",
				"/assets/performances-Bix_D3Kl.js",
				"/assets/ContentCard-CLuWq7wL.js"
			],
			"css": []
		}
	},
	"url": "/assets/manifest-2903ffbd.js",
	"version": "2903ffbd"
};
//#endregion
//#region \0virtual:remix/server-build
var server_build_exports = /* @__PURE__ */ __exportAll({
	assets: () => server_manifest_default,
	assetsBuildDirectory: () => assetsBuildDirectory,
	basename: () => "/",
	entry: () => entry,
	future: () => future,
	isSpaMode: () => false,
	mode: () => mode,
	publicPath: () => "/",
	routes: () => routes
});
/**
* `mode` is only relevant for the old Remix compiler but
* is included here to satisfy the `ServerBuild` typings.
*/
var mode = "production";
var assetsBuildDirectory = "build\\client";
var basename = "/";
var future = {
	"v3_fetcherPersist": true,
	"v3_relativeSplatPath": true,
	"v3_throwAbortReason": true,
	"v3_routeConfig": false,
	"v3_singleFetch": false,
	"v3_lazyRouteDiscovery": false,
	"unstable_optimizeDeps": false
};
var isSpaMode = false;
var publicPath = "/";
var entry = { module: entry_server_node_exports };
var routes = {
	"root": {
		id: "root",
		parentId: void 0,
		path: "",
		index: void 0,
		caseSensitive: void 0,
		module: root_exports
	},
	"routes/watch.$id": {
		id: "routes/watch.$id",
		parentId: "root",
		path: "watch/:id",
		index: void 0,
		caseSensitive: void 0,
		module: watch_$id_exports
	},
	"routes/browse": {
		id: "routes/browse",
		parentId: "root",
		path: "browse",
		index: void 0,
		caseSensitive: void 0,
		module: browse_exports
	},
	"routes/_index": {
		id: "routes/_index",
		parentId: "root",
		path: void 0,
		index: true,
		caseSensitive: void 0,
		module: _index_exports
	}
};
//#endregion
export { isSpaMode as a, routes as c, future as i, server_build_exports as l, basename as n, mode as o, entry as r, publicPath as s, assetsBuildDirectory as t, server_manifest_default as u };
