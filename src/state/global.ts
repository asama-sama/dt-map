import { hookstate } from "@hookstate/core";
import { Suburb } from "../types";

type SuburbState = { [key: number]: Suburb };

export const globalSuburbState = hookstate<SuburbState>({});
