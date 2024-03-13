import { FallbackNode } from '@/nodes/fallbackNode'
import { ActionNode } from '@/base/actionNode'
import { NodeStatus } from '@/base/nodeStatus'
import { Blackboard } from '@/base/blackboard'

describe('fallback node', () => {
	test('executes fallback child when first child fails', async () => {
		let count = 0

		class SuccessAction extends ActionNode {
			async tick() {
				count++
				return NodeStatus.SUCCESS
			}
		}

		class FailureAction extends ActionNode {
			async tick() {
				count++

				this.write_output('b', 1)

				return NodeStatus.FAILURE
			}
		}

		const fb = new FallbackNode([new FailureAction(), new SuccessAction()])
		fb.setBlackboard(new Blackboard())

		const result = await fb.executeTick()

		expect(result).toBe('success')
		expect(count).toBe(2)
	})

	test('ignores fallback child when first child succeeds', async () => {
		let count = 0

		class FallbackAction extends ActionNode {
			async tick() {
				count++
				return NodeStatus.SUCCESS
			}
		}

		class SuccessAction extends ActionNode {
			async tick() {
				count++
				return NodeStatus.SUCCESS
			}
		}

		const fb = new FallbackNode([new SuccessAction(), new FallbackAction()])
		fb.setBlackboard(new Blackboard())

		const result = await fb.executeTick()
		expect(result).toBe(NodeStatus.SUCCESS)
		expect(count).toBe(1)
	})

	test('retains position of running child on next tick', async () => {
		let count = 0

		class FailureAction extends ActionNode {
			async tick() {
				count++
				return NodeStatus.FAILURE
			}
		}

		class AsyncAction extends ActionNode {
			async tick() {
				count++
				if (count === 2) {
					return NodeStatus.RUNNING
				}

				return NodeStatus.FAILURE
			}
		}

		class FallbackAction extends ActionNode {
			async tick() {
				count++
				return NodeStatus.SUCCESS
			}
		}

		const node = new FallbackNode([new FailureAction(), new AsyncAction(), new FallbackAction()])

		await node.executeTick()
		const result = await node.executeTick()

		expect(result).toBe(NodeStatus.SUCCESS)
		expect(count).toBe(4)
	})
})
