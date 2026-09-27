import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GramMausam — Dhanbad Panchayat Weather" },
      {
        name: "description",
        content: "Simple local rain forecasts and farm guidance for Dhanbad Panchayats.",
      },
      { property: "og:title", content: "GramMausam — Dhanbad Panchayat Weather" },
      {
        property: "og:description",
        content: "Check the next 5 days of local rain and weather guidance for your Panchayat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});
