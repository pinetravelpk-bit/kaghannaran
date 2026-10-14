export type Locale = "en" | "ur";
export const LOCALES: Locale[] = ["en", "ur"];

const en = {
  nav: { places: "Places", stay: "Stay", food: "Food", trails: "Jeep & hiking", guides: "Guides", services: "Services", live: "Road & weather", community: "Jobs & events", list: "List your business", signIn: "Sign in", dashboard: "My account", admin: "Admin" },
  hero: {
    kicker: "Kunhar valley · N-15 · Khyber Pakhtunkhwa",
    title1: "Balakot to Babusar Top.",
    title2: "Every stop, listed.",
    sub: "Hotels, dhabas, jeep drivers, trekking guides, ATMs, police and health centres, plus today's road and weather, for the whole valley in one place.",
    search: "Search", searchPlaceholder: "e.g. family hotel with parking", near: "Near", wholeValley: "Whole valley", popular: "Popular",
  },
  tabs: { all: "All", hotel: "Hotels", restaurant: "Restaurants", jeep: "Jeeps", guide: "Guides", adventure: "Adventure" },
  finder: {
    stayType: "Stay type", budget: "Budget / night", mustHave: "Must have", cuisine: "Cuisine", familyArea: "Family area",
    route: "Route", anyRoute: "Any route", seats: "Group size", area: "Area", anyArea: "Any area", language: "Language", anyLanguage: "Any language",
    firstAid: "First-aid trained", activity: "Activity", anyActivity: "Any activity", youngest: "Youngest in group",
    anyAge: "Any age", years: "years",
    ph: { all: "e.g. ATM, pharmacy, fuel, trout", hotel: "Hotel name or feature", restaurant: "Dish or restaurant name", jeep: "Driver or company name", guide: "Guide name or trek", adventure: "Operator name" },
    cta: { all: "Search", hotel: "Find stays", restaurant: "Find food", jeep: "Find jeeps", guide: "Find guides", adventure: "Find activities" },
  },
  sections: {
    route: "The route", routeTitle: "Balakot to Babusar, stop by stop.", routeSub: "Pick a stop to see every place worth visiting there. New marks recently added spots; dashed circles are side trips off the N-15.",
    numbers: "Valley by numbers", numbersTitle: "From 980 m to 4,173 m in one road.",
    directory: "The directory", directoryTitle: "Everything in the valley.",
    sights: "Lakes, meadows & viewpoints", sightsTitle: "The reasons people make the drive.",
    trails: "Jeep tracks & hikes", trailsTitle: "Where the road ends.", trailsSub: "Times come from visitor reports. Check conditions locally before you set off.",
    live: "Road & weather", liveTitle: "Before you drive, check here.",
    services: "Essential services", servicesTitle: "Good to know before you need it.",
    film: "The valley in motion", filmTitle: "Ride the Kunhar from source to gate.",
    featured: "Approved & verified", featuredTitle: "Trusted places to stay, eat and explore.",
    jobs: "Valley jobs", events: "Events & news",
    cta: "For hotels, shops, drivers & guides", ctaTitle: "Run a business in the valley? Get found before visitors arrive.", ctaSub: "Every listing is checked by our team before it goes live, so travellers can trust what they find.",
  },
  common: { viewAll: "View all", new: "New", sideTrip: "Side trip", places: "places", from: "from", perNight: "/ night", verified: "Verified", featured: "Featured", sample: "Sample", allStops: "All stops", back: "Back", submit: "Submit", next: "Next", previous: "Previous", save: "Save", cancel: "Cancel", open: "Open", caution: "Caution", closed: "Closed", seasonal: "Seasonal", updated: "Updated", call: "Call", whatsapp: "WhatsApp" },
  footer: { about: "The local directory for the Kaghan valley, from Balakot to Babusar Top.", alerts: "Before you drive", alertsTitle: "Know about landslides and closures before you leave.", mobile: "Tourist helpline 1422", getAlerts: "Live road status", credits: "Credits" },
};

type Dict = typeof en;

const ur: Dict = {
  nav: { places: "مقامات", stay: "رہائش", food: "کھانا", trails: "جیپ اور ہائیکنگ", guides: "گائیڈ", services: "سہولیات", live: "سڑک اور موسم", community: "نوکریاں اور ایونٹس", list: "اپنا کاروبار شامل کریں", signIn: "سائن ان", dashboard: "میرا اکاؤنٹ", admin: "ایڈمن" },
  hero: {
    kicker: "وادیٔ کنہار · این-15 · خیبر پختونخوا",
    title1: "بالاکوٹ سے بابوسر ٹاپ تک۔",
    title2: "ہر پڑاؤ، ایک جگہ۔",
    sub: "ہوٹل، ڈھابے، جیپ ڈرائیور، ٹریکنگ گائیڈ، اے ٹی ایم، پولیس اور مراکز صحت، اور آج کی سڑک اور موسم، پوری وادی ایک جگہ۔",
    search: "تلاش", searchPlaceholder: "مثلاً پارکنگ والا فیملی ہوٹل", near: "قریب", wholeValley: "پوری وادی", popular: "مقبول",
  },
  tabs: { all: "سب", hotel: "ہوٹل", restaurant: "ریسٹورنٹ", jeep: "جیپیں", guide: "گائیڈ", adventure: "ایڈونچر" },
  finder: {
    stayType: "رہائش کی قسم", budget: "بجٹ / رات", mustHave: "ضروری سہولیات", cuisine: "کھانا", familyArea: "فیملی ایریا",
    route: "روٹ", anyRoute: "کوئی بھی روٹ", seats: "گروپ کا سائز", area: "علاقہ", anyArea: "کوئی بھی علاقہ", language: "زبان", anyLanguage: "کوئی بھی زبان",
    firstAid: "فرسٹ ایڈ تربیت یافتہ", activity: "سرگرمی", anyActivity: "کوئی بھی سرگرمی", youngest: "گروپ میں سب سے کم عمر",
    anyAge: "کوئی بھی عمر", years: "سال",
    ph: { all: "مثلاً اے ٹی ایم، فارمیسی، پیٹرول، ٹراؤٹ", hotel: "ہوٹل کا نام یا سہولت", restaurant: "ڈش یا ریسٹورنٹ کا نام", jeep: "ڈرائیور یا کمپنی کا نام", guide: "گائیڈ کا نام یا ٹریک", adventure: "آپریٹر کا نام" },
    cta: { all: "تلاش", hotel: "رہائش تلاش کریں", restaurant: "کھانا تلاش کریں", jeep: "جیپ تلاش کریں", guide: "گائیڈ تلاش کریں", adventure: "سرگرمیاں تلاش کریں" },
  },
  sections: {
    route: "راستہ", routeTitle: "بالاکوٹ سے بابوسر، پڑاؤ بہ پڑاؤ۔", routeSub: "کسی پڑاؤ کو چنیں اور وہاں کی ہر دیکھنے والی جگہ دیکھیں۔ ’نیا‘ حال ہی میں شامل جگہیں ہیں؛ نقطہ دار دائرے این-15 سے ہٹ کر سائیڈ ٹرپ ہیں۔",
    numbers: "وادی اعداد میں", numbersTitle: "ایک سڑک پر 980 میٹر سے 4,173 میٹر تک۔",
    directory: "ڈائریکٹری", directoryTitle: "وادی کی ہر چیز۔",
    sights: "جھیلیں، میدان اور ویو پوائنٹس", sightsTitle: "وہ وجوہات جن کے لیے لوگ یہاں آتے ہیں۔",
    trails: "جیپ ٹریک اور ہائیک", trailsTitle: "جہاں سڑک ختم ہوتی ہے۔", trailsSub: "اوقات سیاحوں کی رپورٹس سے ہیں۔ روانگی سے پہلے مقامی طور پر حالات معلوم کریں۔",
    live: "سڑک اور موسم", liveTitle: "سفر سے پہلے یہاں دیکھیں۔",
    services: "ضروری سہولیات", servicesTitle: "ضرورت سے پہلے جان لیں۔",
    film: "وادی حرکت میں", filmTitle: "کنہار کے ساتھ منبع سے دروازے تک۔",
    featured: "منظور شدہ اور تصدیق شدہ", featuredTitle: "رہنے، کھانے اور گھومنے کی قابلِ اعتماد جگہیں۔",
    jobs: "وادی کی نوکریاں", events: "ایونٹس اور خبریں",
    cta: "ہوٹل، دکانیں، ڈرائیور اور گائیڈ", ctaTitle: "وادی میں کاروبار ہے؟ سیاحوں کے آنے سے پہلے نظر آئیں۔", ctaSub: "ہر لسٹنگ شائع ہونے سے پہلے ہماری ٹیم چیک کرتی ہے، تاکہ سیاح بھروسہ کر سکیں۔",
  },
  common: { viewAll: "سب دیکھیں", new: "نیا", sideTrip: "سائیڈ ٹرپ", places: "مقامات", from: "سے شروع", perNight: "/ رات", verified: "تصدیق شدہ", featured: "نمایاں", sample: "نمونہ", allStops: "تمام پڑاؤ", back: "واپس", submit: "جمع کریں", next: "اگلا", previous: "پچھلا", save: "محفوظ کریں", cancel: "منسوخ", open: "کھلا", caution: "احتیاط", closed: "بند", seasonal: "موسمی", updated: "اپ ڈیٹ", call: "کال", whatsapp: "واٹس ایپ" },
  footer: { about: "وادیٔ کاغان کی مقامی ڈائریکٹری، بالاکوٹ سے بابوسر ٹاپ تک۔", alerts: "سفر سے پہلے", alertsTitle: "روانگی سے پہلے لینڈ سلائیڈ اور بندش کا جانیں۔", mobile: "سیاحتی ہیلپ لائن 1422", getAlerts: "سڑک کی تازہ صورتحال", credits: "حوالہ جات" },
};

export const DICTIONARIES: Record<Locale, Dict> = { en, ur };
export type Dictionary = Dict;
