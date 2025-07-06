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
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { プレイヤー } from '../db/スキーマ';
import { nanoid } from 'nanoid'; // 一意IDの生成用

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
 * @param db - データベース接続インスタンス
 * @returns Honoルーターインスタンス
 */
export function プレイヤールーター(db: any) {
  const app = new Hono();

  /**
   * プレイヤー作成API
   * POST /api/players
   * 
   * 初学者向けメモ：
   * - 新しいプレイヤーアカウントを作成
   * - 名前の重複チェックは今回は省略（MVP版）
   * - 作成成功時はプレイヤー情報を返す
   */
  app.post('/', zValidator('json', プレイヤー作成スキーマ), async (c) => {
    try {
      const { 名前 } = c.req.valid('json');
      
      // 一意IDを生成
      const プレイヤーid = nanoid();
      const 現在時刻 = new Date();
      
      // データベースに新しいプレイヤーを登録
      const [新しいプレイヤー] = await db
        .insert(プレイヤー)
        .values({
          id: プレイヤーid,
          名前,
          作成日時: 現在時刻,
          更新日時: 現在時刻,
        })
        .returning();
      
      // 成功レスポンス
      return c.json({
        成功: true,
        メッセージ: 'プレイヤーが作成されました',
        データ: {
          id: 新しいプレイヤー.id,
          名前: 新しいプレイヤー.名前,
          作成日時: 新しいプレイヤー.作成日時,
        },
      }, 201);
      
    } catch (error) {
      console.error('プレイヤー作成エラー:', error);
      
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
      console.error('プレイヤー取得エラー:', error);
      
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
      console.error('プレイヤー一覧取得エラー:', error);
      
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