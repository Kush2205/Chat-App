"use client";

interface ButoonProps {
    text: string;
    width: string;
    height: string;
    backgroundColor?: string | "white";
    color?: string | "black";
    onClick: () => void;
}

export function Button(props: ButoonProps) {
    return (
        <button
            style={{
                width: props.width,
                height: props.height,
                backgroundColor: props.backgroundColor,
                color: props.color
            }}
            onClick={props.onClick}
        >
            {props.text}
        </button>
    );
}