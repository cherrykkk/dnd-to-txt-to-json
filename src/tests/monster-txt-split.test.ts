import assert from "node:assert/strict";
import test from "node:test";
import { splitMonsterTxt } from "../parser/monster-txt-split";
import { parseMonsterTxtSplitToJson } from "../parser/monster-txt-split-to-json";

const card = `獾Badger
微型野兽，无阵营
AC 11 先攻 +0（10）
HP 5（1d4+3）
速度 20尺，掘穴5尺
调整豁免 调整豁免 调整豁免
力量 10 +0 +0 敏捷 11 +0 +0 体质 16 +3 +3
智力 2 -4 -4 感知 12 +1 +1 魅力 5 -3 -3`;

test("treats an appendix page with one title as a monster card", () => {
  const result = splitMonsterTxt(card);

  assert.equal(result.name_CH, "獾");
  assert.equal(result.name_ENG, "Badger");
  assert.equal(result.backgroundStory, "");
  assert.equal(result.monsterCard, `${card}\n`);

  const parsedCard = parseMonsterTxtSplitToJson(result.monsterCard);
  assert.equal(parsedCard.title, "獾");
  assert.equal(parsedCard.subLine, "微型野兽，无阵营");
});

test("accepts a hyphen in an English monster title", () => {
  const saberToothedTigerCard = card.replace("獾Badger", "剑齿虎Saber-Toothed Tiger");
  const result = splitMonsterTxt(saberToothedTigerCard);

  assert.equal(result.name_CH, "剑齿虎");
  assert.equal(result.name_ENG, "Saber-Toothed Tiger");
  assert.equal(result.monsterCard, `${saberToothedTigerCard}\n`);

  const parsedCard = parseMonsterTxtSplitToJson(result.monsterCard);
  assert.equal(parsedCard.title, "剑齿虎");
  assert.equal(parsedCard.ENG_name, "Saber-Toothed Tiger");
});

test("uses the last matching title after the background as the card start", () => {
  const result = splitMonsterTxt(`獾 Badger
生活在地下的动物。
獾Badger
微型野兽，无阵营
AC 11 先攻 +0（10）
HP 5（1d4+3）
速度 20尺，掘穴5尺
调整豁免 调整豁免 调整豁免
力量 10 +0 +0 敏捷 11 +0 +0 体质 16 +3 +3
智力 2 -4 -4 感知 12 +1 +1 魅力 5 -3 -3`);

  assert.equal(result.name_CH, "獾");
  assert.equal(result.name_ENG, "Badger");
  assert.equal(result.backgroundStory, "生活在地下的动物。\n");
  assert.equal(result.monsterCard, `${card}\n`);
});

test("does not treat an appendix description page as a monster card", () => {
  const result = splitMonsterTxt(`附录A：动物 Animals
该附录提供动物数据卡。
奇幻生物 Fantastic Animals
以下数据卡是现实动物的奇幻版本：
血鹰Blood Hawk：极具侵略性的鸟类。`);

  assert.equal(result.monsterCard, "");
});

test("does not treat a group overview as a monster card", () => {
  const result = splitMonsterTxt(`史拉蟾Slaadi
孽生于混乱的混沌海族裔
史拉蟾以其他生物为宿主繁殖。
特质Traits
魔法抗性Magic Resistance。史拉蟾对抗法术时具有优势。`);

  assert.equal(result.name_CH, "史拉蟾");
  assert.equal(result.monsterCard, "");
});
