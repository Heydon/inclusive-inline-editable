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
* `disallowedTags` **(array):** Array of tags **in addition to script tags** that the user cannot include when editing. If a disallowed tag is used, the `disallowed` event is emitted when the user tries to save (default: `['input', 'textarea', 'select', 'button', 'br']`)

### Disallowing just links example

```js
var editable = new InlineEditable('#heading', '#button', {
  disallowed: ['a']
})
```

## Adding listeners

The `startEdit` and `saveEdit` events are supplied a `data` object that contains the `editButton` and the `editable` as nodes.

### `saveEdit` example

```js
editable.on('saveEdit', function (data) {
  console.log('Saved content:', data.editable.innerHTML)
})
```

The `disallowed` event's `data` object also includes the offending disallowed element as `badElement`. This is the first disallowed element the script finds; there may be others.

### `disallowed` example

```js
editable.on('disallowed', function (data) {
  alert('<' + data.badElement.nodeName.toLowerCase() + '> element not allowed!')
})
```
