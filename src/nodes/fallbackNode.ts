import { ControlNode } from '../base/controlNode'
import { NodeStatus } from '../base/nodeStatus'

export class FallbackNode<
	TInputPorts = Record<string, unknown>,
	TOutputPorts = Record<string, unknown>
> extends ControlNode<TInputPorts, TOutputPorts> {
	index: number = 0

	tick() {
		let skipped = false

		if (this.status === NodeStatus.IDLE) {
			skipped = true
		}

		this.setStatus(NodeStatus.RUNNING)

		for (let i = this.index; i < this.children.length; i++) {
			const status = this.children[i].executeTick()

			skipped = skipped || status === NodeStatus.SKIPPED

			if (status === NodeStatus.RUNNING) {
				this.index = i
				return NodeStatus.RUNNING
			}

			if (status === NodeStatus.SUCCESS) {
				this.resetChildren()
				this.index = 0
				return NodeStatus.SUCCESS
			}

			if (status === NodeStatus.IDLE) {
				throw new Error('Child node cannot return IDLE status')
			}
		}

		if (skipped) {
			return NodeStatus.SKIPPED
		}

		this.resetChildren()
		this.index = 0

		return NodeStatus.FAILURE
	}
}
