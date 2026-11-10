import {
  useLayoutEffect,
  useRef,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { ArrowUpIcon, ChevronDownIcon, PlusIcon } from "./icons";

export type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  model: string;
  mode: string;
  disabled?: boolean;
};

const MAX_HEIGHT = 160;

function fitHeight(element: HTMLTextAreaElement): void {
  const scrollTop = element.scrollTop;

  element.style.height = "auto";
  element.style.height = `${Math.min(element.scrollHeight, MAX_HEIGHT)}px`;
  // Collapsing to "auto" clamps scrollTop; restore it so a long draft does not jump.
  element.scrollTop = scrollTop;
}

export default function Composer({
  value,
  onChange,
  onSubmit,
  model,
  mode,
  disabled = false,
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSubmit = !disabled && value.trim().length > 0;

  // Re-measure after every value change so a draft restored by switching sessions
  // (or cleared by submit) starts at the right height instead of a stale one.
  useLayoutEffect(() => {
    if (textareaRef.current) {
      fitHeight(textareaRef.current);
    }
  }, [value]);

  function handleInput(event: FormEvent<HTMLTextAreaElement>): void {
    fitHeight(event.currentTarget);
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    onChange(event.target.value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key !== "Enter" || event.shiftKey) return;
    // IME composition uses Enter to accept a candidate; never submit on that key.
    // WebView2/Chromium fire compositionend before the committing keydown, so isComposing
    // is already false there; keyCode 229 is the legacy marker for an IME-handled keydown.
    if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;

    event.preventDefault();

    if (canSubmit) {
      onSubmit();
    }
  }

  return (
    <div className="home-composer">
      <textarea
        ref={textareaRef}
        className="home-composer-input"
        rows={1}
        placeholder="Ask, build, or describe a change…"
        aria-label="Prompt"
        value={value}
        onChange={handleChange}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
      />

      <div className="home-composer-actions">
        <button className="home-composer-add" type="button" aria-label="Add context" disabled>
          <PlusIcon />
        </button>

        <span className="home-composer-pill home-composer-model">
          <span className="home-composer-dot" aria-hidden="true" />
          {model}
          <ChevronDownIcon className="home-composer-chevron" />
        </span>

        <span className="home-composer-pill home-composer-mode">{mode}</span>

        <span className="home-composer-spacer" />

        <button
          className="home-composer-submit"
          type="button"
          aria-label="Send prompt"
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          <ArrowUpIcon />
        </button>
      </div>
    </div>
  );
}
