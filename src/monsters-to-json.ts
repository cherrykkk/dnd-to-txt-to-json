import { batchFetchHtmlThenToJsonThenWriteFile } from "batch/monsters-to-json";
import { fetchGitFiles, recurFetchGitFiles } from "api/fetch-folder";
import fs from "node:fs";
import { wcpJsonFind, wcpToJson } from "parser/wcp-to-json";
import { writeTxtToFile } from "api/read-write";
import { gatherTxtAndJsonArr, wcpNodeToTxtAndJson } from "batch/wcp-node-to-json";

// const testFilePaths = [
//   "怪物图鉴2025/亡灵/骷髅/骷髅总.htm",
//   "怪物图鉴2025/亡灵/骷髅/骷髅战马.htm",
//   "怪物图鉴2025/亡灵/骷髅/骷髅牛头人.htm",
// ];
// batchFetchHtmlThenToJsonThenWriteFile(testFilePaths, "test");

// // 1. 读取 WCP（注意 DND5e_chm 的 WCP 是 UTF-16LE）
const buf = fs.readFileSync("./files-input/不全书.wcp");
const text = buf.toString("utf16le"); // 如果你确认是 ANSI/UTF-8，就改相应编码
const wcpJson = wcpToJson(text);
const wcpNode = wcpJsonFind(wcpJson, "怪物图鉴2025");
console.log(wcpNode);
if (!wcpNode) throw new Error("no wcpNode");
const validNode = wcpNode.children.filter((e) => e.title !== "前言");

const tasks = await Promise.all(validNode.map((e) => wcpNodeToTxtAndJson(e)));
const output = gatherTxtAndJsonArr(tasks);

writeTxtToFile(JSON.stringify(output.cards, null, 2), "monster-list.json");
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
