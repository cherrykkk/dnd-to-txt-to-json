import { batchFetchHtmlThenToJsonThenWriteFile } from "batch/monsters-to-json";
import { fetchGitFiles, recurFetchGitFiles } from "api/fetch-folder";
import { fetchRawFromGitHub, resolveGitHubRef } from "api/fetch-html";
import { wcpJsonFind, wcpToJson } from "parser/wcp-to-json";
import { writeTxtToFile } from "api/read-write";
import { gatherTxtAndJsonArr, wcpNodeToTxtAndJson } from "batch/monster-wcp-node-to-json";
import type { MonsterTreeNode } from "batch/monster-wcp-node-to-json";

// const testFilePaths = [
//   "怪物图鉴2025/亡灵/骷髅/骷髅总.htm",
//   "怪物图鉴2025/亡灵/骷髅/骷髅战马.htm",
//   "怪物图鉴2025/亡灵/骷髅/骷髅牛头人.htm",
// ];
// batchFetchHtmlThenToJsonThenWriteFile(testFilePaths, "test");

// 固定一次远端提交，确保 WCP 索引和随后读取的 HTML 来自同一版本。
const ref = await resolveGitHubRef();
const buf = await fetchRawFromGitHub("不全书.wcp", ref);
const isUtf16Le = (buf[0] === 0xff && buf[1] === 0xfe) || buf[1] === 0;
const text = buf.toString(isUtf16Le ? "utf16le" : "utf8").replace(/^\uFEFF/, "");
const wcpJson = wcpToJson(text);
const wcpNode = wcpJsonFind(wcpJson, "怪物图鉴2025");
console.log(wcpNode);
if (!wcpNode) throw new Error("no wcpNode");
const validNode = wcpNode.children.filter((e) => e.title !== "前言");

const tasks = await Promise.all(validNode.map((e) => wcpNodeToTxtAndJson(e, ref)));
const output = gatherTxtAndJsonArr(tasks);
const tree: MonsterTreeNode = {
  title: wcpNode.title,
  children: output.tree,
};

writeTxtToFile(JSON.stringify(output.cards, null, 2), "monster-list.json");
writeTxtToFile(JSON.stringify(tree, null, 2), "monster-tree.json");
writeTxtToFile(output.allTxt, "monster-list.txt");

// const recurFolderBase = `怪物图鉴2025`;
// const filePaths = await recurFetchGitFiles("DND5eChm", "DND5e_chm", recurFolderBase);
//
// const validFilePaths = filePaths.filter((filePath) => {
//   if (filePath.endsWith(".htm") || filePath.endsWith(".html")) {
//     return true;
//   } else {
//     console.log("skip ", filePath);
//     return false;
//   }
// });
//
// batchFetchHtmlThenToJsonThenWriteFile(validFilePaths, recurFolderBase.split("/").join("-"));
