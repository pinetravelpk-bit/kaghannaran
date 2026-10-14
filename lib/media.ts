/**
 * Stock photography.
 *
 * All images below are free-licensed photos from Wikimedia Commons (mostly CC BY-SA),
 * loaded by URL until you upload your own photos from the admin panel.
 * Credits are listed on /credits; keep that page if you keep these photos.
 *
 * To swap a photo: change the file name here, or set `image` on a stop / listing in the admin.
 */
const commons = (file: string, width = 1600) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;

export const commonsPage = (file: string) =>
  `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, "_"))}`;

export const PHOTO_FILES = {
  naranDrone: "Naraan drone shot.jpg",
  naranAerial: "Naran (Aerial View).jpg",
  naranNight: "Naran at night.jpg",
  naranWinter: "Frozen heaven - Naran Valley in winter.jpg",
  lulusar: "Stunning - Lulusar Lake.jpg",
  lulusar2: "Lulosar,Naran Valley.jpg",
  jalkhad: "Land Of Fairies - Jalkhad.jpg",
  malikaParbat: "MalkaPerbat Naran PK.jpg",
  lalazar: "Lalzar view Naran.JPG",
  ansoo: "Mountains near Aansoo Lake.jpg",
  dudipatsar: "Enroute Dodipatsar Lake, Naran Valley.jpg",
  jeeps: "Jeeps of Naran.jpg",
  kunhar: "Kunhar River in Naran Valley Richtone(HDR).jpg",
  camping: "Camping area in Naran Valley.jpg",
  waterfall: "A waterfall in Naran.jpg",
  khanian: "Khanian.jpg",
  handicraft: "Handicraft of Naran.jpg",
  food: "Food vendors and visitors in Naran Valley.jpg",
  balakot: "En route to Balakot.jpg",
  shogran: "KaghanNaranShogran 1.jpg",
  batakundi: "Bridge enroute Batakundi.jpeg",
  meadow: "Montane meadow in Naran Valley 2017-01-19.jpg",
  horses: "Grazing horses of Naran.JPG",
  sheep: "Herds of sheep going to high planes for summer seasons in Naran, KPK, Pakistan.jpg",
  restHouse: "Govt. Rest House in Naraan.JPG",
  kaghanNaran: "Kaghan and Naran Valleys.jpg",
} as const;

export type PhotoKey = keyof typeof PHOTO_FILES;

export const photo = (key: PhotoKey, width = 1600) => commons(PHOTO_FILES[key], width);

export const PHOTO_AUTHOR_NOTE =
  "Photos: Wikimedia Commons contributors, used under their Creative Commons licences.";
