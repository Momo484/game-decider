import type { MouseEventHandler } from "react";

interface ButtonProps {
  content: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function Button({
  content,
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
}
