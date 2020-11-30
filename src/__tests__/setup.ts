import { setSystemLogger } from "@akashic/headless-driver";
import { SilentLogger } from "./helpers/SilentLogger";

module.exports = () => {
	setSystemLogger(new SilentLogger());
};
