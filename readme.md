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