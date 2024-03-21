import { Blackboard } from './base/blackboard'
import { Node } from './base/node'
import { NodeStatus } from './base/nodeStatus'
import { EventEmitter } from './util/events/eventEmitter'

export enum TickOption {
	WHILE_RUNNING,
	EXACTLY_ONCE,
}

export type TreeJSON = {
	rootNode: any
}

export class Tree extends EventEmitter {
	private sleep_time = 100
	private _rootNode: Node | null = null

	private _isHalted = false

	get rootNode() {
		return this._rootNode
	}

	private nodeStatusChangedHandler = this.onNodeStatusChanged.bind(this)

	constructor(rootNode: Node) {
		super()
		this._rootNode = rootNode

		this._rootNode.setBlackboard(new Blackboard())

		this.nodesList().forEach((node) => {
			node.on('statusChanged', this.nodeStatusChangedHandler)
		})
	}

	async tickWhileRunning() {
		await this.tickRoot(TickOption.WHILE_RUNNING, this.sleep_time)
	}

	async tickRoot(option: TickOption, sleep_time: number) {
		if (!this._rootNode) {
			throw new Error('Root node is not set')
		}

		this._isHalted = false
		let status = NodeStatus.IDLE

		this.emit('start')

		while (
			status === NodeStatus.IDLE ||
			(option === TickOption.WHILE_RUNNING && status === NodeStatus.RUNNING)
		) {
			if (this._isHalted) {
				return NodeStatus.IDLE
			}

			this.emit('tick')

			status = this._rootNode.executeTick()

			if (status === NodeStatus.FAILURE || status === NodeStatus.SUCCESS) {
				this._rootNode.resetStatus()
			}

			if (status === NodeStatus.RUNNING) {
				await new Promise((resolve) => setTimeout(resolve, sleep_time))
			}
		}

		this.emit('end')

		return status
	}

	halt() {
		this._isHalted = true
		this.rootNode?.halt()
		this.emit('end')
	}

	nodesList() {
		if (!this._rootNode) {
			return []
		}

		return [this._rootNode, ...this._rootNode.getAllChildNodes()]
	}

	toJSON(): TreeJSON {
		return {
			rootNode: this._rootNode?.toJSON(),
		}
	}

	private onNodeStatusChanged(node: Node) {
		this.emit('nodeStatusChanged', node)
	}
}
