-- Starter content. Run after schema.sql.
-- Products are SAMPLES (no photos, price on request, no materials) so you can see
-- the site working. Edit or delete them in the admin, then add your real pieces.

insert into public.categories (slug, name, position) values
  ('rings','Rings',1), ('brooches','Brooches',2), ('necklaces','Necklaces',3), ('earrings','Earrings',4)
on conflict (slug) do nothing;

insert into public.products (slug, name, category, description, status, sizes, stock, featured, position, is_sample, low_stock)
values
  ('solitaire-cz-ring',   'Solitaire CZ Ring',   'rings', 'A fine gold-tone ring set with a single clear stone.',          'active', '{5,6,7,8,9,10}', '{"5":3,"6":3,"7":3,"8":3,"9":3,"10":3}', true,  1, true, 2),
  ('triple-band-set',     'Triple Band Set',     'rings', 'Three slim gold-tone bands that stack or wear apart.',          'active', '{5,6,7,8,9,10}', '{"5":3,"6":3,"7":3,"8":3,"9":3,"10":3}', true,  2, true, 2),
  ('clover-cz-ring',      'Clover CZ Ring',      'rings', 'A clover motif set with clear stones.',                         'active', '{5,6,7,8,9,10}', '{"5":3,"6":3,"7":3,"8":3,"9":3,"10":3}', true,  3, true, 2),
  ('star-stack-ring',     'Star Stack Ring',     'rings', 'A delicate stackable ring with a star detail.',                 'active', '{5,6,7,8,9,10}', '{"5":3,"6":3,"7":3,"8":3,"9":3,"10":3}', false, 4, true, 2),
  ('ribbed-open-ring',    'Ribbed Open Ring',    'rings', 'A ribbed gold-tone band with an open back.',                    'active', '{5,6,7,8,9,10}', '{"5":3,"6":3,"7":3,"8":3,"9":3,"10":3}', false, 5, true, 2),
  ('pearl-statement-ring','Pearl Statement Ring','rings', 'A bold cocktail ring with a pearl-look centre.',                'active', '{5,6,7,8,9,10}', '{"5":3,"6":3,"7":3,"8":3,"9":3,"10":3}', false, 6, true, 2),
  ('gold-flower-brooch',  'Gold Flower Brooch',  'brooches',  'A gold-tone flower spray with crystal accents.',            'active', '{}', '{"all":3}', true,  7, true, 2),
  ('crystal-wreath-brooch','Crystal Wreath Brooch','brooches','A wreath of clear crystals in a gold-tone setting.',        'active', '{}', '{"all":3}', true,  8, true, 2),
  ('peacock-leaf-brooch', 'Peacock Leaf Brooch', 'brooches',  'A leaf-and-feather brooch with opal-look stones.',          'active', '{}', '{"all":3}', false, 9, true, 2),
  ('layered-lariat-necklace','Layered Lariat Necklace','necklaces','A double fine chain with ball drops.',                 'active', '{}', '{"all":3}', true, 10, true, 2),
  ('black-stone-pendant', 'Black Stone Pendant', 'necklaces', 'A fine chain with a dark stone and square crystal pendant.','active', '{}', '{"all":3}', false, 11, true, 2),
  ('cz-circle-drops',     'CZ Circle Drops',     'earrings',  'Clear-stone circles with a small drop.',                    'active', '{}', '{"all":3}', true, 12, true, 2),
  ('blue-halo-studs',     'Blue Halo Studs',     'earrings',  'Deep blue stones framed by a crystal halo.',                'active', '{}', '{"all":3}', false, 13, true, 2),
  ('pearl-studs',         'Pearl Studs',         'earrings',  'Simple studs with a pearl-look finish.',                    'active', '{}', '{"all":3}', false, 14, true, 2)
on conflict (slug) do nothing;

-- Pages: only "How to order" is written (it describes how this site works).
-- The rest are empty and unpublished: write them in the admin in your own words.
insert into public.pages (slug, title, body, published) values
  ('how-to-order', 'How to order',
   E'1. Browse the collection and add the pieces you like to your bag.\n\n2. Send your bag to us on WhatsApp or Instagram with one tap. Your selection is filled in for you.\n\n3. We confirm availability, price, delivery details and payment with you directly in the chat.',
   true),
  ('shipping-returns', 'Shipping & Returns', '', false),
  ('jewelry-care',     'Jewelry Care',       '', false),
  ('size-guide',       'Ring Size Guide',    '', false),
  ('faq',              'FAQ',                '', false),
  ('our-story',        'Our Story',          '', false),
  ('privacy',          'Privacy',            '', false)
on conflict (slug) do nothing;

insert into public.site_settings (id, data) values (1, jsonb_build_object(
  'shop_name', 'Zi''s Selection',
  'whatsapp', '',
  'instagram', 'zi_selection518',
  'hours_open', '08:00',
  'hours_close', '20:00',
  'announce_on', true,
  'announce', 'Order on WhatsApp or Instagram · Open daily, 8 AM – 8 PM',
  'hero_headline', 'Where Selection Becomes Signature',
  'hero_sub', 'Handpicked jewelry, chosen with intention and worn as your own.',
  'hero_image', '',
  'delivery_note', ''
))
on conflict (id) do nothing;

-- After you create your login in Supabase (Authentication → Users → Add user), make it the owner:
--   insert into public.admins (user_id, role)
--   select id, 'owner' from auth.users where email = 'YOUR-EMAIL-HERE';
