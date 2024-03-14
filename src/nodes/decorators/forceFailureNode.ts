import { DecoratorNode } from '../../base/decoratorNode'
import { NodeStatus } from '../../base/nodeStatus'

export class ForceFailureNode<
	TInputPorts = Record<string, unknown>,
	TOutputPorts = Record<string, unknown>
> extends DecoratorNode<TInputPorts, TOutputPorts> {
	tick() {
		this.setStatus(NodeStatus.RUNNING)

		const result = this.child.executeTick()

		switch (result) {
			case NodeStatus.SUCCESS:
			case NodeStatus.FAILURE:
				this.resetChild()
				return NodeStatus.FAILURE

			case NodeStatus.RUNNING:
			case NodeStatus.SKIPPED:
				return result

			case NodeStatus.IDLE:
				throw new Error('Child node cannot return IDLE status')

			default:
				throw new Error('Unhandled result from child node')
		}
	}
}
