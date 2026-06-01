import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Roomie",
    short_name: "Roomie",
    description: "Find your perfect student roommate. Connect and Cooonnectttt.",
    start_url: "/feed",
    display: "standalone",
    background_color: "#EDE8C8",
    theme_color: "#8AAF6E",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      { name: "Discover", short_name: "Discover", url: "/discover", description: "Browse roommate profiles" },
      { name: "My Chats", short_name: "Chats", url: "/chat", description: "Your conversations" },
      { name: "Find Housing", short_name: "Housing", url: "/housing", description: "Find accommodation" },
    ],
  };
}
