import { createContext, useContext } from "react";
import { defaultSiteContent } from "@/lib/site-content";

export const SiteContentContext = createContext(defaultSiteContent);
export const useSiteContent = () => useContext(SiteContentContext);
