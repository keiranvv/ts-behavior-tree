import { DecoratorNode } from '@/base/decoratorNode'
import { NodeStatus } from '@/base/nodeStatus'

export class InverterNode<
	TInputPorts = Record<string, unknown>,
	TOutputPorts = Record<string, unknown>
> extends DecoratorNode<TInputPorts, TOutputPorts> {
	async tick() {
		this.setStatus(NodeStatus.RUNNING)

		const result = await this.child.executeTick()

		switch (result) {
			case NodeStatus.SUCCESS:
				this.resetChild()
				return NodeStatus.FAILURE

			case NodeStatus.FAILURE:
				this.resetChild()
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
