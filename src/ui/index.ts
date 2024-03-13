import { Node } from '@/base/node'
import { NodeStatus } from '@/base/nodeStatus'
import { Tree } from '@/tree'
import {
	ConsoleManager,
	OptionPopup,
	InputPopup,
	PageBuilder,
	ButtonPopup,
	ConfirmPopup,
} from 'console-gui-tools'

const GUI = new ConsoleManager({
	title: 'TCP Simulator', // Title of the console
	// logPageSize: 8, // Number of lines to show in logs page
	// changeLayoutKey: 'ctrl+l', // Change layout with ctrl+l to switch to the logs page
})

class SimpleNode extends Node {
	count = 0

	async tick() {
		this.count++

		if (this.count === 5) {
			return NodeStatus.SUCCESS
		}

		return NodeStatus.RUNNING
	}
}

const updateConsole = async (nodes: Node[]) => {
	const p = new PageBuilder()
	p.addRow({ text: `TCP server simulator app! Welcome...`, color: 'yellow' })

	nodes.forEach((node) => {
		p.addRow({ text: `${node.constructor.name}: ${node.status}`, color: 'white' })
	})

	GUI.setPage(p)
}

const tree = new Tree(new SimpleNode())
tree.on('nodeStatusChanged', () => {
	updateConsole(tree.nodesList())
})

const run = async () => {
	await tree.tickWhileRunning()
}

run()
