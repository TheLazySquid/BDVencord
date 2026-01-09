import EventEmitter3 from "eventemitter3";

export default new class BDEvents extends EventEmitter3 {
    constructor() {
        super();
    }

    dispatch(eventName: string, ...args: any[]) {
        this.emit(eventName, ...args);
    }
};