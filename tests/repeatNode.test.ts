import { Blackboard } from '../src/base/blackboard'
import { ActionNode, NodeStatus, RepeatNode, Tree } from '../src/index'

let sampleNodeCounter = 0
class SampleNode extends ActionNode {
	constructor() {
		super()
	}

	tick() {
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

		expect(() => {
			repeatNode.executeTick()
		}).toThrow('num_cycles is required in RepeatNode')
		expect(sampleNodeCounter).toBe(0)
	})

	test('execute num_cycles specified', async () => {
		const repeatNode = new RepeatNode(new SampleNode())
		repeatNode.setBlackboard(new Blackboard())

		repeatNode.write_output('num_cycles', 5)

		repeatNode.executeTick()

		expect(sampleNodeCounter).toBe(5)
	})
})
