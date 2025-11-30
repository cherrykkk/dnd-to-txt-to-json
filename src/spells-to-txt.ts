import { convert, htmlToText } from "html-to-text";
import { fetchFromGitHub } from "./api/fetch-html";
import { writeTxtToFile } from "./api/read-write";
import { convertHtmlToText } from "./parser/html-to-text";

fetchHtmlThenConvertThenWriteTxt(["玩家手册2024", "法术详述", "0环"]);
// fetchHtmlThenConvertThenWriteTxt(["玩家手册2024", "法术详述", "3环"]);
// fetchHtmlThenConvertThenWriteTxt(["玩家手册2024", "法术详述", "4环"]);
// fetchHtmlThenConvertThenWriteTxt(["玩家手册2024", "法术详述", "5环"]);

async function fetchHtmlThenConvertThenWriteTxt(filePath: string[]) {
  const input = await fetchFromGitHub(filePath.join("/") + ".htm");
  const text = convertHtmlToText(input);
  writeTxtToFile(text, filePath.join("-") + ".txt");
}
