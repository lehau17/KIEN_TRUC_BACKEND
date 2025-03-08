"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManagement = exports.StateFunc = void 0;
var StateFunc;
(function (StateFunc) {
    StateFunc[StateFunc["Complete"] = 0] = "Complete";
    StateFunc[StateFunc["Fail"] = 1] = "Fail";
    StateFunc[StateFunc["Pending"] = 2] = "Pending";
    StateFunc[StateFunc["Block"] = 3] = "Block";
})(StateFunc || (exports.StateFunc = StateFunc = {}));
class StateManagement {
    constructor(retry = 3, timeRetry = 3000) {
        this.retry = retry;
        this.timeRetry = timeRetry;
        this.state = StateFunc.Pending;
    }
    async handleRetry(callback, args) {
        let retryCount = 0;
        while (retryCount < this.retry) {
            try {
                console.debug("🔄 Retry Attempt:", retryCount + 1);
                this.state = StateFunc.Pending;
                const result = await callback(args);
                this.state = StateFunc.Complete;
                return result;
            }
            catch (error) {
                retryCount++;
                console.error("❌ Error:", error.message);
                if (retryCount >= this.retry) {
                    this.state = StateFunc.Fail;
                    throw new Error("❌ Max retry attempts reached.");
                }
                this.state = StateFunc.Block;
                await new Promise((resolve) => setTimeout(resolve, this.timeRetry));
            }
        }
        throw new Error("❌ Unknown error occurred.");
    }
}
exports.StateManagement = StateManagement;
//# sourceMappingURL=stateManagement.js.map