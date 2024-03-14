import { Blackboard } from '@/base/blackboard'
import { ActionNode, NodeStatus, RepeatNode, Tree } from '@/index'

let sampleNodeCounter = 0
class SampleNode extends ActionNode {
	constructor() {
		super()
	}

	async tick() {
		sampleNodeCounter++
		return NodeStatus.SUCCESS
	}
}

beforeEach(() => {
	sampleNodeCounter = 0
})

describe('repeatNode', () => {
	test('execute without setting num_cycles should throw exception', async () => {
		const repeatNode = new RepeatNode(new SampleNode())
		repeatNode.setBlackboard(new Blackboard())

		expect(repeatNode.executeTick()).rejects.toThrow('num_cycles is required in RepeatNode')
		expect(sampleNodeCounter).toBe(0)
	})

	test('execute num_cycles specified', async () => {
		const repeatNode = new RepeatNode(new SampleNode())
		repeatNode.setBlackboard(new Blackboard())

		repeatNode.write_output('num_cycles', 5)

		await repeatNode.executeTick()

		expect(sampleNodeCounter).toBe(5)
	})
})
