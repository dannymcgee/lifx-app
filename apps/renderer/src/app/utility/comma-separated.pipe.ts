import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: "commaSep"
})
export class CommaSeparatedPipe<T> implements PipeTransform {
	transform(list: Iterable<T>, key?: string): string {
		if (!list) return "";
		if (!list[0]) return "";

		let arr = Array.from(list);

		if (typeof list[0] === "string") return arr.join(", ");

		if (!key) return arr
			.map(it => it.toString())
			.join(", ");

		return arr
			.map(it => it[key])
			.join(", ");
	}
}
