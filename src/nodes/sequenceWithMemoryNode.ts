import { ControlNode } from '../base/controlNode'
import { NodeStatus } from '../base/nodeStatus'

export class SequenceWithMemoryNode<
	TInputPorts = Record<string, unknown>,
	TOutputPorts = Record<string, unknown>
> extends ControlNode<TInputPorts, TOutputPorts> {
	index = 0

	tick() {
		let skipped = false

		if (this.status === NodeStatus.IDLE) {
			skipped = true
		}

		this.setStatus(NodeStatus.RUNNING)

		for (let i = this.index; i < this.children.length; i++) {
			this.index = i

			const status = this.children[i].executeTick()

			skipped = skipped || status === NodeStatus.SKIPPED

			if (status === NodeStatus.FAILURE) {
				return NodeStatus.FAILURE
			}
			if (status === NodeStatus.RUNNING) {
				return NodeStatus.RUNNING
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
}
