import * as chalk from "chalk";
import { promises as fs } from "fs";
import * as path from "path";

import {
	BuilderContext,
	BuilderOutput,
	createBuilder,
} from "@angular-devkit/architect";

import { Options } from "./schema";

export default createBuilder(runBuilder);

async function runBuilder(opts: Options, ctx: BuilderContext) {
	return new Promise<BuilderOutput>(async resolve => {
		const success = () => resolve({ success: true });
		const error = (err: Error) => {
			console.log(chalk.bold.redBright(err.message));
			resolve({ success: false });
		};

		const { workspaceRoot } = ctx;
		let workspaceJson = await fs
			.readFile(path.join(workspaceRoot, "angular.json"))
			.then((buffer) => JSON.parse(buffer.toString()));

		let srcRoot = workspaceJson?.projects?.[ctx.target.project]?.sourceRoot;
		if (!srcRoot) error(new Error("No sourceRoot!"));

		let shadersPath = path.resolve(process.cwd(), srcRoot, "lib");
		let shaders = await fs.readdir(shadersPath);

		await Promise.all(shaders.map(async shader => {
			let name = path.basename(shader, ".glsl");
			let packageJson = JSON.stringify({
				name: `@lifx/${name}`,
				version: "1.0.0",
				glslify: `./${shader}`,
			}, null, "\t");

			let source = path.resolve(shadersPath, shader);
			let outPath = path.resolve(process.cwd(), opts.outputPath!, name);

			await fs.mkdir(outPath, { recursive: true });
			await fs.copyFile(source, path.resolve(outPath, shader));
			await fs.writeFile(path.resolve(outPath, "package.json"), packageJson);
		}));

		success();
	});
}
