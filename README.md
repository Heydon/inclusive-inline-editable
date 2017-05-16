# Inclusive Inline Editables

An accessible implementation of `contenteditable` that allows HTML editing.

## Features

* Ability to edit any element using `contenteditable` as standard or converted to HTML code
* Disallow unwanted tags
* Keyboard and screen reader accessible, with focus management
* Emission of `disallowed` and `save` events

## Initialization

There are two mandatory arguments for the constructor: a selector for the editable element and a selector for the button that enables entering and exiting editing. It is recommended you use `id` selectors (the script uses `querySelector` internally).

```js
var editable = new InlineEditable('#heading', '#button')
```

## Options

The third, optional argument is the options object. For example, you may want to enforce the use of `aria-label` for labeling the trigger button. This may be useful if you are using icons to represent the button.

```js
var editable = new InlineEditable('#heading', '#button' {
  ARIALabels: true
})
```

### All options

* `saveLabel` **(string):** The label for the button when the editable is in its active state (default: 'save')
* `ARIALabels` **(boolean):** Whether to use hidden labels in the form of `aria-label="label"` for each state (default: `false`)
* `allowHTML` **(boolean):** Whether to serialize the editable's content as a string representation of its HTML, for HTML editing (default: `true`)
* `disallowedTags` **(array):** Array of tags that the user cannot include when editing. If a disallowed tag is used, the `disallowed` event is emitted when the 'save' button is clicked and the editable element does not save (default: `['input', 'textarea', 'select', 'button', 'br']`)

## Adding listeners

### `save` example

```js
editable.on('save', function (content) {
  console.log('Saved content:', content)
})
```

### `disallowed` example

```js
editable.on('disallowed', function (node) {
  alert('<' + node.nodeName.toLowerCase() + '> element not allowed!')
})
```
