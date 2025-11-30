const levelMap: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};
const classes = ["牧师", "德鲁伊", "法师", "游侠", "术士", "魔契师", "吟游诗人", "圣武士"];
const classSpellListMap: Record<string, string[]> = {};

export function spellTxtToJson(txt: string) {
  const e = txt;
  try {
    const lines = e.split("\n");
    const fetchNextLine = () => lines.shift() ?? "";

    const firstLine = fetchNextLine();
    const firstLineSplit = firstLine.split(/｜/);
    const name = firstLineSplit.shift();
    const rawName = firstLineSplit.join(" ");

    const secondLine = fetchNextLine();
    classes.forEach((e) => {
      if (secondLine.includes(e)) {
        classSpellListMap[e] = classSpellListMap[e] || [];
        classSpellListMap[e].push(rawName);
      }
    });

    // 塑能 戏法 or 二环 防护
    const [a = "", b] = secondLine.split(/ |（/);
    let school, level;
    if (b === "戏法") {
      level = 0;
      school = a;
    } else {
      school = b;
      const levelChZn = a[0];
      if (levelChZn && levelChZn in levelMap) {
        level = levelMap[levelChZn];
      }
    }

    const [castingTimeName, castingTime] = fetchNextLine().split("：");
    if (castingTimeName !== "施法时间") {
      throw new Error('the second line should be "施法时间："');
    }
    const range = fetchNextLine().split("：")[1];
    const components = fetchNextLine().split("：")[1];
    const duration = fetchNextLine().split("：")[1];
    return {
      name,
      rawName,
      school,
      level,
      castingTime,
      range,
      components,
      duration,
      description: lines.join("\n"),
      material: "",
      ritual: false,
    };
  } catch (error) {
    console.log(e, error);
    throw new Error(e);
  }
}
