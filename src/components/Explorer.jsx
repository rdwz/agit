import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Menu, MenuItem, Button } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { configContext } from "../context/ConfigContext";
import useSiteConfig from "../lib/useSiteConfig";
import CreateNewDf from "./CreateNewDf";
import Editor from "./Editor";

function Explorer() {
  const [filesAndFolders, setFilesAndFolders] = useState([]);
  const siteConfig = useSiteConfig();
  const { updateSiteConfig } = useContext(configContext);
  const location = useLocation();
  const searchparams = new URLSearchParams(location.search);

  //current working dir or filek
  const cwdf = searchparams.get("path");
  const dfName = searchparams.get("name");
  const isInRoot = cwdf === siteConfig.path;
  const isInDir = searchparams.get("isDir") === "true" || isInRoot;
  const isDfPinned = !siteConfig.pinnedDirs.every((df) => {
    if (df.path === cwdf) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    console.warn("Dir Effect");
    if (!isInDir) return;
    loadFilesAndFolders();
  }, [cwdf]); //eslint-disable-line

  const addPinnedDirs = (name, path, isDir) => {
    updateSiteConfig({
      ...siteConfig,
      pinnedDirs: [...siteConfig.pinnedDirs, { name, path, isDir }],
    });
  };

  const removePinnedDir = (path, isDir) => {
    const pinnedDirs = siteConfig.pinnedDirs.filter(
      (df) => df.path !== path || df.isDir !== isDir
    );
    updateSiteConfig({
      ...siteConfig,
      pinnedDirs,
    });
  };

  const loadFilesAndFolders = async () => {
    const { err, filesAndFolders } =
      await window.electronAPI.getFilesAndFolders(cwdf);
    if (err !== null) {
      alert(err);
      return;
    }
    setFilesAndFolders(filesAndFolders);
  };

  return (
    <div id="explorer">
      <div id="top-bar">
        {cwdf}
        {isDfPinned ? (
          <Button
            size="small"
            onClick={() => removePinnedDir(cwdf, isInDir)}
            sx={{ padding: "0", lineHeight: "unset" }}
          >
            Unpin
          </Button>
        ) : (
          <Button
            size="small"
            onClick={() => addPinnedDirs(dfName, cwdf, isInDir)}
            sx={{ padding: "0", lineHeight: "unset" }}
          >
            Pin
          </Button>
        )}
      </div>
      {isInDir && <CreateNewDf cwdf={cwdf} />}
      {isInDir &&
        filesAndFolders.map((df) => (
          <Df cwdf={cwdf} df={df} loadFilesAndFolders={loadFilesAndFolders} />
        ))}
      {!isInDir && <Editor filePath={cwdf}></Editor>}
    </div>
  );
}

function Df({ cwdf, df, loadFilesAndFolders }) {
  const [anchorEl, setAnchorEl] = useState(null);
  //const renameDf = async () => {};
  const history = useHistory();
  const removeDf = async () => {
    const dfPath = cwdf + "/" + df.name;
    let err;
    if (df.isDir) {
      err = (await window.electronAPI.removeFolder(dfPath)).err;
    } else {
      err = (await window.electronAPI.removeFile(dfPath)).err;
    }
    if (err !== null) {
      alert(err);
      return;
    }
    loadFilesAndFolders();
  };

  return (
    <div
      className="df"
      onClick={() => {
        history.push(
          "?path=" +
            cwdf +
            "/" +
            df.name +
            "&isDir=" +
            df.isDir +
            "&name=" +
            df.name
        );
      }}
    >
      <div style={{ display: "flex" }}>
        {df.isDir && <FolderOpenOutlinedIcon fontSize="small" />}
        <p style={{ paddingLeft: "10px" }}>{df.name}</p>
      </div>
      <MoreHorizIcon
        onClick={(e) => {
          setAnchorEl(e.currentTarget);
          e.stopPropagation();
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={anchorEl !== null}
        onClose={(e) => {
          setAnchorEl(null);
          e.stopPropagation();
        }}
        //on Click menuitems
        onClick={(e) => {
          setAnchorEl(null);
          e.stopPropagation();
        }}
      >
        {/*     <MenuItem onClick={renameDf}>rename</MenuItem> */}
        <MenuItem onClick={removeDf}>delete</MenuItem>
      </Menu>
    </div>
  );
}

export default Explorer;
