import { RunnerV1, RunnerV2, RunnerV3 } from "@akashic/headless-driver";
import { RunnerGame } from "./types";

type Runner = RunnerV1 | RunnerV2 | RunnerV3;

export type GameClientInstanceType = "active" | "passive";

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
}
