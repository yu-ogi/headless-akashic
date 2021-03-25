import { RunnerV1, RunnerV2, RunnerV3 } from "@akashic/headless-driver";
import { RunnerGame } from "./types";

type Runner = RunnerV1 | RunnerV2 | RunnerV3;

export type GameClientInstanceType = "active" | "passive";

export type GameClientConditionFunc = () => boolean;

export interface GameClientParameterObject<T extends RunnerGame> {
	runner: Runner;
	game: T;
	type: GameClientInstanceType;
}

/**
 * ゲームクライアント。
 */
export class GameClient<T extends RunnerGame> {
	/**
	 * `g.game` の値。
	 */
	readonly game: T;

	readonly type: GameClientInstanceType;

	protected runner: Runner;

	constructor({ runner, game, type }: GameClientParameterObject<T>) {
		this.runner = runner;
		this.game = game;
		this.type = type;
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
	 * 引数に指定した関数が真を返すまでゲームの状態を進める。
	 * @param condition 進めるまでの条件となる関数。
	 * @param timeout タイムアウトまでのミリ秒数。省略時は `5000` 。ゲーム内時間ではなく実時間である点に注意。
	 */
	async advanceUntil(condition: GameClientConditionFunc, timeout: number = 5000): Promise<void> {
		return new Promise((resolve, reject) => {
			const limit = Date.now() + timeout;
			const handler = (): void => {
				if (limit < Date.now()) {
					return void reject(new Error("GameClient#advanceUntil(): processing timeout"));
				}
				try {
					if (condition()) return void resolve();
					this.runner.step();
				} catch (e) {
					return void reject(e);
				}
				setImmediate(handler);
			};
			handler();
		});
	}
}
