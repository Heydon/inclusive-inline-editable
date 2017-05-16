/* global define */

(function (global) {
  'use strict'

  // Constructor
  function InlineEditable (editable, button, options) {
    options = options || {}

    // The default settings for the module.
    this.settings = {
      saveLabel: 'save',
      ARIALabels: false,
      allowHTML: true,
      disallowedTags: ['input', 'textarea', 'select', 'button', 'br']
    }

    // Overwrite defaults where they are provided in options
    for (var setting in options) {
      if (options.hasOwnProperty(setting)) {
        this.settings[setting] = options[setting]
      }
    }

    // Save a reference to the edit button
    this.editButton = document.querySelector(button)

    // Set initial editButton label if it doesn't exist
    var hasTextNode = this.editButton.textContent !== ''
    this.settings.editLabel = hasTextNode ? this.editButton.textContent : 'edit'

    // Save a reference to the editable element.
    this.editable = document.querySelector(editable)

    // Error if editButton is a child of editable
    if (this.editable.contains(this.editButton)) {
      throw new Error('Inline editables cannot contain the buttons that control them.')
    }

    // Give button hidden or unhidden label
    if (this.settings.ARIALabels) {
      this.editButton.setAttribute('aria-label', this.settings.editLabel)
    } else {
      this.editButton.textContent = this.settings.editLabel
    }

    // Start out of editMode
    this.editMode = false

    // Named function for key-based confirm
    this.keyConfirm = function (e) {
      var key = e.which || e.keyCode || 0
      if (key === 13 || (key === 83 && (e.ctrlKey || e.metaKey))) {
        e.preventDefault()
        this.exitEditMode()
        if (this.valid) {
          this.editButton.focus()
        }
      }
    }

    // Save on Enter of save key combinations
    this.editable.addEventListener('keydown', this.keyConfirm.bind(this))

    // Add toggle listener to button
    this.editButton.addEventListener('click', this.toggleMode.bind(this))

    // initiate listeners object for public events
    this._listeners = {}
  }

  // enterEditMode method
  InlineEditable.prototype.enterEditMode = function () {
    this.editable.setAttribute('contenteditable', true)
    this.editable.setAttribute('role', 'textbox')

    // Change label
    if (this.settings.ARIALabels) {
      this.editButton.setAttribute('aria-label', this.settings.saveLabel)
    } else {
      this.editButton.textContent = this.settings.saveLabel
    }

    // If HTML is allowed, convert HTML to text
    if (this.settings.allowHTML) {
      this.editable.textContent = this.editable.innerHTML
    }

    // Place caret at end of editable element
    if (document.createRange) {
      var range = document.createRange()
      range.selectNodeContents(this.editable)
      range.collapse(false)
      var selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
    }

    // Focus the editable element
    this.editable.focus()

    // save Boolean to object
    this.editMode = true

    // Fire enterEditMode event
    this._fire('enterEditMode')

    return this
  }

  // enterEditMode method
  InlineEditable.prototype.exitEditMode = function () {
    // Assume validity
    this.valid = true

    // Use proxy to process content
    var proxy = document.createElement('span')
    proxy.innerHTML = this.editable.textContent

    if (this.settings.allowHTML) {
      // Remove script tags and disallowed tags
      this.settings.disallowedTags.push('script')
      var childElems = proxy.querySelectorAll(this.settings.disallowedTags.join(','))
      Array.prototype.forEach.call(childElems, function (childElem) {
        if (childElem) {
          this.valid = false
          // Fire exitEditMode event
          this._fire('disallowed', childElem)
        }
      }.bind(this))
    }

    if (this.valid) {
      this.editable.removeAttribute('contenteditable')
      this.editable.removeAttribute('role')

      if (this.settings.allowHTML) {
        // Write HTML back to editable
        this.editable.innerHTML = proxy.innerHTML
      }

      // Change label
      if (this.settings.ARIALabels) {
        this.editButton.setAttribute('aria-label', this.settings.editLabel)
      } else {
        this.editButton.textContent = this.settings.editLabel
      }

      // save Boolean to object
      this.editMode = false

      // Fire exitEditMode event
      this._fire('save', this.editable.innerHTML)
    }

    return this
  }

  // toggleMode method
  InlineEditable.prototype.toggleMode = function () {
    if (this.editMode) {
      this.exitEditMode()
    } else {
      this.enterEditMode()
    }

    return this
  }

  // Fire each registered event
  InlineEditable.prototype._fire = function (type, data) {
    var listeners = this._listeners[type] || []

    listeners.forEach(function (listener) {
      listener(data)
    })
  }

  // On method, like in jQuery, for adding handlers
  InlineEditable.prototype.on = function (type, handler) {
    if (typeof this._listeners[type] === 'undefined') {
      this._listeners[type] = []
    }

    this._listeners[type].push(handler)

    return this
  }

  // Off method for removing listeners
  InlineEditable.prototype.off = function (type, handler) {
    var index = this._listeners[type].indexOf(handler)

    if (index > -1) {
      this._listeners[type].splice(index, 1)
    }

    return this
  }

  // Destroy method for removing all listeners
  InlineEditable.prototype.destroy = function () {
    // Remove toggle listener on button
    // and key binding on editable
    this.editButton.removeEventListener('click', this.toggleMode)
    this.editable.removeEventListener('keydown', this.keyConfirm)

    // Empty listeners object
    this._listeners = {}

    this._fire('destroy')

    return this
  }

  // Export InlineEditable
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = InlineEditable
  } else if (typeof define === 'function' && define.amd) {
    define('InlineEditable', [], function () {
      return InlineEditable
    })
  } else if (typeof global === 'object') {
    // attach to window
    global.InlineEditable = InlineEditable
  }
}(this))
