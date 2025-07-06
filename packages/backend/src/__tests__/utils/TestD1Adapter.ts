/**
 * テスト用D1互換アダプター
 * 
 * 初学者向けメモ：
 * - better-sqlite3をD1 APIと互換性のある形式に変換
 * - 統合テストでD1とbetter-sqlite3の差異を吸収
 * - Cloudflare D1のメソッドをbetter-sqlite3で模倣
 */

import type Database from 'better-sqlite3';

/**
 * D1PreparedStatementを模倣するクラス
 * 
 * 初学者向けメモ：
 * - D1Database.PreparedStatementのすべてのメソッドを実装
 * - rawメソッドはDrizzle ORMが使用する重要なメソッド
 */
export class TestD1PreparedStatement {
  constructor(
    private stmt: Database.Statement,
    private database: Database.Database
  ) {}

  /**
   * D1特有のget()メソッド - Drizzle ORMがよく使用する
   * 
   * 初学者向けメモ：
   * - Drizzle ORMはfirst()ではなくget()を直接呼ぶ場合がある
   * - D1PreparedStatementインターフェースには複数のメソッドが必要
   */
  get<T = unknown>(): T | null {
    try {
      const result = this.stmt.get();
      console.log('TestD1PreparedStatement.get() - 取得結果:', result);
      return result ? (result as T) : null;
    } catch (error) {
      console.error('D1 get() エラー:', error);
      return null;
    }
  }

  bind(...values: unknown[]): TestD1PreparedStatement {
    // better-sqlite3のbindメソッドを呼び出し
    console.log('TestD1PreparedStatement.bind() - 値:', values);
    return new TestD1PreparedStatement(this.stmt.bind(...values), this.database);
  }

  first<T = unknown>(): T | null {
    try {
      const result = this.stmt.get();
      // デバッグ用ログ
      console.log('TestD1PreparedStatement.first() - 取得結果:', result);
      return result ? (result as T) : null;
    } catch (error) {
      console.error('D1 first() エラー:', error);
      return null;
    }
  }

  all<T = unknown[]>(): T[] {
    try {
      const results = this.stmt.all();
      console.log('TestD1PreparedStatement.all() - 結果:', results);
      return results as T[];
    } catch (error) {
      console.error('D1 all() エラー:', error);
      return [] as T[];
    }
  }

  run(): { success: boolean; meta: { changes: number; last_row_id: number } } {
    try {
      const result = this.stmt.run();
      return {
        success: true,
        meta: {
          changes: result.changes,
          last_row_id: Number(result.lastInsertRowid),
        },
      };
    } catch (error) {
      console.error('D1 run() エラー:', error);
      return {
        success: false,
        meta: { changes: 0, last_row_id: 0 },
      };
    }
  }

  /**
   * rawメソッド - Drizzle ORMが使用する重要なメソッド
   * 
   * 初学者向けメモ：
   * - D1では生のSQLの結果を配列で返す
   * - better-sqlite3では.all()で結果を取得
   * - このメソッドがないとDrizzle ORMでエラーが発生
   */
  raw<T = unknown[]>(): T[] {
    try {
      const results = this.stmt.all();
      // D1のraw形式に合わせて変換
      return results as T[];
    } catch (error) {
      console.error('D1 raw() エラー:', error);
      return [] as T[];
    }
  }
}

/**
 * D1Databaseを模倣するクラス
 */
export class TestD1Database {
  constructor(private database: Database.Database) {}

  prepare(sql: string): TestD1PreparedStatement {
    try {
      const stmt = this.database.prepare(sql);
      console.log('TestD1Database.prepare() - SQL:', sql);
      return new TestD1PreparedStatement(stmt, this.database);
    } catch (error) {
      console.error('D1 prepare() エラー:', error);
      throw error;
    }
  }

  dump(): Promise<ArrayBuffer> {
    throw new Error('dump() はテスト環境では実装されていません');
  }

  batch(statements: TestD1PreparedStatement[]): Promise<unknown[]> {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.database.transaction(() => {
          return statements.map(stmt => stmt.run());
        });
        const results = transaction();
        resolve(results);
      } catch (error) {
        reject(error);
      }
    });
  }

  exec(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.database.exec(sql);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}

/**
 * テスト環境用のD1互換データベースファクトリー
 */
export function createTestD1Database(database: Database.Database): TestD1Database {
  return new TestD1Database(database);
}