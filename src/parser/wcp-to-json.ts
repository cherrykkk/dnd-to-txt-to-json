import { parse } from "ini";

export interface WcpNode {
  title: string;
  url: string;
  level: number;
  children: WcpNode[];
}

export function wcpJsonFind(wcpJsonArr: WcpNode[], path: string) {
  const pathSplit = path.split("/");
  let output: WcpNode | null = null;
  console.log(pathSplit);
  while (pathSplit.length > 0) {
    const curTitle = pathSplit.shift();
    if (!output) {
      output = wcpJsonArr.find((e) => e.title === curTitle) ?? null;
    } else {
      output = output.children.find((e) => e.title === curTitle) ?? null;
    }
  }
  return output;
}

export function wcpToJson(text: string) {
  // 2. 解析 INI
  const config = parse(text);

  // 3. 取出 [TOPICS] 部分
  const topics = config["TOPICS"];

  // TitleList=7583
  const total = Number(topics.TitleList) || 0;

  // 4. 根据 Level 构建树
  function buildToc(topicsSection: any) {
    const count = Number(topicsSection.TitleList) || 0;

    const roots = [];
    const stack: any = []; // stack[level] = 当前层级最后一个节点

    for (let i = 0; i < count; i++) {
      const title = topicsSection[`TitleList.Title.${i}`];
      const level = Number(topicsSection[`TitleList.Level.${i}`]);
      const url = topicsSection[`TitleList.Url.${i}`];

      if (title == null) continue; // 有些 index 可能是空的

      const node: WcpNode = {
        title,
        url,
        level,
        children: [],
      };

      if (level === 0) {
        // 根节点
        roots.push(node);
      } else {
        // 非根节点，父节点就是最近的 level-1
        const parent = stack[level - 1];
        if (parent) {
          parent.children.push(node);
        } else {
          // 数据异常时兜底：没有找到父节点时也当根丢进去
          roots.push(node);
        }
      }

      // 更新当前层级“栈顶”节点
      stack[level] = node;
      // 把比当前层级更深的栈内容截掉
      stack.length = level + 1;
    }

    return roots;
  }

  const tocTree = buildToc(topics);
  return tocTree;
  // console.log(JSON.stringify(tocTree, null, 2));
}
