import { fetchHtmlThenToTxtThenToJsonAndWrite } from "batch/spells-to-json";

fetchHtmlThenToTxtThenToJsonAndWrite(
  "玩家手册2024/法术详述",
  ["0环", "1环", "2环", "3环", "4环", "5环", "6环", "7环", "8环", "9环"].map((e) => `${e}.htm`),
);
fetchHtmlThenToTxtThenToJsonAndWrite(
  "塔莎的万事坩埚/法术/法术详述",
  ["戏法", "1环", "2环", "3环", "4环", "5环", "6环", "7环", "9环"].map((e) => `${e}.html`),
);
