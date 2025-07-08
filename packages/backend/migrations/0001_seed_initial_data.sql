-- 初期データの投入
-- 初学者向けメモ：ゲーム開始時に必要な基本的なモンスター種族データを投入

-- モンスター種族データの挿入
INSERT INTO monster_species (id, name, base_hp, description, created_at, updated_at) VALUES
  ('electric_mouse', 'でんきネズミ', 35, '黄色い毛並みと長い耳が特徴的な電気タイプのモンスター。頬の電気袋から電撃を放つ。', unixepoch(), unixepoch()),
  ('fire_lizard', 'ほのおトカゲ', 40, '尻尾に炎を灯す小型の爬虫類モンスター。感情が高ぶると炎が大きくなる。', unixepoch(), unixepoch()),
  ('water_turtle', 'みずガメ', 45, '青い甲羅を持つ亀型のモンスター。甲羅から強力な水流を放つことができる。', unixepoch(), unixepoch()),
  ('grass_seed', 'くさダネ', 45, '背中に大きな球根を持つ植物型モンスター。光合成でエネルギーを蓄える。', unixepoch(), unixepoch()),
  ('rock_snake', 'いわヘビ', 50, '岩でできた巨大な蛇型モンスター。地中を自在に移動できる。', unixepoch(), unixepoch());

-- 初学者向けメモ：
-- unixepoch() はSQLiteの関数で、現在のUnixタイムスタンプ（秒）を取得します
-- D1はSQLiteベースなので、SQLiteの組み込み関数が使用できます