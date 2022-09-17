import { ISiteConfig } from "@shared/types/config";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  genContent,
  parseContent,
  updateFrontmatterJson,
} from "./frontmatterInterface";
import useSiteConfig from "./useSiteConfig";

export interface IFile {
  name: string;
  path: string;
  content: string;
  frontmatter: {};
  doc: string;
  isRead: boolean;
  isModified: boolean;
  isFrontmatterEmpty: boolean;
}

export interface IFileManager {
  file: IFile;
  editName: (name: string) => void;
  updateFrontmatter: (name: string, value: any, parentNames?: string[]) => void;
  setDoc: (doc: string) => void;
  readFile: () => Promise<void | Error>;
  saveFile: () => Promise<Error>;
}

//useCodeMirror depends on useFileBuffer's updateDoc
//filePath is a only dependency.
function useFileManager(filePath: string): IFileManager {
  const location = useLocation();
  const searchparams = new URLSearchParams(location.search);
  const fileName = searchparams.get("name") as string;
  const initialState: IFile = {
    name: fileName,
    path: filePath,
    content: "", //include frontmatter
    frontmatter: {},
    doc: "", //exclude frontmatter
    isRead: false,
    isModified: false,
    isFrontmatterEmpty: true,
  };
  const [file, setFile] = useState(initialState);
  const siteConfig = useSiteConfig() as ISiteConfig;

  useEffect(() => {
    //prevent first rerender
    if (initialState !== file) {
      setFile(initialState);
    }
  }, [filePath]);

  const editName = (name: string) => {
    setFile((prev) => ({ ...prev, name }));
  };
  const updateFrontmatter = (
    name: string,
    value: any,
    parentNames?: string[]
  ) => {
    const newFrontmatter = updateFrontmatterJson(
      file.frontmatter,
      value,
      name,
      parentNames
    );
    const content = genContent(siteConfig, file.doc, newFrontmatter);

    setFile((prev) => ({
      ...prev,
      content,
      frontmatter: newFrontmatter,
      isModified: true,
    }));
  };
  const setDoc = (doc: string) => {
    const content = genContent(siteConfig, doc, file.frontmatter);
    setFile((prev) => ({
      ...prev,
      content,
      doc,
      isModified: true,
    }));
  };

  const readFile = async (): Promise<void | Error> => {
    const { content, err }: { content: string; err: Error } =
      //@ts-ignore
      await window.electronAPI.readFile(filePath);
    if (err) {
      return err;
    }
    const { doc, frontmatter } = parseContent(siteConfig, content);
    const isFrontmatterEmpty = Object.keys(frontmatter).length === 0;
    setFile((prev) => ({
      ...prev,
      content,
      doc,
      frontmatter,
      isRead: true,
      isModified: false,
      isFrontmatterEmpty,
    }));
  };

  const saveFile = async () => {
    if (!file.isRead || !file.isModified) {
      return;
    }
    //@ts-ignore
    const { err } = await window.electronAPI.saveFile(filePath, file.content);
    if (!err) console.log("saved", file);
    return err;
  };

  return {
    file,
    editName,
    updateFrontmatter,
    setDoc,
    readFile,
    saveFile,
  };
}

export default useFileManager;