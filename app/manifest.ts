import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kaghan Naran Valley Guide",
    short_name: "Kaghan Naran",
    description: "Live N-15 road status, weather, places and services for Kaghan Valley, from Balakot to Babusar Top.",
    start_url: "/",
    display: "standalone",
    background_color: "#EEF1EE",
    theme_color: "#12302C",
    lang: "en-PK",
    categories: ["travel", "navigation", "weather"],
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
