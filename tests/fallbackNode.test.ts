import { FallbackNode } from '../src/nodes/fallbackNode'
import { ActionNode } from '../src/base/actionNode'
import { NodeStatus } from '../src/base/nodeStatus'
import { Blackboard } from '../src/base/blackboard'

describe('fallback node', () => {
	test('executes fallback child when first child fails', () => {
		let count = 0

		class SuccessAction extends ActionNode {
			tick() {
				count++
				return NodeStatus.SUCCESS
			}
		}

		class FailureAction extends ActionNode {
			tick() {
				count++

				this.write_output('b', 1)

				return NodeStatus.FAILURE
			}
		}

		const fb = new FallbackNode([new FailureAction(), new SuccessAction()])
		fb.setBlackboard(new Blackboard())

		const result = fb.executeTick()

		expect(result).toBe('success')
		expect(count).toBe(2)
	})

	test('ignores fallback child when first child succeeds', () => {
		let count = 0

		class FallbackAction extends ActionNode {
			tick() {
				count++
				return NodeStatus.SUCCESS
			}
		}

		class SuccessAction extends ActionNode {
			tick() {
				count++
				return NodeStatus.SUCCESS
			}
		}

		const fb = new FallbackNode([new SuccessAction(), new FallbackAction()])
		fb.setBlackboard(new Blackboard())

		const result = fb.executeTick()
		expect(result).toBe(NodeStatus.SUCCESS)
		expect(count).toBe(1)
	})

	test('retains position of running child on next tick', async () => {
		let count = 0

		class FailureAction extends ActionNode {
			tick() {
				count++
				return NodeStatus.FAILURE
			}
		}

		class AsyncAction extends ActionNode {
			tick() {
				count++
				if (count === 2) {
					return NodeStatus.RUNNING
				}

				return NodeStatus.FAILURE
			}
		}

		class FallbackAction extends ActionNode {
			tick() {
				count++
				return NodeStatus.SUCCESS
			}
		}

		const node = new FallbackNode([new FailureAction(), new AsyncAction(), new FallbackAction()])

		node.executeTick()
		const result = node.executeTick()

		expect(result).toBe(NodeStatus.SUCCESS)
		expect(count).toBe(4)
	})
})
