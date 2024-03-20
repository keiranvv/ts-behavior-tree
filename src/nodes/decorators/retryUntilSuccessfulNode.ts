import { DecoratorNode } from '../../base/decoratorNode'
import { NodeStatus } from '../../base/nodeStatus'

export class RetryUntilSuccessfulNode<
	TInputPorts extends {
		num_attempts: number
	},
	TOutputPorts = Record<string, unknown>
> extends DecoratorNode<TInputPorts, TOutputPorts> {
	private index = 0

	tick() {
		const num_cycles = this.read_input('num_attempts')
		let skipped = false

		if (!num_cycles) {
			throw new Error('num_attempts is required in RetryUntilSuccessfulNode')
		}

		if (this.status === NodeStatus.IDLE) {
			skipped = true
		}

		// this.setStatus(NodeStatus.RUNNING)

		for (let i = this.index; i < num_cycles; i++) {
			const status = this.child.executeTick()

			skipped = skipped || status === NodeStatus.SKIPPED

			if (status === NodeStatus.RUNNING) {
				this.index = i
				return NodeStatus.RUNNING
			}

			if (status === NodeStatus.SUCCESS) {
				this.index = 0
				return NodeStatus.SUCCESS
			}

			if (status === NodeStatus.IDLE) {
				throw new Error('Child node cannot return IDLE status')
			}
		}

		this.index = 0

		if (skipped) {
			return NodeStatus.SKIPPED
		}

		return NodeStatus.FAILURE
	}
}
