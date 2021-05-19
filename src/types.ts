import { RunnerV1Game, RunnerV1_g, RunnerV2Game, RunnerV2_g, RunnerV3Game, RunnerV3_g } from "@akashic/headless-driver";

export type RunnerGame = RunnerV1Game | RunnerV2Game | RunnerV3Game;

// eslint-disable-next-line @typescript-eslint/naming-convention
export type Runner_g = RunnerV1_g | RunnerV2_g | RunnerV3_g;
