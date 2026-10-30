"use client";

import { Fragment, useRef, useState } from "react";
import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HANDOUTS, type Handout, type Run, type SourcePage } from "@/lib/handouts";

function Runs({ runs }: { runs: Run[] }) {
  return (
    <>
      {runs.map((r, i) => {
        const lines = r.text.split("\n");
        const content = lines.map((line, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            {line}
          </Fragment>
        ));
        if (r.bold) return <strong key={i}>{content}</strong>;
        if (r.italic) return <em key={i}>{content}</em>;
        return <Fragment key={i}>{content}</Fragment>;
      })}
    </>
  );
}

/** One printout, drawn as a mock browser window so it reads like Glitch's web "research". */
function MockWebpage({ source, total }: { source: SourcePage; total: number }) {
  return (
    <article aria-label={`Source ${source.id} of ${total}: ${source.name}`} className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2">
        <span className="flex gap-1" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-md bg-white px-2 py-0.5 font-mono text-xs text-slate-600" title={source.url}>
          {source.url}
        </span>
      </div>
      <div className="space-y-2.5 p-4 text-sm leading-relaxed text-slate-700">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Source {source.id} of {total}
        </p>
        {source.paras.map((para, i) =>
          i === 0 ? (
            <p key={i} className="font-display text-lg font-bold text-slate-900">
              <Runs runs={para.runs} />
            </p>
          ) : para.bold ? (
            <p key={i} className="font-semibold text-slate-900">
              <Runs runs={para.runs} />
            </p>
          ) : (
            <p key={i}>
              <Runs runs={para.runs} />
            </p>
          )
        )}
      </div>
    </article>
  );
}

function HandoutBody({ handout }: { handout: Handout }) {
  const sourceRefs = useRef<Record<number, HTMLElement | null>>({});

  if (handout.kind === "pages") {
    return (
      <div className="space-y-4">
        {handout.pages.map((page, i) => (
          <figure key={page.src} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={page.src}
              alt={`Page ${i + 1} of ${handout.pages.length}`}
              loading={i < 2 ? "eager" : "lazy"}
              className="block h-auto w-full"
            />
            <figcaption className="sr-only">{page.text}</figcaption>
          </figure>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <nav aria-label="Jump to a source" className="flex flex-wrap gap-1.5">
        {handout.sources.map((s) => (
          <button
            key={s.id}
            onClick={() => sourceRefs.current[s.id]?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {s.id}. {s.name}
          </button>
        ))}
      </nav>
      {handout.sources.map((s) => (
        <div key={s.id} ref={(el) => { sourceRefs.current[s.id] = el; }} className="scroll-mt-2">
          <MockWebpage source={s} total={handout.sources.length} />
        </div>
      ))}
    </div>
  );
}

/** Puzzle-header button that opens the puzzle's reference handout, labelled for that challenge. */
export default function LabPapers({ ids, ringClass }: { ids: string[]; ringClass: string }) {
  const handouts = ids.map((id) => HANDOUTS[id]).filter(Boolean);
  const [active, setActive] = useState(0);
  if (handouts.length === 0) return null;
  const handout = handouts[Math.min(active, handouts.length - 1)];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={`inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 ${ringClass}`}
        >
          <FileText className="h-4 w-4" />
          {handouts[0].button}
        </button>
      </DialogTrigger>
      <DialogContent className="flex h-[90vh] w-[calc(100%-1rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl border-slate-200 bg-slate-50 p-0">
        <div className="border-b border-slate-200 bg-white px-5 py-4 pr-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">From around the lab</p>
          <DialogTitle className="font-display text-xl font-bold text-slate-900">{handout.title}</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-slate-600">
            {handout.note ?? "Reference material from around the lab. Scroll to read; close this to get back to the puzzle."}
          </DialogDescription>
          {handouts.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2" role="tablist">
              {handouts.map((h, i) => (
                <button
                  key={h.id}
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => setActive(i)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${i === active ? "bg-slate-800 text-white" : "border border-slate-300 bg-white text-slate-700"}`}
                >
                  {h.title}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <HandoutBody key={handout.id} handout={handout} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
