import { writable } from "svelte/store";

export const State = writable({score: 0, lives: 3, speed: 80, snake: [[0, 20], [0, 20], [0, 20]]});