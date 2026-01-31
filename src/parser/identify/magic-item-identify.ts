const normalRarity = [
  "普通",
  "非普通",
  "珍稀",
  "极珍稀",
  "神器",
  "传说",
  "多种稀有度",
  "多种珍稀度", // 艾恩石
  "普通或非普通", // 幻织
]; // 艾恩石被特殊写成了多种珍稀度
const categories = ["护甲", "药水", "戒指", "权杖", "卷轴", "法杖", "魔杖", "武器", "奇物"];
const ggrSpecialRarity = ["稀有度依符镇兵种类而不同"];
const rarities = normalRarity.concat(ggrSpecialRarity);

//1. 奇物，神器
//2. 奇物， 珍稀（需同调）#不规范写法，多了一个空格
//3. 奇物，神器（需同调）
//4. 奇物，普通（需魔契师同调）
//5. 卷轴，多种稀有度
//6. 武器（任意弹药或近战武器），非普通
//7. 武器（长柄刀、巨剑、长剑、刺剑、弯刀或短剑），非普通（需同调）
//8. 护甲（中甲或重甲，兽皮甲除外），非普通
//9. 奇物，普通或非普通
//10. 武器（镰刀）, 非普通（+1）, 珍稀（+2）, 极珍稀（+3）（需德鲁伊或游侠同调 ）
export function parseAsCategoryAndRarityAndAttunement(line: string) {
  //按英文逗号 , 或中文逗号 ， 分割字符串，但如果逗号位于括号 () 或 （） 内部，则不作为分隔符。
  const parseResult1 = line.split(/[,，](?![^（(]*[）)])/);
  // 分割结果可能不止两个元素，例如类型 10 的情况
  const categoryAnd = parseResult1.shift() ?? "";
  const rarityAndAttunement = parseResult1.join("，");
  const category = categoryAnd.split(/[（）,， ]/).filter(Boolean)[0];
  if (rarityAndAttunement.includes("同调")) {
    const parseResult2 = rarityAndAttunement.match(/^(.*?)(?:（([^（）]+)）)\s*$/);
    if (parseResult2 && parseResult2[2] && parseResult2[2].includes("同调")) {
      return {
        category: categoryAnd,
        rarity:
          parseResult2[1] ??
          "".replace("多种珍稀度", "多种稀有度").replace("稀有度依符镇兵种类而不同", "多种稀有度"),
        attunement: parseResult2[2],
      };
    } else {
      throw new Error(rarityAndAttunement);
    }
  } else {
    const rarity = rarityAndAttunement.split(/[（）,， ]/).filter(Boolean)[0];
    // 先分割再完全匹配，避免一句话中偶然出现这两种词
    if (categories.includes(category) && rarities.includes(rarity)) {
      // 存在不标准格式如同“奇物， 珍稀（需同调）” 一样在逗号后多了个空格，故加一个 trim
      const attunement = rarityAndAttunement.trim().replace(rarity, "");

      return {
        category: categoryAnd,
        rarity: rarity
          .replace("多种珍稀度", "多种稀有度")
          .replace("稀有度依符镇兵种类而不同", "多种稀有度"),
        attunement,
      };
    } else {
      return { category: "", rarity: "", attunement: "" };
    }
  }
}
