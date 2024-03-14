import { Node } from './node'
import { NodeStatus } from './nodeStatus'
import { Blackboard } from './blackboard'

export abstract class ControlNode<
	TInputPorts = Record<string, unknown>,
	TOutputPorts = Record<string, unknown>
> extends Node<TInputPorts, TOutputPorts> {
	children: Node[]

	constructor(children: Node[]) {
		super()
		this.children = children ?? []
	}

	override setBlackboard(blackboard: Blackboard) {
		super.setBlackboard(blackboard)

		this.children.forEach((child) => {
			if (this.blackboard) {
				child.setBlackboard(this.blackboard)
			}
		})
	}

	override halt() {
		this.resetChildren()
		this.resetStatus()
	}

	resetChildren() {
		this.children.forEach((child) => {
			if (child.status === NodeStatus.RUNNING) {
				child.halt()
			}
			child.resetStatus()
		})
	}

	haltChild(i: number) {
		this.children[i].halt()
	}

	haltChildren() {
		for (let i = 0; i < this.children.length; i++) {
			this.haltChild(i)
		}
	}
}
