import { ActionNode, DelayNode, NodeStatus } from '../src'
import { Blackboard } from '../src/base/blackboard'

class SampleNode extends ActionNode {
	constructor() {
		super()
	}

	tick() {
		return NodeStatus.SUCCESS
	}
}

describe('delay node', () => {
	test('returns running before delay is complete', async () => {
		const delay = 2000

		const delayNode = new DelayNode(new SampleNode())
		delayNode.setBlackboard(new Blackboard())

		delayNode.write_output('delay_msec', delay)

		const result = delayNode.executeTick()

		expect(result).toBe(NodeStatus.RUNNING)
	})

	test('returns success after delay is complete', async () => {
		const delay = 2000

		const delayNode = new DelayNode(new SampleNode())
		delayNode.setBlackboard(new Blackboard())

		delayNode.write_output('delay_msec', delay)

		delayNode.executeTick()

		await new Promise((resolve) => setTimeout(resolve, delay))

		const result = delayNode.executeTick()

		expect(result).toBe(NodeStatus.SUCCESS)
	})
})
