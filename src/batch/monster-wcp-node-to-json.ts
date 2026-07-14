import type { WcpNode } from "parser/wcp-to-json";
import { fetchWcpNodeFileFromGithub } from "api/fetch-html";
import type { MonsterCard } from "card-types";
import { convertHtmlToText } from "parser/html-to-text";
import { splitMonsterTxt } from "parser/monster-txt-split";
import { parseMonsterTxtSplitToJson } from "parser/monster-txt-split-to-json";

export interface MonsterTreeNode {
  title: string;
  card?: MonsterCard;
  children: MonsterTreeNode[];
}

interface MonsterNodeConversion {
  cards: MonsterCard[];
  allTxt: string;
  tree: MonsterTreeNode;
}

export function gatherTxtAndJsonArr(inputArr: MonsterNodeConversion[]) {
  const cards: MonsterCard[] = [];
  const tree: MonsterTreeNode[] = [];
  let allTxt = "";
  inputArr.forEach(({ cards: childrenCards, allTxt: childrenTxt, tree: childTree }) => {
    allTxt += "\n===================\n" + childrenTxt;
    tree.push(childTree);
    childrenCards.forEach((e) => {
      cards.push(e);
    });
  });
  return {
    cards,
    allTxt,
    tree,
  };
}

export async function wcpNodeToTxtAndJson(
  node: WcpNode,
  ref = "main",
): Promise<MonsterNodeConversion> {
  console.log(node);
  let allTxt = "";
  let txt = "";
  const cards: MonsterCard[] = [];
  let nodeCard: MonsterCard | undefined;
  let children: MonsterTreeNode[] = [];

  if (node.url) {
    const html = await fetchWcpNodeFileFromGithub(node, ref);
    txt = convertHtmlToText(html);
    const txtSplit = splitMonsterTxt(txt);
    const card = parseMonsterTxtSplitToJson(txtSplit.monsterCard);
    card.simpleInfo["背景"] = txtSplit.backgroundStory;
    const isCard = card.title && card.subLine;
    if (isCard) {
      nodeCard = card;
      cards.push(card);
      const monsterSplitText = `${txtSplit.name_CH} ${txtSplit.name_ENG}\n ${txtSplit.backgroundStory}\n---------------\n${txtSplit.monsterCard}`;
      allTxt += monsterSplitText + "\n\n";
    } else {
      allTxt += txt + "\n\n";
    }
  }

  if (node.children) {
    const tasks = await Promise.all(node.children.map((child) => wcpNodeToTxtAndJson(child, ref)));
    const flatted = gatherTxtAndJsonArr(tasks);
    children = flatted.tree;
    allTxt += `\n===================\n` + flatted.allTxt;
    flatted.cards.forEach((e) => {
      e.simpleInfo["父级：" + node.title] = txt;
      cards.push(e);
    });
  }
  return {
    cards,
    allTxt,
    tree: {
      title: node.title,
      card: nodeCard,
      children,
    },
  };
}
