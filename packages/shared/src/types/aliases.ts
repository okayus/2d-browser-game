/**
 * 英語エイリアス定義
 * 初学者向け: 日本語の型定義を英語でも使えるようにする
 */

import type { プレイヤー, プレイヤー作成データ, プレイヤー作成レスポンス } from './player.js';
import type { モンスター種族, 所持モンスター } from './monster.js';

// プレイヤー関連
export type Player = プレイヤー;
export type PlayerCreateData = プレイヤー作成データ;
export type PlayerCreateResponse = プレイヤー作成レスポンス;

// モンスター関連
export type MonsterSpecies = モンスター種族;
export type OwnedMonster = 所持モンスター;
export type Monster = 所持モンスター; // Monsterは所持モンスターとして使用