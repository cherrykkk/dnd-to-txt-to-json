import { MonsterCard, AbilityEntry, AbilityName } from "../card-types";
import { isNewBlockTitle, parseMonsterTitleLine } from "./monster-misc";

/**
 * 施法动作描述如下，需要特殊处理
 施法Spellcasting。巫妖施展以下一道法术，使用智力作为施法属性（法术豁免DC20）：
 随意： 侦测魔法Detect Magic，侦测思想Detect Thoughts，解除魔法Dispel Magic，火球术Fireball（五环版本）， 隐形术Invisibility，闪电束Lightning Bolt（五环版本）， 法师之手Mage Hand，魔法伎俩Prestidigitation
 每项2/日：活化死尸Animate Dead，任意门Dimension Door，位面转移Plane Shift
 每项1/日：连锁闪电Chain Lightning，死亡一指Finger of Death，律令死亡Power Word Kill，探知术Scrying
 */

const INFO_KEYS = ["HP", "AC", "先攻", "速度", "生命值", "护甲等级"];
const REPLACE_KEY: Record<string, string> = {
  生命值: "HP",
  护甲等级: "AC",
};

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

  const titleLine = fetchNextLine(); // 例如：平民Commoner
  const { name_CH, name_ENG } = parseMonsterTitleLine(titleLine);
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
      curVal = curVal.replace(/^[:：]\s*/, "");

      const key = REPLACE_KEY[curPair.key] ?? curPair.key;
      simpleInfo[key] = curVal;
      curPair = nextPair;
    }
  };

  let curLine = fetchNextLine();
  while (!curLine.includes("力量")) {
    getKeyValueUntilNextKey(curLine);
    if (remainingLines.length === 0) break;
    curLine = fetchNextLine();
  }

  // 第一行能力值已经由上面的循环取出；第二行也必须在进入通用信息解析前消费掉。
  // 否则“智力 … 感知 … 魅力 …”会被错误写入 simpleInfo.智力。
  if (remainingLines[0]?.startsWith("智力")) {
    fetchNextLine();
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
  const traitsAndActions: Record<string, { name: string; text: string }[]> = {};
  const appendToLast = (arr: { name: string; text: string }[], extraLine: string) => {
    if (arr.length === 0) return false;
    const lastItem = arr[arr.length - 1];
    if (!lastItem) return false;
    const separator = lastItem.text ? "\n" : "";
    lastItem.text = `${lastItem.text}${separator}${extraLine}`;
    return true;
  };

  /**
   * 判断按第一个“。”拆出的候选项是否真的是一条新特质或新动作。
   *
   * HTML 转成纯文本后，条目和描述续行都只剩普通文本行：
   * - 返回 true：把 item 作为 curBlock 中的新条目加入数组；
   * - 返回 false：调用方会尝试用 appendToLast 将原始行接到上一条的 text。
   *
   * 当前格式以双语名称作为稳定信号；纯中文只明确支持数字结果子项。
   * 其他纯中文行没有足够结构信息区分名称和描述，统一作为续行处理。
   */
  const isLikelyNewEntry = (item: { name: string; text: string }) => {
    const trimmedName = item.name.trim();
    if (!trimmedName) return false;
    if (/[，,:：；;]/.test(trimmedName)) return false; // 含句内标点时更可能是描述续写
    if (/[A-Za-z]/.test(trimmedName)) return true; // 双语条目名可能很长，不能按字符数截断
    return /^\d+(?:[~～-]\d+)?。$/.test(trimmedName); // 如“1~4。”的随机结果子项
  };

  while (remainingLines.length > 0) {
    const line = fetchNextLine();
    const newBlockTitle = isNewBlockTitle(line);
    if (newBlockTitle) {
      curBlock = newBlockTitle;
      continue;
    }

    if (!curBlock) {
      // not in block, which means in simple info
      const i1 = line.indexOf(":");
      const i2 = line.indexOf("：");
      const i3 = line.indexOf(" ");
      const validIndex = [i1, i2, i3].filter((i) => i !== -1);
      if (validIndex.length === 0) continue;
      const splitterIndex = Math.min(...validIndex);
      const name = line.slice(0, splitterIndex);
      const value = line.slice(splitterIndex + 1);
      if (!name || !value) continue;
      simpleInfo[name] = value;
    }

    if (curBlock) {
      const curArr = traitsAndActions[curBlock] ?? [];
      const item = splitNameAndText(line);
      if (!isLikelyNewEntry(item) && appendToLast(curArr, line)) {
        traitsAndActions[curBlock] = curArr;
        continue;
      }
      curArr.push(item);
      traitsAndActions[curBlock] = curArr;
    }
  }

  return {
    ENG_name: name_ENG,
    title: name_CH,
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
