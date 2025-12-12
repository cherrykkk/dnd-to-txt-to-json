import { fetchFromGitHub, fetchWcpNodeFileFromGithub } from "./api/fetch-html";
import { convertHtmlToText } from "./parser/html-to-text";
import { writeTxtToFile } from "./api/read-write";
import { splitTxtAsMagicItems } from "parser/magic-item-txt-split";
import { getWcpNode } from "./wcp-node";

// async function fetchHtmlThenConvertThenWriteTxt(filePath: string[]) {
//   const input = await fetchFromGitHub(filePath.join("/") + ".htm");
//   const text = convertHtmlToText(input);
//   // writeTxtToFile(text, filePath.join("-") + ".txt");
//   const segments = splitTxtAsMagicItems(text);
//   console.log(segments);
// }
//
// await fetchHtmlThenConvertThenWriteTxt([
//   "城主指南2024",
//   "7.宝藏",
//   "魔法物品详述",
//   "魔杖",
//   "非普通",
// ]);

const gatherMagicItemsFromBook = async (book: string) => {
  const rootWcpNode = getWcpNode(book);
  if (!rootWcpNode) throw new Error("no wcpNode");
  const validNodes = rootWcpNode.children;

  const tasks = await Promise.all(
    validNodes
      .map((node) => node.children)
      .flat()
      .map((node) => node.children)
      .flat()
      .map(async (node) => {
        try {
          const html = await fetchWcpNodeFileFromGithub(node);
          return html;
        } catch (err) {
          console.log(node);
          throw err;
        }
      }),
  );

  const rawTxtList = tasks.map(convertHtmlToText);
  const segments = rawTxtList.map(splitTxtAsMagicItems).flat();
  return {
    rawTxtList,
    segments,
  };
};

const dmg = await gatherMagicItemsFromBook("城主指南2024/第七章：宝藏/魔法物品详述");

writeTxtToFile(dmg.rawTxtList.join("\\n---------------\\n"), "magic-item-list-raw-dmg.txt");
writeTxtToFile(dmg.segments.join("\n---------------\n"), "magic-item-list-dmg.txt");

let xgeSegments: string[] = [];
const xgeRootWcpNode = getWcpNode("珊娜萨的万事指南/城主工具/奖励魔法物品/新普通魔法物品");
console.log(xgeRootWcpNode);
if (xgeRootWcpNode) {
  const html = await fetchWcpNodeFileFromGithub(xgeRootWcpNode);
  const rawTxtList = convertHtmlToText(html);
  const segments = splitTxtAsMagicItems(rawTxtList);
  segments.shift(); // 此文件的开头部分并非是魔法物品
  xgeSegments = segments;
  writeTxtToFile(rawTxtList, "magic-item-list-raw-xge.txt");
  writeTxtToFile(segments.join("\n---------------\n"), "magic-item-list-xge.txt");
}

const docs = [
  {
    source: "DGM2024",
    content: dmg.segments,
  },
  { source: "XGE", content: xgeSegments },
];
writeTxtToFile(JSON.stringify(docs, null,2), "magic-item-list.json");