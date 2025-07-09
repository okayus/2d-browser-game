/**
 * 共通JavaScript機能
 * 
 * 初学者向けメモ：
 * - 全画面で共通して使用する機能
 * - LocalStorageによるデータ永続化
 * - バリデーション、ユーティリティ関数
 * - 画面遷移の管理
 */

// ========== 定数定義 ==========

const STORAGE_KEYS = {
  PLAYER_NAME: 'player_name',
  SELECTED_MONSTER: 'selected_monster',
  PLAYER_POSITION: 'player_position',
  GAME_STATE: 'game_state'
};

const MONSTER_TYPES = [
  {
    id: 'electric_mouse',
    name: 'でんきネズミ',
    description: '電気を操る小さなモンスター',
    icon: '⚡',
    baseHp: 35,
    rarity: 'common'
  },
  {
    id: 'fire_lizard',
    name: 'ほのおトカゲ',
    description: '炎を吐くトカゲのモンスター',
    icon: '🔥',
    baseHp: 40,
    rarity: 'common'
  },
  {
    id: 'water_turtle',
    name: 'みずガメ',
    description: '水を操る亀のモンスター',
    icon: '💧',
    baseHp: 45,
    rarity: 'rare'
  }
];

const MAP_CONFIG = {
  width: 10,
  height: 8,
  startPosition: { x: 5, y: 4 }
};

// ========== ユーティリティ関数 ==========

/**
 * LocalStorageからデータを取得
 * @param {string} key - ストレージキー
 * @param {*} defaultValue - デフォルト値
 * @returns {*} 取得したデータ
 */
function getStorageData(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.warn('LocalStorageの読み込みに失敗:', error);
    return defaultValue;
  }
}

/**
 * LocalStorageにデータを保存
 * @param {string} key - ストレージキー
 * @param {*} data - 保存するデータ
 * @returns {boolean} 保存成功の可否
 */
function setStorageData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn('LocalStorageの保存に失敗:', error);
    return false;
  }
}

/**
 * プレイヤー名のバリデーション
 * @param {string} name - プレイヤー名
 * @returns {object} バリデーション結果 {isValid: boolean, message: string}
 */
function validatePlayerName(name) {
  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      message: 'プレイヤー名を入力してください'
    };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 3) {
    return {
      isValid: false,
      message: 'プレイヤー名は3文字以上で入力してください'
    };
  }
  
  if (trimmedName.length > 20) {
    return {
      isValid: false,
      message: 'プレイヤー名は20文字以下で入力してください'
    };
  }
  
  // 特殊文字のチェック（基本的な文字のみ許可）
  const validPattern = /^[a-zA-Z0-9あ-んア-ンー一-龯\s]+$/;
  if (!validPattern.test(trimmedName)) {
    return {
      isValid: false,
      message: 'プレイヤー名に使用できない文字が含まれています'
    };
  }
  
  return {
    isValid: true,
    message: '',
    name: trimmedName
  };
}

/**
 * モンスター情報を取得
 * @param {string} monsterId - モンスターID
 * @returns {object|null} モンスター情報
 */
function getMonsterById(monsterId) {
  return MONSTER_TYPES.find(monster => monster.id === monsterId) || null;
}

/**
 * 全モンスター情報を取得
 * @returns {Array} モンスター情報の配列
 */
function getAllMonsters() {
  return [...MONSTER_TYPES];
}

// ========== 画面遷移管理 ==========

/**
 * 指定されたページに遷移
 * @param {string} pageName - ページ名（index, player-creation, map）
 * @param {object} params - URLパラメータ（オプション）
 */
function navigateToPage(pageName, params = {}) {
  let url = `${pageName}.html`;
  
  // URLパラメータがある場合は追加
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.set(key, value);
    }
  });
  
  if (searchParams.toString()) {
    url += `?${searchParams.toString()}`;
  }
  
  window.location.href = url;
}

/**
 * URLパラメータを取得
 * @param {string} paramName - パラメータ名
 * @returns {string|null} パラメータ値
 */
function getUrlParameter(paramName) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName);
}

// ========== UI操作ヘルパー ==========

/**
 * 要素にフェードイン効果を適用
 * @param {HTMLElement} element - 対象要素
 * @param {number} delay - 遅延時間（ミリ秒）
 */
function fadeInElement(element, delay = 0) {
  if (!element) return;
  
  element.style.opacity = '0';
  element.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  }, delay);
}

/**
 * 複数の要素に順次フェードイン効果を適用
 * @param {NodeList|Array} elements - 対象要素のリスト
 * @param {number} interval - 要素間の遅延時間（ミリ秒）
 */
function staggeredFadeIn(elements, interval = 200) {
  elements.forEach((element, index) => {
    fadeInElement(element, index * interval);
  });
}

/**
 * ボタンを一時的に無効化
 * @param {HTMLElement} button - ボタン要素
 * @param {number} duration - 無効化時間（ミリ秒）
 */
function temporaryDisableButton(button, duration = 1000) {
  if (!button) return;
  
  const originalText = button.textContent;
  const originalDisabled = button.disabled;
  
  button.disabled = true;
  button.classList.add('disabled');
  
  setTimeout(() => {
    button.disabled = originalDisabled;
    button.classList.remove('disabled');
    button.textContent = originalText;
  }, duration);
}

/**
 * エラーメッセージを表示
 * @param {HTMLElement} container - メッセージを表示するコンテナ
 * @param {string} message - エラーメッセージ
 * @param {number} duration - 表示時間（ミリ秒、0で自動消去なし）
 */
function showErrorMessage(container, message, duration = 5000) {
  if (!container) return;
  
  // 既存のエラーメッセージを削除
  const existingError = container.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // エラーメッセージ要素を作成
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
  errorElement.textContent = message;
  
  // コンテナの先頭に挿入
  container.insertBefore(errorElement, container.firstChild);
  
  // フェードイン効果
  fadeInElement(errorElement);
  
  // 自動消去
  if (duration > 0) {
    setTimeout(() => {
      if (errorElement.parentNode) {
        errorElement.style.transition = 'opacity 0.3s ease-out';
        errorElement.style.opacity = '0';
        setTimeout(() => {
          if (errorElement.parentNode) {
            errorElement.remove();
          }
        }, 300);
      }
    }, duration);
  }
}

/**
 * 成功メッセージを表示
 * @param {HTMLElement} container - メッセージを表示するコンテナ
 * @param {string} message - 成功メッセージ
 * @param {number} duration - 表示時間（ミリ秒）
 */
function showSuccessMessage(container, message, duration = 3000) {
  if (!container) return;
  
  const successElement = document.createElement('div');
  successElement.className = 'success-message bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4';
  successElement.textContent = message;
  
  container.insertBefore(successElement, container.firstChild);
  fadeInElement(successElement);
  
  if (duration > 0) {
    setTimeout(() => {
      if (successElement.parentNode) {
        successElement.style.transition = 'opacity 0.3s ease-out';
        successElement.style.opacity = '0';
        setTimeout(() => {
          if (successElement.parentNode) {
            successElement.remove();
          }
        }, 300);
      }
    }, duration);
  }
}

// ========== ゲーム状態管理 ==========

/**
 * ゲーム状態を取得
 * @returns {object} 現在のゲーム状態
 */
function getGameState() {
  return {
    playerName: getStorageData(STORAGE_KEYS.PLAYER_NAME),
    selectedMonster: getStorageData(STORAGE_KEYS.SELECTED_MONSTER),
    playerPosition: getStorageData(STORAGE_KEYS.PLAYER_POSITION, MAP_CONFIG.startPosition),
    gameState: getStorageData(STORAGE_KEYS.GAME_STATE, 'start')
  };
}

/**
 * ゲーム状態を更新
 * @param {object} updates - 更新するデータ
 * @returns {boolean} 更新成功の可否
 */
function updateGameState(updates) {
  try {
    if (updates.playerName !== undefined) {
      setStorageData(STORAGE_KEYS.PLAYER_NAME, updates.playerName);
    }
    if (updates.selectedMonster !== undefined) {
      setStorageData(STORAGE_KEYS.SELECTED_MONSTER, updates.selectedMonster);
    }
    if (updates.playerPosition !== undefined) {
      setStorageData(STORAGE_KEYS.PLAYER_POSITION, updates.playerPosition);
    }
    if (updates.gameState !== undefined) {
      setStorageData(STORAGE_KEYS.GAME_STATE, updates.gameState);
    }
    return true;
  } catch (error) {
    console.error('ゲーム状態の更新に失敗:', error);
    return false;
  }
}

/**
 * ゲーム状態をリセット
 */
function resetGameState() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

// ========== イベントリスナーのヘルパー ==========

/**
 * DOM読み込み完了時の処理を登録
 * @param {function} callback - 実行する関数
 */
function onDOMReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

/**
 * キーボードイベントのヘルパー
 * @param {object} keyMap - キーと関数のマッピング
 */
function setupKeyboardEvents(keyMap) {
  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (keyMap[key] && typeof keyMap[key] === 'function') {
      event.preventDefault();
      keyMap[key](event);
    }
  });
}

// ========== デバッグ用関数 ==========

/**
 * デバッグ情報をコンソールに出力
 * @param {string} label - ラベル
 * @param {*} data - 出力するデータ
 */
function debugLog(label, data) {
  if (window.location.search.includes('debug=true')) {
    console.log(`[DEBUG] ${label}:`, data);
  }
}

/**
 * 現在のゲーム状態をコンソールに出力
 */
function debugGameState() {
  debugLog('Game State', getGameState());
}

// ========== 初期化 ==========

// ページが読み込まれた時の共通処理
onDOMReady(() => {
  // デバッグモードの場合、ゲーム状態を出力
  debugGameState();
  
  // グローバルなエラーハンドリング
  window.addEventListener('error', (event) => {
    console.error('グローバルエラー:', event.error);
  });
  
  // アクセシビリティ：フォーカス可能な要素にクラスを追加
  const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href]');
  focusableElements.forEach(element => {
    element.classList.add('focusable');
  });
});