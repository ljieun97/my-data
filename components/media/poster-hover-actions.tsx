"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";

type PosterHoverAction = {
  icon: IconDefinition;
  onClick: () => void;
  label: string;
  className?: string;
};

export default function PosterHoverActions({
  actions,
  overlayClassName = "",
  groupClassName = "",
}: {
  actions: PosterHoverAction[];
  overlayClassName?: string;
  groupClassName?: string;
}) {
  return (
    <div
      className={[
        "invisible absolute inset-0 z-10 flex items-center justify-center rounded-lg transition",
        overlayClassName,
      ].join(" ")}
    >
      <div className={["flex gap-2", groupClassName].join(" ")}>
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            aria-label={action.label}
            className={action.className}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              action.onClick();
            }}
          >
            <FontAwesomeIcon icon={action.icon} />
          </button>
        ))}
      </div>
    </div>
  );
}
