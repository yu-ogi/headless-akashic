<p align="center">
<img src="https://raw.githubusercontent.com/akashic-games/headless-akashic/main/img/akashic.png" />
</p>

# headless-akashic

Akashic コンテンツをヘッドレスで実行するためのモジュールです。
主にテストでの利用を想定しています。

## installation

npm 経由でインストールできます。

```sh
npm install @akashic/headless-akashic -D
```

## usage

任意のテストフレームワーク内で `@akashic/headless-akashic` を require します。

Node.js 上でのサンプルコードは以下になります。

```javascript
const assert = require("assert");
const path = require("path");
const GameContext = require("@akashic/headless-akashic").GameContext;

(async () => {
  const context = new GameContext({
    gameJsonPath: path.join(__dirname, "..", "helloworld", "game.json") // テストする game.json のパス
  });
  const client = await context.getGameClient();

  const game = client.game;
  assert.strictEqual(game.width, 800);
  assert.strictEqual(game.height, 450);
  assert.strictEqual(game.fps, 60);

  await client.advanceTo(() => {
    return game.scene().name === "..." // 最初のシーンをロードするまで進める
  });

  // ...

  await context.destroy();
})();

```

## limitation

### 描画内容の確認および音声の再生に関して

`@akashic/headless-akashic@1.0.0` において、headless-akashic 上で実行されているコンテンツの描画状態を取得することはできません。
同様に音声の再生もサポートしていません。

将来的にはサポートされる予定です。

### ゲームコンテンツ内でのコンストラクタの等価性

ゲームコンテンツ内のあるエンティティ (`g.Sprite` など) とのコンストラクタの等価性を確認したい場合、例えば以下のようなコードは意図しない結果となりえます。

```javascript
import * as g from "@akashic/akashic-engine";
import { GameContext } from "@akashic/headless-akashic";

...

const entity = scene.children[0];
assert(entity instanceof g.Sprite); // entity が g.Sprite であることを確認
```

これは headless-akashic により生成される `g.Sprite` のコンストラクタが、上記のコードから参照されている `@akashic/akashic-engine` と一致しないことに起因しています。

ただし、TypeScript の型として参照する分には問題ありません。

```typescript
import * as g from "@akashic/akashic-engine";
import { GameContext } from "@akashic/headless-akashic";

...

const entity = scene.children[0] as g.Sprite;
assert(entity.src != null); // entity が g.Sprite であることを確認
```

### g および g.game の解決

headless-akashic は、 require しただけではゲームコンテンツの実行環境において存在すべき `g` と `g.game` を自動的には解決しません。
(注: `GameContext#start()` により実行されるゲームコンテンツのスクリプトアセット内では `g` や `g.game` は自動的に解決されます)

`g` に関するモジュール (`g.E` を継承したクラスなど) を単体テストしたいなどのケースでは、利用者自身で `globalThis` への `g` の代入が必要となります。

以下は Node.js 上でのサンプルです。

```javascript
const g = require("@akashic/akashic-engine");
globalThis.g = g;

// 以降 `g` の名前空間が参照可能になります

...

const client = await context.getGameClient();
const game = client.game;

globalThis.g.game = game;

// 以降 `g.game` が参照可能になります

const player = new Player({
  scene: g.game.scene(),
  width: 32,
  height: 32,
  ...
});

...

```
