/**
 * マップ機能JavaScript
 * 
 * 初学者向けメモ：
 * - 2Dマップの生成と表示
 * - プレイヤーキャラクターの移動
 * - タイルベースのゲームシステム
 * - キーボード入力の処理
 */

// ========== マップ設定 ==========

const MAP_TILES = {
  GRASS: 'grass',
  TOWN: 'town',
  MOUNTAIN: 'mountain',
  WATER: 'water'
};

// マップデータ（10x8のグリッド）
const MAP_DATA = [
  ['water', 'water', 'water', 'grass', 'grass', 'grass', 'mountain', 'mountain', 'mountain', 'water'],
  ['water', 'grass', 'grass', 'grass', 'town', 'grass', 'grass', 'mountain', 'mountain', 'water'],
  ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'mountain', 'water'],
  ['grass', 'grass', 'town', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'water'],
  ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'water'],
  ['grass', 'mountain', 'grass', 'grass', 'town', 'grass', 'grass', 'grass', 'grass', 'water'],
  ['mountain', 'mountain', 'grass', 'grass', 'grass', 'grass', 'grass', 'water', 'water', 'water'],
  ['mountain', 'mountain', 'mountain', 'grass', 'grass', 'grass', 'water', 'water', 'water', 'water']
];

// タイル情報
const TILE_INFO = {
  grass: {
    name: '草原',
    walkable: true,
    description: '緑豊かな草原。モンスターが出現することがある。',
    emoji: '🌱'
  },
  town: {
    name: '街',
    walkable: true,
    description: '人々が住む平和な街。休息できる場所。',
    emoji: '🏘️'
  },
  mountain: {
    name: '山',
    walkable: false,
    description: '険しい山。登ることはできない。',
    emoji: '⛰️'
  },
  water: {
    name: '水辺',
    walkable: false,
    description: '美しい水辺。泳ぐことはできない。',
    emoji: '🌊'
  }
};

// ========== マップ表示とプレイヤー管理 ==========

let currentPosition = { x: 5, y: 4 };
let mapContainer = null;
let playerElement = null;
let isMoving = false;

/**
 * マップコンテナを初期化
 * @param {HTMLElement} container - マップを表示するコンテナ
 */
function initializeMap(container) {
  if (!container) return;
  
  mapContainer = container;
  
  // マップをクリア
  container.innerHTML = '';
  
  // マップのスタイルを設定
  container.style.display = 'grid';
  container.style.gridTemplateColumns = `repeat(${MAP_CONFIG.width}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${MAP_CONFIG.height}, 1fr)`;
  container.style.gap = '1px';
  container.style.backgroundColor = '#e5e5e5';
  container.style.padding = '4px';
  container.style.borderRadius = '8px';
  container.style.maxWidth = '600px';
  container.style.aspectRatio = `${MAP_CONFIG.width} / ${MAP_CONFIG.height}`;
  
  // マップタイルを生成
  generateMapTiles();
  
  // プレイヤーを配置
  placePlayer();
  
  debugLog('Map Initialized', { position: currentPosition, mapSize: `${MAP_CONFIG.width}x${MAP_CONFIG.height}` });
}

/**
 * マップタイルを生成
 */
function generateMapTiles() {
  if (!mapContainer) return;
  
  for (let y = 0; y < MAP_CONFIG.height; y++) {
    for (let x = 0; x < MAP_CONFIG.width; x++) {
      const tile = createMapTile(x, y);
      mapContainer.appendChild(tile);
    }
  }
}

/**
 * 個別のマップタイルを作成
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @returns {HTMLElement} タイル要素
 */
function createMapTile(x, y) {
  const tileType = MAP_DATA[y][x];
  const tileInfo = TILE_INFO[tileType];
  
  const tile = document.createElement('div');
  tile.className = `map-tile tile-${tileType}`;
  tile.dataset.x = x;
  tile.dataset.y = y;
  tile.dataset.type = tileType;
  
  // アクセシビリティ
  tile.setAttribute('aria-label', `${tileInfo.name} (${x}, ${y})`);
  tile.title = `${tileInfo.name}: ${tileInfo.description}`;
  
  // タイルクリックイベント
  tile.addEventListener('click', () => {
    handleTileClick(x, y);
  });
  
  return tile;
}

/**
 * プレイヤーキャラクターを配置
 */
function placePlayer() {
  if (!mapContainer) return;
  
  // 既存のプレイヤー要素を削除
  if (playerElement) {
    playerElement.remove();
  }
  
  // 新しいプレイヤー要素を作成
  playerElement = document.createElement('div');
  playerElement.className = 'character';
  playerElement.id = 'player-character';
  playerElement.setAttribute('aria-label', 'プレイヤーキャラクター');
  
  // プレイヤーを正しい位置に配置
  positionPlayer();
  
  mapContainer.appendChild(playerElement);
  
  // 現在位置のタイルを強調
  updateCurrentTileHighlight();
}

/**
 * プレイヤーの位置を更新
 */
function positionPlayer() {
  if (!playerElement || !mapContainer) return;
  
  const tileSize = mapContainer.offsetWidth / MAP_CONFIG.width;
  const x = currentPosition.x * tileSize + tileSize / 2 - 20; // 20はキャラクターサイズの半分
  const y = currentPosition.y * tileSize + tileSize / 2 - 20;
  
  playerElement.style.position = 'absolute';
  playerElement.style.left = `${x}px`;
  playerElement.style.top = `${y}px`;
  playerElement.style.transition = isMoving ? 'all 0.3s ease-in-out' : 'none';
}

/**
 * プレイヤーを移動
 * @param {number} deltaX - X方向の移動量
 * @param {number} deltaY - Y方向の移動量
 * @returns {boolean} 移動成功の可否
 */
function movePlayer(deltaX, deltaY) {
  if (isMoving) return false;
  
  const newX = currentPosition.x + deltaX;
  const newY = currentPosition.y + deltaY;
  
  // 境界チェック
  if (newX < 0 || newX >= MAP_CONFIG.width || newY < 0 || newY >= MAP_CONFIG.height) {
    showMovementMessage('これ以上進めません', 'warning');
    return false;
  }
  
  // 通行可能チェック
  const tileType = MAP_DATA[newY][newX];
  const tileInfo = TILE_INFO[tileType];
  
  if (!tileInfo.walkable) {
    showMovementMessage(`${tileInfo.name}は通れません`, 'error');
    return false;
  }
  
  // 移動実行
  isMoving = true;
  currentPosition.x = newX;
  currentPosition.y = newY;
  
  // 位置を保存
  updateGameState({ playerPosition: { ...currentPosition } });
  
  // アニメーション付きで移動
  positionPlayer();
  
  // ハイライト更新
  updateCurrentTileHighlight();
  
  // 位置情報表示を更新
  updatePositionDisplay();
  
  // 移動完了後の処理
  setTimeout(() => {
    isMoving = false;
    
    // 特定のタイルでのイベント処理
    handleTileEvent(tileType);
  }, 300);
  
  debugLog('Player Moved', { from: { x: newX - deltaX, y: newY - deltaY }, to: currentPosition });
  
  return true;
}

/**
 * 現在位置のタイルハイライトを更新
 */
function updateCurrentTileHighlight() {
  if (!mapContainer) return;
  
  // 既存のハイライトを削除
  mapContainer.querySelectorAll('.tile-current').forEach(tile => {
    tile.classList.remove('tile-current');
  });
  
  // 現在位置のタイルをハイライト
  const currentTile = mapContainer.querySelector(`[data-x="${currentPosition.x}"][data-y="${currentPosition.y}"]`);
  if (currentTile) {
    currentTile.classList.add('tile-current');
  }
}

/**
 * 位置情報表示を更新
 */
function updatePositionDisplay() {
  const positionElement = document.getElementById('position-display');
  if (positionElement) {
    const tileType = MAP_DATA[currentPosition.y][currentPosition.x];
    const tileInfo = TILE_INFO[tileType];
    
    positionElement.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="text-2xl">${tileInfo.emoji}</span>
        <div>
          <div class="font-semibold">${tileInfo.name}</div>
          <div class="text-sm text-gray-600">座標: (${currentPosition.x}, ${currentPosition.y})</div>
        </div>
      </div>
    `;
  }
}

/**
 * タイルクリック処理
 * @param {number} x - クリックされたタイルのX座標
 * @param {number} y - クリックされたタイルのY座標
 */
function handleTileClick(x, y) {
  const deltaX = x - currentPosition.x;
  const deltaY = y - currentPosition.y;
  
  // 隣接タイルのみ移動可能
  if (Math.abs(deltaX) + Math.abs(deltaY) === 1) {
    movePlayer(deltaX, deltaY);
  } else if (x === currentPosition.x && y === currentPosition.y) {
    // 現在位置をクリックした場合の情報表示
    showTileInfo(x, y);
  } else {
    showMovementMessage('隣接するタイルにのみ移動できます', 'info');
  }
}

/**
 * タイル情報を表示
 * @param {number} x - X座標
 * @param {number} y - Y座標
 */
function showTileInfo(x, y) {
  const tileType = MAP_DATA[y][x];
  const tileInfo = TILE_INFO[tileType];
  
  const infoElement = document.getElementById('tile-info');
  if (infoElement) {
    infoElement.innerHTML = `
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center space-x-3 mb-2">
          <span class="text-3xl">${tileInfo.emoji}</span>
          <div>
            <h4 class="font-bold text-blue-900">${tileInfo.name}</h4>
            <p class="text-sm text-blue-700">座標: (${x}, ${y})</p>
          </div>
        </div>
        <p class="text-blue-800 text-sm">${tileInfo.description}</p>
      </div>
    `;
    
    // 数秒後に自動で消える
    setTimeout(() => {
      if (infoElement) {
        infoElement.innerHTML = '';
      }
    }, 5000);
  }
}

/**
 * タイルイベント処理
 * @param {string} tileType - タイルの種類
 */
function handleTileEvent(tileType) {
  switch (tileType) {
    case 'town':
      showMovementMessage('街に到着しました。ここで休息できます。', 'success');
      break;
    case 'grass':
      // ランダムでモンスター出現イベント
      if (Math.random() < 0.1) { // 10%の確率
        showMovementMessage('野生のモンスターが現れそうな気配...', 'info');
      }
      break;
  }
}

/**
 * 移動メッセージを表示
 * @param {string} message - メッセージ
 * @param {string} type - メッセージタイプ (success, error, warning, info)
 */
function showMovementMessage(message, type = 'info') {
  const messageElement = document.getElementById('movement-messages');
  if (!messageElement) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message-${type} px-3 py-2 rounded-lg text-sm mb-2 transition-all duration-300`;
  
  // タイプ別のスタイル
  const styles = {
    success: 'bg-green-100 text-green-700 border border-green-300',
    error: 'bg-red-100 text-red-700 border border-red-300',
    warning: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    info: 'bg-blue-100 text-blue-700 border border-blue-300'
  };
  
  messageDiv.className += ' ' + styles[type];
  messageDiv.textContent = message;
  
  // メッセージを先頭に追加
  messageElement.insertBefore(messageDiv, messageElement.firstChild);
  
  // フェードイン効果
  fadeInElement(messageDiv);
  
  // 古いメッセージを削除（最新5件のみ保持）
  const messages = messageElement.querySelectorAll('[class*="message-"]');
  if (messages.length > 5) {
    for (let i = 5; i < messages.length; i++) {
      messages[i].remove();
    }
  }
  
  // 5秒後に自動削除
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.style.opacity = '0';
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.remove();
        }
      }, 300);
    }
  }, 5000);
}

// ========== キーボード制御 ==========

/**
 * キーボードマップ制御を設定
 */
function setupMapKeyboardControls() {
  setupKeyboardEvents({
    'arrowup': () => movePlayer(0, -1),
    'arrowdown': () => movePlayer(0, 1),
    'arrowleft': () => movePlayer(-1, 0),
    'arrowright': () => movePlayer(1, 0),
    'w': () => movePlayer(0, -1),
    's': () => movePlayer(0, 1),
    'a': () => movePlayer(-1, 0),
    'd': () => movePlayer(1, 0),
    ' ': () => {
      // スペースキーで現在位置の情報表示
      showTileInfo(currentPosition.x, currentPosition.y);
    }
  });
}

// ========== プレイヤー情報表示 ==========

/**
 * プレイヤー情報パネルを更新
 */
function updatePlayerPanel() {
  const gameState = getGameState();
  const playerPanel = document.getElementById('player-panel');
  
  if (!playerPanel) return;
  
  const selectedMonster = getMonsterById(gameState.selectedMonster);
  
  playerPanel.innerHTML = `
    <div class="bg-white rounded-lg shadow-md p-4">
      <h3 class="font-bold text-gray-900 mb-3">プレイヤー情報</h3>
      
      <!-- プレイヤー名 -->
      <div class="flex items-center space-x-2 mb-3">
        <span class="text-lg">👤</span>
        <div>
          <div class="text-sm text-gray-500">プレイヤー名</div>
          <div class="font-semibold">${gameState.playerName || '不明'}</div>
        </div>
      </div>
      
      <!-- パートナーモンスター -->
      ${selectedMonster ? `
        <div class="flex items-center space-x-2 mb-3">
          <span class="text-lg">${selectedMonster.icon}</span>
          <div>
            <div class="text-sm text-gray-500">パートナー</div>
            <div class="font-semibold">${selectedMonster.name}</div>
          </div>
        </div>
      ` : ''}
      
      <!-- 現在位置 -->
      <div id="position-display" class="border-t pt-3">
        <!-- 位置情報がここに表示される -->
      </div>
    </div>
  `;
  
  // 位置情報を初期化
  updatePositionDisplay();
}

// ========== 初期化 ==========

/**
 * マップ画面の初期化
 */
function initializeMapPage() {
  const gameState = getGameState();
  
  // ゲーム状態の確認
  if (!gameState.playerName || !gameState.selectedMonster) {
    showErrorMessage(
      document.body,
      'ゲームデータが不完全です。プレイヤー作成からやり直してください。',
      5000
    );
    setTimeout(() => {
      navigateToPage('player-creation');
    }, 2000);
    return;
  }
  
  // 保存された位置を復元
  if (gameState.playerPosition) {
    currentPosition = { ...gameState.playerPosition };
  }
  
  // マップ初期化
  const mapContainer = document.getElementById('game-map');
  if (mapContainer) {
    initializeMap(mapContainer);
  }
  
  // プレイヤー情報パネル更新
  updatePlayerPanel();
  
  // キーボード制御設定
  setupMapKeyboardControls();
  
  // ウィンドウリサイズ時の処理
  window.addEventListener('resize', () => {
    setTimeout(() => {
      if (playerElement) {
        positionPlayer();
      }
    }, 100);
  });
  
  debugLog('Map Page Initialized', { gameState, currentPosition });
}

// ========== エクスポート ==========

window.mapModule = {
  initializeMapPage,
  movePlayer,
  updatePlayerPanel,
  showTileInfo,
  handleTileClick
};