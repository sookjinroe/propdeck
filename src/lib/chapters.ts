import type { Chapter } from '../types';

export type TreeNode = Chapter & { children: TreeNode[] };

export function buildTree(chapters: Chapter[]): TreeNode[] {
  const map: Record<string, TreeNode> = {};
  const roots: TreeNode[] = [];
  [...chapters].sort((a, b) => a.order - b.order)
    .forEach(ch => { map[ch.id] = { ...ch, children: [] }; });
  chapters.forEach(ch => {
    if (ch.parentId && map[ch.parentId]) map[ch.parentId].children.push(map[ch.id]);
    else if (map[ch.id]) roots.push(map[ch.id]);
  });
  return roots;
}

export function flattenTree(nodes: TreeNode[], depth = 0): { ch: Chapter; depth: number }[] {
  const result: { ch: Chapter; depth: number }[] = [];
  nodes.forEach(node => {
    result.push({ ch: node, depth });
    if (node.children.length) result.push(...flattenTree(node.children, depth + 1));
  });
  return result;
}

export function getChapterNumber(id: string, chapters: Chapter[]): string {
  function search(nodes: TreeNode[], prefix: string): string | null {
    for (let i = 0; i < nodes.length; i++) {
      const num = prefix ? `${prefix}.${i + 1}` : `${i + 1}`;
      if (nodes[i].id === id) return num;
      const found = search(nodes[i].children, num);
      if (found) return found;
    }
    return null;
  }
  return search(buildTree(chapters), '') || '';
}

export function normalizeOrders(chapters: Chapter[]): Chapter[] {
  const updated = [...chapters];
  function assign(nodes: TreeNode[]) {
    nodes.forEach((node, i) => {
      const ch = updated.find(c => c.id === node.id);
      if (ch) ch.order = i + 1;
      if (node.children.length) assign(node.children);
    });
  }
  assign(buildTree(updated));
  return updated;
}

export function maturityScore(chapters: Chapter[]): number {
  if (!chapters.length) return 0;
  const weights = { done: 1, review: 0.7, wip: 0.3, todo: 0 };
  return Math.round(chapters.reduce((sum, c) => sum + weights[c.status], 0) / chapters.length * 100);
}
