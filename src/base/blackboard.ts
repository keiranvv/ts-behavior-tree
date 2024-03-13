export class Blackboard {
	private data: any = {}

	public set(key: string, value: any) {
		this.data[key] = value
	}

	public get(key: string): any {
		return this.data[key]
	}
}
