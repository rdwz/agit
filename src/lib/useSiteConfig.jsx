import { v4 as uuid } from "uuid";
import { useContext } from "react";
import { useRouteMatch } from "react-router-dom";
import { configContext } from "../context/ConfigContext";

function useSiteConfig() {
  const { config } = useContext(configContext);

  const match = useRouteMatch("/*/:siteKey");
  if (!match) return null;
  const { siteKey } = match.params;

  if (!siteKey) return null;

  let siteConfig;
  config.sites.every((site) => {
    if (site.key === siteKey) {
      siteConfig = site;
      return false;
    }
    return true;
  });

  return siteConfig;
}

export const FrontmatterTypes = [
  { name: "String", key: "String" },
  { name: "Array of String", key: "Array.String" },
  { name: "Date", key: "Date" },
  { name: "Bool", key: "Bool" },
];

export const FrontmatterLanguages = ["yaml", "toml"];

export const newSiteConfig = () => {
  return {
    name: "",
    key: uuid(),
    path: "",
    //showFrontmatter: false,
    frontmatterLanguage: "yaml",
    frontmatterDelimiter: "---",
    defaultDir: "",
    mediaDir: "",
    pinnedDirs: [],
    commands: [],
    frontmatter: [],
  };
};

export default useSiteConfig;
