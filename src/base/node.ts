import { EventEmitter } from '@/util/events/eventEmitter'
import { Blackboard } from './blackboard'
import { NodeStatus } from './nodeStatus'

export abstract class Node<
	TInputPorts = Record<string, unknown>,
	TOutputPorts = Record<string, unknown>
> extends EventEmitter {
	private _blackboard: Blackboard | undefined
	private _uuid = Math.random().toString(36).substring(7)
	private _status = NodeStatus.IDLE

	public get uuid() {
		return this._uuid
	}

	protected abstract tick(): Promise<NodeStatus>

	public async executeTick() {
		// TODO: Add some observability etc here
		let prev_status = this._status

		if (prev_status === NodeStatus.IDLE) {
			this.setStatus(NodeStatus.RUNNING)
			prev_status = NodeStatus.RUNNING
		}

		const status = await this.tick()
		if (status !== prev_status) {
			this.setStatus(status)
		}

		return status
	}

	public setBlackboard(blackboard: Blackboard) {
		this._blackboard = blackboard
	}

	public get blackboard() {
		return this._blackboard
	}

	protected setStatus(status: NodeStatus) {
		this._status = status

		this.emit('statusChanged', this)
	}

	public get status() {
		return this._status
	}

	public resetStatus() {
		this._status = NodeStatus.IDLE
	}

	public halt() {
		this.resetStatus()
	}

	protected write_output<K extends keyof TOutputPorts>(key: K, value: TOutputPorts[K]) {
		if (!this._blackboard) {
			throw new Error('Blackboard not set')
		}

		this._blackboard.set(key as string, value)
	}

	protected read_input<K extends keyof TInputPorts>(key: K): TInputPorts[K] {
		if (!this._blackboard) {
			throw new Error('Blackboard not set')
		}

		return this._blackboard.get(key as string)
	}

	public getAllChildNodes() {
		const nodes = []

		const thisNode = this as any

		if (thisNode.children) {
			nodes.push(...thisNode.children)

			thisNode.children.forEach((child: any) => {
				nodes.push(...child.getAllChildNodes())
			})
		} else if (thisNode.child) {
			nodes.push(thisNode.child)

			nodes.push(...thisNode.child.getAllChildNodes())
		}

		return nodes
	}
}
