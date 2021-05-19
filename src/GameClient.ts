import { RunnerAdvanceConditionFunc, RunnerRenderingMode, RunnerV1, RunnerV2, RunnerV3 } from "@akashic/headless-driver";
import { Canvas } from "canvas";
import { RunnerGame, Runner_g } from "./types";

type Runner = RunnerV1 | RunnerV2 | RunnerV3;

export type GameClientInstanceType = "active" | "passive";

export interface GameClientParameterObject<Game extends RunnerGame> {
	runner: Runner;
	game: Game;
	type: GameClientInstanceType;
	renderingMode: RunnerRenderingMode;
}

/**
 * ゲームクライアント。
 */
export class GameClient<G extends Runner_g, Game extends RunnerGame> {
	/**
	 * `g.game` の値。
	 */
	readonly game: Game;

	/**
	 * ゲームインスタンスの種別。
	 */
	readonly type: GameClientInstanceType;

	/**
	 * `g` の値。 `g.game` は `undefined` である点に注意。
	 */
	readonly g: G;

	protected runner: Runner;
	protected renderingMode: RunnerRenderingMode;

	constructor({ runner, game, type, renderingMode }: GameClientParameterObject<Game>) {
		this.runner = runner;
		this.game = game;
		this.type = type;
		this.renderingMode = renderingMode;
		this.g = runner.g as G;
	}

	/**
	 * 任意の g.PointDownEvent を送信する。
	 *
	 * @param x x座標
	 * @param y y座標
	 * @param identifier ポイントを識別するためのID
	 */
	sendPointDown(x: number, y: number, identifier: number): void {
		this.runner.firePointEvent({
			type: "down",
			identifier,
			offset: {
				x,
				y
			}
		});
	}

	/**
	 * 任意の g.PointMoveEvent を送信する。
	 *
	 * @param x x座標
	 * @param y y座標
	 * @param identifier ポイントを識別するためのID
	 */
	sendPointMove(x: number, y: number, identifier: number): void {
		this.runner.firePointEvent({
			type: "move",
			identifier,
			offset: {
				x,
				y
			}
		});
	}

	/**
	 * 任意の g.PointUpEvent を送信する。
	 *
	 * @param x x座標
	 * @param y y座標
	 * @param identifier ポイントを識別するためのID
	 */
	sendPointUp(x: number, y: number, identifier: number): void {
		this.runner.firePointEvent({
			type: "up",
			identifier,
			offset: {
				x,
				y
			}
		});
	}

	/**
	 * 任意の g.MessageEvent を送信する。
	 * @param message メッセージ
	 * @param playerId プレイヤーID
	 */
	sendMessage(message: any, playerId?: string): void {
		this.runner.amflow.sendEvent([0x20, 0, playerId, message]);
	}

	/**
	 * ゲームの描画内容を取得し、そのデータを取得する。
	 */
	getPrimarySurfaceCanvas(): Canvas {
		const mode = this.renderingMode;

		if (mode === "canvas") {
			if (this.runner instanceof RunnerV3) {
				return this.runner.getPrimarySurfaceCanvas();
			}
			throw new Error("GameClient#getPrimarySurface(): renderingMode 'canvas' is only supported on akashic-engine@^3.0.0");
		}

		throw new Error(`GameClient#getPrimarySurface(): renderingMode "${mode}" is not supported`);
	}

	/**
	 * 引数に指定した関数が真を返すまでゲームの状態を進める。
	 * @param condition 進めるまでの条件となる関数。
	 * @param timeout タイムアウトまでのミリ秒数。省略時は `5000` 。ゲーム内時間ではなく実時間である点に注意。
	 */
	async advanceUntil(condition: RunnerAdvanceConditionFunc, timeout: number = 5000): Promise<void> {
		return this.runner.advanceUntil(condition, timeout);
	}
}
