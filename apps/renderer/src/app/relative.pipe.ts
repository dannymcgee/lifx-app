import { Pipe, PipeTransform } from "@angular/core";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

@Pipe({
	name: "relative",
	pure: false,
})
export class RelativePipe implements PipeTransform {
	transform(value: Date|number): string {
		if (!value) return "";
		return formatDistanceToNow(value, {
			includeSeconds: true,
			addSuffix: true,
		});
	}
}
