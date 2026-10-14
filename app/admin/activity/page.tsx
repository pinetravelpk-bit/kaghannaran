import { getActivity } from "@/lib/data";
import { AdminHeader } from "@/components/admin/ui";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = { title: "Activity log" };

export default async function ActivityAdmin() {
  const items = await getActivity(200);
  const byDay = items.reduce<Record<string, typeof items>>((a, i) => { const d = new Date(i.at).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }); (a[d] ??= []).push(i); return a; }, {});
  return (
    <>
      <AdminHeader title="Activity log" sub="Every approval, rejection, road update and settings change, with who did it." />
      <div className="flex flex-col gap-6">
        {Object.entries(byDay).map(([day, list]) => (
          <Reveal key={day} className="rounded-3xl border border-line bg-white p-5">
            <h2 className="mb-3 font-display text-lg font-bold">{day}</h2>
            <ol className="relative flex flex-col gap-3 border-s-2 border-line ps-5">
              {list.map((a) => (
                <li key={a.id} className="relative text-sm"><span className="absolute -start-[27px] top-1 size-3.5 rounded-full border-2 border-white bg-amber" /><span className="font-mono text-xs text-muted">{new Date(a.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span> <b>{a.actor}</b> {a.action} <span className="text-ink-2">{a.target}</span></li>
              ))}
            </ol>
          </Reveal>
        ))}
      </div>
    </>
  );
}
