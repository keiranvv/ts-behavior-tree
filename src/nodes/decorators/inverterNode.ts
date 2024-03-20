import { DecoratorNode } from '../../base/decoratorNode'
import { NodeStatus } from '../../base/nodeStatus'

export class InverterNode<
	TInputPorts = Record<string, unknown>,
	TOutputPorts = Record<string, unknown>
> extends DecoratorNode<TInputPorts, TOutputPorts> {
	tick() {
		this.setStatus(NodeStatus.RUNNING)

		const result = this.child.executeTick()

		switch (result) {
			case NodeStatus.SUCCESS:
				return NodeStatus.FAILURE

			case NodeStatus.FAILURE:
				return NodeStatus.SUCCESS

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
