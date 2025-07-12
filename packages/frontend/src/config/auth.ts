/**
 * 認証設定ファイル
 * 
 * 初学者向けメモ：
 * - 環境変数による認証方式の切り替え設定
 * - 開発・ステージング・本番環境での柔軟な認証方式選択
 * - 設定の一元管理により、認証関連の変更を簡素化
 * - A/Bテストでの認証方式比較も可能
 */

/**
 * 認証方式の種類
 */
export type AuthType = 'local' | 'firebase' | 'auth0' | 'cognito'

/**
 * 認証設定の型定義
 */
export interface AuthConfig {
  /** 認証方式 */
  type: AuthType
  /** 認証プロバイダーの設定 */
  provider: {
    /** Firebase設定 */
    firebase?: {
      apiKey: string
      authDomain: string
      projectId: string
      storageBucket: string
      messagingSenderId: string
      appId: string
    }
    /** Auth0設定 */
    auth0?: {
      domain: string
      clientId: string
      audience: string
    }
    /** AWS Cognito設定 */
    cognito?: {
      region: string
      userPoolId: string
      clientId: string
    }
  }
  /** セッションの設定 */
  session: {
    /** セッション有効期限（秒） */
    expiresIn: number
    /** 自動更新の有効/無効 */
    autoRefresh: boolean
    /** リフレッシュ間隔（秒） */
    refreshInterval: number
  }
}

/**
 * デフォルト認証設定
 */
const defaultAuthConfig: AuthConfig = {
  type: 'local',
  provider: {},
  session: {
    expiresIn: 24 * 60 * 60, // 24時間
    autoRefresh: false,
    refreshInterval: 15 * 60, // 15分
  }
}

/**
 * 環境変数から認証設定を構築
 * 
 * 初学者向けメモ：
 * - import.meta.envでViteの環境変数にアクセス
 * - VITE_プレフィックスが必要（Viteの仕様）
 * - 本番環境では.env.productionファイルから読み込み
 * - 開発環境では.env.localファイルから読み込み
 */
function buildAuthConfig(): AuthConfig {
  const authType = (import.meta.env.VITE_AUTH_TYPE || 'local') as AuthType
  
  const config: AuthConfig = {
    ...defaultAuthConfig,
    type: authType,
  }

  // 認証方式に応じた設定の追加
  switch (authType) {
    case 'firebase':
      config.provider.firebase = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
      }
      config.session.autoRefresh = true
      config.session.refreshInterval = 30 * 60 // 30分
      break

    case 'auth0':
      config.provider.auth0 = {
        domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
        clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
        audience: import.meta.env.VITE_AUTH0_AUDIENCE || '',
      }
      config.session.autoRefresh = true
      config.session.refreshInterval = 15 * 60 // 15分
      break

    case 'cognito':
      config.provider.cognito = {
        region: import.meta.env.VITE_COGNITO_REGION || '',
        userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
        clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
      }
      config.session.autoRefresh = true
      config.session.refreshInterval = 20 * 60 // 20分
      break

    case 'local':
    default:
      // ローカル認証では特別な設定は不要
      break
  }

  return config
}

/**
 * グローバル認証設定
 * アプリケーション全体で使用する設定インスタンス
 */
export const authConfig = buildAuthConfig()

/**
 * 設定の検証
 * 必要な環境変数が設定されているかチェック
 */
export function validateAuthConfig(config: AuthConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  switch (config.type) {
    case 'firebase':
      if (!config.provider.firebase?.apiKey) {
        errors.push('VITE_FIREBASE_API_KEY is required for Firebase authentication')
      }
      if (!config.provider.firebase?.authDomain) {
        errors.push('VITE_FIREBASE_AUTH_DOMAIN is required for Firebase authentication')
      }
      if (!config.provider.firebase?.projectId) {
        errors.push('VITE_FIREBASE_PROJECT_ID is required for Firebase authentication')
      }
      break

    case 'auth0':
      if (!config.provider.auth0?.domain) {
        errors.push('VITE_AUTH0_DOMAIN is required for Auth0 authentication')
      }
      if (!config.provider.auth0?.clientId) {
        errors.push('VITE_AUTH0_CLIENT_ID is required for Auth0 authentication')
      }
      break

    case 'cognito':
      if (!config.provider.cognito?.userPoolId) {
        errors.push('VITE_COGNITO_USER_POOL_ID is required for Cognito authentication')
      }
      if (!config.provider.cognito?.clientId) {
        errors.push('VITE_COGNITO_CLIENT_ID is required for Cognito authentication')
      }
      break

    case 'local':
      // ローカル認証では特別な検証は不要
      break
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 開発時の設定ヘルパー
 * コンソールに現在の認証設定を表示
 */
export function logAuthConfig() {
  if (import.meta.env.MODE === 'development') {
    console.group('🔐 Authentication Configuration')
    console.log('Type:', authConfig.type)
    console.log('Session expires in:', authConfig.session.expiresIn, 'seconds')
    console.log('Auto refresh:', authConfig.session.autoRefresh)
    
    if (authConfig.type !== 'local') {
      console.log('Provider config:', authConfig.provider)
    }
    
    const validation = validateAuthConfig(authConfig)
    if (!validation.isValid) {
      console.warn('⚠️ Configuration errors:', validation.errors)
    } else {
      console.log('✅ Configuration is valid')
    }
    console.groupEnd()
  }
}

/**
 * 初学者向けメモ：認証設定管理の利点
 * 
 * 1. **環境別設定**
 *    ```bash
 *    # 開発環境 (.env.local)
 *    VITE_AUTH_TYPE=local
 *    
 *    # ステージング環境 (.env.staging)
 *    VITE_AUTH_TYPE=firebase
 *    VITE_FIREBASE_API_KEY=your-api-key
 *    
 *    # 本番環境 (.env.production)
 *    VITE_AUTH_TYPE=firebase
 *    VITE_FIREBASE_API_KEY=production-api-key
 *    ```
 * 
 * 2. **段階的導入**
 *    - Phase 1: local認証で開発
 *    - Phase 2: firebase認証でテスト
 *    - Phase 3: 本番環境でfirebase認証
 * 
 * 3. **A/Bテスト**
 *    - ユーザーグループAは従来の認証
 *    - ユーザーグループBは新しい認証
 *    - 環境変数での切り替え
 * 
 * 4. **トラブルシューティング**
 *    - 認証エラー時の設定確認
 *    - 環境変数の漏れ検出
 *    - デバッグ情報の自動表示
 * 
 * 5. **セキュリティ**
 *    - 本番環境の設定情報保護
 *    - 開発環境での設定簡素化
 *    - 設定漏れによる脆弱性防止
 */