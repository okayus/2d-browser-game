/**
 * バトル画面コンポーネント
 * 初学者向け: ターン制バトルシステムの実装例
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent } from '../components/ui';
import { 
  initializeBattleState,
  saveBattleState,
  loadBattleState,
  clearBattleState,
  createLogEntry,
  calculateDamage,
  updateHp,
  canCaptureWildMonster,
  attemptCapture,
  calculateHpPercentage,
  getHpBarColor,
  createBattleResult,
  switchTurn
} from '../lib/battle-utils';
import type { BattleState, BattleAction, WildMonster, BattlePlayerMonster } from '@monster-game/shared';
import { getStorageData } from '../lib/utils';

/**
 * HPバーコンポーネント（HP bar component）
 * @description モンスターのHP表示用コンポーネント
 */
interface HpBarProps {
  currentHp: number;
  maxHp: number;
  name: string;
  size?: 'small' | 'medium' | 'large';
}

function HpBar({ currentHp, maxHp, name, size = 'medium' }: HpBarProps) {
  const hpPercent = calculateHpPercentage(currentHp, maxHp);
  const colorClass = getHpBarColor(hpPercent);
  
  const sizeClasses = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4'
  };

  return (
    <div className={`w-full ${size !== 'small' ? 'space-y-1' : ''}`}>
      {size !== 'small' && (
        <div className="flex justify-between text-sm">
          <span className="font-medium">{name}</span>
          <span className="text-gray-600">{currentHp}/{maxHp}</span>
        </div>
      )}
      <div className={`w-full ${sizeClasses[size]} bg-gray-200 rounded-full overflow-hidden`}>
        <div 
          className={`h-full ${colorClass} transition-all duration-500 ease-out`}
          style={{ width: `${hpPercent}%` }}
        />
      </div>
      {size === 'small' && (
        <div className="text-xs text-gray-600 text-center">
          {currentHp}/{maxHp}
        </div>
      )}
    </div>
  );
}

/**
 * モンスター表示コンポーネント（Monster display component）
 * @description バトル中のモンスター情報表示
 */
interface MonsterDisplayProps {
  name: string;
  icon: string;
  currentHp: number;
  maxHp: number;
  isWild?: boolean;
  isPlayerTurn: boolean;
}

function MonsterDisplay({ name, icon, currentHp, maxHp, isWild = false, isPlayerTurn }: MonsterDisplayProps) {
  const isActive = isWild ? !isPlayerTurn : isPlayerTurn;
  
  return (
    <Card className={`transition-all duration-300 ${isActive ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow'}`}>
      <CardContent className="p-6 text-center">
        <div className="space-y-4">
          {/* モンスターアイコン */}
          <div className={`text-6xl transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
            {icon}
          </div>
          
          {/* モンスター名 */}
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">
              {isWild && '野生の'}{name}
            </h3>
            {isActive && (
              <div className="text-sm text-blue-600 font-medium">
                {isWild ? '敵のターン' : 'あなたのターン'}
              </div>
            )}
          </div>
          
          {/* HPバー */}
          <div className="px-2">
            <HpBar 
              currentHp={currentHp} 
              maxHp={maxHp} 
              name={isWild ? '野生' : '味方'}
              size="medium" 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * アクションボタンコンポーネント（Action buttons component）
 * @description プレイヤーが選択可能なアクション
 */
interface ActionButtonsProps {
  onAction: (action: BattleAction) => void;
  canCapture: boolean;
  disabled: boolean;
}

function ActionButtons({ onAction, canCapture, disabled }: ActionButtonsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">アクションを選択</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={() => onAction('attack')}
            disabled={disabled}
            className="w-full h-12 text-base"
            variant="primary"
          >
            ⚔️ たたかう
          </Button>
          <Button
            onClick={() => onAction('capture')}
            disabled={disabled || !canCapture}
            className="w-full h-12 text-base"
            variant={canCapture ? "secondary" : "ghost"}
          >
            🎯 つかまえる
          </Button>
          <Button
            onClick={() => onAction('escape')}
            disabled={disabled}
            className="w-full h-12 text-base"
            variant="ghost"
          >
            🏃 にげる
          </Button>
        </div>
        {!canCapture && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            ※ 捕獲は相手のHPが50%以下の時のみ可能
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * バトルログコンポーネント（Battle log component）
 * @description バトル中のアクションログ表示
 */
interface BattleLogProps {
  battleLog: BattleState['battleLog'];
}

function BattleLog({ battleLog }: BattleLogProps) {
  const logTypeColors = {
    attack: 'bg-red-50 border-red-200 text-red-700',
    damage: 'bg-orange-50 border-orange-200 text-orange-700',
    capture: 'bg-purple-50 border-purple-200 text-purple-700',
    escape: 'bg-gray-50 border-gray-200 text-gray-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    victory: 'bg-green-50 border-green-200 text-green-700',
    defeat: 'bg-red-50 border-red-200 text-red-700'
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-bold text-gray-900 mb-3">📝 バトルログ</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {battleLog.slice(-10).map((log) => (
            <div
              key={log.id}
              className={`px-3 py-2 rounded-lg text-sm border ${logTypeColors[log.type]}`}
            >
              {log.message}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * バトル画面のメインコンポーネント（Main battle page component）
 * @description ターン制バトルシステムの中心となる画面
 */
export function BattlePage() {
  const navigate = useNavigate();
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * コンポーネント初期化（Component initialization）
   * @description バトル状態の復元または新規作成
   */
  useEffect(() => {
    const initializeBattle = () => {
      try {
        // 保存されたバトル状態を復元を試行
        const savedBattle = loadBattleState();
        if (savedBattle) {
          setBattleState(savedBattle);
          setIsLoading(false);
          return;
        }

        // 新規バトルの初期化データを取得
        const battleInitData = getStorageData<{
          wildMonsterSpeciesId: string;
          playerMonsterId: string;
          wildMonster?: WildMonster;
          playerMonster?: BattlePlayerMonster;
        }>('battle_init');

        // 詳細なデバッグログを出力
        console.log('バトル初期化データの検証:', {
          battleInitData,
          hasBattleInitData: !!battleInitData,
          hasWildMonster: !!battleInitData?.wildMonster,
          hasPlayerMonster: !!battleInitData?.playerMonster,
          wildMonster: battleInitData?.wildMonster,
          playerMonster: battleInitData?.playerMonster
        });

        if (!battleInitData) {
          console.error('バトル初期化データが見つかりません - sessionStorage に battle_init が存在しません');
          navigate('/map');
          return;
        }

        if (!battleInitData.wildMonster) {
          console.error('野生モンスターデータが不足しています:', {
            battleInitData,
            wildMonster: battleInitData.wildMonster
          });
          navigate('/map');
          return;
        }

        if (!battleInitData.playerMonster) {
          console.error('プレイヤーモンスターデータが不足しています:', {
            battleInitData,
            playerMonster: battleInitData.playerMonster
          });
          navigate('/map');
          return;
        }

        // 新しいバトル状態を初期化
        const newBattle = initializeBattleState(
          battleInitData.wildMonster,
          battleInitData.playerMonster
        );

        setBattleState(newBattle);
        saveBattleState(newBattle);
        setIsLoading(false);

      } catch (error) {
        console.error('バトルの初期化に失敗:', error);
        navigate('/map');
      }
    };

    initializeBattle();
  }, [navigate]);

  /**
   * 野生モンスターの自動ターン処理（Wild monster auto turn）
   * @description 野生モンスターのターンになったら自動で実行
   */
  useEffect(() => {
    if (!battleState || battleState.status !== 'ongoing' || isProcessing) {
      return;
    }

    if (battleState.currentTurn === 'wild') {
      console.log('野生モンスターの自動ターンを開始...');
      const timer = setTimeout(() => {
        executeWildMonsterTurn();
      }, 1500); // 1.5秒後に自動実行

      return () => clearTimeout(timer);
    }
  }, [battleState?.currentTurn, battleState?.status, isProcessing]);

  /**
   * プレイヤーアクション処理（Handle player action）
   * @description プレイヤーが選択したアクションを処理
   * @param action - 選択されたアクション
   */
  const handlePlayerAction = async (action: BattleAction) => {
    if (!battleState || isProcessing || battleState.status !== 'ongoing') {
      return;
    }

    setIsProcessing(true);

    try {
      let newBattleState = { ...battleState };
      
      // ターン数を増加
      newBattleState.turnCount += 1;

      switch (action) {
        case 'attack':
          newBattleState = handleAttackAction(newBattleState);
          break;
        case 'capture':
          newBattleState = handleCaptureAction(newBattleState);
          break;
        case 'escape':
          newBattleState = handleEscapeAction(newBattleState);
          break;
      }

      // プレイヤーアクション後の状態チェック
      if (newBattleState.status === 'ongoing') {
        // ターンを野生モンスターに切り替え（自動処理はuseEffectで実行）
        newBattleState.currentTurn = switchTurn(newBattleState.currentTurn);
      }

      setBattleState(newBattleState);
      saveBattleState(newBattleState);

      // バトル終了チェック
      if (newBattleState.status !== 'ongoing') {
        setTimeout(() => {
          handleBattleEnd(newBattleState);
        }, 2000);
      }

    } catch (error) {
      console.error('アクション処理中のエラー:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 攻撃アクション処理（Handle attack action）
   * @description プレイヤーの攻撃処理
   * @param currentState - 現在のバトル状態
   * @returns 更新されたバトル状態
   */
  const handleAttackAction = (currentState: BattleState): BattleState => {
    const damage = calculateDamage('player');
    const newWildHp = updateHp(currentState.wildMonster.currentHp, damage);
    
    const newState = {
      ...currentState,
      wildMonster: {
        ...currentState.wildMonster,
        currentHp: newWildHp
      },
      battleLog: [
        ...currentState.battleLog,
        createLogEntry(
          `${currentState.playerMonster.nickname || currentState.playerMonster.speciesName}の攻撃！`,
          'attack'
        ),
        createLogEntry(
          `野生の${currentState.wildMonster.speciesName}に${damage}ダメージ！`,
          'damage'
        )
      ]
    };

    // 野生モンスターのHP確認
    if (newWildHp <= 0) {
      newState.status = 'victory';
      newState.battleLog.push(
        createLogEntry('野生モンスターを倒した！', 'victory')
      );
    }

    return newState;
  };

  /**
   * 捕獲アクション処理（Handle capture action）
   * @description プレイヤーの捕獲試行処理
   * @param currentState - 現在のバトル状態
   * @returns 更新されたバトル状態
   */
  const handleCaptureAction = (currentState: BattleState): BattleState => {
    const newState = { ...currentState };
    
    if (!canCaptureWildMonster(currentState.wildMonster)) {
      newState.battleLog = [
        ...currentState.battleLog,
        createLogEntry('まだ捕獲できない！HPをもっと減らそう', 'info')
      ];
      return newState;
    }

    const success = attemptCapture();
    
    if (success) {
      newState.status = 'captured';
      newState.battleLog = [
        ...currentState.battleLog,
        createLogEntry('捕獲を試行...', 'capture'),
        createLogEntry(`野生の${currentState.wildMonster.speciesName}を捕獲した！`, 'victory')
      ];
    } else {
      newState.battleLog = [
        ...currentState.battleLog,
        createLogEntry('捕獲を試行...', 'capture'),
        createLogEntry('捕獲に失敗した...', 'info')
      ];
    }

    return newState;
  };

  /**
   * 逃走アクション処理（Handle escape action）
   * @description プレイヤーの逃走処理
   * @param currentState - 現在のバトル状態
   * @returns 更新されたバトル状態
   */
  const handleEscapeAction = (currentState: BattleState): BattleState => {
    return {
      ...currentState,
      status: 'escaped',
      battleLog: [
        ...currentState.battleLog,
        createLogEntry('逃走した！', 'escape')
      ]
    };
  };

  /**
   * 野生モンスターのターン処理（Handle wild monster turn）
   * @description 野生モンスターの自動行動
   * @param currentState - 現在のバトル状態
   * @returns 更新されたバトル状態
   */
  const handleWildMonsterTurn = (currentState: BattleState): BattleState => {
    const damage = calculateDamage('wild');
    const newPlayerHp = updateHp(currentState.playerMonster.currentHp, damage);
    
    const newState = {
      ...currentState,
      playerMonster: {
        ...currentState.playerMonster,
        currentHp: newPlayerHp
      },
      battleLog: [
        ...currentState.battleLog,
        createLogEntry(
          `野生の${currentState.wildMonster.speciesName}の攻撃！`,
          'attack'
        ),
        createLogEntry(
          `${currentState.playerMonster.nickname || currentState.playerMonster.speciesName}に${damage}ダメージ！`,
          'damage'
        )
      ]
    };

    // プレイヤーモンスターのHP確認
    if (newPlayerHp <= 0) {
      newState.status = 'defeat';
      newState.battleLog.push(
        createLogEntry(`${currentState.playerMonster.nickname || currentState.playerMonster.speciesName}は倒れた...`, 'defeat')
      );
    } else {
      // バトルが継続する場合、ターンをプレイヤーに切り替え
      newState.currentTurn = switchTurn(currentState.currentTurn);
    }

    return newState;
  };

  /**
   * 野生モンスターのターン実行（Execute wild monster turn）
   * @description 野生モンスターの自動ターン処理
   */
  const executeWildMonsterTurn = async () => {
    if (!battleState || battleState.status !== 'ongoing' || battleState.currentTurn !== 'wild' || isProcessing) {
      return;
    }

    console.log('野生モンスターのターンを実行中...');
    setIsProcessing(true);

    try {
      // 野生モンスターのターン処理
      const newBattleState = handleWildMonsterTurn(battleState);
      
      setBattleState(newBattleState);
      saveBattleState(newBattleState);

      // バトル終了チェック
      if (newBattleState.status !== 'ongoing') {
        setTimeout(() => {
          handleBattleEnd(newBattleState);
        }, 2000);
      }

    } catch (error) {
      console.error('野生モンスターターン処理中のエラー:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * バトル終了処理（Handle battle end）
   * @description バトル終了時の処理と画面遷移
   * @param finalState - 最終的なバトル状態
   */
  const handleBattleEnd = (finalState: BattleState) => {
    const battleResult = createBattleResult(finalState);
    
    // バトル結果を保存
    sessionStorage.setItem('battle_result', JSON.stringify(battleResult));
    
    // バトル状態をクリア
    clearBattleState();
    
    // 結果画面に遷移
    navigate('/battle/result');
  };

  /**
   * バトル中止（Abort battle）
   * @description バトルを途中で終了してマップに戻る
   */
  const handleAbortBattle = () => {
    if (confirm('バトルを中止してマップに戻りますか？')) {
      clearBattleState();
      navigate('/map');
    }
  };

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="prototype-background min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">⚔️</div>
            <p className="text-lg">バトルを準備中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // バトル状態が存在しない場合
  if (!battleState) {
    return (
      <div className="prototype-background min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-lg mb-4">バトルデータが見つかりません</p>
            <Button onClick={() => navigate('/map')}>マップに戻る</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canCapture = canCaptureWildMonster(battleState.wildMonster);

  return (
    <div className="prototype-background min-h-screen">
      <div className="prototype-card max-w-6xl">
        {/* ヘッダー */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚔️</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">バトル</h1>
                <p className="text-sm text-gray-600">
                  ターン {battleState.turnCount} - {battleState.status === 'ongoing' ? '戦闘中' : '終了'}
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAbortBattle}
              className="text-gray-600"
            >
              ← マップに戻る
            </Button>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* バトルエリア */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* モンスター対戦エリア */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 野生モンスター */}
                <MonsterDisplay
                  name={battleState.wildMonster.speciesName}
                  icon={battleState.wildMonster.icon}
                  currentHp={battleState.wildMonster.currentHp}
                  maxHp={battleState.wildMonster.maxHp}
                  isWild={true}
                  isPlayerTurn={battleState.currentTurn === 'player'}
                />
                
                {/* プレイヤーモンスター */}
                <MonsterDisplay
                  name={battleState.playerMonster.nickname || battleState.playerMonster.speciesName}
                  icon={battleState.playerMonster.icon}
                  currentHp={battleState.playerMonster.currentHp}
                  maxHp={battleState.playerMonster.maxHp}
                  isWild={false}
                  isPlayerTurn={battleState.currentTurn === 'player'}
                />
              </div>

              {/* アクションボタン */}
              {battleState.status === 'ongoing' && battleState.currentTurn === 'player' && (
                <ActionButtons
                  onAction={handlePlayerAction}
                  canCapture={canCapture}
                  disabled={isProcessing}
                />
              )}

              {/* 野生モンスターターン表示 */}
              {battleState.status === 'ongoing' && battleState.currentTurn === 'wild' && !isProcessing && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4 text-center">
                    <div className="text-lg text-orange-700 mb-2">
                      🤔 野生モンスターが行動を考えています...
                    </div>
                    <div className="text-sm text-orange-600">
                      まもなく攻撃します
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 処理中表示 */}
              {isProcessing && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4 text-center">
                    <div className="text-lg text-blue-700 mb-2">
                      {battleState.currentTurn === 'wild' ? '⚔️ 野生モンスターの攻撃中...' : '🎯 処理中...'}
                    </div>
                    <div className="text-sm text-blue-600">
                      しばらくお待ちください
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* サイドエリア */}
            <div className="lg:col-span-1">
              {/* バトルログ */}
              <BattleLog battleLog={battleState.battleLog} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}