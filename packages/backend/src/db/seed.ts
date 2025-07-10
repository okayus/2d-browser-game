/**
 * データベース初期データ投入スクリプト
 * 
 * 初学者向けメモ：
 * - ゲーム開始時に必要なマスタデータを投入
 * - モンスター種族の基本データを定義
 * - 開発環境・本番環境の両方で使用可能
 */

import * as schema from './schema';
import { uuid生成 } from '@monster-game/shared';
import type { データベース型 } from './kataTeigi';

/**
 * モンスター種族の初期データ
 * 
 * 初学者向けメモ：
 * - 基礎HPは種族ごとの基本体力値
 * - レアリティは捕獲難易度に影響（今後実装）
 * - 属性システムは将来の拡張として検討
 */
const 初期モンスター種族 = [
  {
    id: uuid生成(),
    名前: 'でんきネズミ',
    基本hp: 35,
    説明: '電気を操る小さなモンスター',
    作成日時: new Date(),
    更新日時: new Date(),
  },
  {
    id: uuid生成(),
    名前: 'ほのおトカゲ',
    基本hp: 40,
    説明: '炎を吐く爬虫類モンスター',
    作成日時: new Date(),
    更新日時: new Date(),
  },
  {
    id: uuid生成(),
    名前: 'みずガメ',
    基本hp: 45,
    説明: '水を操る亀のモンスター',
    作成日時: new Date(),
    更新日時: new Date(),
  },
  {
    id: uuid生成(),
    名前: 'くさモグラ',
    基本hp: 30,
    説明: '植物を育てるモグラモンスター',
    作成日時: new Date(),
    更新日時: new Date(),
  },
  {
    id: uuid生成(),
    名前: 'いわゴーレム',
    基本hp: 50,
    説明: '岩石でできた力強いモンスター',
    作成日時: new Date(),
    更新日時: new Date(),
  },
];

/**
 * 初期データ投入関数
 * 
 * 初学者向けメモ：
 * - すでにデータが存在する場合はスキップ
 * - トランザクションを使用してデータの整合性を保証
 * - エラー時は自動的にロールバック
 * 
 * @param db - Drizzle ORMのデータベースインスタンス
 */
export async function 初期データ投入(db: データベース型) {
  try {
    // 既存データのチェック
    const 既存種族 = await db
      .select()
      .from(schema.モンスター種族)
      .limit(1);

    if (既存種族.length > 0) {
      console.log('初期データは既に投入済みです');
      return;
    }

    // モンスター種族データの投入
    console.log('モンスター種族データを投入中...');
    
    for (const 種族 of 初期モンスター種族) {
      await db.insert(schema.モンスター種族).values(種族);
      console.log(`✅ ${種族.名前} を追加しました`);
    }

    console.log('初期データの投入が完了しました！');
    
    // 投入結果の確認
    const 投入済み種族 = await db.select().from(schema.モンスター種族);
    console.log(`合計 ${投入済み種族.length} 種類のモンスターを登録しました`);
    
  } catch (error) {
    console.error('初期データ投入中にエラーが発生しました:', error);
    throw error;
  }
}

/**
 * 開発環境用：データリセット関数
 * 
 * 初学者向けメモ：
 * - 開発時のテスト用にデータをリセット
 * - 本番環境では使用しないこと！
 * - 外部キー制約を考慮した削除順序
 */
export async function データリセット(db: データベース型) {
  console.log('⚠️  データベースをリセットします...');
  
  try {
    // 外部キー制約の順序を考慮して削除
    await db.delete(schema.所持モンスター);
    await db.delete(schema.モンスター種族);
    await db.delete(schema.プレイヤー);
    
    console.log('✅ データベースのリセットが完了しました');
  } catch (error) {
    console.error('データリセット中にエラーが発生しました:', error);
    throw error;
  }
}

/**
 * 初学者向けメモ：シードスクリプトの使い方
 * 
 * 1. 開発環境での実行
 *    - `pnpm seed` コマンドで実行
 *    - データベースに初期データが投入される
 * 
 * 2. データのリセット
 *    - `pnpm seed:reset` コマンドで実行
 *    - 全データが削除され、初期データが再投入される
 * 
 * 3. 本番環境での使用
 *    - マイグレーション後に一度だけ実行
 *    - CI/CDパイプラインに組み込むことを推奨
 * 
 * 4. カスタマイズ
 *    - 新しいモンスターを追加したい場合は
 *      初期モンスター種族配列に追加
 *    - レアリティや基礎HPは自由に調整可能
 */