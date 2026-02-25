"use client";

import { useEffect } from "react";
import { getWebSettings } from "@/services/online-services/webSettingsService";

export default function FaviconUpdater() {
  useEffect(() => {
    const updateFavicon = async () => {
      try {
        const response = await getWebSettings();
        
        if (response.success && response.data.faviconUrl) {
          const faviconUrl = response.data.faviconUrl;
          
          // Helper to update or create link
          const updateLink = (rel: string) => {
            let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
            if (!link) {
              link = document.createElement("link");
              link.rel = rel;
              document.head.appendChild(link);
            }
            link.href = faviconUrl;
          };

          updateLink("icon");
          updateLink("apple-touch-icon");
        }
      } catch (error) {
        console.error("Error updating favicon:", error);
      }
    };

    updateFavicon();
  }, []);

  return null; // This component doesn't render anything
}
