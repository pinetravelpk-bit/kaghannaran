import { pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/site/PageHero";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata = pageMeta({ title: "Privacy policy", description: "How Pine Travel (SMC-Private) Limited handles your information on kaghannaran.com.", path: "/privacy" });

export default function PrivacyPage() {
  return (
    <>
      <PageHero kicker="Privacy" title="Privacy policy" sub="How Pine Travel (SMC-Private) Limited handles your information on kaghannaran.com." />
      <section className="px-4 py-12 md:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 text-lg text-ink-2">
          <h2 className="font-display text-2xl font-extrabold text-ink">What we collect</h2>
          <p>When you create an account we keep your name, email address, phone number and account type. When you list a business or register as a guide we also keep the listing details, photos and the verification documents you upload.</p>
          <h2 className="font-display text-2xl font-extrabold text-ink">Verification documents</h2>
          <p>Documents uploaded for verification (CNIC, licences, registrations) are stored in a private bucket. Only the uploader and our moderators can open them, and they are never shown on the public site. Moderators open them through links that expire after 10 minutes.</p>
          <h2 className="font-display text-2xl font-extrabold text-ink">How we use it</h2>
          <p>We use your information to run your account, review and publish listings, and contact you about your listing. Contact details you choose to publish on a listing (phone, WhatsApp) are shown publicly. We do not sell your data.</p>
          <h2 className="font-display text-2xl font-extrabold text-ink">How long we keep it</h2>
          <p>We keep your account and listings while your account is active. Verification documents are kept while the listing is live and deleted within 90 days of the listing or account being removed, unless the law requires us to keep them longer.</p>
          <h2 className="font-display text-2xl font-extrabold text-ink">Your choices</h2>
          <p>You can edit your listings from your dashboard at any time. To delete your account and data, or to ask what we hold about you, email <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-maroon underline">{CONTACT_EMAIL}</a>.</p>
          <h2 className="font-display text-2xl font-extrabold text-ink">Third-party services</h2>
          <p>Weather data comes from Open-Meteo, fonts from Google Fonts, and some photos from Wikimedia Commons. These services may receive your IP address when your browser loads them.</p>
        </div>
      </section>
    </>
  );
}
