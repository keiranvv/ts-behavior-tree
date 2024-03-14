import { ActionNode } from '@/base/actionNode'
import { NodeStatus } from '@/base/nodeStatus'
import { TickOption, Tree } from '@/tree'

describe('tree tests', () => {
	test('tick exactly once', async () => {
		class SimpleNode extends ActionNode {
			count = 0

			tick() {
				this.count++

				if (this.count === 5) {
					return NodeStatus.SUCCESS
				}

				return NodeStatus.RUNNING
			}
		}

		const node = new SimpleNode()
		const tree = new Tree(node)
		await tree.tickRoot(TickOption.EXACTLY_ONCE, 100)

		expect(node.count).toBe(1)
	})

	test('tickWhileRunning', async () => {
		class SimpleNode extends ActionNode {
			count = 0

			tick() {
				this.count++

				if (this.count === 5) {
					return NodeStatus.SUCCESS
				}

				return NodeStatus.RUNNING
			}
		}

		const node = new SimpleNode()
		const tree = new Tree(node)
		await tree.tickWhileRunning()

		expect(node.count).toBe(5)
	})
})
