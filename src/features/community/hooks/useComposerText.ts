import { useState } from "react";

type UseComposerTextParams = {
  initialText?: string;
  onExpand?: () => void;
  onUserInput?: () => void;
};

export function useComposerText({ initialText = "", onExpand, onUserInput }: UseComposerTextParams) {
  const [text, setText] = useState(initialText);

  const updateText = (nextValue: string) => {
    setText(nextValue);
    onExpand?.();
    onUserInput?.();
  };

  const resetText = () => {
    setText("");
  };

  return {
    text,
    setText,
    updateText,
    resetText,
    hasTypedText: Boolean(text.trim()),
  };
}
