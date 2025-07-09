/**
 * プレイヤー管理JavaScript
 * 
 * 初学者向けメモ：
 * - プレイヤー作成画面の機能
 * - モンスター選択の処理
 * - プレイヤーデータの管理
 */

// ========== プレイヤー作成画面の処理 ==========

/**
 * モンスター選択カードを生成
 * @param {object} monster - モンスター情報
 * @param {boolean} isSelected - 選択状態
 * @returns {HTMLElement} カード要素
 */
function createMonsterCard(monster, isSelected = false) {
  const card = document.createElement('div');
  card.className = `selectable-card bg-white rounded-lg shadow-md p-6 transition-all duration-300 ${
    isSelected ? 'selected' : ''
  }`;
  card.dataset.monsterId = monster.id;
  
  card.innerHTML = `
    <div class="text-center">
      <div class="text-6xl mb-4">${monster.icon}</div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">${monster.name}</h3>
      <p class="text-gray-600 text-sm mb-3">${monster.description}</p>
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-500">基本HP:</span>
          <span class="font-semibold text-gray-700">${monster.baseHp}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-500">レア度:</span>
          <span class="font-semibold ${
            monster.rarity === 'rare' ? 'text-purple-600' : 'text-blue-600'
          }">${monster.rarity === 'rare' ? 'レア' : 'コモン'}</span>
        </div>
      </div>
    </div>
  `;
  
  // 選択イベントを追加
  card.addEventListener('click', () => {
    selectMonster(monster.id);
  });
  
  // キーボードアクセシビリティ
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `${monster.name}を選択`);
  
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectMonster(monster.id);
    }
  });
  
  return card;
}

/**
 * モンスター選択処理
 * @param {string} monsterId - 選択されたモンスターID
 */
function selectMonster(monsterId) {
  // 既存の選択を解除
  document.querySelectorAll('.selectable-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  // 新しい選択を適用
  const selectedCard = document.querySelector(`[data-monster-id="${monsterId}"]`);
  if (selectedCard) {
    selectedCard.classList.add('selected');
  }
  
  // 選択状態を保存
  updateGameState({ selectedMonster: monsterId });
  
  // プレビューエリアを更新
  updateMonsterPreview(monsterId);
  
  // 開始ボタンを有効化
  enableStartButton();
  
  debugLog('Monster Selected', monsterId);
}

/**
 * モンスタープレビューを更新
 * @param {string} monsterId - モンスターID
 */
function updateMonsterPreview(monsterId) {
  const previewContainer = document.getElementById('monster-preview');
  if (!previewContainer) return;
  
  const monster = getMonsterById(monsterId);
  if (!monster) return;
  
  previewContainer.innerHTML = `
    <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
      <h3 class="text-lg font-bold text-gray-900 mb-4 text-center">選択されたパートナー</h3>
      <div class="text-center">
        <div class="text-8xl mb-4">${monster.icon}</div>
        <h4 class="text-2xl font-bold text-gray-900 mb-2">${monster.name}</h4>
        <p class="text-gray-600 mb-4">${monster.description}</p>
        <div class="bg-white rounded-lg p-4 space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">基本HP:</span>
            <span class="font-bold text-blue-600">${monster.baseHp}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">レア度:</span>
            <span class="font-bold ${
              monster.rarity === 'rare' ? 'text-purple-600' : 'text-blue-600'
            }">${monster.rarity === 'rare' ? 'レア' : 'コモン'}</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // フェードイン効果
  fadeInElement(previewContainer);
}

/**
 * 冒険開始ボタンを有効化
 */
function enableStartButton() {
  const startButton = document.getElementById('start-adventure-btn');
  if (startButton) {
    startButton.disabled = false;
    startButton.classList.remove('disabled', 'opacity-50', 'cursor-not-allowed');
    startButton.classList.add('btn-hover-scale');
  }
}

/**
 * 冒険開始処理
 */
function startAdventure() {
  const gameState = getGameState();
  
  // 必要なデータが揃っているかチェック
  if (!gameState.playerName || !gameState.selectedMonster) {
    showErrorMessage(
      document.getElementById('main-content'),
      'プレイヤー名とモンスターを選択してください'
    );
    return;
  }
  
  // ゲーム状態を更新
  updateGameState({ 
    gameState: 'playing',
    playerPosition: MAP_CONFIG.startPosition
  });
  
  // 成功メッセージを表示
  showSuccessMessage(
    document.getElementById('main-content'),
    '冒険を開始します！',
    1500
  );
  
  // 少し待ってからマップ画面に遷移
  setTimeout(() => {
    navigateToPage('map');
  }, 1500);
}

// ========== プレイヤー情報表示 ==========

/**
 * プレイヤー情報を表示
 * @param {HTMLElement} container - 表示コンテナ
 */
function displayPlayerInfo(container) {
  if (!container) return;
  
  const gameState = getGameState();
  const playerName = gameState.playerName;
  
  if (!playerName) {
    container.innerHTML = `
      <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        プレイヤー情報が見つかりません。スタート画面からやり直してください。
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">プレイヤー情報</h2>
      <div class="space-y-3">
        <div class="flex items-center space-x-3">
          <div class="bg-blue-100 p-2 rounded-full">
            <span class="text-blue-600 text-xl">👤</span>
          </div>
          <div>
            <p class="text-sm text-gray-500">プレイヤー名</p>
            <p class="text-lg font-semibold text-gray-900">${playerName}</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <div class="bg-green-100 p-2 rounded-full">
            <span class="text-green-600 text-xl">🎮</span>
          </div>
          <div>
            <p class="text-sm text-gray-500">ゲーム状態</p>
            <p class="text-lg font-semibold text-gray-900">準備中</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * モンスター選択エリアを初期化
 * @param {HTMLElement} container - 選択エリアのコンテナ
 */
function initializeMonsterSelection(container) {
  if (!container) return;
  
  const monsters = getAllMonsters();
  const gameState = getGameState();
  const selectedMonsterId = gameState.selectedMonster;
  
  // 既存の内容をクリア
  container.innerHTML = '';
  
  // 説明文を追加
  const descriptionDiv = document.createElement('div');
  descriptionDiv.className = 'text-center mb-8';
  descriptionDiv.innerHTML = `
    <h2 class="text-2xl font-bold text-gray-900 mb-4">パートナーモンスターを選択</h2>
    <p class="text-gray-600">
      あなたと一緒に冒険するパートナーモンスターを選んでください。
      <br>
      それぞれ異なる特徴を持っています。
    </p>
  `;
  container.appendChild(descriptionDiv);
  
  // モンスターカードコンテナ
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-8';
  
  // 各モンスターのカードを作成
  monsters.forEach((monster, index) => {
    const isSelected = monster.id === selectedMonsterId;
    const card = createMonsterCard(monster, isSelected);
    cardsContainer.appendChild(card);
    
    // アニメーション付きで表示
    setTimeout(() => {
      fadeInElement(card);
    }, index * 100);
  });
  
  container.appendChild(cardsContainer);
  
  // 既に選択されている場合はプレビューを表示
  if (selectedMonsterId) {
    updateMonsterPreview(selectedMonsterId);
  }
}

// ========== 初期化 ==========

/**
 * プレイヤー作成画面の初期化
 */
function initializePlayerCreationPage() {
  const gameState = getGameState();
  
  // プレイヤー名が設定されていない場合はスタート画面に戻る
  if (!gameState.playerName) {
    showErrorMessage(
      document.body,
      'プレイヤー名が設定されていません。スタート画面からやり直してください。',
      5000
    );
    setTimeout(() => {
      navigateToPage('index');
    }, 2000);
    return;
  }
  
  // プレイヤー情報表示
  const playerInfoContainer = document.getElementById('player-info');
  if (playerInfoContainer) {
    displayPlayerInfo(playerInfoContainer);
  }
  
  // モンスター選択エリア初期化
  const monsterSelectionContainer = document.getElementById('monster-selection');
  if (monsterSelectionContainer) {
    initializeMonsterSelection(monsterSelectionContainer);
  }
  
  // 冒険開始ボタンの設定
  const startButton = document.getElementById('start-adventure-btn');
  if (startButton) {
    // 既にモンスターが選択されている場合は有効化
    if (gameState.selectedMonster) {
      enableStartButton();
    }
    
    startButton.addEventListener('click', startAdventure);
  }
  
  // 戻るボタンの設定
  const backButton = document.getElementById('back-to-start-btn');
  if (backButton) {
    backButton.addEventListener('click', () => {
      navigateToPage('index');
    });
  }
  
  debugLog('Player Creation Page Initialized', gameState);
}

// ========== エクスポート（グローバル関数として利用可能に） ==========

// グローバルスコープに関数を追加（他のファイルから呼び出し可能）
window.playerModule = {
  initializePlayerCreationPage,
  selectMonster,
  startAdventure,
  displayPlayerInfo,
  createMonsterCard,
  updateMonsterPreview
};