import type { RgbaColor } from "svelte-awesome-color-picker";

export type Token = {
    uuid: string;
    x: number;
    y: number;
    width: number;
    height: number;
    image: string;
    ringColor: string;
    locked?: boolean;
    visible?: boolean;
};