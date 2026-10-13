export type SchedulerTask = () => void;
export declare function queueTask(task: SchedulerTask): void;
