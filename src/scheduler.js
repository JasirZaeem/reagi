const workState = {
	queuedTasks: [],
	ongoingTask: null,
	nextSubTask: null,
};

const actors = {
	performSubtask: null,
	handleTaskEnd: null,
};

function workLoop(deadline) {
	let shouldYield = false;

	if (
		// Queued tasks temain
		workState.queuedTasks.length &&
		// And last task has completed
		!workState.nextSubTask &&
		!workState.ongoingTask
	) {
		// Start next queued task
		workState.nextSubTask = workState.ongoingTask =
			workState.queuedTasks.shift();
	}

	while (workState.nextSubTask && !shouldYield) {
		workState.nextSubTask = actors.performSubtask(workState.nextSubTask);
		shouldYield = deadline.timeRemaining() < 1;
	}

	if (!workState.nextSubTask && workState.ongoingTask) {
		actors.handleTaskEnd();
	}

	// Wait for next chance to work
	window.requestIdleCallback(workLoop);
}

export function queueTask(task) {
	workState.queuedTasks.push(task);
}

export function beginWorkLoop(performSubtask, handleTaskEnd) {
	actors.performSubtask = performSubtask;
	actors.handleTaskEnd = handleTaskEnd;
	window.requestIdleCallback(workLoop);
}
