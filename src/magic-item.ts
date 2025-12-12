import { fetchFromGitHub, fetchWcpNodeFileFromGithub } from "./api/fetch-html";
import { convertHtmlToText } from "./parser/html-to-text";
import { writeTxtToFile } from "./api/read-write";
import { splitTxtAsMagicItems } from "./parser/magic-item-txt-split";
import { getWcpNode } from "./wcp-node";
import { magicItemSegmentToJson } from "parser/magic-item-txt-to-json";

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

const gatheredList: Record<string, { rawTxtList: string[]; segments: string[] }> = {};

const gatherMagicItemsFromBook = async (book: string) => {
  const rootWcpNode = getWcpNode(book);
  if (!rootWcpNode) throw new Error("no wcpNode");
  console.log(rootWcpNode);
  let validNodes = rootWcpNode.children;
  validNodes = validNodes
    .flatMap((e) => (e.children.length ? e.children : e))
    .flatMap((e) => (e.children.length ? e.children : e));
  console.log(validNodes);
  const tasks = await Promise.all(
    validNodes.map(async (node) => {
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

const gatherMagicItemsFromPage = async (page: string) => {
  const node = getWcpNode(page);
  if (!node) throw new Error("no wcpNode: " + page);
  const html = await fetchWcpNodeFileFromGithub(node);
  const rawTxtList = convertHtmlToText(html);
  const segments = splitTxtAsMagicItems(rawTxtList);
  segments.shift(); // 此文件的开头部分并非是魔法物品
  return {
    rawTxtList: [rawTxtList],
    segments,
  };
};

gatheredList["DMG2024"] = await gatherMagicItemsFromBook("城主指南2024/第七章：宝藏/魔法物品详述");
gatheredList["ERLW"] = await gatherMagicItemsFromBook("艾伯伦：从终末战争中崛起/宝藏/魔法物品");
gatheredList["XGE"] = await gatherMagicItemsFromPage(
  "珊娜萨的万事指南/城主工具/奖励魔法物品/新普通魔法物品",
);
gatheredList["TCE"] = await gatherMagicItemsFromBook(
  "塔莎的万事坩埚/魔法杂物间/魔法物品/魔法物品详述",
);
gatheredList["GGR"] = await gatherMagicItemsFromPage("拉尼卡公会长指南/宝藏/魔法物品详述");
gatheredList["BGG"] = await gatherMagicItemsFromBook("毕格比巨献：巨人之荣耀/巨人宝藏/魔法物品");
gatheredList["MOT"] = await gatherMagicItemsFromBook("塞洛斯之神话奥德赛/宝藏/魔法物品");
gatheredList["SCC"] = await gatherMagicItemsFromPage(
  "斯翠海文：混沌研习（无模组）/角色选项/魔法物品",
);

writeTxtToFile(
  Object.values(gatheredList)
    .map((e) => e.rawTxtList.join("\n\n=============\n\n"))
    .join("\n\n=============\n\n"),
  "magic-item-list-raw.txt",
);
writeTxtToFile(
  Object.values(gatheredList)
    .map((e) => e.segments.join("\n---------------\n"))
    .join("\n\n=============\n\n"),
  "magic-item-list.txt",
);

const outputList = Object.keys(gatheredList).flatMap((key) => {
  return gatheredList[key]!.segments.map((seg) => ({
    ...magicItemSegmentToJson(seg),
    source: key,
  }));
});

writeTxtToFile(JSON.stringify(outputList, null, 2), "magic-item-list.json");
