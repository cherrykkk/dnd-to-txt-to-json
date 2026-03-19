import path from "path";
import { fetchFromGitHub } from "../api/fetch-html";
import { writeTxtToFile } from "../api/read-write";
import { convertHtmlToText } from "../parser/html-to-text";
import { spellTxtToJson } from "../parser/json/spell-json";
import { splitSpellTxt } from "../parser/split/spell-split";

export async function fetchHtmlThenToTxtThenToJsonAndWrite(
  basePath: string,
  pages: string[],
  debug = false,
  mayOverwrite = {
    splitSpellTxt,
    convertHtmlToText,
  },
) {
  console.log(debug);
  const taskGroup = pages.map(async (e) => {
    const filePath = basePath + "/" + e;

    const input = await fetchFromGitHub(filePath);
    const plainText = mayOverwrite.convertHtmlToText(input);
    const txtBlocks = mayOverwrite.splitSpellTxt(plainText);

    // await ensureDirectoryExists("分割");

    if (debug) {
      const name = path.parse(filePath).name;
      writeTxtToFile(input, `debug-源-` + name.split("/").join("-") + "" + ".html");
      writeTxtToFile(plainText, `debug-text-` + name.split("/").join("-") + "" + ".html");
      writeTxtToFile(
        txtBlocks.join("\n--------------\n"),
        `debug-分割-` + name.split("/").join("-") + "" + ".txt",
      );
    }

    const structuredSpells = txtBlocks.map((e) => spellTxtToJson(e));
    return structuredSpells;
  });
  const resultGroup = await Promise.all(taskGroup);

  const spellList = resultGroup.flat();
  spellList.sort((a, b) => {
    if (a.rawName > b.rawName) {
      return 1;
    } else {
      return -1;
    }
  });
  writeTxtToFile(
    JSON.stringify(spellList, undefined, 2),
    `格式化-${basePath.split("/").join("-")}.json`,
  );
}
// fsPromises.writeFile("./class_spell_list_map.json", JSON.stringify(classSpellListMap));
