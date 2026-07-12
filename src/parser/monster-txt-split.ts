// 一般会是一个怪物一个页面，但该页面分为怪物背景描述和怪物卡信息
import { isTitleLine, parseMonsterTitleLine } from "./monster-misc";

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

  /** 第一行不一定是标题，有可能是图片，例如：
   * [helmed-horror.jpg]
   * 恐怖铠甲对魔法师的闪电束免疫
   * 恐怖铠甲 Helmed Horror
   */
  const titleIndex = lines.findIndex(isTitleLine);
  if (titleIndex === -1) return { name_CH, name_ENG, backgroundStory, monsterCard };

  const name = parseMonsterTitleLine(lines[titleIndex] ?? "");
  name_CH = name.name_CH;
  name_ENG = name.name_ENG;

  const hasMonsterCardStructure = (candidateIndex: number) => {
    const cardHeaderLines = lines
      .slice(candidateIndex + 1)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 12);

    return (
      cardHeaderLines.some((line) => /^(?:AC|护甲等级)(?:\s|[:：])/.test(line)) &&
      cardHeaderLines.some((line) => /^(?:HP|生命值)(?:\s|[:：])/.test(line)) &&
      cardHeaderLines.some((line) => /^速度(?:\s|[:：])/.test(line)) &&
      cardHeaderLines.some(
        (line) => line.includes("力量") && line.includes("敏捷") && line.includes("体质"),
      ) &&
      cardHeaderLines.some(
        (line) => line.includes("智力") && line.includes("感知") && line.includes("魅力"),
      )
    );
  };

  // 普通条目会在背景和数据卡开头各出现一次标题；附录中的纯数据卡页面只有一次。
  // 只接受后面紧跟完整属性骨架的同名标题，避免把说明页的双语小标题当成怪物卡。
  let cardTitleIndex = hasMonsterCardStructure(titleIndex) ? titleIndex : -1;
  for (let i = titleIndex + 1; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (!isTitleLine(line)) continue;

    const candidate = parseMonsterTitleLine(line);
    if (
      candidate.name_CH === name_CH &&
      candidate.name_ENG === name_ENG &&
      hasMonsterCardStructure(i)
    ) {
      cardTitleIndex = i;
    }
  }

  if (cardTitleIndex === -1) {
    backgroundStory = lines.slice(titleIndex + 1).join("\n");
    if (backgroundStory && !backgroundStory.endsWith("\n")) backgroundStory += "\n";
    return { name_CH, name_ENG, backgroundStory, monsterCard };
  }

  backgroundStory = lines.slice(titleIndex + 1, cardTitleIndex).join("\n");
  if (backgroundStory) backgroundStory += "\n";

  monsterCard = lines.slice(cardTitleIndex).join("\n");
  if (monsterCard && !monsterCard.endsWith("\n")) monsterCard += "\n";

  return { name_CH, name_ENG, backgroundStory, monsterCard };
}

export type MonsterTxtSplitResult = ReturnType<typeof splitMonsterTxt>;
