import { Instance as Chalk } from "chalk";
import { Channel, Request, Response } from "@lifx/api";

const chalk = new Chalk({ level: 2 });

namespace log {

	export function request(chan: Channel, payload?: Request) {
		let msg = ch(chan) + " --> " + pretty(payload ?? null);
		process.stdout.write(msg.trim() + "\r");
	}

	export function response(chan: Channel, payload?: Response) {
		(payload as any) = payload?.[chan] ?? null;
		let msg = ch(chan) + " <-- " + pretty(payload);
		process.stdout.write(msg.trim() + "\r\n");
	}

	export function debug(msg: string, data?: any) {
		let result = chalk.bold.grey.inverse(" DEBUG ");
		result += ` ${msg} `;

		if (data !== undefined) result += pretty(data);

		process.stdout.write(result.trim() + "\r");
	}

	function ch(channel: Channel) {
		let color: typeof chalk;
		switch (channel) {
			case Channel.Discovery: { color = chalk.yellow;    break; }
			case Channel.GetColor:  { color = chalk.blueBright; break; }
			case Channel.SetColor:  { color = chalk.cyan;       break; }
		}
		return color.bold.inverse(` ${channel} `);
	}

	function pretty(payload?: any): string {
		if (payload === undefined) return kw`undefined`;
		if (payload === null) return kw`null`;

		switch (typeof payload) {
			case "bigint":
			case "number":
				return n`${payload}`;
			case "boolean":
				return kw`${payload}`;
			case "string":
			case "symbol":
				return str`${payload}`;
		}

		if (Array.isArray(payload)) {
			return p`[` + "..." + p`]`;
		}

		let result = p`{ `;
		let entries = Object.entries(payload);
		entries.forEach(([key, value], idx) => {
			result += k`${key}` + ": " + pretty(value);
			if (idx < entries.length - 1)
				result += ", ";
		});
		result += p` }`;

		return result;
	}

	function kw(strings: TemplateStringsArray, ...values: any[]) {
		return chalk.italic.magenta(parse(strings, ...values));
	}

	function n(strings: TemplateStringsArray, ...values: any[]) {
		return chalk.cyan(parse(strings, ...values));
	}

	function str(strings: TemplateStringsArray, ...values: any[]) {
		let quote = chalk.green.dim("\"");
		return quote + chalk.green(parse(strings, ...values)) + quote;
	}

	function k(strings: TemplateStringsArray, ...values: any[]) {
		return chalk.redBright(parse(strings, ...values));
	}

	function p(strings: TemplateStringsArray, ...values: any[]) {
		return chalk.whiteBright(parse(strings, ...values));
	}

	function parse(strings: TemplateStringsArray, ...values: any[]) {
		return strings.raw.reduce((acc, cur, idx) => {
			acc += cur;
			if (idx < values.length) acc += values[idx].toString();
			return acc;
		}, "");
	}

}

export default log;
