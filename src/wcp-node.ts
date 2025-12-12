import fs from "node:fs";
import { wcpJsonFind, wcpToJson } from "parser/wcp-to-json";

export function getWcpNode(path: string) {
  // // 1. 读取 WCP（注意 DND5e_chm 的 WCP 是 UTF-16LE）
  const buf = fs.readFileSync("./files-input/不全书.wcp");
  const text = buf.toString("utf16le"); // 如果你确认是 ANSI/UTF-8，就改相应编码
  const wcpJson = wcpToJson(text);
  const wcpNode = wcpJsonFind(wcpJson, path);
  return wcpNode;
}
