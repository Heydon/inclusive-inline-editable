# Inclusive Inline Editables

An accessible implementation of `contenteditable` that allows HTML editing.

## Features

* Ability to edit any element using `contenteditable` as standard or converted to HTML code
* Disallow unwanted tags
* Keyboard and screen reader accessible, with focus management
* Emission of `startEdit`, `saveEdit`, and `disallowed` events

## Initialization

There are two mandatory arguments for the constructor: a selector for the editable element and a selector for the button that enables entering and exiting editing. It is recommended you use `id` selectors (the script uses `querySelector` internally).

```js
var editable = new InlineEditable('#heading', '#button')
```

## Options

* `allowHTML` **(boolean):** Whether to serialize the editable's content as a string representation of its HTML, for HTML editing (default: `true`)
* `allowedTags` **(array):** Array of tags that the user can include when editing. If a disallowed tag is used, the `disallowed` event is emitted when the user tries to save (default: `['em', 'strong', 'a']`)
* `textareaMode` **(boolean)**: The editable behaves like a `<textarea>`, allowing carriage returns and taking the `aria-multiline="true"` attribute (default: `false`)
* `charLimit` **(false or number)**: If set, this will limit the number of characters one can enter in the editable. Is based on the `textContent` length, not the serialized HTML string length, so excludes HTML tags in the count (default: `false`)

### Allowing just `<em>`s and `<strong>`s example

```js
var editable = new InlineEditable('#heading', '#button', {
  allowedTags: ['em', 'strong']
})
```

## Events

* `startEdit` → when the editable element becomes editable and focus is moved to it
* `saveEdit` → when the editable element is valid and the user has hit <kbd>cmd</kmd> + <kbd>s</kbd>, or <kbd>Enter</kbd>, or clicked the edit button to save.
* `disallowed` → when saving is suppressed because disallowed HTML tags (tags not included in the  `allowedTags` option) have been used
* `limited` → when the character limit (set with `charLimit`) has been reached and any extra characters have been removed

### Adding listeners

The `startEdit` and `saveEdit` events are supplied a `data` object that contains the `editButton` and the `editable` as nodes.

#### `saveEdit` example

```js
editable.on('saveEdit', function (data) {
  console.log('Saved content:', data.editable.innerHTML)
})
```

The `disallowed` event's `data` object also includes the offending disallowed element as `badElement`. This is the first disallowed element the script finds; there may be others.

#### `disallowed` example

```js
editable.on('disallowed', function (data) {
  alert('<' + data.badElement.nodeName.toLowerCase() + '> element not allowed!')
})
```

#### `limited` example

The `limited` event's data object includes the `charLimit` value.

```js
editable.on('limited', function (data) {
  console.log(data.charLimit + ' characters reached!')
})
```
