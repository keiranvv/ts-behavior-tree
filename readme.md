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
- Correctly implement halting

## Differences from the reference implementation
- Decorator and control nodes do not reset children upon certain statuses. This only occurs when the parent node itself is reset. In practice this means that the only time a reset happens is when the tree resets the root node, and it trickles down to all children. This was done so that I could monitor the last status of each node, I don't know if this will cause any issues down the line.