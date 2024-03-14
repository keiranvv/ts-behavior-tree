import { Blackboard } from './base/blackboard'
import { Node } from './base/node'
import { NodeStatus } from './base/nodeStatus'
import { EventEmitter } from './util/events/eventEmitter'

export enum TickOption {
	WHILE_RUNNING,
	EXACTLY_ONCE,
}

export class Tree extends EventEmitter {
	private sleep_time = 1000
	private _rootNode: Node | null = null

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
		let status = NodeStatus.IDLE

		if (!this._rootNode) {
			throw new Error('Root node is not set')
		}

		while (
			status === NodeStatus.IDLE ||
			(option === TickOption.WHILE_RUNNING && status === NodeStatus.RUNNING)
		) {
			this.emit('tick')

			status = this._rootNode.executeTick()

			if (status === NodeStatus.FAILURE || status === NodeStatus.SUCCESS) {
				this._rootNode.resetStatus()
			}

			if (status === NodeStatus.RUNNING) {
				await new Promise((resolve) => setTimeout(resolve, sleep_time))
			}
		}

		return status
	}

	nodesList() {
		if (!this._rootNode) {
			return []
		}

		return [this._rootNode, ...this._rootNode.getAllChildNodes()]
	}

	private onNodeStatusChanged(node: Node) {
		this.emit('nodeStatusChanged', node)
	}
}
