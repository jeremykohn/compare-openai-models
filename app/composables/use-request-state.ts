import { reactive } from "vue";

import type { RequestStatus } from "~~/types/api";

type RequestState = {
  status: RequestStatus;
  data: string | null;
  error: string | null;
  errorDetails: string | null;
};

export function useRequestState() {
  const state = reactive<RequestState>({
    status: "idle",
    data: null,
    error: null,
    errorDetails: null,
  });

  function start(): void {
    state.status = "loading";
    state.data = null;
    state.error = null;
    state.errorDetails = null;
  }

  function succeed(data: string): void {
    state.status = "success";
    state.data = data;
    state.error = null;
    state.errorDetails = null;
  }

  function fail(error: string, details?: string): void {
    state.status = "error";
    state.data = null;
    state.error = error;
    state.errorDetails = details ?? null;
  }

  function reset(): void {
    state.status = "idle";
    state.data = null;
    state.error = null;
    state.errorDetails = null;
  }

  return {
    state,
    start,
    succeed,
    fail,
    reset,
  };
}
