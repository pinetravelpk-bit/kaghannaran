"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, X } from "lucide-react";
import { photo } from "@/lib/media";

/** Turn a YouTube / Vimeo / mp4 URL into something we can play. */
function toEmbed(url: string): { kind: "iframe" | "video"; src: string } | null {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0` };
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return { kind: "iframe", src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1` };
  if (/\.(mp4|webm)(\?|$)/i.test(url)) return { kind: "video", src: url };
  return null;
}

const FRAMES = [photo("naranDrone", 1400), photo("kunhar", 1400), photo("lulusar", 1400), photo("jalkhad", 1400), photo("naranNight", 1400)];

export function Film({ url }: { url: string }) {
  const [open, setOpen] = useState(false);
  const embed = toEmbed(url);
  return (
    <div className="relative isolate overflow-hidden rounded-[28px] bg-board">
      {/* cinematic slideshow: crossfading frames with slow Ken Burns */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        {FRAMES.map((src, i) => (
          <motion.img
            key={src}
            src={src}
            alt=""
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [1.05, 1.12] }}
            transition={{ duration: 8, delay: i * 6, repeat: Infinity, repeatDelay: FRAMES.length * 6 - 8, ease: "linear" }}
          />
        ))}
        <div className="absolute inset-0 bg-[rgba(10,23,22,0.55)]" />
      </div>
      <div className="flex min-h-[460px] flex-col items-center justify-center gap-6 p-8 text-center text-white md:min-h-[560px]">
        {embed ? (
          <button type="button" onClick={() => setOpen(true)} aria-label="Play the valley film" className="group relative flex size-24 items-center justify-center rounded-full bg-amber text-ink">
            <span className="absolute inset-0 animate-ping rounded-full bg-amber/40" />
            <Play className="relative size-9 translate-x-0.5 fill-current" />
          </button>
        ) : (
          <span className="rounded-full border border-white/30 px-4 py-2 font-mono text-xs tracking-widest">ADD A VIDEO LINK IN ADMIN › SETTINGS</span>
        )}
        <p className="max-w-lg text-lg text-mist">Drone shots, river runs and the drive to Babusar, in a few minutes.</p>
      </div>
      <AnimatePresence>
        {open && embed ? (
          <motion.div role="dialog" aria-modal="true" aria-label="Valley film" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4">
            <button type="button" onClick={() => setOpen(false)} aria-label="Close video" className="absolute top-5 right-5 flex size-11 items-center justify-center rounded-full bg-white text-ink"><X /></button>
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} className="aspect-video w-full max-w-5xl overflow-hidden rounded-2xl bg-black">
              {embed.kind === "iframe" ? (
                <iframe src={embed.src} title="Valley film" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen className="h-full w-full" />
              ) : (
                <video src={embed.src} controls autoPlay className="h-full w-full" />
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
