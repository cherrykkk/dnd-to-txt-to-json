import assert from "node:assert/strict";
import test from "node:test";
import type { MonsterCard } from "../card-types";
import { gatherTxtAndJsonArr } from "../batch/monster-wcp-node-to-json";
import type { MonsterTreeNode } from "../batch/monster-wcp-node-to-json";

function createTree(title: string, card?: MonsterCard): MonsterTreeNode {
  return {
    title,
    card,
    children: [],
  };
}

test("gathers monster cards and preserves the original table-of-contents order", () => {
  const firstCard = { title: "史拉蟾蝌蚪" } as MonsterCard;
  const secondCard = { title: "史拉红蟾" } as MonsterCard;
  const firstTree = createTree("史拉蟾蝌蚪", firstCard);
  const secondTree = createTree("史拉红蟾", secondCard);

  const output = gatherTxtAndJsonArr([
    { cards: [firstCard], allTxt: "first", tree: firstTree },
    { cards: [secondCard], allTxt: "second", tree: secondTree },
  ]);

  assert.deepEqual(output.cards, [firstCard, secondCard]);
  assert.deepEqual(output.tree, [firstTree, secondTree]);
  assert.match(output.allTxt, /first[\s\S]*second/);
});
