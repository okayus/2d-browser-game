/**
 * バトル結果画面コンポーネント
 * 初学者向け: バトル後の結果表示とAPI連携の例
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent } from '../components/ui';
import type { BattleResult } from '@monster-game/shared';
import { calculateHpPercentage, getHpBarColor } from '../lib/battle-utils';
import { getStorageData } from '../lib/utils';
import { useAuth } from '../hooks';

/**
 * 結果カードコンポーネント（Result card component）
 * @description バトル結果の表示用カード
 */
interface ResultCardProps {
  title: string;
  icon: string;
  color: string;
  children: React.ReactNode;
}

function ResultCard({ title, icon, color, children }: ResultCardProps) {
  return (
    <Card className={`border-2 ${color}`}>
      <CardContent className="p-6 text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}

/**
 * HPバーコンポーネント（HP bar component）
 * @description モンスターのHP表示用
 */
interface HpDisplayProps {
  currentHp: number;
  maxHp: number;
  name: string;
}

function HpDisplay({ currentHp, maxHp, name }: HpDisplayProps) {
  const hpPercent = calculateHpPercentage(currentHp, maxHp);
  const colorClass = getHpBarColor(hpPercent);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{name}</span>
        <span className="text-gray-600">{currentHp}/{maxHp}</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-500`}
          style={{ width: `${hpPercent}%` }}
        />
      </div>
    </div>
  );
}

/**
 * 捕獲したモンスター表示コンポーネント（Captured monster display）
 * @description 捕獲成功時のモンスター情報表示
 */
interface CapturedMonsterDisplayProps {
  monster: NonNullable<BattleResult['capturedMonster']>;
}

function CapturedMonsterDisplay({ monster }: CapturedMonsterDisplayProps) {
  const monsterTypes = getStorageData<Array<{ id: string; icon: string }>>('monster_types', []);
  const species = monsterTypes?.find((s) => s.id === monster.speciesId);
  const icon = species?.icon || '🎮';

  return (
    <Card className="border-2 border-green-500 bg-green-50">
      <CardContent className="p-6 text-center">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-lg font-bold text-green-800 mb-2">
          {monster.nickname}
        </h3>
        <p className="text-sm text-green-600 mb-4">
          種族: {monster.speciesName}
        </p>
        <HpDisplay 
          currentHp={monster.currentHp}
          maxHp={monster.maxHp}
          name="新しい仲間"
        />
      </CardContent>
    </Card>
  );
}

/**
 * バトル統計表示コンポーネント（Battle statistics display）
 * @description バトルの統計情報表示
 */
interface BattleStatsProps {
  totalTurns: number;
  battleLog: BattleResult['battleLog'];
}

function BattleStats({ totalTurns, battleLog }: BattleStatsProps) {
  const attackCount = battleLog.filter(log => log.type === 'attack').length;

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-bold text-gray-900 mb-3">📊 バトル統計</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalTurns}</div>
            <div className="text-gray-600">総ターン数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{attackCount}</div>
            <div className="text-gray-600">攻撃回数</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * バトル結果画面のメインコンポーネント（Main battle result component）
 * @description バトル終了後の結果表示とAPI連携処理
 */
export function BattleResultPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingReward, setIsProcessingReward] = useState(false);
  const [rewardProcessed, setRewardProcessed] = useState(false);

  /**
   * バトル報酬処理（Process battle rewards）
   * @description 捕獲成功時のモンスター獲得とHP更新API呼び出し
   * @param result - バトル結果データ
   */
  const processBattleRewards = useCallback(async (result: BattleResult) => {
    if (!currentUser || rewardProcessed) return;

    setIsProcessingReward(true);

    try {
      const playerId = getStorageData<string>('player_id');
      if (!playerId) {
        throw new Error('プレイヤーIDが見つかりません');
      }

      // プレイヤーモンスターのHP更新（バトル後のHP反映）
      await updatePlayerMonsterHp(result.playerMonster);

      // 捕獲成功の場合、新しいモンスターを獲得
      if (result.status === 'captured' && result.capturedMonster) {
        await addCapturedMonster(playerId, result.capturedMonster);
      }

      setRewardProcessed(true);

    } catch (error) {
      console.error('報酬処理中のエラー:', error);
    } finally {
      setIsProcessingReward(false);
    }
  }, [currentUser, rewardProcessed]);

  /**
   * 継続ボタン処理（Handle continue）
   * @description マップ画面に戻る
   */
  const handleContinue = useCallback(() => {
    // バトル結果データをクリア
    sessionStorage.removeItem('battle_result');
    sessionStorage.removeItem('battle_init');
    navigate('/map');
  }, [navigate]);

  /**
   * モンスター一覧表示（Show monster list）
   * @description モンスター一覧画面に遷移
   */
  const handleShowMonsters = useCallback(() => {
    // バトル結果データをクリア
    sessionStorage.removeItem('battle_result');
    sessionStorage.removeItem('battle_init');
    navigate('/monsters');
  }, [navigate]);

  /**
   * バトル敗北時の回復処理（Process defeat recovery）
   * @description 敗北時にプレイヤーモンスターのHPを最大値に戻す
   * @param result - バトル結果データ
   */
  const processDefeatRecovery = useCallback(async (result: BattleResult) => {
    if (!currentUser || rewardProcessed) return;

    setIsProcessingReward(true);

    try {
      console.log('バトル敗北：HP回復処理を開始...');
      
      // プレイヤーモンスターのHPを最大値に回復
      const recoveredMonster = {
        ...result.playerMonster,
        currentHp: result.playerMonster.maxHp
      };

      await updatePlayerMonsterHp(recoveredMonster);
      
      console.log('HP回復処理が完了しました');
      setRewardProcessed(true);

      // 2秒後にマップ画面に自動遷移
      setTimeout(() => {
        handleContinue();
      }, 2000);

    } catch (error) {
      console.error('HP回復処理中のエラー:', error);
    } finally {
      setIsProcessingReward(false);
    }
  }, [currentUser, rewardProcessed, handleContinue]);

  /**
   * コンポーネント初期化（Component initialization）
   * @description バトル結果の読み込みと表示
   */
  useEffect(() => {
    const loadBattleResult = () => {
      try {
        const resultData = sessionStorage.getItem('battle_result');
        if (!resultData) {
          console.error('バトル結果データが見つかりません');
          navigate('/map');
          return;
        }

        const result: BattleResult = JSON.parse(resultData);
        setBattleResult(result);
        setIsLoading(false);

        // 報酬処理を開始
        if (result.status === 'captured' || result.status === 'victory') {
          processBattleRewards(result);
        } else if (result.status === 'defeat') {
          // 敗北時はHP回復処理を実行
          processDefeatRecovery(result);
        }

      } catch (error) {
        console.error('バトル結果の読み込みに失敗:', error);
        navigate('/map');
      }
    };

    loadBattleResult();
  }, [navigate, processBattleRewards, processDefeatRecovery]);

  /**
   * プレイヤーモンスターのHP更新（Update player monster HP）
   * @description バトル後のプレイヤーモンスターHP更新API呼び出し
   * @param playerMonster - 更新するプレイヤーモンスター
   */
  const updatePlayerMonsterHp = async (playerMonster: BattleResult['playerMonster']) => {
    try {
      // 開発環境では認証なしのテストエンドポイントを使用
      const isDevelopment = window.location.hostname === 'localhost';
      let response: Response;
      
      if (isDevelopment) {
        console.log('開発環境：認証なしエンドポイントを使用（モンスターHP更新）');
        response = await fetch(`/api/test/monsters/${playerMonster.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            currentHp: playerMonster.currentHp
          })
        });
      } else {
        const token = await currentUser?.getIdToken();
        if (!token) throw new Error('認証トークンが取得できません');

        response = await fetch(`/api/monsters/${playerMonster.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentHp: playerMonster.currentHp
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'レスポンス解析エラー' }));
        console.error('HP更新APIエラー:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          endpoint: isDevelopment ? `/api/test/monsters/${playerMonster.id}` : `/api/monsters/${playerMonster.id}`
        });
        throw new Error(`プレイヤーモンスターのHP更新に失敗: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('プレイヤーモンスターのHPを更新しました:', responseData);

    } catch (error) {
      console.error('HP更新エラー:', error);
      throw error;
    }
  };

  /**
   * 捕獲したモンスターの追加（Add captured monster）
   * @description 捕獲成功時の新しいモンスター獲得API呼び出し
   * @param playerId - プレイヤーID
   * @param capturedMonster - 捕獲したモンスター
   */
  const addCapturedMonster = async (playerId: string, capturedMonster: NonNullable<BattleResult['capturedMonster']>) => {
    try {
      // 開発環境では認証なしのテストエンドポイントを使用
      const isDevelopment = window.location.hostname === 'localhost';
      let response: Response;
      
      if (isDevelopment) {
        console.log('開発環境：認証なしエンドポイントを使用（モンスター追加）');
        // 開発環境用のテストエンドポイントが存在しない場合は処理をスキップ
        console.warn('開発環境：モンスター追加のテストエンドポイントが未実装のため処理をスキップします');
        return;
      } else {
        const token = await currentUser?.getIdToken();
        if (!token) throw new Error('認証トークンが取得できません');

        response = await fetch(`/api/players/${playerId}/monsters`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            speciesId: capturedMonster.speciesId
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'レスポンス解析エラー' }));
          console.error('モンスター追加APIエラー:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          throw new Error(`捕獲したモンスターの追加に失敗: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('捕獲したモンスターを追加しました:', responseData);
      }

    } catch (error) {
      console.error('モンスター追加エラー:', error);
      throw error;
    }
  };


  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="prototype-background min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg">結果を集計中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // バトル結果が存在しない場合
  if (!battleResult) {
    return (
      <div className="prototype-background min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-lg mb-4">バトル結果が見つかりません</p>
            <Button onClick={() => navigate('/map')}>マップに戻る</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 結果に応じたカードの設定
  const getResultConfig = () => {
    switch (battleResult.status) {
      case 'victory':
        return {
          title: '勝利！',
          icon: '🏆',
          color: 'border-yellow-500 bg-yellow-50'
        };
      case 'captured':
        return {
          title: '捕獲成功！',
          icon: '🎯',
          color: 'border-green-500 bg-green-50'
        };
      case 'defeat':
        return {
          title: '敗北...',
          icon: '💔',
          color: 'border-red-500 bg-red-50'
        };
      case 'escaped':
        return {
          title: '逃走成功',
          icon: '🏃',
          color: 'border-gray-500 bg-gray-50'
        };
      default:
        return {
          title: 'バトル終了',
          icon: '⚔️',
          color: 'border-blue-500 bg-blue-50'
        };
    }
  };

  const resultConfig = getResultConfig();

  return (
    <div className="prototype-background min-h-screen">
      <div className="prototype-card max-w-4xl">
        {/* ヘッダー */}
        <header className="mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📊</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">バトル結果</h1>
              <p className="text-sm text-gray-600">
                {battleResult.totalTurns}ターンで終了
              </p>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main>
          <div className="space-y-6">
            
            {/* メイン結果カード */}
            <ResultCard 
              title={resultConfig.title}
              icon={resultConfig.icon}
              color={resultConfig.color}
            >
              <div className="space-y-4">
                {/* 結果メッセージ */}
                <div className="text-gray-700">
                  {battleResult.status === 'victory' && '野生モンスターを倒しました！'}
                  {battleResult.status === 'captured' && '野生モンスターを捕獲しました！'}
                  {battleResult.status === 'defeat' && 'モンスターが倒れてしまいました...'}
                  {battleResult.status === 'escaped' && '無事に逃げることができました'}
                </div>

                {/* 処理中表示 */}
                {isProcessingReward && (
                  <div className="text-sm text-blue-600">
                    {battleResult.status === 'defeat' 
                      ? 'モンスターを回復中...' 
                      : '報酬を処理中...'
                    }
                  </div>
                )}

                {/* 敗北時の自動遷移メッセージ */}
                {battleResult.status === 'defeat' && rewardProcessed && (
                  <div className="text-sm text-green-600">
                    HPが回復しました！マップ画面に戻ります...
                  </div>
                )}
              </div>
            </ResultCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* 左側 */}
              <div className="space-y-6">
                
                {/* 捕獲したモンスター表示 */}
                {battleResult.status === 'captured' && battleResult.capturedMonster && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">🎉 新しい仲間</h3>
                    <CapturedMonsterDisplay monster={battleResult.capturedMonster} />
                  </div>
                )}

                {/* プレイヤーモンスターの状態 */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">👥 あなたのモンスター</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{battleResult.playerMonster.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {battleResult.playerMonster.nickname || battleResult.playerMonster.speciesName}
                          </h4>
                          <div className="mt-2">
                            <HpDisplay 
                              currentHp={battleResult.playerMonster.currentHp}
                              maxHp={battleResult.playerMonster.maxHp}
                              name="HP"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* 右側 */}
              <div className="space-y-6">
                
                {/* バトル統計 */}
                <BattleStats 
                  totalTurns={battleResult.totalTurns}
                  battleLog={battleResult.battleLog}
                />

                {/* バトルログ（最後の5件） */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-gray-900 mb-3">📝 バトルログ</h3>
                    <div className="space-y-2 text-sm">
                      {battleResult.battleLog.slice(-5).map((log) => (
                        <div
                          key={log.id}
                          className="px-2 py-1 rounded bg-gray-50 text-gray-700"
                        >
                          {log.message}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
              <Button
                onClick={handleContinue}
                variant="primary"
                className="px-8 py-3 text-lg"
              >
                🗺️ マップに戻る
              </Button>
              
              {(battleResult.status === 'captured' || battleResult.status === 'victory') && (
                <Button
                  onClick={handleShowMonsters}
                  variant="secondary"
                  className="px-8 py-3 text-lg"
                >
                  🎒 モンスター一覧
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}