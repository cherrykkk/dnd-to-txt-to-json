import { fetchFromGitHub } from "../api/fetch-html";
import { writeTxtToFile } from "../api/read-write";
import { convertHtmlToText } from "../parser/html-to-text";
import { splitMonsterTxt } from "../parser/monster-txt-split";
import { parseMonsterTxtToJson } from "../parser/monster-txt-to-json";

export async function batchFetchHtmlThenToJsonThenWriteFile(pages: string[], writeTo: string) {
  const allTasks = pages.map((e) => fetchHtmlThenToJson(e));
  const allResults = await Promise.all(allTasks);

  const toWriteTxt = allResults
    .map((e) => {
      const split = e.txtSplit;
      return (
        split.name_CH +
        " " +
        split.name_ENG +
        "\n" +
        split.backgroundStory +
        "\n----------\n" +
        split.monsterCard
      );
    })
    .join("\n=============================\n");
  writeTxtToFile(toWriteTxt, writeTo + ".txt");

  writeTxtToFile(
    JSON.stringify(
      allResults.map((e) => e.card),
      undefined,
      2,
    ),
    writeTo + ".json",
  );
}

async function fetchHtmlThenToJson(pagePath: string) {
  console.log("fetching ", pagePath);
  const input = await fetchFromGitHub(pagePath);
  const text = convertHtmlToText(input);
  const txtSplit = splitMonsterTxt(text);
  const card = parseMonsterTxtToJson(txtSplit.monsterCard);
  return { text, txtSplit, card };
}
