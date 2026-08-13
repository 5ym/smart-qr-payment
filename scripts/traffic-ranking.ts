/**
 * GitHub Insights (Traffic) の閲覧数ランキングを生成するスクリプト。
 *
 * 指定したオーナー（既定: 5ym, danything）の全リポジトリについて
 * Traffic API から直近14日間のページビューを取得し、閲覧数の多い順に
 * Markdown テーブルで出力する。
 *
 * Traffic API はリポジトリへの push 権限を持つトークンでのみ利用できるため、
 * `repo` スコープ付きの Personal Access Token が必要:
 *
 *   GITHUB_TOKEN=ghp_xxx bun run scripts/traffic-ranking.ts [owner...]
 */

const API = "https://api.github.com";
const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
if (!token) {
	console.error("GITHUB_TOKEN（repo スコープ付き PAT）を設定してください。");
	process.exit(1);
}

const owners = process.argv.length > 2 ? process.argv.slice(2) : ["5ym", "danything"];

const headers = {
	Authorization: `Bearer ${token}`,
	Accept: "application/vnd.github+json",
	"X-GitHub-Api-Version": "2022-11-28",
};

async function api<T>(path: string): Promise<T> {
	const res = await fetch(`${API}${path}`, { headers });
	if (!res.ok) throw new Error(`${res.status} ${path}: ${await res.text()}`);
	return res.json() as Promise<T>;
}

interface Repo {
	full_name: string;
	fork: boolean;
	archived: boolean;
}

interface Views {
	count: number;
	uniques: number;
}

async function listRepos(owner: string): Promise<Repo[]> {
	const repos: Repo[] = [];
	for (let page = 1; ; page++) {
		const batch = await api<Repo[]>(`/users/${owner}/repos?per_page=100&type=owner&page=${page}`);
		repos.push(...batch);
		if (batch.length < 100) break;
	}
	return repos;
}

interface Row {
	repo: string;
	views: number;
	uniques: number;
	error?: string;
}

const rows: Row[] = [];
for (const owner of owners) {
	for (const { full_name } of await listRepos(owner)) {
		try {
			const v = await api<Views>(`/repos/${full_name}/traffic/views`);
			rows.push({ repo: full_name, views: v.count, uniques: v.uniques });
		} catch (e) {
			rows.push({ repo: full_name, views: -1, uniques: -1, error: String(e) });
		}
	}
}

const failed = rows.filter((r) => r.error);
const ranked = rows.filter((r) => !r.error).sort((a, b) => b.views - a.views || b.uniques - a.uniques);

console.log(`# 閲覧数ランキング（直近14日 / ${owners.join(", ")}）\n`);
console.log("| 順位 | リポジトリ | 閲覧数 | ユニーク訪問者 |");
console.log("| ---: | --- | ---: | ---: |");
ranked.forEach((r, i) => {
	console.log(`| ${i + 1} | [${r.repo}](https://github.com/${r.repo}) | ${r.views} | ${r.uniques} |`);
});

if (failed.length > 0) {
	console.log(`\n取得できなかったリポジトリ（権限不足など）: ${failed.length} 件`);
	for (const r of failed) console.log(`- ${r.repo}: ${r.error}`);
}
