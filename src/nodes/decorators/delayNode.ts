import { DecoratorNode } from '../../base/decoratorNode'
import { NodeStatus } from '../../base/nodeStatus'

export class DelayNode<
	TInputPorts extends {
		delay_msec: number
	},
	TOutputPorts = Record<string, unknown>
> extends DecoratorNode<TInputPorts, TOutputPorts> {
	private _delayTimeout: NodeJS.Timeout | null = null
	private _timerStarted = false
	private _timerCompleted = false

	tick() {
		if (!this._timerCompleted && this._timerStarted) {
			return NodeStatus.RUNNING
		}

		if (this._timerCompleted) {
			const result = this.child.executeTick()

			if (result === NodeStatus.IDLE) {
				throw new Error('Child node cannot return IDLE status')
			}

			if (result === NodeStatus.RUNNING) {
				return NodeStatus.RUNNING
			}

			this.reset()
			return result
		}

		const duration = this.read_input('delay_msec')

		this._timerStarted = true

		this._delayTimeout = setTimeout(() => {
			this._timerCompleted = true
		}, duration)

		return NodeStatus.RUNNING
	}

	reset() {
		this._timerStarted = false
		this._timerCompleted = false
		if (this._delayTimeout) {
			clearTimeout(this._delayTimeout)
			this._delayTimeout = null
		}
	}

	override resetStatus(): void {
		this.reset()
		super.resetStatus()
	}

	override halt(): void {
		this.reset()
		super.halt()
	}
}
