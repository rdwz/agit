import { useEffect } from "react";
import useSiteConfig from "../lib/useSiteConfig";
import useTerminalManager from "../lib/useTerminalManger";

function Terminal() {
  const siteConfig = useSiteConfig();
  const { init, exit, isVisible, cid, setCid, terminals, createNew } =
    useTerminalManager(siteConfig);
  useEffect(() => {
    if (!siteConfig.path) return;
    init();
    createNew();
    createNew();
    window.setCid = setCid;
    return exit;
  }, [siteConfig.path]);

  console.log({ terminals });

  return (
    <div id="terminal" style={{ display: !isVisible && "none" }}>
      <div id="terminal-header">
        {terminals.current.map((t, i) => (
          <>
            <div
              className="terminal-tab"
              style={
                cid === t.id ? { background: "white", color: "black" } : {}
              }
              onClick={() => setCid(t.id)}
            >
              {i}
            </div>
          </>
        ))}
      </div>
      <div id="terminal-console"></div>
    </div>
  );
}

export default Terminal;
