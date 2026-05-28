import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Chapter } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TreeNode extends Chapter {
  children: TreeNode[];
  depth: number;
}

export function buildTree(chapters: Chapter[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  chapters.forEach(c => map.set(c.id, { ...c, children: [], depth: 0 }));
  const roots: TreeNode[] = [];
  const sorted = [...chapters].sort((a, b) => a.order - b.order);
  sorted.forEach(c => {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export function flattenTree(nodes: TreeNode[], depth = 0): { ch: TreeNode; depth: number }[] {
  const result: { ch: TreeNode; depth: number }[] = [];
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
  const result = [...chapters];
  function assign(nodes: TreeNode[]) {
    nodes.forEach((node, i) => {
      const ch = result.find(c => c.id === node.id);
      if (ch) ch.order = i + 1;
      if (node.children.length) assign(node.children);
    });
  }
  assign(buildTree(result));
  return result;
}

export const STATUS_LABEL: Record<string, string> = {
  todo: '시작 전', wip: '작성중', review: '검토중', done: '완료',
};
export const STATUS_COLOR: Record<string, string> = {
  todo: 'text-stone-400', wip: 'text-sky-600', review: 'text-amber-600', done: 'text-emerald-600',
};
export const ACCENT_COLORS: Record<string, { bg: string; text: string }> = {
  accent:  { bg: 'bg-orange-50',  text: 'text-orange-600' },
  green:   { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  blue:    { bg: 'bg-sky-50',     text: 'text-sky-700' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-700' },
  purple:  { bg: 'bg-violet-50',  text: 'text-violet-700' },
};
