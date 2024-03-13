import { Blackboard } from '@/base/blackboard'
import { Node } from '@/base/node'
import { NodeStatus } from '@/base/nodeStatus'

describe('base node', () => {
	test('write_output updates blackboard and read_input gets blackboard value', async () => {
		class TestNode extends Node {
			async tick() {
				this.write_output('a', 1)
				return NodeStatus.SUCCESS
			}

			getValue(key: string) {
				return this.read_input(key)
			}
		}

		const t = new TestNode()
		t.setBlackboard(new Blackboard())

		await t.executeTick()

		expect(t.getValue('a')).toBe(1)
	})

	test('write_output value is accessible in other node', async () => {
		class TestNode extends Node {
			async tick() {
				this.write_output('a', 1)
				return NodeStatus.SUCCESS
			}
		}

		class Test2Node extends Node {
			async tick() {
				return NodeStatus.SUCCESS
			}

			getValue(key: string) {
				return this.read_input(key)
			}
		}

		const t = new TestNode()
		const t2 = new Test2Node()

		const b = new Blackboard()

		t.setBlackboard(b)
		t2.setBlackboard(b)

		await t.executeTick()

		expect(t2.getValue('a')).toBe(1)
	})
})
