import { PlayManager, RunnerManager, setSystemLogger } from "@akashic/headless-driver";
import { activePermission, EMPTY_V3_PATH, passivePermission } from "./constants";
import { GameClient } from "./GameClient";
import { DefaultLogger } from "./loggers/DefaultLogger";
import { VerboseLogger } from "./loggers/VerboseLogger";
import { RunnerGame } from "./types";

export interface GameContextParameterObject {
	/**
	 * game.json のパス。
	 * 省略した場合、空のゲームコンテンツを起動する。詳細は README を参照のこと。
	 */
	gameJsonPath?: string;

	/**
	 * 詳細な実行ログを出力するかどうか。
	 * 省略した場合は `false` 。
	 */
	verbose?: boolean;
}

/**
 * ゲームのコンテキスト。
 * 一つのゲームに対して一つのみ存在する。
 */
export class GameContext {
	protected params: GameContextParameterObject;
	protected playManager: PlayManager;
	protected runnerManager: RunnerManager;
	protected playId: string | null = null;

	constructor(params: GameContextParameterObject) {
		if (params.verbose) {
			setSystemLogger(new VerboseLogger());
		} else {
			setSystemLogger(new DefaultLogger());
		}
		this.params = params;
		this.playManager = new PlayManager();
		this.runnerManager = new RunnerManager(this.playManager);
	}

	/**
	 * active の GameClient を返す。
	 */
	async getGameClient(): Promise<GameClient<RunnerGame>> {
		const { playManager, runnerManager } = this;
		const { gameJsonPath } = this.params;

		if (this.playId != null) {
			await this.playManager.deletePlay(this.playId);
		}

		const playId = await playManager.createPlay({
			gameJsonPath: gameJsonPath ?? EMPTY_V3_PATH
		});
		this.playId = playId;

		const playToken = playManager.createPlayToken(playId, activePermission);
		const amflow = playManager.createAMFlow(playId);

		const runnerId = await runnerManager.createRunner({
			playId,
			amflow,
			playToken,
			executionMode: "active",
			allowedUrls: null
		});

		const runner = runnerManager.getRunner(runnerId)!;
		runner.errorTrigger.add(this.handleRunnerError, this);
		const game = (await runnerManager.startRunner(runnerId)) as RunnerGame;
		runner.pause();

		return new GameClient({ runner, game, type: "active" });
	}

	/**
	 * passive の GameClient を生成する。
	 */
	async createPassiveGameClient(): Promise<GameClient<RunnerGame>> {
		const { playManager, runnerManager, playId } = this;

		if (playId == null) {
			throw new Error("Cannot create the client before starting");
		}

		const playToken = playManager.createPlayToken(playId, passivePermission);
		const amflow = playManager.createAMFlow(playId);

		const runnerId = await runnerManager.createRunner({
			playId,
			amflow,
			playToken,
			executionMode: "passive",
			allowedUrls: null
		});

		const runner = runnerManager.getRunner(runnerId)!;
		const game = (await runnerManager.startRunner(runnerId)) as RunnerGame;
		runner.errorTrigger.add(this.handleRunnerError, this);
		runner.pause();

		return new GameClient({ runner, game, type: "passive" });
	}

	/**
	 * GameContext を破棄する。
	 */
	async destroy(): Promise<void> {
		const { playManager, runnerManager, playId } = this;

		const runners = runnerManager.getRunners();
		for (let i = 0; i < runners.length; i++) {
			const runner = runners[i];
			runner.stop();
			runner.errorTrigger.remove(this.handleRunnerError, this);
		}

		if (playId) {
			playManager.deletePlay(playId);
			this.playId = null;
		}
	}

	/**
	 * GameContext の状態を指定ミリ秒だけ進める。
	 * @param ms 進めるミリ秒
	 */
	async advance(ms: number): Promise<void> {
		const { runnerManager } = this;
		const runners = runnerManager.getRunners();
		for (let i = 0; i < runners.length; i++) {
			await runners[i].advance(ms);
		}
	}

	/**
	 * GameContext の状態を一フレームだけ進める。
	 */
	step(): void {
		const { runnerManager } = this;
		const runners = runnerManager.getRunners();
		for (let i = 0; i < runners.length; i++) {
			runners[i].step();
		}
	}

	protected handleRunnerError(err: any): void {
		throw err;
	}
}
