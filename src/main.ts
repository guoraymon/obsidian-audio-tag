import { Plugin, Editor, Menu } from 'obsidian';
import { RangeSetBuilder } from '@codemirror/state';
import {
    Decoration,
    DecorationSet,
    EditorView,
    PluginValue,
    ViewPlugin,
    ViewUpdate,
    WidgetType,
} from '@codemirror/view';

const AUDIO_REGEXP = /\{([^}]+)\}\(audio\)/g;
const ERASER_ICON = 'eraser';
const AUDIO_ICON = 'audio-lines';
const ERASE_TEXT = 'Remove Audio Tag';
const CONVERT_TEXT = 'Convert to Audio Tag';

// --- 1. Speaker icon widget for edit mode ---
class AudioIconWidget extends WidgetType {
    constructor(readonly text: string, readonly playFn: (t: string) => void) {
        super();
    }
    toDOM() {
        const span = document.createElement("span");
        span.innerText = " 🔊";
        span.addClass("audio-link-icon");
        span.onclick = (e) => {
            e.preventDefault();
            this.playFn(this.text);
        };
        return span;
    }
}

// --- 2. Live Preview core logic ---
const audioLivePreview = (playFn: (t: string) => void) => ViewPlugin.fromClass(
    class implements PluginValue {
        decorations: DecorationSet;
        constructor(view: EditorView) { this.decorations = this.buildDecorations(view); }
        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged || update.selectionSet) {
                this.decorations = this.buildDecorations(update.view);
            }
        }
        buildDecorations(view: EditorView) {
            const builder = new RangeSetBuilder<Decoration>();
            const selection = view.state.selection.main;
            for (let { from, to } of view.visibleRanges) {
                const text = view.state.doc.sliceString(from, to);
                let match;
                while ((match = AUDIO_REGEXP.exec(text)) !== null) {
                    const start = from + match.index;
                    const end = start + match[0].length;
                    const word = match[1] || '';
                    const isEditing = selection.from >= start && selection.to <= end;

                    if (!isEditing) {
                        builder.add(start, end, Decoration.replace({
                            widget: new (class extends WidgetType {
                                toDOM() {
                                    const span = document.createElement("span");
                                    span.innerText = word;
                                    span.addClass("audio-link");
                                    span.onclick = () => playFn(word);
                                    return span;
                                }
                            })()
                        }));
                        builder.add(end, end, Decoration.widget({
                            widget: new AudioIconWidget(word, playFn),
                            side: 1
                        }));
                    }
                }
            }
            return builder.finish();
        }
    },
    { decorations: (v) => v.decorations }
);

// --- 3. Main plugin class ---
export default class AudioTagPlugin extends Plugin {
    onload() {
        // 1. Reading mode processing
        this.registerMarkdownPostProcessor((el) => {
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            let node;
            const tasks: { node: Text, matches: RegExpExecArray[] }[] = [];
            while ((node = walker.nextNode() as Text)) {
                const matches = Array.from(node.textContent.matchAll(AUDIO_REGEXP));
                if (matches.length > 0) tasks.push({ node, matches });
            }
            tasks.forEach(({ node, matches }) => {
                const fragment = document.createDocumentFragment();
                let lastIdx = 0;
                const fullText = node.textContent;
                matches.forEach(match => {
                    fragment.appendChild(document.createTextNode(fullText.slice(lastIdx, match.index)));
                    const span = fragment.createSpan({ cls: "audio-link" });
                    span.innerText = match[1] || '';
                    span.onclick = () => this.playTTS(match[1] || '');
                    lastIdx = match.index + match[0].length;
                });
                fragment.appendChild(document.createTextNode(fullText.slice(lastIdx)));
                node.replaceWith(fragment);
            });
        });

        // 2. Register editor extension
        this.registerEditorExtension([audioLivePreview(this.playTTS.bind(this))]);

        // 3. Context menu: Add removal functionality
        this.registerEvent(
            this.app.workspace.on("editor-menu", (menu: Menu, editor: Editor) => {
                const cursor = editor.getCursor();
                const lineText = editor.getLine(cursor.line);

                // Check if the cursor is inside a {word}(audio) tag
                let match;
                let foundMatch = null;
                const regex = /\{([^}]+)\}\(audio\)/g;

                while ((match = regex.exec(lineText)) !== null) {
                    const start = match.index;
                    const end = start + match[0].length;
                    if (cursor.ch >= start && cursor.ch <= end) {
                        foundMatch = {
                            full: match[0],
                            word: match[1],
                            start: { line: cursor.line, ch: start },
                            end: { line: cursor.line, ch: end }
                        };
                        break;
                    }
                }

                if (foundMatch) {
                    // If inside an Audio Tag, show removal option
                    menu.addItem((item) => {
                        item
                            .setTitle(ERASE_TEXT)
                            .setIcon(ERASER_ICON)
                            .onClick(() => {
                                editor.replaceRange(foundMatch.word || '', foundMatch.start, foundMatch.end);
                            });
                    });
                } else {
                    // If it's a normal selection, show conversion option
                    const selection = editor.getSelection();
                    if (selection) {
                        menu.addItem((item) => {
                            item
                                .setTitle(CONVERT_TEXT)
                                .setIcon(AUDIO_ICON)
                                .onClick(() => {
                                    editor.replaceSelection(`{${selection}}(audio)`);
                                });
                        });
                    }
                }
            })
        );
    }

    playTTS(text: string) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'en-US';
        window.speechSynthesis.speak(msg);
    }
}