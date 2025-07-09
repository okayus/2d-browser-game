/**
 * ユーティリティ関数
 * 
 * 初学者向けメモ:
 * - clsx: 条件付きクラス名の結合
 * - tailwind-merge: Tailwind CSSクラスの重複解決
 * - cn関数: shadcn/uiで標準的に使用されるクラス名結合関数
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * クラス名を結合し、Tailwindの重複を解決する関数
 * 
 * @param inputs - 結合するクラス名（文字列、配列、オブジェクト）
 * @returns 結合・最適化されたクラス名文字列
 * 
 * 使用例:
 * cn("bg-red-500", "bg-blue-500") // => "bg-blue-500" (後者が優先)
 * cn("px-4", condition && "py-2") // => 条件に応じてクラス追加
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}