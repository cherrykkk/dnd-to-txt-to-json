import { MonsterCard, AbilityEntry, AbilityName } from "../card-types";
import { isNewBlockTitle } from "./monster-misc";

/**
 * 施法动作描述如下，需要特殊处理
 施法Spellcasting。巫妖施展以下一道法术，使用智力作为施法属性（法术豁免DC20）：
 随意： 侦测魔法Detect Magic，侦测思想Detect Thoughts，解除魔法Dispel Magic，火球术Fireball（五环版本）， 隐形术Invisibility，闪电束Lightning Bolt（五环版本）， 法师之手Mage Hand，魔法伎俩Prestidigitation
 每项2/日：活化死尸Animate Dead，任意门Dimension Door，位面转移Plane Shift
 每项1/日：连锁闪电Chain Lightning，死亡一指Finger of Death，律令死亡Power Word Kill，探知术Scrying
 */

const splitSigns = /\\t|\t| /;
const ABILITY_NAME_MAP = {
  力量: "str",
  敏捷: "dex",
  体质: "con",
  智力: "ins",
  感知: "wis",
  魅力: "cha",
};

const INFO_KEYS = ["HP", "AC", "先攻", "速度"];

function splitNameAndText(line: string): { name: string; text: string } {
  // 形如：XXX。YYYY -> name 含结尾的“。”，text 为其后描述
  const m = line.match(/^(.+?。)(.*)$/);
  if (m) return { name: m[1] ?? "", text: m[2] ?? "" };
  return { name: "", text: line };
}

// 将 mock-monster 文本解析为 MonsterCard JSON
export function parseMonsterTxtSplitToJson(txt: string): MonsterCard {
  const lines = txt
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const remainingLines = [...lines];
  const fetchNextLine = () => remainingLines.shift() ?? "";

  const title = fetchNextLine(); // 例如：平民Commoner
  const eng_name = ((title ?? "").match(/[A-Za-z][A-Za-z0-9_\- ]*/) || [title])[0];
  const subLine = fetchNextLine(); // 例如：中型或小型类人，中立

  const fineNextKeyIndex = (line: string, start: number) => {
    const indexesOfThisLine: { key: string; index: number }[] = [];
    for (let i = 0; i < INFO_KEYS.length; i++) {
      const key = INFO_KEYS[i] ?? "";
      const index = line.indexOf(key, start);
      if (index !== -1) {
        indexesOfThisLine.push({ key, index });
      }
    }
    if (indexesOfThisLine.length > 0) {
      indexesOfThisLine.sort((a, b) => a.index - b.index);
      return indexesOfThisLine[0];
    }
    return null;
  };
  const simpleInfo: Record<string, string> = {};
  const getKeyValueUntilNextKey = (line: string) => {
    // console.log(line);
    let curPair = fineNextKeyIndex(line, -1);
    let nextPair;
    while (curPair) {
      // console.log(curPair);
      nextPair = fineNextKeyIndex(line, curPair.index + curPair.key.length);
      let curVal = line.slice(curPair.index + curPair.key.length, nextPair?.index).trim();
      simpleInfo[curPair.key] = curVal;
      curPair = nextPair;
    }
  };

  let curLine = fetchNextLine();
  while (!curLine.includes("力量")) {
    getKeyValueUntilNextKey(curLine);
    if (remainingLines.length === 0) break;
    curLine = fetchNextLine();
  }
  // console.log(simpleInfo);

  function parseAbilityRow(row: string | undefined) {
    if (!row) return [];
    // e.g. 力量\t16\t+3\t+3\t\t敏捷\t13\t+1\t+1\t\t体质\t16\t+3\t+3
    const parts = row.split(/(\t| )+/).filter((e) => Boolean(e.trim()));
    // console.log(row, parts);
    const result: AbilityEntry[] = [];
    for (let i = 0; i + 3 < parts.length; i += 4) {
      const name = parts[i] as AbilityName;
      const score = Number(parts[i + 1]);
      const mod = parts[i + 2] ?? "";
      const save = parts[i + 3] ?? "";
      result.push({ name, score, mod, save });
    }
    return result;
  }

  // 能力行（两行：力量/敏捷/体质 与 智力/感知/魅力）
  const row2 = lines.find((l) => l.startsWith("力量"));
  const row3 = lines.find((l) => l.startsWith("智力"));
  const abilityEntries = [...parseAbilityRow(row2), ...parseAbilityRow(row3)];
  const pick = (name: AbilityName): AbilityEntry => {
    return abilityEntries.find((e) => e.name === name) ?? { name, score: 0, mod: "", save: "" };
  };

  let curBlock = "";
  let inSpellcasting = false; // 5e 的施法描述不太规范
  const traitsAndActions: Record<string, { name: string; text: string }[]> = {};

  while (remainingLines.length > 0) {
    const line = fetchNextLine();
    const newBlockTitle = isNewBlockTitle(line);
    if (newBlockTitle) {
      curBlock = newBlockTitle;
      inSpellcasting = false;
      continue;
    }

    if (!curBlock) {
      // not in block, which means in simple info
      const [name, value] = line.split(" ");
      if (!name || !value) continue;
      simpleInfo[name] = value;
    }

    if (curBlock) {
      const curArr = traitsAndActions[curBlock] ?? [];
      if (inSpellcasting) {
        const lastItem = curArr[curArr.length - 1];
        if (!lastItem) {
          console.log(
            "unexpected spellcasting line:",
            line,
            "curBlock:",
            curBlock,
            "curArr:",
            curArr,
          );
          continue;
        }
        lastItem.text += "\n" + line;
        continue;
      } else {
        const item = splitNameAndText(line);
        curArr.push(item);
        traitsAndActions[curBlock] = curArr;
        if (line.startsWith("施法Spellcasting。")) {
          inSpellcasting = true;
        }
      }
    }
  }

  return {
    ENG_name: eng_name,
    title: title ?? "",
    subLine: subLine ?? "",
    simpleInfo,
    abilities: {
      str: pick("力量"),
      dex: pick("敏捷"),
      con: pick("体质"),
      int: pick("智力"),
      wis: pick("感知"),
      cha: pick("魅力"),
    },
    ...traitsAndActions,
  };
}
