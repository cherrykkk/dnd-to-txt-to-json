export function isTitleLine(line: string) {
  // 正则表达式：必须同时包含汉字和英文字母，英文名可包含空格和连字符
  const regex =
    /^(?=.*[\u4e00-\u9fff\u3400-\u4dbf])(?=.*[a-zA-Z])[\u4e00-\u9fff\u3400-\u4dbfa-zA-Z -]+$/;
  return regex.test(line);
}

export function parseMonsterTitleLine(line: string) {
  // 方式 1（失效，标题可能有空格，但也可能没有空格，比如 ‘晓谕斯芬克斯Sphinx of Lore’ 就没有空格）
  // const splitIndex = line.indexOf(" ");
  // const name_CH = line.slice(0, splitIndex);
  // const name_ENG = line.slice(splitIndex + 1);

  // 方式 2：从第一个英文字母开始视为英文名，之前为中文名。
  // 纯中文标题也要保留在 name_CH，不能误当成英文名。
  const englishMatch = line.match(/[A-Za-z][A-Za-z0-9_\- ]*/);
  const name_ENG = englishMatch?.[0].trim() ?? "";
  const name_CH = englishMatch ? line.replace(englishMatch[0], "").trim() : line.trim();
  return { name_CH, name_ENG };
}

// 规范化区块标题，兼容大小写、空格和冒号差异
const normalizeBlockTitle = (line: string) =>
  line.replace(/\s+/g, "").replace(/[：:]/g, "").toLowerCase();

const linesMapKey = [
  {
    key: "traits",
    from: ["特质Traits", "特质", "traits", "特性", "特性Traits"],
  },
  {
    key: "actions",
    from: ["动作Actions", "动作", "actions", "动作 Actions"],
  },
  {
    key: "reactions",
    from: ["反应Reactions", "反应", "reactions", "反应 Reactions"],
  },
  {
    key: "bonusActions",
    from: ["附赠动作Bonus Actions", "附赠动作", "bonus actions", "附赠动作 Bonus Actions"],
  },
  {
    key: "legendaryActions",
    from: [
      "传奇动作Legendary Actions",
      "传奇动作",
      "legendary actions",
      "传奇动作 Legendary Actions",
    ],
  },
];
export function isNewBlockTitle(line: string) {
  for (const item of linesMapKey) {
    if (item.from.find((e) => normalizeBlockTitle(e) === normalizeBlockTitle(line)))
      return item.key;
  }
}
