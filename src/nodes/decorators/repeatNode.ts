import { DecoratorNode } from '../../base/decoratorNode'
import { NodeStatus } from '../../base/nodeStatus'

export class RepeatNode<
	TInputPorts extends {
		num_cycles: number
	},
	TOutputPorts = Record<string, unknown>
> extends DecoratorNode<TInputPorts, TOutputPorts> {
	private index = 0

	tick() {
		const num_cycles = this.read_input('num_cycles')
		let skipped = false

		if (!num_cycles) {
			throw new Error('num_cycles is required in RepeatNode')
		}

		if (this.status === NodeStatus.IDLE) {
			skipped = true
		}

		for (let i = this.index; i < num_cycles; i++) {
			const status = this.child.executeTick()

			skipped = skipped || status === NodeStatus.SKIPPED

			if (status === NodeStatus.RUNNING) {
				return NodeStatus.RUNNING
			}

			if (status === NodeStatus.SUCCESS) {
				this.index = i

				this.resetChild()
			}

			if (status === NodeStatus.FAILURE) {
				this.index = 0
				this.resetChild()
				return NodeStatus.FAILURE
			}

			if (status === NodeStatus.IDLE) {
				throw new Error('Child node cannot return IDLE status')
			}
		}

		this.index = 0
		if (skipped) {
			return NodeStatus.SKIPPED
		}

		return NodeStatus.SUCCESS
	}

	override halt() {
		this.index = 0
		super.halt()
	}
}
