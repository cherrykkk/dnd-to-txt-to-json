import { GITHUB_TOKEN } from "api/github-token";

/**
 *   {
 *     name: '恶灵.htm',
 *     path: '怪物图鉴2025/亡灵/恶灵.htm',
 *     sha: '22a909f265db6adae9afd3f3a69b668fa10012ad',
 *     size: 3719,
 *     url: 'https://api.github.com/repos/DND5eChm/DND5e_chm/contents/%E6%80%AA%E7%89%A9%E5%9B%BE%E9%89%B42025/%E4%BA%A1%E7%81%B5/%E6%81%B6%E7%81%B5.htm?ref=main',
 *     html_url: 'https://github.com/DND5eChm/DND5e_chm/blob/main/%E6%80%AA%E7%89%A9%E5%9B%BE%E9%89%B42025/%E4%BA%A1%E7%81%B5/%E6%81%B6%E7%81%B5.htm',
 *     git_url: 'https://api.github.com/repos/DND5eChm/DND5e_chm/git/blobs/22a909f265db6adae9afd3f3a69b668fa10012ad',
 *     download_url: 'https://raw.githubusercontent.com/DND5eChm/DND5e_chm/main/怪物图鉴2025/亡灵/恶灵.htm',
 *     type: 'file',
 *     _links: {
 *       self: 'https://api.github.com/repos/DND5eChm/DND5e_chm/contents/%E6%80%AA%E7%89%A9%E5%9B%BE%E9%89%B42025/%E4%BA%A1%E7%81%B5/%E6%81%B6%E7%81%B5.htm?ref=main',
 *       git: 'https://api.github.com/repos/DND5eChm/DND5e_chm/git/blobs/22a909f265db6adae9afd3f3a69b668fa10012ad',
 *       html: 'https://github.com/DND5eChm/DND5e_chm/blob/main/%E6%80%AA%E7%89%A9%E5%9B%BE%E9%89%B42025/%E4%BA%A1%E7%81%B5/%E6%81%B6%E7%81%B5.htm'
 *     }
 *   },
 */
interface GitFileDescription {
  name: string;
  path: string;
  type: string; // file or dir
}

export async function fetchGitFiles(owner: string, repo: string, dir: string) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(dir)}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "node",
      ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub API Error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data as GitFileDescription[]; // 数组：包含文件和子目录
}

export async function recurFetchGitFiles(owner: string, repo: string, dir: string) {
  console.log("fetching", dir);
  const filePathList: string[] = [];

  const files = await fetchGitFiles(owner, repo, dir);
  for (let f of files) {
    if (f.type === "dir") {
      const subFiles = await recurFetchGitFiles(owner, repo, f.path);
      filePathList.push(...subFiles);
    } else {
      filePathList.push(f.path);
    }
  }
  return filePathList;
}
