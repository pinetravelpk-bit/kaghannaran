import { PageHero } from "@/components/site/PageHero";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero kicker="Privacy" title="Privacy policy" sub="[Replace this page with your privacy policy before launch.]" />
      <section className="px-4 py-12 md:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 text-lg text-ink-2">
          <p>Documents uploaded for verification (CNIC, licences, registrations) are stored in a private bucket. Only the uploader and our moderators can open them, and they are never shown on the public site.</p>
          <p>[Add how long you keep documents, who to contact, and how users can delete their data.]</p>
        </div>
      </section>
    </>
  );
}
