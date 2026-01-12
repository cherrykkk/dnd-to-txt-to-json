import { fetchHtmlThenToTxtThenToJsonAndWrite } from "batch/spells-to-json";

const debug = false;

// fetchHtmlThenToTxtThenToJsonAndWrite(
//   "玩家手册2024/法术详述",
//   ["0环", "1环", "2环", "3环", "4环", "5环", "6环", "7环", "8环", "9环"].map(
//     (e) => `${e}.htm`,
//     true,
//   ),
// );
// fetchHtmlThenToTxtThenToJsonAndWrite(
//   "塔莎的万事坩埚/法术/法术详述",
//   ["戏法", "1环", "2环", "3环", "4环", "5环", "6环", "7环", "9环"].map((e) => `${e}.html`),
// );
fetchHtmlThenToTxtThenToJsonAndWrite(
  "珊娜萨的万事指南/法术/法术详述",
  ["戏法", "1环", "2环", "3环", "4环", "5环", "6环", "7环", "8环", "9环"].map((e) => `${e}.html`),
  debug,
);

// fetchHtmlThenToTxtThenToJsonAndWrite(
//   "荒洲探险家指南/角色选项/秘迹学法术",
//   ["秘迹学法术详述.htm"],
//   debug,
// );
// fetchHtmlThenToTxtThenToJsonAndWrite("艾奎兹玄有限责任公司/玩家选项", ["新法术详述.htm"], debug);
// fetchHtmlThenToTxtThenToJsonAndWrite("第三方/歪曲之月/第七章", ["法术详述.htm"], debug);
