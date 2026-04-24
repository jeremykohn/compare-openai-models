import { reactive } from "vue";
import type { RequestStatus } from "~~/types/api";
import type { NormalizedUiError } from "../utils/error-normalization";

type RequestState = {
  status: RequestStatus;
  data: string | null;
  error: NormalizedUiError | null;
};

export function useRequestState() {
  const state = reactive<RequestState>({
    status: "idle",
    data: null,
    error: null,
  });

  function start(): void {
    state.status = "loading";
    state.data = null;
    state.error = null;
  }

  function succeed(data: string): void {
    state.status = "success";
    state.data = data;
    state.error = null;
  }

  function fail(error: NormalizedUiError): void {
    state.status = "error";
    state.data = null;
    state.error = error;
  }

  function reset(): void {
    state.status = "idle";
    state.data = null;
    state.error = null;
  }

  return {
    state,
    start,
    succeed,
    fail,
    reset,
  };
}
