# Inclusive Inline Editables

An accessible implementation of `contenteditable` that allows HTML editing.

## Features

* Ability to edit any element using `contenteditable` as standard or serialized to HTML code
* Set which tags you allow
* Keyboard and screen reader accessible, with focus management
* Limit the number of characters allowed. Only the content is counted, not the HTML!
* Emission of `startEdit`, `saveEdit`, `limited`, and `disallowed` events

## Initialization

There are two mandatory arguments for the constructor: a selector for the editable element and a selector for the button that enables entering and exiting editing. It is recommended you use `id` selectors (the script uses `querySelector` internally). If the button is contained inside the "editable" an error is thrown.

```js
var editable = new InlineEditable('#heading', '#button')
```

## Options

* `allowHTML` **(boolean):** Whether to serialize the editable's content as a string representation of its HTML, for HTML editing (default: `true`)
* `allowedTags` **(array):** Array of tags that the user can include when editing. If a disallowed tag is used, the `disallowed` event is emitted when the user tries to save (default: `['em', 'strong', 'a', 'span']`)
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
* `saveEdit` → when the editable element is valid and the user has hit <kbd>cmd</kbd> (or <kbd>ctrl</kbd>) + <kbd>s</kbd>, or <kbd>Enter</kbd>, or clicked the edit button to save.
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

#### `disallowed` example

The `disallowed` event's `data` object also includes the an array of the offending disallowed elements as `badElems`. Here's how one might alert the user to which disallowed elements have been included:

```js
editable.on('disallowed', function (data) {
  var badNodes = data.badElems.map(function(bad) {
    return '<' + bad.nodeName.toLowerCase() + '>'
  })
  var uniqueBadNodes = badNodes.filter(function(elem, index, self) {
    return index == self.indexOf(elem)
  })
  var badString = uniqueBadNodes.join(', ')
  alert(badString + ' not allowed!') // e.g. "<blockquote>, <figure> not allowed!"
})
```

#### `limited` example

The `limited` event's data object includes the `charLimit` value.

```js
editable.on('limited', function (data) {
  console.log(data.charLimit + ' characters reached!')
})
```
