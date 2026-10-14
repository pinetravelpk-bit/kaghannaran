import type { Stop } from "@/lib/types";
import { photo } from "@/lib/media";

const N = true;

/** The 19 stops from Balakot to Babusar Top, with every visiting place. Altitudes are approximate. */
export const STOPS: Stop[] = [
  {
    slug: "balakot", order: 1, name: "Balakot", nameUr: "بالاکوٹ", kind: "Gateway town", altitude: 980, image: photo("balakot"),
    desc: "Where the valley begins, on the Kunhar. The Kashmir and Kaghan roads split just above town.",
    places: [
      { name: "Country Club Walk Trail", note: "A walking trail at the start of Balakot.", isNew: N },
      { name: "Hareem Waterfall", note: "On Naran Road, right next to Balakot.", isNew: N },
      { name: "Balakot Hill Top", note: "First break point on the Kaghan road, where the routes to Kashmir and Kaghan split.", isNew: N },
      { name: "Liaqat Bagh", note: "A park in town.", isNew: N },
      { name: "Hadiyan", note: "Balakot’s upper viewpoint area.", isNew: N },
      { name: "Syed Ahmad Shaheed Mosque & Tomb" },
      { name: "Kaghan Valley Gate" },
      { name: "Kunhar riverside viewpoints" },
    ],
  },
  {
    slug: "ghanool", order: 2, name: "Ghanool", nameUr: "گھنول", kind: "Waterfall stop", image: photo("waterfall"),
    desc: "About an hour’s drive from Balakot, for one of the valley’s newest waterfall finds.",
    places: [
      { name: "Ghanool Waterfall", note: "About 1 hour’s drive from Balakot.", isNew: N, warning: "No shops or washrooms, and a landslide-prone area." },
    ],
  },
  {
    slug: "kiwai", order: 3, name: "Kiwai", nameUr: "کیوائی", kind: "Jeep junction", image: photo("kunhar"),
    desc: "Park the car and switch to a local jeep for Shogran, after tea with your feet in the waterfall.",
    places: [
      { name: "Kiwai Waterfall", note: "Charpais and chairs set right in the water." },
      { name: "Kiwai Village", note: "Park your car here and take a jeep up to Shogran." },
    ],
  },
  {
    slug: "shogran", order: 4, name: "Shogran", nameUr: "شوگران", kind: "Hill station", sideTrip: true, altitude: 2360, image: photo("shogran"),
    desc: "A forest hill station about 8 km above Kiwai, and the base for the Siri and Paye meadows.",
    places: [
      { name: "Shogran", note: "About 8 km from Kiwai.", warning: "Rocky and steep road, so a local jeep is the better choice." },
      { name: "Natural Park Shogran", note: "Forest walks and a picnic spot.", isNew: N },
      { name: "Shogran Forest Rest House" },
      { name: "Siri Meadows & Siri Lake", note: "4x4 jeeps only." },
      { name: "Paye Meadows", note: "About 45 minutes by jeep from Shogran. Best to arrive before 2 pm." },
      { name: "Makra Peak", note: "Trek from Paye. One visitor did 10 km in about 3.5 hours." },
      { name: "Musa ka Musalla & Malika Parbat views" },
      { name: "Shogran–Sharan hiking track" },
    ],
  },
  {
    slug: "paras-sharan", order: 5, name: "Paras & Sharan", nameUr: "پارس اور شاران", kind: "Forest", sideTrip: true, image: photo("meadow"),
    desc: "A bridge over the Kunhar, then a 45-minute jeep ride up into the Sharan forest.",
    places: [
      { name: "Paras Bridge, Hangrai", note: "A bridge over the Kunhar near Paras.", isNew: N },
      { name: "Sharan Forest", note: "About 45 min by jeep from Paras. Stays at the forest edge have Wi-Fi and Mobilink signal. Two youth hostels about 30 min further in have no mobile internet." },
      { name: "Sharan Waterfall", note: "45 minutes to 1 hour from the camping pods.", warning: "The climb back is hard, but horses are available." },
      { name: "Manshi Top", note: "3–4 hour hike from Sharan, with views of Musa ka Musalla, Shogran, Siri, Paye and Makra." },
      { name: "Musa ka Musalla trek", note: "A 2–3 day trek from Sharan." },
    ],
  },
  {
    slug: "malakandi", order: 6, name: "Malakandi", nameUr: "ملکنڈی", kind: "National park", image: photo("khanian"),
    desc: "A young national park of forest and hiking trails.",
    places: [
      { name: "Malakandi National Park", note: "Established 2022. A forest and hiking area between Paras, Bhoonja and Jared.", isNew: N },
    ],
  },
  {
    slug: "shinu-jared", order: 7, name: "Shinu & Jared", nameUr: "شینو اور جرید", kind: "Trout & crafts", image: photo("handicraft"),
    desc: "Pick your own trout for lunch, then shop for walnut-wood crafts.",
    places: [
      { name: "Government Shinu Trout Hatchery", note: "Watch the trout breeding, buy a live trout and have it cooked at the restaurant opposite." },
      { name: "Jared", note: "Walnut-wood furniture and handicrafts." },
    ],
  },
  {
    slug: "mahandri-manoor", order: 8, name: "Mahandri & Manoor", nameUr: "مہاندری اور منور", kind: "Bazaar & valley", image: photo("sheep"),
    desc: "The last good shopping stop before Naran, and the turn-off into the quiet Manoor Valley.",
    places: [
      { name: "Mahandri Bazaar", note: "A small riverside bazaar, and the last good place to shop before Naran.", isNew: N },
      { name: "Beyari / Biari Village", note: "In Manoor Valley. Few visitors make it here.", isNew: N },
      { name: "Rewri Cricket Ground", note: "A camping site in Manoor Valley.", isNew: N },
      { name: "Manoor Biari Forest Rest House", note: "Book in advance.", isNew: N, warning: "Ask locals about road conditions before you go." },
      { name: "Kuch Gali & Manoor Peak", note: "Trekking routes from Mahandri." },
      { name: "Ansoo Lake, alternative route", note: "A second way up to Ansoo, starting from Mahandri." },
    ],
  },
  {
    slug: "khanian", order: 9, name: "Khanian", nameUr: "کھنیاں", kind: "Trailhead", image: photo("khanian"),
    desc: "Resort trails and a long hike up to the Danna Meadows.",
    places: [
      { name: "Hiking trail by Spruce Resort", isNew: N },
      { name: "Danna Meadows", note: "2–6 hour trek from Khanian. The old jeep track was destroyed in the 2005 earthquake.", isNew: N, warning: "No facilities, so carry water and food." },
    ],
  },
  {
    slug: "kaghan", order: 10, name: "Kaghan", nameUr: "کاغان", kind: "Valley town", altitude: 2050, image: photo("kaghanNaran"),
    desc: "The town the valley is named after: a bazaar, riverside resorts and two big viewpoints.",
    places: [
      { name: "Kaghan Bazaar" },
      { name: "Maidan Meadows", note: "Jeep from Kaghan Bazaar. The view from the top is superb.", isNew: N, warning: "The jeep track is dangerous." },
      { name: "Shingri Top", note: "About 2 km hike near Kaghan, to a mountain viewpoint.", isNew: N },
      { name: "Riverside resorts", note: "Such as Luna Resort, between Kaghan and Naran." },
    ],
  },
  {
    slug: "naran-picnic-point", order: 11, name: "Naran Picnic Point", nameUr: "ناران پکنک پوائنٹ", kind: "Before Naran", image: photo("kunhar"),
    desc: "A riverside pause just before town.",
    places: [{ name: "Naran Picnic Point", note: "A viewpoint on the Kunhar.", isNew: N }],
  },
  {
    slug: "naran", order: 12, name: "Naran", nameUr: "ناران", kind: "Main base", altitude: 2400, image: photo("naranDrone"),
    desc: "The heart of the valley: bazaar, rafting, the legend caves and the jeep up to Saif-ul-Malook.",
    places: [
      { name: "Naran Bazaar & Kunhar River" },
      { name: "Naran River Rafting Point", note: "2 km from Naran.", isNew: N },
      { name: "Cave Naran Princess", note: "Small cave in town, opposite the Saif-ul-Malook road near Markhoor Hotel. About 12 ft deep, tied to the fairy-and-giant legend.", isNew: N },
      { name: "Rose Park", note: "A park in Naran.", isNew: N },
      { name: "Saif-ul-Malook Lake & National Park", note: "By jeep from Naran." },
      { name: "Saif-ul-Malook Cave", note: "The original legend cave, beside the lake." },
      { name: "Kach Gali", note: "Just beyond Saif-ul-Malook, recommended by a visitor.", isNew: N },
      { name: "Ansoo Lake", note: "Trek from Saif-ul-Malook, about 10 hours return.", warning: "Don’t start after 9 am. Two streams to cross, so a horse is better." },
      { name: "Malika Parbat" },
      { name: "Lalazar to Saif-ul-Malook trek" },
      { name: "Fairy Land & Baby Saral Lake", note: "Near Naran. Ask locally for the way." },
    ],
  },
  {
    slug: "batakundi", order: 13, name: "Batakundi", nameUr: "بٹہ کنڈی", kind: "Naran → Batakundi", image: photo("lalazar"),
    desc: "Roadside waterfalls on the way, then the jeep track up to Lalazar. Batakundi is about 16 km from Naran.",
    places: [
      { name: "Kiswah Waterfall", note: "Water flows across the road.", isNew: N, warning: "Drive slowly here." },
      { name: "Sohni Waterfall", note: "Falls over step-like rocks. You can climb 50–60 ft to the water.", isNew: N },
      { name: "Batakundi", note: "About 16 km from Naran. The Satsar Mala trek also starts from the campground." },
      { name: "Lalazar", note: "Half-hour jeep from Batakundi. Old Dak Bungalow and a small forest at the top.", warning: "Dusty or slippery track." },
    ],
  },
  {
    slug: "burawai", order: 14, name: "Burawai", nameUr: "بوڑاوائی", kind: "Village", image: photo("horses"),
    desc: "A small village with river views.",
    places: [{ name: "Burawai", note: "A small village with river views." }],
  },
  {
    slug: "jalkhad", order: 15, name: "Jalkhad", nameUr: "جلکھڈ", kind: "Junction", image: photo("jalkhad"),
    desc: "Where the Sharda road meets the N-15, with views of Pyala Lake, Noori Top and Tiger Peak.",
    places: [
      { name: "Jalkhad View Point", note: "Where the Sharda road meets N-15. Views of Pyala Lake, the Noori Top track and Tiger Peak (Mini K-2).", isNew: N },
      { name: "Pyala Lake", note: "Right by the road, on the right before Besal.", warning: "No safety fence, so watch children." },
      { name: "Noori Top", note: "Off-road jeep track from Jalkhad, continuing to Sharda (Neelum).", warning: "No hotels or food. Go in daylight only." },
    ],
  },
  {
    slug: "besal", order: 16, name: "Besal", nameUr: "بیسل", kind: "Trailhead", image: photo("dudipatsar"),
    desc: "The start of the Dudipatsar trek, at Moon Restaurant.",
    places: [
      { name: "Besal Ford", note: "A water crossing on the road.", isNew: N, warning: "Take care in rain, especially on a motorbike." },
      { name: "Moon Restaurant", note: "The Dudipatsar trek starts here." },
      { name: "Hidden meadow & stream", note: "15-minute walk from Moon Restaurant, with green grass and a stream.", isNew: N },
      { name: "Mullah ki Basti", note: "First camp on the Dudipatsar trek, about 8 hours from Besal." },
      { name: "Dudipatsar Lake", note: "About 2 hours from Mullah ki Basti the next morning." },
    ],
  },
  {
    slug: "lulusar", order: 17, name: "Lulusar", nameUr: "لولوسر", kind: "Lake", altitude: 3410, image: photo("lulusar"),
    desc: "A long, quiet lake by the road, with treks to higher lakes.",
    places: [
      { name: "Lulusar Lake Viewpoint", note: "No boating allowed, so it stays peaceful." },
      { name: "Lulusar Valley", note: "At the far end of the lake. The Abhom Pass trek is mentioned from here.", isNew: N },
      { name: "Surkhail & Satsar Lakes", note: "A trek up above Lulusar." },
    ],
  },
  {
    slug: "gittidas", order: 18, name: "Gittidas", nameUr: "گٹی داس", kind: "Meadows", image: photo("meadow"),
    desc: "High roadside meadows with a glacier.",
    places: [
      { name: "Gittidas Meadows", note: "Roadside, with a glacier too." },
      { name: "Satsar Mala trek", note: "Starts a little before Gittidas." },
    ],
  },
  {
    slug: "babusar-top", order: 19, name: "Babusar Top", nameUr: "بابوسر ٹاپ", kind: "Pass", altitude: 4173, image: photo("lulusar2"),
    desc: "The top of the valley, with a zipline and big views. Jeep tracks lead to Dharamsar Lake just before the pass.",
    places: [
      { name: "Dharamsar Lake", note: "Jeep track just before Babusar Top, 1.5–3 hrs from the main road. Best to hire a 4x4 from Jalkhad." },
      { name: "Sambaksar Lake", note: "About a 1-hour trek from Dharamsar, also visible from Babusar Top." },
      { name: "Kalabashi Top", note: "On the route from Dharamsar to Mullah ki Basti." },
      { name: "Babusar Top", note: "4,173 m, with a zipline and views." },
    ],
  },
];

export const getStop = (slug: string) => STOPS.find((s) => s.slug === slug);
export const TOTAL_PLACES = STOPS.reduce((a, s) => a + s.places.length, 0);
export const NEW_PLACES = STOPS.reduce((a, s) => a + s.places.filter((p) => p.isNew).length, 0);
