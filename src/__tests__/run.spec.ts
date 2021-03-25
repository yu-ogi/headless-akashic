import * as path from "path";
import { GameContext } from "..";

const gameJsonPath = path.resolve(__dirname, "fixtures", "helloworld", "game.json");

describe("run content", () => {
	it("empty content", async () => {
		const context = new GameContext({});
		const activeClient = await context.getGameClient();
		const game = activeClient.game;
		expect(game.width).toBe(1280);
		expect(game.height).toBe(720);
		expect(game.fps).toBe(60);
	});

	it("helloworld", async () => {
		const context = new GameContext({ gameJsonPath });
		const activeClient = await context.getGameClient();

		expect(activeClient.type).toBe("active");

		const game = activeClient.game!;
		expect(game.width).toBe(800);
		expect(game.height).toBe(450);
		expect(game.fps).toBe(60);

		// advance to the entry scene
		await activeClient.advanceUntil(() => activeClient.game.scene().name === "entry-scene");

		const activeClientScene = activeClient.game.scene()!;
		expect(activeClientScene).toBeDefined();
		expect(Object.keys(activeClientScene.assets).length).toBe(4); // player, shot, se, dummy_text
		expect(activeClientScene.children.length).toBe(1);

		const passiveClient = await context.createPassiveGameClient();
		expect(passiveClient.type).toBe("passive");

		// advance to the entry scene
		await passiveClient.advanceUntil(() => passiveClient.game.scene().name === "entry-scene");

		const passiveClientScene = passiveClient.game.scene()!;
		// same as the active client
		expect(passiveClientScene).toBeDefined();
		expect(Object.keys(passiveClientScene.assets).length).toBe(4);
		expect(passiveClientScene.children.length).toBe(1);

		// generate a sprite (shot) if clicked on the game canvas
		activeClient.sendPointDown(Math.ceil(Math.random() * game.width), Math.ceil(Math.random() * game.height), 0);
		context.step();
		expect(activeClientScene.children.length).toBe(2);

		activeClient.sendPointDown(Math.ceil(Math.random() * game.width), Math.ceil(Math.random() * game.height), 0);
		context.step();
		expect(activeClientScene.children.length).toBe(3);

		// enough time passed, must be removed all shot sprites
		await context.advance(3000);
		expect(activeClientScene.children.length).toBe(1);

		await context.destroy();
	});

	it("verbose = false", async () => {
		const consoleLogSpy = jest.spyOn(console, "log");

		const context = new GameContext({ gameJsonPath, verbose: false });
		await context.getGameClient();

		// 一切のログが出力されていないことを確認
		expect(consoleLogSpy).not.toBeCalled();

		jest.clearAllMocks();
	});

	it("verbose = true", async () => {
		const consoleLogSpy = jest.spyOn(console, "log");

		const context = new GameContext({ gameJsonPath, verbose: true });
		await context.getGameClient();

		expect(consoleLogSpy).toBeCalled();

		jest.clearAllMocks();
	});
});
