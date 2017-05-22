/* global define */

(function (global) {
  'use strict'

  // Constructor
  function InlineEditable (editable, button, options) {
    options = options || {}

    // The default settings for the module.
    this.settings = {
      allowHTML: true,
      allowedTags: ['em', 'strong', 'a', 'span'],
      textareaMode: false,
      charLimit: false
    }

    // Overwrite defaults where they are provided in options
    for (var setting in options) {
      if (options.hasOwnProperty(setting)) {
        this.settings[setting] = options[setting]
      }
    }

    // Save a reference to the edit button
    this.editButton = document.querySelector(button)

    // Save a reference to the editable element.
    this.editable = document.querySelector(editable)

    // Error if editButton is a child of editable
    if (this.editable.contains(this.editButton)) {
      throw new Error('InlineEditables cannot contain the buttons that control them.')
    }

    // Create proxy helper
    this.createProxy = function (string) {
      var proxyElem = document.createElement('span')
      proxyElem.innerHTML = string
      return proxyElem
    }

    // Save inital content as string
    var proxy = this.createProxy(this.editable.textContent)
    proxy.textContent = this.editable.innerHTML
    this.savedContent = proxy.textContent

    // Place caret at end of editable element helper
    this.caretToEnd = function () {
      if (document.createRange) {
        var range = document.createRange()
        range.selectNodeContents(this.editable)
        range.collapse(false)
        var selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }

    // Start out of editMode
    this.editMode = false

    // Named function for key-based confirm
    this.keyConfirm = function (e) {
      var key = e.which || e.keyCode || 0
      if ((key === 13 && !this.settings.textareaMode) || (key === 83 && (e.ctrlKey || e.metaKey))) {
        e.preventDefault()
        this.saveEdit()
        if (this.valid) {
          this.editButton.focus()
        }
      }
    }

    this.limitCheck = function (e) {
      // Create proxy to get character length exclusing HTML tags
      var proxy = this.createProxy(this.editable.textContent)
      var chars = proxy.textContent.length
      if (chars > this.settings.charLimit) {
        // Fire limited event
        this._fire('limited', {
          editButton: this.editButton,
          editable: this.editable,
          charLimit: this.settings.charLimit
        })

        // Reset to original saved content
        this.editable.textContent = this.savedContent

        // Move caret to end of editable again
        this.caretToEnd()
      } else {
        // Update saved content
        this.savedContent = this.editable.textContent
      }
    }

    // Save on Enter of save key combinations
    this.editable.addEventListener('keydown', this.keyConfirm.bind(this))

    // Add toggle listener to button
    this.editButton.addEventListener('click', this.toggleMode.bind(this))

    // Execute limitCheck if there is a character limit set
    if (this.settings.charLimit) {
      this.editable.addEventListener('input', this.limitCheck.bind(this))
    }

    // Initiate listeners object for public events
    this._listeners = {}
  }

  // enterEditMode method
  InlineEditable.prototype.startEdit = function () {
    this.editable.setAttribute('contenteditable', true)
    this.editable.setAttribute('role', 'textbox')
    if (this.settings.textareaMode) {
      this.editable.setAttribute('aria-multiline', 'true')
    }

    // If HTML is allowed, convert HTML to text
    if (this.settings.allowHTML) {
      this.editable.textContent = this.editable.innerHTML
    }

    this.caretToEnd()

    // Focus the editable element
    this.editable.focus()

    // save Boolean to object
    this.editMode = true

    // Fire startEdit event
    this._fire('startEdit', {
      editButton: this.editButton,
      editable: this.editable
    })

    return this
  }

  // enterEditMode method
  InlineEditable.prototype.saveEdit = function () {
    // Assume validity
    this.valid = true

    // Use proxy to process content
    var proxy = this.createProxy(this.editable.textContent)

    if (this.settings.allowHTML) {
      var childElems = proxy.querySelectorAll('*')
      Array.prototype.forEach.call(childElems, function (childElem) {
        if (this.settings.allowedTags.indexOf(childElem.nodeName.toLowerCase()) < 0) {
          this.valid = false
          // Fire disallowed event
          this._fire('disallowed', {
            editButton: this.editButton,
            editable: this.editable,
            badElement: childElem
          })
        }
      }.bind(this))
    }

    if (this.valid) {
      // Make the editable a simple node again
      this.editable.removeAttribute('contenteditable')
      this.editable.removeAttribute('role')
      if (this.settings.textareaMode) {
        this.editable.removeAttribute('aria-multiline')
      }

      var nbspRemoved

      if (this.settings.allowHTML) {
        // Write HTML back to editable
        // with &nbsp; instances removed
        nbspRemoved = proxy.innerHTML.replace(/&nbsp;/g, '')
      } else {
        nbspRemoved = this.editable.innerHTML.replace(/&nbsp;/g, '')
      }

      this.editable.innerHTML = nbspRemoved

      // save Boolean to object
      this.editMode = false

      // Fire saveEdit event
      this._fire('saveEdit', {
        editButton: this.editButton,
        editable: this.editable
      })
    }

    return this
  }

  // toggleMode method
  InlineEditable.prototype.toggleMode = function () {
    if (this.editMode) {
      this.saveEdit()
    } else {
      this.startEdit()
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
    // Remove internal listeners
    this.editButton.removeEventListener('click', this.toggleMode)
    this.editable.removeEventListener('keydown', this.keyConfirm)
    this.editable.removeEventListener('input', this.limitCheck)

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
