import { EventEmitter } from '../util/events/eventEmitter'
import { Blackboard } from './blackboard'
import { NodeStatus } from './nodeStatus'

export type NodeJSON = {
	uuid: string
	displayName: string
	status: NodeStatus
	children: NodeJSON[]
}

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
	private _prevStatus = NodeStatus.IDLE

	public get blackboard() {
		return this._blackboard
	}

	public get uuid() {
		return this._uuid
	}

	public get status() {
		return this._status
	}

	public get prevStatus() {
		return this._prevStatus
	}

	public get displayName() {
		return this.constructor.name
	}

	protected abstract tick(): NodeStatus

	public setBlackboard(blackboard: Blackboard) {
		this._blackboard = blackboard
	}

	private setStatus(status: NodeStatus) {
		if (this._status === status) {
			return
		}

		this._prevStatus = this._status
		this._status = status

		this.emit('statusChanged', this)
	}

	public executeTick() {
		let prev_status = this._status

		if (prev_status === NodeStatus.IDLE) {
			this.setStatus(NodeStatus.RUNNING)
			prev_status = NodeStatus.RUNNING
		}

		this.emit('tick_executed', this)

		const status = this.tick()
		if (status !== prev_status) {
			this.setStatus(status)
		}

		return status
	}

	public resetStatus() {
		this.setStatus(NodeStatus.IDLE)
	}

	public halt() {
		this.resetStatus()
	}

	/**
	 *
	 * @returns {Node[]} - A list of all child nodes starting from the current node and going all the way down to the leaves.
	 */
	public getAllChildNodes(): Node[] {
		return this.getChildNodes(Infinity)
	}

	/**
	 *
	 * @param {number} depth - The depth of the tree to search for child nodes.
	 * @returns {Node[]} - A list of all child nodes starting from the current node and going down to the specified depth. A depth of -1 will return all child nodes.
	 */
	public getChildNodes(depth: number) {
		const nodes = []

		const thisNode = this as any

		if (depth === 0) {
			return []
		}

		if (thisNode.children) {
			nodes.push(...thisNode.children)

			thisNode.children.forEach((child: any) => {
				nodes.push(...child.getChildNodes(depth - 1))
			})
		} else if (thisNode.child) {
			nodes.push(thisNode.child)

			nodes.push(...thisNode.child.getChildNodes(depth - 1))
		}

		return nodes
	}

	public toJSON(): NodeJSON {
		return {
			uuid: this.uuid,
			displayName: this.displayName,
			status: this.status,
			children: this.getChildNodes(1).map((node) => node.toJSON()),
		}
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
