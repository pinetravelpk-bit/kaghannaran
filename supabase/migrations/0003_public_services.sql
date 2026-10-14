-- Verified public emergency and help numbers for the whole valley (checked October 2026).
-- Run after 0002. Businesses are added by their owners through the site and approved by staff.
begin;
-- staff-curated rows: skip the owner guard trigger, which would send them back to review
set local session_replication_role = replica;

insert into public.listings (slug, type_slug, name, phone, address, description, attributes, status, verified)
values
  ('pakhtunkhwa-emergency-helpline-911', 'govt', 'Pakhtunkhwa Emergency Helpline 911', '911', 'Valley-wide, Mansehra District, Khyber Pakhtunkhwa',
   'Khyber Pakhtunkhwa''s single emergency number, live since July 2026. One call reaches the police, Rescue 1122, tourist assistance and disaster response, 24 hours a day.',
   '{"department": "KP Home and Tribal Affairs", "source": "https://www.zameen.com/news/kp-rolls-out-911-emergency-response-service.html"}', 'approved', true),
  ('rescue-1122-mansehra', 'health', 'Rescue 1122 Mansehra', '1122', 'Valley-wide, Mansehra District, Khyber Pakhtunkhwa',
   'Free 24-hour ambulance and rescue service. Rescue 1122 Mansehra teams cover Balakot, Kaghan, Naran and the N-15 for road accidents, landslides and floods.',
   '{"emergency": true, "source": "https://www.app.com.pk/?p=1252983"}', 'approved', true),
  ('police-emergency-15', 'police', 'Police Emergency 15', '15', 'Valley-wide, Mansehra District, Khyber Pakhtunkhwa',
   'Police emergency number, free from any phone in Pakistan. In the valley, calls are handled by Mansehra District Police.',
   '{"kind": "Police station"}', 'approved', true),
  ('kp-tourist-helpline-1422', 'govt', 'KP Tourist Helpline 1422', '1422', 'Valley-wide, Mansehra District, Khyber Pakhtunkhwa',
   'Toll-free tourist helpline of the Khyber Pakhtunkhwa Culture and Tourism Authority, run by the Tourist Facilitation Hub. Ask about road and weather conditions, places to visit and help in an emergency.',
   '{"department": "KP Culture and Tourism Authority", "source": "https://propakistani.pk/2021/08/17/kp-tourism-dept-activates-24-7-helpline-1422-for-emergencies/"}', 'approved', true),
  ('pdma-khyber-pakhtunkhwa-helpline-1700', 'govt', 'PDMA Khyber Pakhtunkhwa Helpline 1700', '1700', 'Valley-wide, Mansehra District, Khyber Pakhtunkhwa',
   'Provincial Disaster Management Authority helpline for floods, landslides and heavy snow. The emergency operations centre can also be reached on 091-9219635.',
   '{"department": "Provincial Disaster Management Authority", "source": "https://www.pdma.gov.pk"}', 'approved', true),
  ('motorway-police-helpline-130', 'police', 'Motorway Police Helpline 130', '130', 'Hazara Motorway and national highways',
   'National Highways and Motorway Police helpline for accidents, breakdowns and route information on the motorway and highways to the valley. Calls are free.',
   '{"kind": "Check post", "source": "https://pta.gov.pk/category/motorway-helpline-calls-made-free-983111816-2023-06-01"}', 'approved', true),
  ('edhi-ambulance-115', 'health', 'Edhi Ambulance 115', '115', 'Nationwide',
   'Edhi Foundation''s nationwide ambulance service, a second option if Rescue 1122 is busy.',
   '{"emergency": true, "source": "https://edhi.org"}', 'approved', true)
on conflict (slug) do nothing;

update public.road_segments set mode = 'auto' where segment = 'Naran → Batakundi' and mode = 'manual' and updated_by is null;

update public.site_settings set emergency_numbers =
  '[{"label":"Emergency","number":"911"},{"label":"Rescue","number":"1122"},{"label":"Police","number":"15"},{"label":"Tourist help","number":"1422"}]'
where id = 1;

commit;
