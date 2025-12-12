import iconv from "iconv-lite";
import { GITHUB_TOKEN } from "api/github-token";
import { WcpNode } from "parser/wcp-to-json";

export async function fetchWcpNodeFileFromGithub(node: WcpNode) {
  const validUrl = node.url.replaceAll("\\", "/");
  const html = await fetchFromGitHub(validUrl);
  return html;
}

export async function fetchFromGitHub(path: string, ref = "main") {
  // 好像不用 encodeURIComponent 也行
  const url = `https://api.github.com/repos/DND5eChm/DND5e_chm/contents/${encodeURIComponent(path)}?ref=${ref}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "node-script",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
  });
  console.log(res.status, "剩余配额：", res.headers.get("x-ratelimit-remaining"));

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText} (${url})`);
  }

  const json = await res.json();
  const buffer = Buffer.from(json.content, "base64");

  const resultUtf8 = buffer.toString("utf-8");

  if (!resultUtf8.includes("�")) {
    // 此路可行，即这些文件并不是如 HTML meta 中写的那样是 gb18030
    return resultUtf8;
  } else {
    console.log(path + "may not utf-8, trying gb18030...");
    // 一个兼容方式，暂时还没遇到要走这条路的情况
    return iconv.decode(buffer, "gb18030");
  }
}

async function fetchHtmlWithBlob(owner: string, repo: string, sha: string) {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "node",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
  });

  const json = await res.json();

  // blob 内容通常是 base64
  return Buffer.from(json.content, "base64");
}
