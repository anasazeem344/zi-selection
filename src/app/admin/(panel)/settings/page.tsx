import { AdminForm, Field } from "@/components/admin/AdminForm";
import { Card, PageHeader } from "@/components/admin/ui";
import { saveSettings } from "@/lib/actions/admin";
import { requireOwner } from "@/lib/admin/auth";
import { adminProducts, adminSettings } from "@/lib/admin/queries";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireOwner();
  const [s, products] = await Promise.all([adminSettings(), adminProducts()]);
  const photos = products.flatMap((p) => p.images.map((i, n) => ({ path: i.path, label: `${p.name} · photo ${n + 1}` })));

  return (
    <>
      <PageHeader title="Settings" sub="These control the whole website: contact details, opening hours, the announcement bar and the home page headline." />
      <AdminForm action={saveSettings} submitLabel="Save settings">
        <div className="space-y-6">
          <Card title="Contact and hours">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Shop name" htmlFor="shop_name"><input id="shop_name" name="shop_name" defaultValue={s.shop_name} className="input" maxLength={60} /></Field>
              <Field label="Instagram handle" htmlFor="instagram" hint="Customers are sent here to order or follow."><input id="instagram" name="instagram" defaultValue={s.instagram} className="input" required /></Field>
              <Field label="WhatsApp number" htmlFor="whatsapp" hint="Adds an “Order on WhatsApp” button. Leave empty to use Instagram only."><input id="whatsapp" name="whatsapp" defaultValue={s.whatsapp} className="input" inputMode="tel" placeholder="0300 1234567" /></Field>
              <Field label="Contact email" htmlFor="email" hint="Shown in the website footer."><input id="email" name="email" type="email" defaultValue={s.email} className="input" maxLength={120} placeholder="hello@example.com" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Opens" htmlFor="hours_open"><input id="hours_open" name="hours_open" type="time" defaultValue={s.hours_open} className="input" required /></Field>
                <Field label="Closes" htmlFor="hours_close"><input id="hours_close" name="hours_close" type="time" defaultValue={s.hours_close} className="input" required /></Field>
              </div>
              <Field label="Delivery note (optional)" htmlFor="delivery_note" hint="Shown in the footer, e.g. where you deliver and how long it takes. Only write what is true." className="sm:col-span-2">
                <input id="delivery_note" name="delivery_note" defaultValue={s.delivery_note} className="input" maxLength={220} />
              </Field>
            </div>
          </Card>

          <Card title="Announcement bar">
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input type="checkbox" name="announce_on" defaultChecked={s.announce_on} className="h-5 w-5 accent-[var(--ink)]" /> Show the bar at the top of every page
            </label>
            <Field label="Message" htmlFor="announce" className="mt-4"><input id="announce" name="announce" defaultValue={s.announce} className="input" maxLength={160} /></Field>
          </Card>

          <Card title="Home page">
            <div className="grid gap-5">
              <Field label="Headline" htmlFor="hero_headline"><input id="hero_headline" name="hero_headline" defaultValue={s.hero_headline} className="input" maxLength={80} /></Field>
              <Field label="Sub-headline" htmlFor="hero_sub"><input id="hero_sub" name="hero_sub" defaultValue={s.hero_sub} className="input" maxLength={220} /></Field>
              <Field label="Hero photo" htmlFor="hero_image" hint="Choose from photos you have already uploaded to products.">
                <select id="hero_image" name="hero_image" defaultValue={s.hero_image} className="input">
                  <option value="">Default editorial image</option>
                  {photos.map((p) => <option key={p.path} value={p.path}>{p.label}</option>)}
                </select>
              </Field>
            </div>
          </Card>
        </div>
      </AdminForm>
    </>
  );
}
