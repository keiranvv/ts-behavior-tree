// Simple event emitter class

export abstract class EventEmitter {
	private _events: Record<string, Function[]> = {}

	on(event: string, callback: Function) {
		if (!this._events[event]) {
			this._events[event] = []
		}
		this._events[event].push(callback)
	}

	emit(event: string, ...args: any[]) {
		if (!this._events[event]) {
			return
		}
		this._events[event].forEach((callback) => {
			callback(...args)
		})
	}
}
