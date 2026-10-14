import { pageMeta } from "@/lib/seo";
import { getStops } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { CommunityForm } from "@/components/forms/CommunityForm";

export const metadata = pageMeta({ title: "Post a job or event", description: "Post a job or an event in Kaghan Valley. Every post is reviewed before it goes live.", path: "/community/post", noindex: true });

export default async function PostPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  const stops = await getStops();
  const k = kind === "event" ? "event" : "job";
  return (
    <>
      <PageHero kicker="Community board" title={k === "job" ? "Post a job" : "Submit an event"} sub="A moderator reviews every post, usually within a day." />
      <section className="px-4 py-12 md:px-6">
        <div className="mx-auto max-w-3xl"><CommunityForm kind={k} stops={stops.map((s) => ({ slug: s.slug, name: s.name }))} /></div>
      </section>
    </>
  );
}
