# Repository パターン導入修正計画

## 🎯 目的

Drizzle ORMの単体テスト問題を解決し、テスタビリティとコードの保守性を向上させるため、Repository パターンを導入する。

## 📊 現在の問題分析

### 技術的課題
- **Drizzle ORMモック複雑性**: クエリビルダーパターンのモック設定が困難
- **環境依存性**: Cloudflare D1とbetter-sqlite3の違い
- **型安全性の損失**: モック使用時のTypeScript型チェック機能低下
- **テスト保守性**: Drizzleバージョンアップ時のモック修正負荷

### ビジネス的課題
- **開発効率低下**: 複雑なモック設定による開発時間増加
- **品質リスク**: 不適切なモックによる実装バグの見逃し
- **学習コスト**: 初学者にとってのDrizzle特有テスト手法の習得負荷

## 🏗️ Repository パターン設計

### アーキテクチャ概要

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Layer     │───▶│  Service Layer  │───▶│ Repository Layer│
│  (Hono Routes)  │    │   (Business)    │    │  (Data Access)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   Drizzle ORM   │
                                               │   (Database)    │
                                               └─────────────────┘
```

### レイヤー分離のメリット
1. **関心の分離**: ビジネスロジックとデータアクセスの明確な分離
2. **テスタビリティ**: Repository インターフェースによる簡単なモック
3. **保守性**: データアクセス方法の変更が他レイヤーに影響しない
4. **型安全性**: インターフェース定義による厳密な型チェック

## 📝 実装計画

### Phase 1: Repository インターフェース設計 (2-3時間)

#### 1.1 共通インターフェース定義
```typescript
// packages/shared/src/types/repository.ts
export interface BaseRepository<T, K = string> {
  findById(id: K): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, 'id' | '作成日時' | '更新日時'>): Promise<T>;
  update(id: K, data: Partial<T>): Promise<T>;
  delete(id: K): Promise<void>;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

#### 1.2 ドメイン固有インターフェース
```typescript
// packages/shared/src/types/プレイヤーRepository.ts
export interface プレイヤーRepository extends BaseRepository<プレイヤー型> {
  findByName(name: string): Promise<プレイヤー型[]>;
  getPlayerWithMonsters(playerId: string): Promise<プレイヤー詳細型 | null>;
}

// packages/shared/src/types/モンスターRepository.ts
export interface モンスターRepository extends BaseRepository<所持モンスター型> {
  findByPlayerId(playerId: string, options?: QueryOptions): Promise<所持モンスター型[]>;
  findBySpeciesId(speciesId: string): Promise<所持モンスター型[]>;
  updateNickname(monsterId: string, nickname: string): Promise<所持モンスター型>;
  countByPlayerId(playerId: string): Promise<number>;
}

// packages/shared/src/types/モンスター種族Repository.ts
export interface モンスター種族Repository extends BaseRepository<モンスター種族型> {
  findByNames(names: string[]): Promise<モンスター種族型[]>;
  findStarters(): Promise<モンスター種族型[]>;
}
```

### Phase 2: Repository 実装クラス作成 (4-6時間)

#### 2.1 Drizzle実装クラス
```typescript
// packages/backend/src/repositories/impl/DrizzleプレイヤーRepository.ts
export class DrizzleプレイヤーRepository implements プレイヤーRepository {
  constructor(private db: データベース型) {}

  async findById(id: string): Promise<プレイヤー型 | null> {
    const [player] = await this.db
      .select()
      .from(プレイヤー)
      .where(eq(プレイヤー.id, id))
      .limit(1);
    
    return player || null;
  }

  async findByName(name: string): Promise<プレイヤー型[]> {
    return await this.db
      .select()
      .from(プレイヤー)
      .where(like(プレイヤー.名前, `%${name}%`));
  }

  async create(data: プレイヤー作成データ型): Promise<プレイヤー型> {
    const newPlayer = {
      id: uuid生成(),
      ...data,
      作成日時: new Date(),
      更新日時: new Date(),
    };

    const [created] = await this.db
      .insert(プレイヤー)
      .values(newPlayer)
      .returning();

    if (!created) {
      throw new Error('プレイヤーの作成に失敗しました');
    }

    return created;
  }

  async getPlayerWithMonsters(playerId: string): Promise<プレイヤー詳細型 | null> {
    // JOINクエリでプレイヤーと所持モンスター情報を取得
    const result = await this.db
      .select({
        プレイヤー: プレイヤー,
        モンスター: 所持モンスター,
        種族: モンスター種族,
      })
      .from(プレイヤー)
      .leftJoin(所持モンスター, eq(プレイヤー.id, 所持モンスター.プレイヤーid))
      .leftJoin(モンスター種族, eq(所持モンスター.種族id, モンスター種族.id))
      .where(eq(プレイヤー.id, playerId));

    if (result.length === 0) return null;

    // データ整形
    const playerData = result[0]?.プレイヤー;
    const monsters = result
      .filter(r => r.モンスター)
      .map(r => ({
        ...r.モンスター!,
        種族: r.種族!,
      }));

    return {
      ...playerData!,
      所持モンスター: monsters,
    };
  }

  // 他のメソッド実装...
}
```

#### 2.2 Repository ファクトリー
```typescript
// packages/backend/src/repositories/RepositoryFactory.ts
export interface RepositoryFactory {
  プレイヤーRepository: プレイヤーRepository;
  モンスターRepository: モンスターRepository;
  モンスター種族Repository: モンスター種族Repository;
}

export class DrizzleRepositoryFactory implements RepositoryFactory {
  constructor(private db: データベース型) {}

  get プレイヤーRepository(): プレイヤーRepository {
    return new DrizzleプレイヤーRepository(this.db);
  }

  get モンスターRepository(): モンスターRepository {
    return new DrizzleモンスターRepository(this.db);
  }

  get モンスター種族Repository(): モンスター種族Repository {
    return new Drizzleモンスター種族Repository(this.db);
  }
}
```

### Phase 3: Service Layer 作成 (3-4時間)

#### 3.1 ビジネスロジック抽出
```typescript
// packages/backend/src/services/プレイヤーService.ts
export class プレイヤーService {
  constructor(
    private repositories: RepositoryFactory,
    private logger: Logger
  ) {}

  async プレイヤー作成(データ: プレイヤー作成リクエスト型): Promise<プレイヤー作成レスポンス型> {
    try {
      // 1. プレイヤー作成
      const 新規プレイヤー = await this.repositories.プレイヤーRepository.create({
        名前: データ.名前,
      });

      // 2. 初期モンスター付与
      const 初期モンスター = await this.初期モンスター付与(新規プレイヤー.id);

      this.logger.情報('プレイヤー作成完了', {
        プレイヤーID: 新規プレイヤー.id,
        初期モンスターID: 初期モンスター?.id,
      });

      return {
        プレイヤー: 新規プレイヤー,
        初期モンスター,
      };
    } catch (error) {
      this.logger.エラー('プレイヤー作成失敗', error);
      throw new ApplicationError('プレイヤーの作成に失敗しました', error);
    }
  }

  private async 初期モンスター付与(プレイヤーID: string): Promise<所持モンスター型 | null> {
    const スターター種族一覧 = await this.repositories.モンスター種族Repository
      .findStarters();

    if (スターター種族一覧.length === 0) {
      this.logger.警告('スターター種族が見つかりません');
      return null;
    }

    const ランダム種族 = スターター種族一覧[
      Math.floor(Math.random() * スターター種族一覧.length)
    ];

    return await this.repositories.モンスターRepository.create({
      プレイヤーid: プレイヤーID,
      種族id: ランダム種族!.id,
      ニックネーム: ランダム種族!.名前,
      現在hp: ランダム種族!.基本hp,
      最大hp: ランダム種族!.基本hp,
    });
  }

  async プレイヤー取得(プレイヤーID: string): Promise<プレイヤー型> {
    const プレイヤー = await this.repositories.プレイヤーRepository.findById(プレイヤーID);
    
    if (!プレイヤー) {
      throw new NotFoundError('指定されたプレイヤーが見つかりません');
    }

    return プレイヤー;
  }

  async プレイヤー詳細取得(プレイヤーID: string): Promise<プレイヤー詳細型> {
    const プレイヤー詳細 = await this.repositories.プレイヤーRepository
      .getPlayerWithMonsters(プレイヤーID);
    
    if (!プレイヤー詳細) {
      throw new NotFoundError('指定されたプレイヤーが見つかりません');
    }

    return プレイヤー詳細;
  }
}
```

#### 3.2 エラークラス定義
```typescript
// packages/shared/src/errors/ApplicationErrors.ts
export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
    public readonly code: string = 'APPLICATION_ERROR'
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string, cause?: unknown) {
    super(message, cause, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, cause?: unknown) {
    super(message, cause, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}
```

### Phase 4: API Layer リファクタリング (2-3時間)

#### 4.1 コントローラー実装
```typescript
// packages/backend/src/api/controllers/プレイヤーController.ts
export class プレイヤーController {
  constructor(
    private プレイヤーService: プレイヤーService,
    private logger: Logger
  ) {}

  async プレイヤー作成(c: Context): Promise<Response> {
    try {
      const リクエストデータ = c.req.valid('json');
      const 結果 = await this.プレイヤーService.プレイヤー作成(リクエストデータ);

      return c.json({
        成功: true,
        メッセージ: 'プレイヤーが作成されました',
        データ: {
          id: 結果.プレイヤー.id,
          名前: 結果.プレイヤー.名前,
          作成日時: 結果.プレイヤー.作成日時,
          初期モンスター: 結果.初期モンスター ? {
            id: 結果.初期モンスター.id,
            種族名: 結果.初期モンスター.種族名,
            ニックネーム: 結果.初期モンスター.ニックネーム,
            現在HP: 結果.初期モンスター.現在hp,
            最大HP: 結果.初期モンスター.最大hp,
          } : null,
        },
      }, 201);
    } catch (error) {
      return this.エラーハンドリング(c, error);
    }
  }

  async プレイヤー取得(c: Context): Promise<Response> {
    try {
      const { id } = c.req.valid('param');
      const プレイヤー = await this.プレイヤーService.プレイヤー取得(id);

      return c.json({
        成功: true,
        データ: {
          id: プレイヤー.id,
          名前: プレイヤー.名前,
          作成日時: プレイヤー.作成日時,
        },
      });
    } catch (error) {
      return this.エラーハンドリング(c, error);
    }
  }

  private エラーハンドリング(c: Context, error: unknown): Response {
    if (error instanceof NotFoundError) {
      return c.json({
        成功: false,
        メッセージ: error.message,
        エラー: { コード: error.code },
      }, 404);
    }

    if (error instanceof ValidationError) {
      return c.json({
        成功: false,
        メッセージ: error.message,
        エラー: { コード: error.code },
      }, 400);
    }

    this.logger.エラー('予期しないエラー', error);
    return c.json({
      成功: false,
      メッセージ: 'サーバーエラーが発生しました',
      エラー: { コード: 'INTERNAL_ERROR' },
    }, 500);
  }
}
```

#### 4.2 ルーター設定
```typescript
// packages/backend/src/api/プレイヤー.ts
export function プレイヤールーター(repositoryFactory: RepositoryFactory, logger: Logger) {
  const app = new Hono();
  const プレイヤーService = new プレイヤーService(repositoryFactory, logger);
  const controller = new プレイヤーController(プレイヤーService, logger);

  app.post('/', zValidator('json', プレイヤー作成スキーマ), controller.プレイヤー作成.bind(controller));
  app.get('/:id', zValidator('param', プレイヤーidスキーマ), controller.プレイヤー取得.bind(controller));
  app.get('/', controller.プレイヤー一覧取得.bind(controller));

  return app;
}
```

### Phase 5: Dependency Injection 設定 (2-3時間)

#### 5.1 DI コンテナ設計
```typescript
// packages/backend/src/di/Container.ts
export interface DIContainer {
  get<T>(token: DIToken<T>): T;
  register<T>(token: DIToken<T>, factory: () => T): void;
}

export class SimpleDIContainer implements DIContainer {
  private services = new Map<symbol, () => unknown>();

  register<T>(token: DIToken<T>, factory: () => T): void {
    this.services.set(token.symbol, factory);
  }

  get<T>(token: DIToken<T>): T {
    const factory = this.services.get(token.symbol);
    if (!factory) {
      throw new Error(`Service not registered: ${token.description}`);
    }
    return factory() as T;
  }
}

export class DIToken<T> {
  constructor(
    public readonly description: string,
    public readonly symbol: symbol = Symbol(description)
  ) {}
}

// トークン定義
export const TOKENS = {
  DATABASE: new DIToken<データベース型>('Database'),
  REPOSITORY_FACTORY: new DIToken<RepositoryFactory>('RepositoryFactory'),
  LOGGER: new DIToken<Logger>('Logger'),
  PLAYER_SERVICE: new DIToken<プレイヤーService>('PlayerService'),
  MONSTER_SERVICE: new DIToken<モンスターService>('MonsterService'),
} as const;
```

#### 5.2 DIコンテナ設定
```typescript
// packages/backend/src/di/setup.ts
export function setupDI(database: データベース型): DIContainer {
  const container = new SimpleDIContainer();

  // インフラストラクチャ層
  container.register(TOKENS.DATABASE, () => database);
  container.register(TOKENS.LOGGER, () => new StructuredLogger());

  // Repository層
  container.register(TOKENS.REPOSITORY_FACTORY, () => 
    new DrizzleRepositoryFactory(container.get(TOKENS.DATABASE))
  );

  // Service層
  container.register(TOKENS.PLAYER_SERVICE, () => 
    new プレイヤーService(
      container.get(TOKENS.REPOSITORY_FACTORY),
      container.get(TOKENS.LOGGER)
    )
  );

  container.register(TOKENS.MONSTER_SERVICE, () => 
    new モンスターService(
      container.get(TOKENS.REPOSITORY_FACTORY),
      container.get(TOKENS.LOGGER)
    )
  );

  return container;
}
```

### Phase 6: 新しい単体テスト実装 (4-5時間)

#### 6.1 Repository層テスト（モック使用）
```typescript
// packages/backend/src/__tests__/repositories/プレイヤーRepository.test.ts
describe('プレイヤーRepository単体テスト', () => {
  let repository: プレイヤーRepository;
  let mockDb: MockedFunction<データベース型>;

  beforeEach(() => {
    mockDb = createMockDatabase();
    repository = new DrizzleプレイヤーRepository(mockDb);
  });

  describe('findById', () => {
    it('存在するプレイヤーを正しく取得する', async () => {
      // モック設定が簡単になる
      const expectedPlayer = createTestPlayer();
      mockDb.select.mockResolvedValue([expectedPlayer]);

      const result = await repository.findById('test-id');

      expect(result).toEqual(expectedPlayer);
      expect(mockDb.select).toHaveBeenCalledWith(/* 適切な引数 */);
    });

    it('存在しないプレイヤーの場合nullを返す', async () => {
      mockDb.select.mockResolvedValue([]);

      const result = await repository.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  // その他のメソッドテスト...
});
```

#### 6.2 Service層テスト（Repository モック）
```typescript
// packages/backend/src/__tests__/services/プレイヤーService.test.ts
describe('プレイヤーService単体テスト', () => {
  let service: プレイヤーService;
  let mockRepositoryFactory: jest.Mocked<RepositoryFactory>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockRepositoryFactory = createMockRepositoryFactory();
    mockLogger = createMockLogger();
    service = new プレイヤーService(mockRepositoryFactory, mockLogger);
  });

  describe('プレイヤー作成', () => {
    it('正常にプレイヤーが作成され初期モンスターが付与される', async () => {
      // Repositoryモックは簡単
      const expectedPlayer = createTestPlayer();
      const expectedMonster = createTestMonster();
      
      mockRepositoryFactory.プレイヤーRepository.create
        .mockResolvedValue(expectedPlayer);
      mockRepositoryFactory.モンスター種族Repository.findStarters
        .mockResolvedValue([createTestSpecies()]);
      mockRepositoryFactory.モンスターRepository.create
        .mockResolvedValue(expectedMonster);

      const result = await service.プレイヤー作成({ 名前: 'テストプレイヤー' });

      expect(result.プレイヤー).toEqual(expectedPlayer);
      expect(result.初期モンスター).toEqual(expectedMonster);
      expect(mockLogger.情報).toHaveBeenCalledWith('プレイヤー作成完了', expect.any(Object));
    });

    it('スターター種族が存在しない場合は初期モンスターなしで作成される', async () => {
      const expectedPlayer = createTestPlayer();
      
      mockRepositoryFactory.プレイヤーRepository.create
        .mockResolvedValue(expectedPlayer);
      mockRepositoryFactory.モンスター種族Repository.findStarters
        .mockResolvedValue([]); // 空配列

      const result = await service.プレイヤー作成({ 名前: 'テストプレイヤー' });

      expect(result.プレイヤー).toEqual(expectedPlayer);
      expect(result.初期モンスター).toBeNull();
      expect(mockLogger.警告).toHaveBeenCalledWith('スターター種族が見つかりません');
    });
  });
});
```

#### 6.3 Controller層テスト（Service モック）
```typescript
// packages/backend/src/__tests__/controllers/プレイヤーController.test.ts
describe('プレイヤーController単体テスト', () => {
  let controller: プレイヤーController;
  let mockService: jest.Mocked<プレイヤーService>;
  let mockContext: MockedContext;

  beforeEach(() => {
    mockService = createMockPlayerService();
    controller = new プレイヤーController(mockService, createMockLogger());
    mockContext = createMockHonoContext();
  });

  describe('プレイヤー作成', () => {
    it('正常なリクエストで201レスポンスを返す', async () => {
      const serviceResult = createTestPlayerCreationResult();
      mockService.プレイヤー作成.mockResolvedValue(serviceResult);
      mockContext.req.valid.mockReturnValue({ 名前: 'テストプレイヤー' });

      const response = await controller.プレイヤー作成(mockContext);

      expect(response.status).toBe(201);
      expect(mockContext.json).toHaveBeenCalledWith(
        expect.objectContaining({
          成功: true,
          メッセージ: 'プレイヤーが作成されました',
        }),
        201
      );
    });

    it('ValidationErrorの場合400レスポンスを返す', async () => {
      mockService.プレイヤー作成.mockRejectedValue(
        new ValidationError('名前は必須です')
      );

      const response = await controller.プレイヤー作成(mockContext);

      expect(response.status).toBe(400);
      expect(mockContext.json).toHaveBeenCalledWith(
        expect.objectContaining({
          成功: false,
          エラー: { コード: 'VALIDATION_ERROR' },
        }),
        400
      );
    });
  });
});
```

## 📅 実装スケジュール

### Week 1: Repository パターン基盤構築
- **Day 1-2**: インターフェース設計・共通型定義
- **Day 3-4**: Repository実装クラス作成
- **Day 5**: ファクトリーパターン実装

### Week 2: Service Layer 実装
- **Day 1-3**: ビジネスロジック抽出・Service実装
- **Day 4-5**: エラーハンドリング・ログ機能強化

### Week 3: API Layer リファクタリング
- **Day 1-2**: Controller実装
- **Day 3-4**: DI コンテナ設定
- **Day 5**: 統合・動作確認

### Week 4: テスト実装・品質保証
- **Day 1-2**: Repository層単体テスト
- **Day 3-4**: Service層単体テスト
- **Day 5**: Controller層単体テスト・統合テスト

## 🎯 期待される効果

### 開発効率向上
- **テスト作成時間**: 70%短縮（複雑なORMモック → 簡単なインターフェースモック）
- **デバッグ時間**: 50%短縮（レイヤー分離によるバグ特定の簡易化）
- **新機能開発**: 30%高速化（再利用可能なRepository・Service活用）

### コード品質向上
- **テストカバレッジ**: 90%以上（モック困難による未テスト状態解消）
- **型安全性**: 完全保証（インターフェース定義による厳密チェック）
- **保守性**: 大幅改善（関心の分離による変更影響範囲限定）

### 学習効果向上
- **アーキテクチャ理解**: レイヤードアーキテクチャの実践学習
- **テスト技法習得**: 段階的モックの適用方法習得
- **設計パターン**: Repository・DI・Factory パターンの実践

## ⚠️ リスク管理

### 技術的リスク
- **複雑性増加**: 抽象化レイヤー追加による理解困難度上昇
  - **軽減策**: 十分なドキュメント・サンプルコード提供
- **パフォーマンス影響**: 間接呼び出しによる軽微な性能劣化
  - **軽減策**: パフォーマンステスト実施・ボトルネック特定

### 実装リスク
- **移行期間の混在**: 新旧実装の混在による一時的複雑化
  - **軽減策**: 段階的移行・明確な移行計画
- **学習コスト**: Repository パターン習得の初期負荷
  - **軽減策**: ハンズオン形式の学習プログラム

## 🚀 次のアクション

1. **Phase 1開始**: Repository インターフェース設計着手
2. **プロトタイプ作成**: プレイヤー関連機能での先行実装
3. **効果測定**: テスト作成時間・開発効率の定量評価
4. **チーム共有**: 設計思想・実装方針の共有セッション開催

この計画により、Drizzle ORMテスト問題を根本解決し、より保守性・テスタビリティの高いアーキテクチャへと発展させます。