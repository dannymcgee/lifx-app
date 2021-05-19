import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: "groupIcon",
})
export class GroupIconPipe implements PipeTransform {
	transform(groupName: string): string {
		switch (groupName) {
			case "Bedroom":
			case "bedroom":
				return "bed";
			case "Office":
			case "office":
				return "computer";
			default:
				console.warn(`No icon mapping found for group name '${groupName}'`);
				return groupName;
		}
	}
}
