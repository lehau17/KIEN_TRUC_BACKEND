
export enum StateFunc {
    Complete,
    Fail,
    Pending,
    Block
}

export class StateManagement {
    private retry: number;
    private timeRetry: number;
    private state: StateFunc;

    constructor(retry: number = 3, timeRetry: number = 3000) {
        this.retry = retry;
        this.timeRetry = timeRetry;
        this.state = StateFunc.Pending;
    }

    async handleRetry<T, V>(callback: (arg: V) => Promise<T>, args: V): Promise<T> {
        let retryCount = 0;

        while (retryCount < this.retry) {
            try {
                console.debug("🔄 Retry Attempt:", retryCount + 1);
                this.state = StateFunc.Pending;
                const result = await callback(args);
                this.state = StateFunc.Complete;
                return result;
            } catch (error) {
                retryCount++;
                console.error("❌ Error:", error.message);

                if (retryCount >= this.retry) {
                    this.state = StateFunc.Fail;
                    throw new Error("❌ Max retry attempts reached.");
                }

                this.state = StateFunc.Block;
                await new Promise((resolve) => setTimeout(resolve, this.timeRetry * retryCount));
            }
        }

        throw new Error("❌ Unknown error occurred.");
    }
}
