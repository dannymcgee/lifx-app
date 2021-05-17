export class Vec2 {
	private constructor(
		public x: number,
		public y: number,
	) {}

	static fromMouseEvent(event: MouseEvent): Vec2 {
		return new Vec2(event.screenX, event.screenY);
	}

	plus(other: Vec2): Vec2 {
		return new Vec2(this.x + other.x, this.y + other.y);
	}

	minus(other: Vec2): Vec2 {
		return new Vec2(this.x - other.x, this.y - other.y);
	}

	asScreenPct(): Vec2 {
		return new Vec2(this.x / screen.width, this.y / screen.height);
	}
}
