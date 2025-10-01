export type NonFunctionKeys<T> = Exclude<{ [K in keyof T]: T[K] extends Function ? never : K }[keyof T], undefined>;

export interface IResultResponse<T> {
    result: T;
    status: boolean;
}

export interface SuccessResponse {
    status: boolean;
}

export type Status = 'IDLE' | 'LOADING' | 'SUCCESS' | 'FAIL';