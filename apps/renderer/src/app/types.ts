export interface Func<Args extends any[] = [], Return = void> {
	(...args: Args): Return;
}
