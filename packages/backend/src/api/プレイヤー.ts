/**
 * プレイヤー関連API
 * 
 * 初学者向けメモ：
 * - RESTful APIの設計に基づいて実装
 * - Honoフレームワークを使用してルーティングを定義
 * - Zodを使用してリクエストデータの検証を行う
 * - Drizzle ORMを使用してデータベース操作を行う
 */

import { Hono } from 'hono';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { プレイヤー, モンスター種族, 所持モンスター } from '../db/スキーマ';
// CI環境対応のため、nanoidではなくuuid生成()を使用
// nanoid 5.0.0はNode.js環境でCrypto APIを要求するが、CI環境では利用できない場合がある
// import { nanoid } from 'nanoid'; // 一意IDの生成用
import type { データベース型 } from '../db/型定義';
import { ロガー } from '../utils/ロガー';
import { uuid生成 } from '@monster-game/shared';
// import type { プレイヤー応答, プレイヤー一覧応答, エラー応答 } from '@monster-game/shared'; // 将来の実装で使用

// プレイヤー作成リクエストの検証スキーマ
const プレイヤー作成スキーマ = z.object({
  名前: z.string().min(1, '名前は必須です').max(20, '名前は20文字以内で入力してください'),
});

// プレイヤー取得のパスパラメータ検証スキーマ
const プレイヤーidスキーマ = z.object({
  id: z.string().min(1, 'プレイヤーIDは必須です'),
});

/**
 * プレイヤー関連のルーターを作成
 * 
 * 初学者向けメモ：
 * - データベース型を明示的に指定することで型安全性を確保
 * - この関数内でのデータベース操作はすべて型チェックされる
 * - IDEでオートコンプリートが効くようになる
 * 
 * @param db - 型安全なデータベース接続インスタンス
 * @returns Honoルーターインスタンス
 */
export function プレイヤールーター(db: データベース型) {
  const app = new Hono();

  /**
   * プレイヤー作成API
   * POST /api/players
   * 
   * 初学者向けメモ：
   * - 新しいプレイヤーアカウントを作成
   * - 名前の重複チェックは今回は省略（MVP版）
   * - 作成成功時はプレイヤー情報を返す
   * - 作成後に初期モンスターを1体付与
   */
  app.post('/', zValidator('json', プレイヤー作成スキーマ), async (c) => {
    try {
      const { 名前 } = c.req.valid('json');
      
      // 一意IDを生成（CI環境対応）
      // nanoidはCI環境でCrypto APIエラーを起こすため、環境対応済みのuuid生成()を使用
      const プレイヤーid = uuid生成();
      const 現在時刻 = new Date();
      
      // データベースに新しいプレイヤーを登録
      const 作成結果 = await db
        .insert(プレイヤー)
        .values({
          id: プレイヤーid,
          名前,
          作成日時: 現在時刻,
          更新日時: 現在時刻,
        })
        .returning();
      
      // 初学者向けメモ：配列の分割代入で undefined になる可能性をチェック
      const 新しいプレイヤー = 作成結果[0];
      if (!新しいプレイヤー) {
        throw new Error('プレイヤーの作成に失敗しました');
      }
      
      // 初期モンスターを付与
      const 初期モンスター = await 初期モンスター付与(db, プレイヤーid);
      
      // 成功レスポンス
      return c.json({
        成功: true,
        メッセージ: 'プレイヤーが作成されました',
        データ: {
          id: 新しいプレイヤー.id,
          名前: 新しいプレイヤー.名前,
          作成日時: 新しいプレイヤー.作成日時,
          初期モンスター: 初期モンスター ? {
            id: 初期モンスター.id,
            種族名: 初期モンスター.種族名,
            ニックネーム: 初期モンスター.ニックネーム,
            現在HP: 初期モンスター.現在HP,
            最大HP: 初期モンスター.最大HP,
          } : null,
        },
      }, 201);
      
    } catch (error) {
      ロガー.エラー('プレイヤー作成エラー', error instanceof Error ? error : new Error(String(error)));
      
      return c.json({
        成功: false,
        メッセージ: 'プレイヤーの作成に失敗しました',
        エラー: error instanceof Error ? error.message : '不明なエラー',
      }, 500);
    }
  });

  /**
   * プレイヤー取得API
   * GET /api/players/:id
   * 
   * 初学者向けメモ：
   * - 指定されたIDのプレイヤー情報を取得
   * - 存在しない場合は404エラーを返す
   */
  app.get('/:id', zValidator('param', プレイヤーidスキーマ), async (c) => {
    try {
      const { id } = c.req.valid('param');
      
      // データベースからプレイヤーを検索
      const [プレイヤー情報] = await db
        .select()
        .from(プレイヤー)
        .where(eq(プレイヤー.id, id))
        .limit(1);
      
      // プレイヤーが見つからない場合
      if (!プレイヤー情報) {
        return c.json({
          成功: false,
          メッセージ: '指定されたプレイヤーが見つかりません',
        }, 404);
      }
      
      // 成功レスポンス
      return c.json({
        成功: true,
        データ: {
          id: プレイヤー情報.id,
          名前: プレイヤー情報.名前,
          作成日時: プレイヤー情報.作成日時,
        },
      });
      
    } catch (error) {
      ロガー.エラー('プレイヤー取得エラー', error instanceof Error ? error : new Error(String(error)));
      
      return c.json({
        成功: false,
        メッセージ: 'プレイヤーの取得に失敗しました',
        エラー: error instanceof Error ? error.message : '不明なエラー',
      }, 500);
    }
  });

  /**
   * プレイヤー一覧取得API
   * GET /api/players
   * 
   * 初学者向けメモ：
   * - 全プレイヤーの一覧を取得（開発・テスト用）
   * - 本番環境では認証やページネーションが必要
   */
  app.get('/', async (c) => {
    try {
      // 全プレイヤーを取得（作成日時の降順）
      const プレイヤー一覧 = await db
        .select({
          id: プレイヤー.id,
          名前: プレイヤー.名前,
          作成日時: プレイヤー.作成日時,
        })
        .from(プレイヤー)
        .orderBy(プレイヤー.作成日時);
      
      return c.json({
        成功: true,
        データ: プレイヤー一覧,
        件数: プレイヤー一覧.length,
      });
      
    } catch (error) {
      ロガー.エラー('プレイヤー一覧取得エラー', error instanceof Error ? error : new Error(String(error)));
      
      return c.json({
        成功: false,
        メッセージ: 'プレイヤー一覧の取得に失敗しました',
        エラー: error instanceof Error ? error.message : '不明なエラー',
      }, 500);
    }
  });

  return app;
}

/**
 * 初期モンスター付与関数
 * 
 * 初学者向けメモ：
 * - 新規プレイヤーにスターターモンスターを1体付与
 * - でんきネズミ、ほのおトカゲ、くさモグラの3種類からランダム選択
 * - 選択されたモンスターを所持モンスターテーブルに追加
 * 
 * @param db - データベース接続インスタンス
 * @param プレイヤーid - 対象プレイヤーのID
 * @returns 付与されたモンスターの情報、失敗時はnull
 */
async function 初期モンスター付与(db: データベース型, プレイヤーid: string) {
  try {
    // スターターモンスターの種族名を定義
    const スターター種族名 = ['でんきネズミ', 'ほのおトカゲ', 'くさモグラ'];
    
    // データベースからスターター種族を取得
    const スターター種族一覧 = await db
      .select()
      .from(モンスター種族)
      .where(inArray(モンスター種族.名前, スターター種族名));
    
    if (スターター種族一覧.length === 0) {
      ロガー.警告('スターターモンスターが見つかりません', { スターター種族名 });
      return null;
    }
    
    // ランダムに1体選択
    const ランダムインデックス = Math.floor(Math.random() * スターター種族一覧.length);
    const 選択された種族 = スターター種族一覧[ランダムインデックス];
    
    if (!選択された種族) {
      ロガー.エラー('スターターモンスターの選択に失敗しました', new Error('選択された種族がundefinedです'));
      return null;
    }
    
    // 新しいモンスターを作成
    const 新規モンスター = {
      id: uuid生成(),
      プレイヤーid,
      種族id: 選択された種族.id,
      ニックネーム: 選択された種族.名前, // デフォルトは種族名
      現在hp: 選択された種族.基本hp,
      最大hp: 選択された種族.基本hp,
      取得日時: new Date(),
      更新日時: new Date(),
    };
    
    // データベースに挿入
    await db.insert(所持モンスター).values(新規モンスター);
    
    ロガー.情報('初期モンスター付与成功', {
      プレイヤーID: プレイヤーid,
      モンスターID: 新規モンスター.id,
      種族名: 選択された種族.名前,
    });
    
    // 付与されたモンスターの情報を返す
    return {
      id: 新規モンスター.id,
      種族名: 選択された種族.名前,
      ニックネーム: 新規モンスター.ニックネーム,
      現在HP: 新規モンスター.現在hp,
      最大HP: 新規モンスター.最大hp,
      取得日時: 新規モンスター.取得日時,
    };
    
  } catch (error) {
    ロガー.エラー('初期モンスター付与中のエラー', error instanceof Error ? error : new Error(String(error)), {
      プレイヤーID: プレイヤーid,
    });
    return null;
  }
}

/**
 * 初学者向けメモ：API設計のポイント
 * 
 * 1. HTTPステータスコードの適切な使用
 *    - 201: 作成成功
 *    - 404: リソースが見つからない
 *    - 500: サーバーエラー
 * 
 * 2. 一貫性のあるレスポンス形式
 *    - 成功フラグ、メッセージ、データを統一
 *    - エラー情報も含める
 * 
 * 3. バリデーション
 *    - 入力データの検証は必須
 *    - 適切なエラーメッセージを返す
 * 
 * 4. エラーハンドリング
 *    - try-catch で例外を捕捉
 *    - ログを出力してデバッグしやすくする
 */