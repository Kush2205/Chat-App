"use client";

import { text } from "stream/consumers";

interface ButoonProps {
    text: string;
    width: string;
    height: string;
    backgroundColor?: string | "white"
    color?: string | "black"
    onClick?: () => void;
    textSize?: string;

}

export function Button(props: ButoonProps) {
    return (
        <button className="rounded-md font-semibold"
            style={{
                width: props.width,
                height: props.height,
                backgroundColor: props.backgroundColor,
                color: props.color,
                fontSize: props.textSize
            }}
            onClick={props.onClick}
        >
            {props.text}
        </button>
    );
}