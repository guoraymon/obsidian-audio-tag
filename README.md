# Obsidian Audio Tag

Embed audio players in your notes using simple tags. This plugin allows you to convert text into clickable audio tags that play back using the browser's Text-to-Speech functionality.

## Features

- **Simple Syntax**: Use `{text}(audio)` syntax to create clickable audio tags
- **Visual Indicators**: Audio tags appear with an underline and accent color for easy identification
- **Play Icon**: Each audio tag includes a speaker icon (🔊) for quick access
- **Multiple Modes**: Works in both Reading Mode and Live Preview/Editing Mode
- **Context Menu**: Right-click support to convert selected text to audio tags or remove them
- **Speech Synthesis**: Uses the browser's built-in Text-to-Speech engine

## Installation

1. Download the plugin files to your Obsidian vault's `.obsidian/plugins/` directory
2. Enable the plugin in Obsidian Settings → Community plugins
3. The plugin will be ready to use immediately

## Usage

### Basic Usage
To create an audio tag, wrap your text with curly braces followed by `(audio)`:

```
{Hello World}(audio)
{This is a sample text}(audio)
```

When you view your note, these will appear as clickable text with a dashed underline and a speaker icon. Clicking either the text or the icon will play the text using your browser's text-to-speech functionality.

### Context Menu
The plugin adds helpful options to your right-click context menu:

- **Convert to Audio Tag**: Select text and right-click to convert it to an audio tag
- **Remove Audio Tag**: When right-clicking on an existing audio tag, you can convert it back to regular text

## How It Works

- The plugin uses the Web Speech API to provide text-to-speech functionality
- Audio tags are rendered differently in Reading Mode and Live Preview/Editing Mode
- The speech synthesis is cancellable - clicking another audio tag will stop the current playback

## Example

```
I love learning {new things}(audio) every day. The sound of {rain drops}(audio) on the roof is very relaxing.
```

In your note, this will display as regular text with the marked portions appearing as clickable audio elements.

## Support

If you encounter any issues or have suggestions for improvements, please visit the [GitHub repository](https://github.com/guoraymon/obsidian-audio-tag).

## License

This plugin is licensed under the 0-BSD license.