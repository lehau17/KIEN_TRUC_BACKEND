export declare enum StateFunc {
    Complete = 0,
    Fail = 1,
    Pending = 2,
    Block = 3
}
export declare class StateManagement {
    private retry;
    private timeRetry;
    private state;
    constructor(retry?: number, timeRetry?: number);
    handleRetry<T, V>(callback: (arg: V) => Promise<T>, args: V): Promise<T>;
}
