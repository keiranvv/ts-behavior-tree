import { Node } from '@/base/node'

export abstract class ActionNode<
	TInputPorts = Record<string, unknown>,
	TOutputPorts = Record<string, unknown>
> extends Node<TInputPorts, TOutputPorts> {}
