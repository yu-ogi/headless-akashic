import { RunnerV1Game, RunnerV1_g, RunnerV2Game, RunnerV2_g, RunnerV3Game, RunnerV3_g } from "@akashic/headless-driver";

export interface EngineVersions {
	1: {
		g: RunnerV1_g;
		game: RunnerV1Game;
	};
	2: {
		g: RunnerV2_g;
		game: RunnerV2Game;
	};
	3: {
		g: RunnerV3_g;
		game: RunnerV3Game;
	};
}
