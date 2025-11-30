import path from "path";
import { fetchFromGitHub } from "../api/fetch-html";
import { writeTxtToFile } from "../api/read-write";
import { convertHtmlToText } from "../parser/html-to-text";
import { spellTxtToJson } from "../parser/spell-txt-to-json";
import { splitSpellTxt } from "../parser/spell-txt-split";

export async function fetchHtmlThenToTxtThenToJsonAndWrite(basePath: string, pages: string[]) {
  const taskGroup = pages.map((e) => fetchHtmlThenToTxtThenToJson(basePath + "/" + e));
  const resultGroup = await Promise.all(taskGroup);

  const spellList = resultGroup.flat();
  writeTxtToFile(
    JSON.stringify(spellList, undefined, 2),
    `格式化-${basePath.split("/").join("-")}.json`,
  );
}

async function fetchHtmlThenToTxtThenToJson(filePath: string, debug = false) {
  const input = await fetchFromGitHub(filePath);
  const text = convertHtmlToText(input);
  const txtBlocks = splitSpellTxt(text);

  // await ensureDirectoryExists("分割");

  if (debug) {
    const name = path.parse(filePath).name;
    writeTxtToFile(
      txtBlocks.join("\n--------------\n"),
      `分割-` + name.split("/").join("-") + "" + ".txt",
    );
  }

  const structuredSpells = txtBlocks.map((e) => spellTxtToJson(e));
  return structuredSpells;
}


// fsPromises.writeFile("./class_spell_list_map.json", JSON.stringify(classSpellListMap));
