import React, { RefObject, useContext, useEffect } from 'react';
import { DataGridEditorContext, EditorContext } from './NewEditorContainer';

const navKeys = new Set(['Enter', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

interface DataGridEditorOption {
  preventNavigation?(e: React.KeyboardEvent<HTMLInputElement>): boolean;
}

type DataGridEditorReturnType = [
  (e: React.KeyboardEvent<HTMLInputElement>) => void
];

export function useDataGridEditor(ref: RefObject<Element | Text | null | undefined> | undefined, {
  preventNavigation
}: DataGridEditorOption): DataGridEditorReturnType {
  const { firstEditorKeyPress, commit, commitCancel, onGridKeyDown } = useContext(DataGridEditorContext) as Required<EditorContext>;

  useEffect(() => {
    if (ref && ref.current) {
      if (ref.current instanceof HTMLElement) {
        ref.current.focus();
      }

      if ((firstEditorKeyPress === 'Enter' || firstEditorKeyPress === null) && ref.current instanceof HTMLInputElement) {
        ref.current.select();
      }
    }
  }, [firstEditorKeyPress, ref]);

  function preventDefaultNavigation(e: React.KeyboardEvent<HTMLInputElement>): boolean {
    if (!ref) {
      return (preventNavigation && preventNavigation(e)) || false;
    }

    const isCaretAtBeginningOfInput = (): boolean => {
      return ref.current instanceof HTMLInputElement && ref.current.selectionEnd === 0;
    };

    const isCaretAtEndOfInput = (): boolean => {
      return ref.current instanceof HTMLInputElement
        && ref.current.selectionStart === ref.current.value.length;
    };

    if (
      (preventNavigation && preventNavigation(e))
      // prevent event propogation. this disables left cell navigation
      || (e.key === 'ArrowLeft' && !isCaretAtBeginningOfInput())
      // prevent event propogation. this disables right cell navigation
      || (e.key === 'ArrowRight' && !isCaretAtEndOfInput())
    ) {
      e.stopPropagation();
      return true;
    }

    return false;
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (!preventDefaultNavigation(e)) {
      if (navKeys.has(e.key)) {
        commit();
      } else if (e.key === 'Escape') {
        commitCancel();
      }
    }

    onGridKeyDown && onGridKeyDown(e);
  }

  return [onKeyDown];
}