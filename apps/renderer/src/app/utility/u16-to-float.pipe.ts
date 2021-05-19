import { Pipe, PipeTransform } from "@angular/core";
import { u16, u16toFloat } from "@lifx/api";

@Pipe({
	name: "u16toFloat",
})
export class u16toFloatPipe implements PipeTransform {
	transform(value: u16): number {
		return u16toFloat(value);
	}
}
