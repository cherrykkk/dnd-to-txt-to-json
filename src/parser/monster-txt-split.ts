// 一般会是一个怪物一个页面，但该页面分为怪物背景描述和怪物卡信息
import { isTitleLine, parseMonsterTitleLine } from "parser/monster-misc";

/**
  将根据
    巫妖Lich
    中型亡灵（法师），中立邪恶
  以上两行的格式来识别并分割两种信息
*/

export function splitMonsterTxt(txt: string) {
  let name_CH = "";
  let name_ENG = "";
  let backgroundStory = "";
  let monsterCard = "";

  const lines = txt.split("\n");

  let inCard = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined) break;

    /** 第一行不一定是标题，有可能是图片，例如：
     * [helmed-horror.jpg]
     * 恐怖铠甲对魔法师的闪电束免疫
     * 恐怖铠甲 Helmed Horror
     */

    if (!name_CH || !name_ENG) {
      if (isTitleLine(line)) {
        const name = parseMonsterTitleLine(line);
        name_CH = name.name_CH;
        name_ENG = name.name_ENG;
        continue;
      } else {
        continue;
      }
    }

    if (line === name_CH + name_ENG) {
      inCard = true;
    }
    if (inCard) {
      monsterCard += line + "\n";
    } else {
      backgroundStory += line + "\n";
    }
  }

  return { name_CH, name_ENG, backgroundStory, monsterCard };
}

export type MonsterTxtSplitResult = ReturnType<typeof splitMonsterTxt>;
