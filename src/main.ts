// 直接运行：打印结果，并简单对比是否与 MOCK_MONSTER_HTML 一致
import { MOCK_MONSTER_HTML } from "tests/test_Commoner";
import { parseMonsterTxtToJson } from "parse-to-json";
import { readTxtFromFile, writeHtmlToFile, getInputFilenames } from "read-write";
import { monsterJsonToHtml } from "json-to-html";

if (process.argv.includes("--print")) {
  const txt = readTxtFromFile("./files-input/Sea_Hag.txt");
  const json = parseMonsterTxtToJson(txt);
  console.log(json);
}
if (process.argv.includes("--check")) {
  const txt = readTxtFromFile("./files-input/Commoner.txt");
  const json = parseMonsterTxtToJson(txt);
  const html = monsterJsonToHtml(json);
  const same = html.replace(/\s+/g, "") === MOCK_MONSTER_HTML.replace(/\s+/g, "");
  console.log(same ? "MATCH" : "DIFF");
}
if (process.argv.includes("--write")) {
  const files = getInputFilenames();

  for (const filename of files) {
    const txt = readTxtFromFile(`./files-input/${filename}.txt`);
    const json = parseMonsterTxtToJson(txt);
    writeHtmlToFile(monsterJsonToHtml(json));
  }
}
