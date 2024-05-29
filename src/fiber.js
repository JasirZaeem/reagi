export class Fiber {
	constructor(type, props, dom, parent, alternate, effectTag) {
		// Data
		this.type = type;
		this.props = props;
		this.dom = dom;

		// Fiber Tree
		this.parent = parent;
		this.child = null;
		this.sibling = null;

		// Reconciliation
		this.alternate = alternate;

		// Lifecycle
		this.effectTag = effectTag;

        // Hooks
        this.hooks = [];
        this.isRerenderQueued = false;
	}
}

export function createRootFiber(dom, props, alternate) {
	return new Fiber(null, props, dom, null, alternate, null);
}
