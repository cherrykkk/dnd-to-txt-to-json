import fs from "fs";
import iconv from "iconv-lite";

export function readGB2312Html(filePath: string) {
  const buf = fs.readFileSync(filePath);

  // 按 gb2312 解码
  let text = iconv.decode(buf, "gb2312");

  // 改 meta 以便后续保存或提供给浏览器
  // text = text.replace(/charset\s*=\s*gb2312/i, "charset=utf-8");

  return text;
}
