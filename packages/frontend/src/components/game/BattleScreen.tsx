/**
 * バトル画面コンポーネント
 * ターン制バトルのメイン画面を実装
 */
import React, { useState, useEffect, useRef } from 'react'
import { BattleField } from './BattleField'
import { BattleActions } from './BattleActions'
import { BattleLog } from './BattleLog'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import type { Monster } from '../../types'
import { monsterAPI } from '../../api'
import { usePlayer } from '../../hooks/usePlayer'
import { useMonsters } from '../../hooks/useMonsters'

/**
 * バトル画面のプロパティ
 */
interface BattleScreenProps {
  /** プレイヤーのモンスター */
  playerMonster: Monster
  /** バトル終了時のコールバック */
  onBattleEnd: () => void
}

/**
 * バトルログエントリーの型定義
 */
export interface BattleLogEntry {
  /** ログID */
  id: string
  /** ログメッセージ */
  message: string
  /** ログタイプ */
  type: 'info' | 'attack' | 'damage' | 'capture' | 'victory' | 'defeat'
}

/**
 * 固定の敵モンスターデータ
 * バックエンドスキーマに合わせてHPのみ使用
 */
const WILD_FLAME_BEAST: Monster = {
  id: 'wild-flame-beast',
  name: 'フレイムビースト',
  type: 'fire',
  level: 5,
  hp: 100,
  maxHp: 100,
  imageUrl: '/images/monsters/flame-beast.png'
}

/**
 * バトル画面コンポーネント
 * バトルロジックとUI統合
 */
export function BattleScreen({ playerMonster, onBattleEnd }: BattleScreenProps) {
  // プレイヤー情報（API統合用）
  const { player } = usePlayer()
  const { refreshMonsters } = useMonsters()
  
  // バトル状態
  const [wildMonster, setWildMonster] = useState<Monster>({
    ...WILD_FLAME_BEAST,
    hp: WILD_FLAME_BEAST.maxHp
  })
  const [playerMon, setPlayerMon] = useState<Monster>({
    ...playerMonster,
    hp: playerMonster.hp || playerMonster.maxHp
  })
  const [turn, setTurn] = useState<'player' | 'enemy'>('player')
  const [battleStatus, setBattleStatus] = useState<'active' | 'won' | 'lost' | 'fled'>('active')
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const logIdCounter = useRef(0)

  /**
   * バトルログ追加
   */
  const addLog = (message: string, type: BattleLogEntry['type'] = 'info') => {
    logIdCounter.current += 1
    setBattleLog(prev => [...prev, {
      id: `battle-log-${logIdCounter.current}`,
      message,
      type
    }])
  }

  /**
   * ターン順決定（現在HPが高い方が先攻）
   */
  const determineTurnOrder = (): 'player' | 'enemy' => {
    return playerMon.hp >= wildMonster.hp ? 'player' : 'enemy'
  }

  /**
   * バトル開始時の初期化
   */
  useEffect(() => {
    addLog('野生のフレイムビーストが現れた！', 'info')
    // ターン順決定
    const firstTurn = determineTurnOrder()
    setTurn(firstTurn)
    if (firstTurn === 'enemy') {
      addLog('相手のHPが高い！敵の先攻！', 'info')
    } else {
      addLog('あなたのHPが高い！先攻できる！', 'info')
    }
  }, [])

  /**
   * ダメージ計算
   * 簡単なランダムダメージ（20-30の範囲）
   */
  const calculateDamage = (): number => {
    // 20-30のランダムダメージ
    return Math.floor(Math.random() * 11) + 20
  }

  /**
   * 攻撃処理
   */
  const handleAttack = async () => {
    if (isProcessing || battleStatus !== 'active') return

    setIsProcessing(true)

    // プレイヤーの攻撃
    const damage = calculateDamage()
    addLog(`${playerMon.name}の攻撃！`, 'attack')
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newWildHp = Math.max(0, wildMonster.hp - damage)
    setWildMonster(prev => ({ ...prev, hp: newWildHp }))
    addLog(`フレイムビーストに${damage}のダメージ！`, 'damage')

    await new Promise(resolve => setTimeout(resolve, 500))

    // 敵が倒れた場合
    if (newWildHp === 0) {
      addLog('フレイムビーストを倒した！', 'victory')
      setBattleStatus('won')
      
      // バトル終了時にプレイヤーモンスターのHP更新
      try {
        await monsterAPI.updateHp(playerMon.id, playerMon.hp)
        addLog('モンスターの状態を保存しました', 'info')
        // モンスター一覧を更新
        await refreshMonsters()
      } catch (error) {
        console.error('HP更新エラー:', error)
        addLog('状態保存に失敗しました', 'info')
      }
      
      setIsProcessing(false)
      return
    }

    // 敵の攻撃
    setTurn('enemy')
    await new Promise(resolve => setTimeout(resolve, 1000))

    const enemyDamage = calculateDamage()
    addLog(`フレイムビーストの攻撃！`, 'attack')
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newPlayerHp = Math.max(0, playerMon.hp - enemyDamage)
    setPlayerMon(prev => ({ ...prev, hp: newPlayerHp }))
    addLog(`${playerMon.name}に${enemyDamage}のダメージ！`, 'damage')

    // プレイヤーが倒れた場合
    if (newPlayerHp === 0) {
      addLog(`${playerMon.name}は倒れてしまった...`, 'defeat')
      setBattleStatus('lost')
      
      // バトル終了時にプレイヤーモンスターのHP更新
      try {
        await monsterAPI.updateHp(playerMon.id, 0)
        addLog('モンスターの状態を保存しました', 'info')
        // モンスター一覧を更新
        await refreshMonsters()
      } catch (error) {
        console.error('HP更新エラー:', error)
        addLog('状態保存に失敗しました', 'info')
      }
      
      setIsProcessing(false)
      return
    }

    // 次のターン順をHPベースで決定
    const nextTurn = determineTurnOrder()
    setTurn(nextTurn)
    setIsProcessing(false)
    
    // 敵のターンの場合は自動で攻撃
    if (nextTurn === 'enemy') {
      setTimeout(() => handleEnemyTurn(), 1000)
    }
  }

  /**
   * 捕獲処理
   */
  const handleCapture = async () => {
    if (isProcessing || battleStatus !== 'active') return

    setIsProcessing(true)
    addLog(`モンスターボールを投げた！`, 'capture')

    await new Promise(resolve => setTimeout(resolve, 1000))

    // 捕獲成功率計算（HP30%以下で35%の確率）
    const hpRatio = wildMonster.hp / wildMonster.maxHp
    const captureRate = hpRatio <= 0.3 ? 0.35 : 0.1

    if (Math.random() < captureRate) {
      addLog('やった！フレイムビーストを捕まえた！', 'capture')
      setBattleStatus('won')
      
      // バックエンドAPIでモンスター捕獲
      try {
        if (player) {
          await monsterAPI.capture(
            player.id,
            'flame-beast', // フレイムビーストの種族ID
            'フレイムビースト', // ニックネーム
            wildMonster.hp, // 現在HP
            wildMonster.maxHp // 最大HP
          )
          addLog('捕獲したモンスターを登録しました！', 'capture')
        }
      } catch (error) {
        console.error('モンスター捕獲エラー:', error)
        addLog('捕獲の登録に失敗しました', 'info')
      }
      
      // プレイヤーモンスターのHP更新も実行
      try {
        await monsterAPI.updateHp(playerMon.id, playerMon.hp)
        // モンスター一覧を更新（新しく捕獲したモンスターを含む）
        await refreshMonsters()
      } catch (error) {
        console.error('HP更新エラー:', error)
      }
    } else {
      addLog('だめだ！捕まらなかった！', 'info')
      // 次のターン順をHPベースで決定
      const nextTurn = determineTurnOrder()
      setTurn(nextTurn)
      
      // 敵のターンの場合は自動で攻撃
      if (nextTurn === 'enemy') {
        setTimeout(() => handleEnemyTurn(), 1000)
      }
    }

    setIsProcessing(false)
  }

  /**
   * 敵のターン処理
   */
  const handleEnemyTurn = async () => {
    setTurn('enemy')
    await new Promise(resolve => setTimeout(resolve, 1000))

    const damage = calculateDamage()
    addLog(`フレイムビーストの攻撃！`, 'attack')
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newPlayerHp = Math.max(0, playerMon.hp - damage)
    setPlayerMon(prev => ({ ...prev, hp: newPlayerHp }))
    addLog(`${playerMon.name}に${damage}のダメージ！`, 'damage')

    if (newPlayerHp === 0) {
      addLog(`${playerMon.name}は倒れてしまった...`, 'defeat')
      setBattleStatus('lost')
      
      // プレイヤー敗北時もHP更新
      try {
        await monsterAPI.updateHp(playerMon.id, 0)
        // モンスター一覧を更新
        await refreshMonsters()
      } catch (error) {
        console.error('HP更新エラー:', error)
      }
    } else {
      // 次のターン順をHPベースで決定
      const nextTurn = determineTurnOrder()
      setTurn(nextTurn)
      
      // 敵のターンが続く場合は再度攻撃
      if (nextTurn === 'enemy') {
        setTimeout(() => handleEnemyTurn(), 1500)
      }
    }
  }

  /**
   * 逃走処理
   */
  const handleRun = async () => {
    if (isProcessing || battleStatus !== 'active') return

    setIsProcessing(true)
    addLog('うまく逃げ切れた！', 'info')
    setBattleStatus('fled')
    
    // 逃走時もプレイヤーモンスターのHP更新
    try {
      await monsterAPI.updateHp(playerMon.id, playerMon.hp)
      addLog('モンスターの状態を保存しました', 'info')
      // モンスター一覧を更新
      await refreshMonsters()
    } catch (error) {
      console.error('HP更新エラー:', error)
      addLog('状態保存に失敗しました', 'info')
    }
    
    setIsProcessing(false)
  }

  /**
   * バトル終了画面
   */
  if (battleStatus !== 'active') {
    return (
      <div className="prototype-card max-w-2xl mx-auto mt-8">
        <h2 className="text-2xl font-bold text-center mb-4">
          {battleStatus === 'won' && 'バトル勝利！'}
          {battleStatus === 'lost' && 'バトル敗北...'}
          {battleStatus === 'fled' && '逃走成功！'}
        </h2>
        
        <div className="text-center mb-6">
          {battleStatus === 'won' && (
            <p className="text-lg text-green-600">
              フレイムビーストに勝利した！
            </p>
          )}
          {battleStatus === 'lost' && (
            <p className="text-lg text-red-600">
              {playerMon.name}は倒れてしまった...
            </p>
          )}
          {battleStatus === 'fled' && (
            <p className="text-lg text-blue-600">
              戦闘から逃げ出した！
            </p>
          )}
        </div>

        <div className="flex justify-center">
          <Button onClick={onBattleEnd} size="lg">
            マップに戻る
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="prototype-card max-w-4xl mx-auto mt-8" data-testid="battle-screen">
      {/* バトルメッセージ */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">野生のフレイムビーストが現れた！</h2>
      </div>

      {/* バトルフィールド */}
      <BattleField
        wildMonster={wildMonster}
        playerMonster={playerMon}
        isPlayerTurn={turn === 'player'}
      />

      {/* バトルアクション */}
      <BattleActions
        onAttack={handleAttack}
        onCapture={handleCapture}
        onRun={handleRun}
        disabled={turn !== 'player' || isProcessing}
        captureEnabled={wildMonster.hp / wildMonster.maxHp <= 0.3}
      />

      {/* バトルログ */}
      <Card className="mt-4 p-4">
        <BattleLog entries={battleLog} />
      </Card>
    </div>
  )
}