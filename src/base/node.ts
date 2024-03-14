import { EventEmitter } from '../util/events/eventEmitter'
import { Blackboard } from './blackboard'
import { NodeStatus } from './nodeStatus'

/**
 * @abstract @class Node
 *
 * @classdesc Root class for all Node types.
 * Responsible for managing node status, blackboard, events, and port handling.
 * Subclasses must implement the `tick` method.
 *
 * @template TInputPorts - The input ports of the node.
 * @template TOutputPorts - The output ports of the node.
 *
 */
export abstract class Node<
	TInputPorts = Record<string, unknown>,
	TOutputPorts = Record<string, unknown>
> extends EventEmitter {
	private _blackboard: Blackboard | undefined
	private _uuid = Math.random().toString(36).substring(7)
	private _status = NodeStatus.IDLE

	public get blackboard() {
		return this._blackboard
	}

	public get uuid() {
		return this._uuid
	}

	public get status() {
		return this._status
	}

	protected abstract tick(): NodeStatus

	public setBlackboard(blackboard: Blackboard) {
		this._blackboard = blackboard
	}

	protected setStatus(status: NodeStatus) {
		this._status = status

		this.emit('statusChanged', this)
	}

	public executeTick() {
		let prev_status = this._status

		if (prev_status === NodeStatus.IDLE) {
			this.setStatus(NodeStatus.RUNNING)
			prev_status = NodeStatus.RUNNING
		}

		const status = this.tick()
		if (status !== prev_status) {
			this.setStatus(status)
		}

		return status
	}

	public resetStatus() {
		this._status = NodeStatus.IDLE
	}

	public halt() {
		this.resetStatus()
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

	/*
	 * Blackboard functions
	 */

	public write_output<K extends keyof TOutputPorts>(key: K, value: TOutputPorts[K]) {
		if (!this._blackboard) {
			throw new Error('Blackboard not set')
		}

		this._blackboard.set(key as string, value)
	}

	public read_input<K extends keyof TInputPorts>(key: K): TInputPorts[K] {
		if (!this._blackboard) {
			throw new Error('Blackboard not set')
		}

		return this._blackboard.get(key as string)
	}
}
