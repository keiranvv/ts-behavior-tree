import { ControlNode } from '../base/controlNode'
import { NodeStatus } from '../base/nodeStatus'

export class SequenceNode<
	TInputPorts = Record<string, unknown>,
	TOutputPorts = Record<string, unknown>
> extends ControlNode<TInputPorts, TOutputPorts> {
	tick() {
		let skipped = false

		if (this.status === NodeStatus.IDLE) {
			skipped = true
		}

		this.setStatus(NodeStatus.RUNNING)

		for (let i = 0; i < this.children.length; i++) {
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

		if (skipped) {
			return NodeStatus.SKIPPED
		}

		return NodeStatus.SUCCESS
	}
}
