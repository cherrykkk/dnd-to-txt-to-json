import assert from "node:assert/strict";
import test from "node:test";
import { parseMonsterTitleLine } from "../parser/monster-misc";
import { parseMonsterTxtSplitToJson } from "../parser/monster-txt-split-to-json";

const monsterTxt = `吉斯洋基龙巫Githyanki Dracomancer
中型异怪（吉斯人），守序邪恶
AC 18 先攻 +8（18）
HP 255（30d8+120）
速度 30尺，飞行30尺（悬浮）
力量 10 +0 +0 敏捷 16 +3 +8 体质 18 +4 +9
智力 20 +5 +10 感知 16 +3 +8 魅力 18 +4 +4
技能 奥秘+10，察觉+8
感官 盲视30尺；被动察觉18
语言 通用语、龙语、吉斯语
CR 16（15,000 XP；PB+5）
动作Actions
多重攻击Multiattack。吉斯洋基人发动三次拟龙炎袭攻击。
拟龙炎袭Draconic Strike。近战或远程攻击检定：+10，触及10尺或射程120尺。
目标可以在其回合结束时重复豁免，成功则终止其身上的该效应。
吉斯洋基人可以消耗5尺移动力解除此效应。
咒唤龙息 Conjured Dragon's Breath（充能5~6）。敏捷豁免检定：DC18，90尺锥状区域内的每名生物。
施法Spellcasting。吉斯洋基人施展以下一道法术：
随意：法师之手Mage Hand
每项1/日：位面转移Plane Shift
弱化吐息Weakening Breath。力量豁免检定：DC18，30尺锥状区域内的每名生物。
附赠动作Bonus Actions
迷踪步Misty Step（3/日）。吉斯洋基人施展迷踪步Misty Step。`;

test("parses current two-row abilities without leaking them into simpleInfo", () => {
  const card = parseMonsterTxtSplitToJson(monsterTxt);

  assert.equal(card.title, "吉斯洋基龙巫");
  assert.equal(card.ENG_name, "Githyanki Dracomancer");
  assert.equal(card.simpleInfo["智力"], undefined);
  assert.deepEqual(card.abilities.int, {
    name: "智力",
    score: 20,
    mod: "+5",
    save: "+10",
  });
  assert.deepEqual(card.abilities.cha, {
    name: "魅力",
    score: 18,
    mod: "+4",
    save: "+4",
  });
});

test("keeps a Chinese-only title as the Chinese name", () => {
  assert.deepEqual(parseMonsterTitleLine("巨鳄鱼"), {
    name_CH: "巨鳄鱼",
    name_ENG: "",
  });
});

test("keeps long bilingual action names separate and preserves continuation lines", () => {
  const card = parseMonsterTxtSplitToJson(monsterTxt);

  assert.deepEqual(
    card.actions?.map((entry) => entry.name),
    [
      "多重攻击Multiattack。",
      "拟龙炎袭Draconic Strike。",
      "咒唤龙息 Conjured Dragon's Breath（充能5~6）。",
      "施法Spellcasting。",
      "弱化吐息Weakening Breath。",
    ],
  );
  assert.match(card.actions?.[1]?.text ?? "", /目标可以在其回合结束时重复豁免/);
  assert.match(card.actions?.[1]?.text ?? "", /可以消耗5尺移动力解除此效应/);
  assert.match(card.actions?.[3]?.text ?? "", /随意：法师之手Mage Hand/);
  assert.match(card.actions?.[3]?.text ?? "", /每项1\/日：位面转移Plane Shift/);
  assert.match(card.actions?.[4]?.text ?? "", /力量豁免检定：DC18/);
  assert.equal(card.bonusActions?.[0]?.name, "迷踪步Misty Step（3/日）。");
});

test("keeps numeric result entries without splitting Chinese continuation sentences", () => {
  const card = parseMonsterTxtSplitToJson(`${monsterTxt}
特质Traits
呓语Gibbering。目标掷1d8决定其行为。
1~4。目标什么都不做。
5~6。目标无法执行动作。
作次数。`);

  assert.deepEqual(
    card.traits?.map((entry) => entry.name),
    ["呓语Gibbering。", "1~4。", "5~6。"],
  );
  assert.match(card.traits?.[2]?.text ?? "", /目标无法执行动作/);
  assert.match(card.traits?.[2]?.text ?? "", /作次数/);
});
