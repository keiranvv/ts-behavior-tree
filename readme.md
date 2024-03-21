# Typescript Behaviour Tree

## Description

A simple behaviour tree implementation in typescript. Based heavily on [https://www.behaviortree.dev/](https://www.behaviortree.dev/).


## Usage

```typescript
import { ActionNode, NodeStatus, Tree } from 'ts-behaviour-tree'

class SampleAction extends ActionNode {
  public tick(): void {
    return NodeStatus.SUCCESS
  }
}

const rootNode = new RepeatNode(new SampleAction())
rootNode.write_output('num_cycles', 5)

const tree = new Tree(rootNode)

tree.tickWhileRunning()
```

## TODO
- How to set ports when not using a parser (which doesn't exist yet)
- Create an xml/json parser
- Figure out interrupt signals, if needed

## Differences from the reference implementation
- Decorator and control nodes do not reset children upon certain statuses. This only occurs when the parent node itself is reset. In practice this means that the only time a reset happens is when the tree resets the root node, and it trickles down to all children. This also means that as long as the tree is running, the nodes will not be reset and their state will be preserved. I am yet to see if this is a good idea or not.