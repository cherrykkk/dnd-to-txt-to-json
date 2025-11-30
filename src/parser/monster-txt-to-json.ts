import { MonsterCard } from "../card-types";
import { splitMonsterTxt } from "parser/monster-txt-split";
import { parseMonsterTxtSplitToJson } from "parser/monster-txt-split-to-json";

// 将 mock-monster 文本解析为 MonsterCard JSON
export function parseMonsterTxtToJson(txt: string): MonsterCard {
  const txtSplit = splitMonsterTxt(txt);
  const card = parseMonsterTxtSplitToJson(txtSplit.monsterCard);
  card.simpleInfo["背景"] = txtSplit.backgroundStory;
  return card;
}
