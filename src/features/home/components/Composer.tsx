import {
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { ACCESS_OPTIONS, EFFORT_OPTIONS, MODEL_OPTIONS } from "../composer-options";
import PopoverMenu from "./PopoverMenu";
import { ArrowUpIcon, CloseIcon, LockIcon, PlusIcon, SparkleIcon } from "./icons";

export type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  model: string;
  effort: string;
  access: string;
  onModelChange: (model: string) => void;
  onEffortChange: (effort: string) => void;
  onAccessChange: (access: string) => void;
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
  effort,
  access,
  onModelChange,
  onEffortChange,
  onAccessChange,
  disabled = false,
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
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

  function handleFiles(event: ChangeEvent<HTMLInputElement>): void {
    const picked = Array.from(event.target.files ?? []);
    if (picked.length > 0) {
      setAttachments((current) => [...current, ...picked]);
    }
    // Reset so picking the same file again still fires a change event.
    event.target.value = "";
  }

  function removeAttachment(index: number): void {
    setAttachments((current) => current.filter((_, position) => position !== index));
  }

  function submit(): void {
    if (!canSubmit) return;
    onSubmit();
    setAttachments([]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key !== "Enter" || event.shiftKey) return;
    // IME composition uses Enter to accept a candidate; never submit on that key.
    // WebView2/Chromium fire compositionend before the committing keydown, so isComposing
    // is already false there; keyCode 229 is the legacy marker for an IME-handled keydown.
    if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;

    event.preventDefault();
    submit();
  }

  return (
    <div className="home-composer">
      {attachments.length > 0 ? (
        <ul className="home-composer-files" aria-label="Attached files">
          {attachments.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
              className="home-composer-file"
            >
              <span className="home-composer-file-name" title={file.name}>
                {file.name}
              </span>
              <button
                type="button"
                className="home-composer-file-remove"
                aria-label={`Remove ${file.name}`}
                onClick={() => removeAttachment(index)}
              >
                <CloseIcon />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <textarea
        ref={textareaRef}
        className="home-composer-input"
        rows={1}
        placeholder="Ask, build, or describe a change..."
        aria-label="Prompt"
        autoFocus
        disabled={disabled}
        value={value}
        onChange={handleChange}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
      />

      <div className="home-composer-actions">
        <button
          className="home-composer-attach"
          type="button"
          aria-label="Attach files"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          <PlusIcon />
        </button>
        <input
          ref={fileInputRef}
          className="home-composer-file-input"
          type="file"
          multiple
          tabIndex={-1}
          aria-hidden="true"
          onChange={handleFiles}
        />

        <div className="home-composer-model-group">
          <PopoverMenu
            label="Model"
            value={model}
            options={MODEL_OPTIONS}
            onChange={onModelChange}
            icon={<SparkleIcon className="home-composer-sparkle" />}
          />

          <span className="home-composer-model-divider" aria-hidden="true" />

          <PopoverMenu
            label="Effort"
            value={effort}
            options={EFFORT_OPTIONS}
            onChange={onEffortChange}
            className="home-composer-effort"
          />
        </div>

        <PopoverMenu
          label="Access"
          value={access}
          options={ACCESS_OPTIONS}
          onChange={onAccessChange}
          icon={<LockIcon />}
          className="home-composer-access"
        />

        <span className="home-composer-spacer" />

        <button
          className="home-composer-submit"
          type="button"
          aria-label="Send prompt"
          disabled={!canSubmit}
          onClick={submit}
        >
          <ArrowUpIcon />
        </button>
      </div>
    </div>
  );
}
