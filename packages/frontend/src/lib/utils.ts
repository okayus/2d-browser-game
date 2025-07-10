import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 初学者向けメモ：
// cn関数は、複数のクラス名を結合して、重複を解決する便利な関数
// Tailwind CSSのクラスを動的に組み合わせる際に使用する
// 
// 例：
// cn('px-4 py-2', 'px-6') => 'py-2 px-6' (px-4がpx-6で上書きされる)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}