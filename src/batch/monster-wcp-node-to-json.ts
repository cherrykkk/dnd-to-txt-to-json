import { WcpNode } from "parser/wcp-to-json";
import { fetchFromGitHub, fetchWcpNodeFileFromGithub } from "api/fetch-html";
import { MonsterCard } from "card-types";
import { convertHtmlToText } from "parser/html-to-text";
import { splitMonsterTxt } from "parser/monster-txt-split";
import { parseMonsterTxtSplitToJson } from "parser/monster-txt-split-to-json";

export function gatherTxtAndJsonArr(inputArr: Awaited<ReturnType<typeof wcpNodeToTxtAndJson>>[]) {
  const cards: MonsterCard[] = [];
  let allTxt = "";
  inputArr.forEach(({ cards: childrenCards, allTxt: childrenTxt }) => {
    allTxt += "\n===================\n" + childrenTxt;
    childrenCards.forEach((e) => {
      cards.push(e);
    });
  });
  return {
    cards,
    allTxt,
  };
}

export async function wcpNodeToTxtAndJson(node: WcpNode) {
  console.log(node);
  let allTxt = "";
  let txt = "";
  let cards: MonsterCard[] = [];

  if (node.url) {
    const html = await fetchWcpNodeFileFromGithub(node)
    txt = convertHtmlToText(html);
    const txtSplit = splitMonsterTxt(txt);
    const card = parseMonsterTxtSplitToJson(txtSplit.monsterCard);
    card.simpleInfo["背景"] = txtSplit.backgroundStory;
    const isCard = card.title && card.subLine;
    if (isCard) {
      cards.push(card);
      const monsterSplitText = `${txtSplit.name_CH} ${txtSplit.name_ENG}\n ${txtSplit.backgroundStory}\n---------------\n${txtSplit.monsterCard}`;
      allTxt += monsterSplitText + "\n\n";
    } else {
      allTxt += txt + "\n\n";
    }
  }

  if (node.children) {
    const tasks = await Promise.all(node.children.map(wcpNodeToTxtAndJson));
    const flatted = gatherTxtAndJsonArr(tasks);
    allTxt += `\n===================\n` + flatted.allTxt;
    flatted.cards.forEach((e) => {
      e.simpleInfo["父级：" + node.title] = txt;
      cards.push(e);
    });
  }
  return { cards, allTxt };
}
