export function isTitleLine(line: string) {
  // 正则表达式：必须同时包含汉字和英文字母，空格可选
  const regex =
    /^(?=.*[\u4e00-\u9fff\u3400-\u4dbf])(?=.*[a-zA-Z])[\u4e00-\u9fff\u3400-\u4dbfa-zA-Z ]+$/;
  return regex.test(line);
}

export function parseMonsterTitleLine(line: string) {
  // 方式 1（失效，标题可能有空格，但也可能没有空格，比如 ‘晓谕斯芬克斯Sphinx of Lore’ 就没有空格）
  // const splitIndex = line.indexOf(" ");
  // const name_CH = line.slice(0, splitIndex);
  // const name_ENG = line.slice(splitIndex + 1);

  // 方式 2
  const name_ENG = (line.match(/[A-Za-z][A-Za-z0-9_\- ]*/) || [line])[0];
  const name_CH = line.replace(name_ENG, "").trim();
  return { name_CH, name_ENG };
}

const linesMapKey = [
  {
    key: "traits",
    from: ["特质Traits", "特质", "traits"],
  },
  {
    key: "actions",
    from: ["动作Actions", "动作", "actions"],
  },
  {
    key: "reactions",
    from: ["反应Reactions", "反应", "reactions"],
  },
  {
    key: "bonusActions",
    from: ["附赠动作Bonus Actions", "附赠动作", "bonus actions"],
  },
  {
    key: "legendaryActions",
    from: ["传奇动作Legendary Actions", "传奇动作", "legendary actions"],
  },
];
export function isNewBlockTitle(line: string) {
  for (const item of linesMapKey) {
    if (item.from.find((e) => e.toLowerCase() === line.toLowerCase())) return item.key;
  }
}
