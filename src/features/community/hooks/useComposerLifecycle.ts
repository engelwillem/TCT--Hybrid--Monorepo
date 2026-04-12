import { useState } from "react";
import type { ComposerPanel } from "../components/post-composer/types";

type UseComposerLifecycleParams = {
  initialExpanded?: boolean;
};

export function useComposerLifecycle({ initialExpanded = false }: UseComposerLifecycleParams) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [activePanel, setActivePanel] = useState<ComposerPanel>("none");

  const openComposer = () => {
    setIsExpanded(true);
  };

  const togglePanel = (panel: ComposerPanel) => {
    setIsExpanded(true);
    setActivePanel((prev) => (prev === panel ? "none" : panel));
  };

  const resetLifecycle = () => {
    setIsExpanded(false);
    setActivePanel("none");
  };

  return {
    isExpanded,
    activePanel,
    openComposer,
    togglePanel,
    resetLifecycle,
  };
}
