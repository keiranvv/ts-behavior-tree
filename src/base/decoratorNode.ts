import { Node } from './node'
import { NodeStatus } from './nodeStatus'
import { Blackboard } from './blackboard'

export abstract class DecoratorNode<
	TInputPorts = Record<string, unknown>,
	TOutputPorts = Record<string, unknown>
> extends Node<TInputPorts, TOutputPorts> {
	child: Node

	constructor(child: Node) {
		super()
		this.child = child
	}

	override setBlackboard(blackboard: Blackboard) {
		super.setBlackboard(blackboard)

		if (this.blackboard) {
			this.child.setBlackboard(this.blackboard)
		}
	}

	override halt() {
		this.resetChild()
		this.resetStatus()
	}

	override resetStatus(): void {
		this.resetChild()
		super.resetStatus()
	}

	resetChild() {
		if (!this.child) {
			return
		}

		if (this.child.status === NodeStatus.RUNNING) {
			this.child.halt()
		}

		this.child.resetStatus()
	}
}
