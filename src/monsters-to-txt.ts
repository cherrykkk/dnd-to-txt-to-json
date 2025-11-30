import { fetchFromGitHub } from "./api/fetch-html";
import { writeTxtToFile } from "./api/read-write";
import { convertHtmlToText } from "./parser/html-to-text";
import { splitMonsterTxt } from "parser/monster-txt-split";

fetchHtmlThenConvertThenWriteTxt("怪物图鉴2025/亡灵/巫妖.htm");

async function fetchHtmlThenConvertThenWriteTxt(pagePath: string) {
  const input = await fetchFromGitHub(pagePath);
  const text = convertHtmlToText(input);

  const pageName = pagePath.split(".")[0] ?? "？？";

  writeTxtToFile(text, pageName.split("/").join("-") + ".txt");

  return splitMonsterTxt(text);
}
