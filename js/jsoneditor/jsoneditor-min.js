/*!
 * jsoneditor.js
 *
 * @brief
 * JSONEditor is a web-based tool to view, edit, and format JSON.
 * It shows data a clear, editable treeview.
 *
 * Supported browsers: Chrome, Firefox, Safari, Opera, Internet Explorer 8+
 *
 * @license
 * This json editor is open sourced with the intention to use the editor as
 * a component in your own application. Not to just copy and monetize the editor
 * as it is.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * Copyright (c) 2011-2013 Jos de Jong, http://jsoneditoronline.org
 *
 * @author  Jos de Jong, <wjosdejong@gmail.com>
 * @version 2.2.1
 * @date    2013-05-27
 */
(function () {
  function e(t, i, o) {
    if (!(this instanceof e))throw new Error('JSONEditor constructor called without "new".');
    arguments.length && this._create(t, i, o)
  }

  function t(e, i, o) {
    if (!(this instanceof t))throw new Error('TreeEditor constructor called without "new".');
    this._create(e, i, o)
  }

  function i(e, t, o) {
    if (!(this instanceof i))throw new Error('TextEditor constructor called without "new".');
    this._create(e, t, o)
  }

  function o(e, t) {
    this.editor = e, this.dom = {}, this.expanded = !1, t && t instanceof Object ? (this.setField(t.field, t.fieldEditable), this.setValue(t.value, t.type)) : (this.setField(""), this.setValue(null))
  }

  function n(e) {
    this.editor = e, this.dom = {}
  }

  function s(e, t) {
    function i(e, t, n) {
      n.forEach(function (n) {
        if (n.type == "separator") {
          var s = document.createElement("div");
          s.className = "separator", a = document.createElement("li"), a.appendChild(s), e.appendChild(a)
        } else {
          var r = {}, a = document.createElement("li");
          e.appendChild(a);
          var l = document.createElement("button");
          if (l.className = n.className, r.button = l, n.title && (l.title = n.title), n.click && (l.onclick = function () {
            o.hide(), n.click()
          }), a.appendChild(l), n.submenu) {
            var d = document.createElement("div");
            d.className = "icon", l.appendChild(d), l.appendChild(document.createTextNode(n.text));
            var h;
            if (n.click) {
              l.className += " default";
              var c = document.createElement("button");
              r.buttonExpand = c, c.className = "expand", c.innerHTML = '<div class="expand"></div>', a.appendChild(c), n.submenuTitle && (c.title = n.submenuTitle), h = c
            } else {
              var u = document.createElement("div");
              u.className = "expand", l.appendChild(u), h = l
            }
            h.onclick = function () {
              o._onExpandItem(r), h.focus()
            };
            var p = [];
            r.subItems = p;
            var f = document.createElement("ul");
            r.ul = f, f.className = "menu", f.style.height = "0", a.appendChild(f), i(f, p, n.submenu)
          } else l.innerHTML = '<div class="icon"></div>' + n.text;
          t.push(r)
        }
      })
    }

    this.dom = {};
    var o = this, n = this.dom;
    this.anchor = void 0, this.items = e, this.eventListeners = {}, this.selection = void 0, this.visibleSubmenu = void 0, this.onClose = t ? t.close : void 0;
    var s = document.createElement("div");
    s.className = "jsoneditor-contextmenu", n.menu = s;
    var r = document.createElement("ul");
    r.className = "menu", s.appendChild(r), n.list = r, n.items = [];
    var a = document.createElement("button");
    n.focusButton = a;
    var l = document.createElement("li");
    l.style.overflow = "hidden", l.style.height = "0", l.appendChild(a), r.appendChild(l), i(r, this.dom.items, e), this.maxHeight = 0, e.forEach(function (t) {
      var i = (e.length + (t.submenu ? t.submenu.length : 0)) * 24;
      o.maxHeight = Math.max(o.maxHeight, i)
    })
  }

  function r(e) {
    this.editor = e, this.clear(), this.actions = {editField: {undo: function (e) {
      e.node.updateField(e.oldValue)
    }, redo: function (e) {
      e.node.updateField(e.newValue)
    }}, editValue: {undo: function (e) {
      e.node.updateValue(e.oldValue)
    }, redo: function (e) {
      e.node.updateValue(e.newValue)
    }}, appendNode: {undo: function (e) {
      e.parent.removeChild(e.node)
    }, redo: function (e) {
      e.parent.appendChild(e.node)
    }}, insertBeforeNode: {undo: function (e) {
      e.parent.removeChild(e.node)
    }, redo: function (e) {
      e.parent.insertBefore(e.node, e.beforeNode)
    }}, insertAfterNode: {undo: function (e) {
      e.parent.removeChild(e.node)
    }, redo: function (e) {
      e.parent.insertAfter(e.node, e.afterNode)
    }}, removeNode: {undo: function (e) {
      var t = e.parent, i = t.childs[e.index] || t.append;
      t.insertBefore(e.node, i)
    }, redo: function (e) {
      e.parent.removeChild(e.node)
    }}, duplicateNode: {undo: function (e) {
      e.parent.removeChild(e.clone)
    }, redo: function (e) {
      e.parent.insertAfter(e.clone, e.node)
    }}, changeType: {undo: function (e) {
      e.node.changeType(e.oldType)
    }, redo: function (e) {
      e.node.changeType(e.newType)
    }}, moveNode: {undo: function (e) {
      e.startParent.moveTo(e.node, e.startIndex)
    }, redo: function (e) {
      e.endParent.moveTo(e.node, e.endIndex)
    }}, sort: {undo: function (e) {
      var t = e.node;
      t.hideChilds(), t.sort = e.oldSort, t.childs = e.oldChilds, t.showChilds()
    }, redo: function (e) {
      var t = e.node;
      t.hideChilds(), t.sort = e.newSort, t.childs = e.newChilds, t.showChilds()
    }}}
  }

  function a(e, t) {
    var i = this;
    this.editor = e, this.timeout = void 0, this.delay = 200, this.lastText = void 0, this.dom = {}, this.dom.container = t;
    var o = document.createElement("table");
    this.dom.table = o, o.className = "search", t.appendChild(o);
    var n = document.createElement("tbody");
    this.dom.tbody = n, o.appendChild(n);
    var s = document.createElement("tr");
    n.appendChild(s);
    var r = document.createElement("td");
    s.appendChild(r);
    var a = document.createElement("div");
    this.dom.results = a, a.className = "results", r.appendChild(a), r = document.createElement("td"), s.appendChild(r);
    var l = document.createElement("div");
    this.dom.input = l, l.className = "frame", l.title = "Search fields and values", r.appendChild(l);
    var d = document.createElement("table");
    l.appendChild(d);
    var h = document.createElement("tbody");
    d.appendChild(h), s = document.createElement("tr"), h.appendChild(s);
    var c = document.createElement("button");
    c.className = "refresh", r = document.createElement("td"), r.appendChild(c), s.appendChild(r);
    var u = document.createElement("input");
    this.dom.search = u, u.oninput = function (e) {
      i._onDelayedSearch(e)
    }, u.onchange = function (e) {
      i._onSearch(e)
    }, u.onkeydown = function (e) {
      i._onKeyDown(e)
    }, u.onkeyup = function (e) {
      i._onKeyUp(e)
    }, c.onclick = function () {
      u.select()
    }, r = document.createElement("td"), r.appendChild(u), s.appendChild(r);
    var p = document.createElement("button");
    p.title = "Next result (Enter)", p.className = "next", p.onclick = function () {
      i.next()
    }, r = document.createElement("td"), r.appendChild(p), s.appendChild(r);
    var f = document.createElement("button");
    f.title = "Previous result (Shift+Enter)", f.className = "previous", f.onclick = function () {
      i.previous()
    }, r = document.createElement("td"), r.appendChild(f), s.appendChild(r)
  }

  function l() {
    this.locked = !1
  }

  e.modes = {}, e.prototype._create = function (e, t, i) {
    this.container = e, this.options = t || {}, this.json = i || {};
    var o = this.options.mode || "tree";
    this.setMode(o)
  }, e.prototype._delete = function () {
  }, e.prototype.set = function (e) {
    this.json = e
  }, e.prototype.get = function () {
    return this.json
  }, e.prototype.setText = function (e) {
    this.json = util.parse(e)
  }, e.prototype.getText = function () {
    return JSON.stringify(this.json)
  }, e.prototype.setName = function (e) {
    this.options || (this.options = {}), this.options.name = e
  }, e.prototype.getName = function () {
    return this.options && this.options.name
  }, e.prototype.setMode = function (t) {
    var i, o, n = this.container, s = util.extend({}, this.options);
    s.mode = t;
    var r = e.modes[t];
    if (!r)throw new Error('Unknown mode "' + s.mode + '"');
    try {
      if (r.data == "text" ? (o = this.getName(), i = this.getText(), this._delete(), util.clear(this), util.extend(this, r.editor.prototype), this._create(n, s), this.setName(o), this.setText(i)) : (o = this.getName(), i = this.get(), this._delete(), util.clear(this), util.extend(this, r.editor.prototype), this._create(n, s), this.setName(o), this.set(i)), typeof r.load == "function")try {
        r.load.call(this)
      } catch (a) {
      }
    } catch (a) {
      this._onError(a)
    }
  }, e.prototype._onError = function (e) {
    if (typeof this.onError == "function" && (util.log("WARNING: JSONEditor.onError is deprecated. Use options.error instead."), this.onError(e)), typeof this.options.error != "function")throw e;
    this.options.error(e)
  }, t.prototype._create = function (e, t, i) {
    if ("undefined" == typeof JSON)throw new Error("Your browser does not support JSON. \n\nPlease install the newest version of your browser.\n(all modern browsers support JSON).");
    if (!e)throw new Error("No container element provided.");
    this.container = e, this.dom = {}, this.highlighter = new l, this.selection = void 0, this._setOptions(t), this.options.history && !this.mode.view && (this.history = new r(this)), this._createFrame(), this._createTable(), this.set(i || {})
  }, t.prototype._delete = function () {
    this.frame && this.container && this.frame.parentNode == this.container && this.container.removeChild(this.frame)
  }, t.prototype._setOptions = function (e) {
    if (this.options = {search: !0, history: !0, mode: "tree", name: void 0}, e) {
      for (var t in e)e.hasOwnProperty(t) && (this.options[t] = e[t]);
      e.enableSearch && (this.options.search = e.enableSearch, util.log('WARNING: Option "enableSearch" is deprecated. Use "search" instead.')), e.enableHistory && (this.options.history = e.enableHistory, util.log('WARNING: Option "enableHistory" is deprecated. Use "history" instead.')), e.mode == "editor" && (this.options.mode = "tree", util.log('WARNING: Mode "editor" is deprecated. Use "tree" instead.')), e.mode == "viewer" && (this.options.mode = "view", util.log('WARNING: Mode "viewer" is deprecated. Use "view" instead.'))
    }
    this.mode = {edit: this.options.mode != "view" && this.options.mode != "form", view: this.options.mode == "view", form: this.options.mode == "form"}
  }, t.focusNode = void 0, t.prototype.set = function (e, t) {
    if (t && (util.log('Warning: second parameter "name" is deprecated. Use setName(name) instead.'), this.options.name = t), e instanceof Function || void 0 === e)this.clear(); else {
      this.content.removeChild(this.table);
      var i = {field: this.options.name, value: e}, n = new o(this, i);
      this._setRoot(n);
      var s = !1;
      this.node.expand(s), this.content.appendChild(this.table)
    }
    this.history && this.history.clear()
  }, t.prototype.get = function () {
    return t.focusNode && t.focusNode.blur(), this.node ? this.node.getValue() : void 0
  }, t.prototype.getText = function () {
    return JSON.stringify(this.get())
  }, t.prototype.setText = function (e) {
    this.set(util.parse(e))
  }, t.prototype.setName = function (e) {
    this.options.name = e, this.node && this.node.updateField(this.options.name)
  }, t.prototype.getName = function () {
    return this.options.name
  }, t.prototype.clear = function () {
    this.node && (this.node.collapse(), this.tbody.removeChild(this.node.getDom()), delete this.node)
  }, t.prototype._setRoot = function (e) {
    this.clear(), this.node = e, this.tbody.appendChild(e.getDom())
  }, t.prototype.search = function (e) {
    var t;
    return this.node ? (this.content.removeChild(this.table), t = this.node.search(e), this.content.appendChild(this.table)) : t = [], t
  }, t.prototype.expandAll = function () {
    this.node && (this.content.removeChild(this.table), this.node.expand(), this.content.appendChild(this.table))
  }, t.prototype.collapseAll = function () {
    this.node && (this.content.removeChild(this.table), this.node.collapse(), this.content.appendChild(this.table))
  }, t.prototype._onAction = function (e, t) {
    if (this.history && this.history.add(e, t), this.options.change)try {
      this.options.change()
    } catch (i) {
      util.log("Error in change callback: ", i)
    }
  }, t.prototype.startAutoScroll = function (e) {
    var t = this, i = this.content, o = util.getAbsoluteTop(i), n = i.clientHeight, s = o + n, r = 24, a = 50;
    this.autoScrollStep = o + r > e && i.scrollTop > 0 ? (o + r - e) / 3 : e > s - r && n + i.scrollTop < i.scrollHeight ? (s - r - e) / 3 : void 0, this.autoScrollStep ? this.autoScrollTimer || (this.autoScrollTimer = setInterval(function () {
      t.autoScrollStep ? i.scrollTop -= t.autoScrollStep : t.stopAutoScroll()
    }, a)) : this.stopAutoScroll()
  }, t.prototype.stopAutoScroll = function () {
    this.autoScrollTimer && (clearTimeout(this.autoScrollTimer), delete this.autoScrollTimer), this.autoScrollStep && delete this.autoScrollStep
  }, t.prototype.setSelection = function (e) {
    e && ("scrollTop"in e && this.content && (this.content.scrollTop = e.scrollTop), e.range && util.setSelectionOffset(e.range), e.dom && e.dom.focus())
  }, t.prototype.getSelection = function () {
    return{dom: t.domFocus, scrollTop: this.content ? this.content.scrollTop : 0, range: util.getSelectionOffset()}
  }, t.prototype.scrollTo = function (e, t) {
    var i = this.content;
    if (i) {
      var o = this;
      o.animateTimeout && (clearTimeout(o.animateTimeout), delete o.animateTimeout), o.animateCallback && (o.animateCallback(!1), delete o.animateCallback);
      var n = i.clientHeight, s = i.scrollHeight - n, r = Math.min(Math.max(e - n / 4, 0), s), a = function () {
        var e = i.scrollTop, n = r - e;
        Math.abs(n) > 3 ? (i.scrollTop += n / 3, o.animateCallback = t, o.animateTimeout = setTimeout(a, 50)) : (t && t(!0), i.scrollTop = r, delete o.animateTimeout, delete o.animateCallback)
      };
      a()
    } else t && t(!1)
  }, t.prototype._createFrame = function () {
    this.frame = document.createElement("div"), this.frame.className = "jsoneditor", this.container.appendChild(this.frame);
    var e = this, t = function (t) {
      e._onEvent(t)
    };
    this.frame.onclick = function (e) {
      e = e || window.event;
      var i = e.target || e.srcElement;
      t(e), i.nodeName == "BUTTON" && util.preventDefault(e)
    }, this.frame.oninput = t, this.frame.onchange = t, this.frame.onkeydown = t, this.frame.onkeyup = t, this.frame.oncut = t, this.frame.onpaste = t, this.frame.onmousedown = t, this.frame.onmouseup = t, this.frame.onmouseover = t, this.frame.onmouseout = t, util.addEventListener(this.frame, "focus", t, !0), util.addEventListener(this.frame, "blur", t, !0), this.frame.onfocusin = t, this.frame.onfocusout = t, this.menu = document.createElement("div"), this.menu.className = "menu", this.frame.appendChild(this.menu);
    var i = document.createElement("button");
    i.className = "expand-all", i.title = "Expand all fields", i.onclick = function () {
      e.expandAll()
    }, this.menu.appendChild(i);
    var o = document.createElement("button");
    if (o.title = "Collapse all fields", o.className = "collapse-all", o.onclick = function () {
      e.collapseAll()
    }, this.menu.appendChild(o), this.history) {
      var n = document.createElement("span");
      n.innerHTML = "&nbsp;", this.menu.appendChild(n);
      var s = document.createElement("button");
      s.className = "undo", s.title = "Undo last action (Ctrl+Z)", s.onclick = function () {
        e._onUndo()
      }, this.menu.appendChild(s), this.dom.undo = s;
      var r = document.createElement("button");
      r.className = "redo", r.title = "Redo (Ctrl+Shift+Z)", r.onclick = function () {
        e._onRedo()
      }, this.menu.appendChild(r), this.dom.redo = r, this.history.onChange = function () {
        s.disabled = !e.history.canUndo(), r.disabled = !e.history.canRedo()
      }, this.history.onChange()
    }
    this.options.search && (this.searchBox = new a(this, this.menu))
  }, t.prototype._onUndo = function () {
    this.history && (this.history.undo(), this.options.change && this.options.change())
  }, t.prototype._onRedo = function () {
    this.history && (this.history.redo(), this.options.change && this.options.change())
  }, t.prototype._onEvent = function (e) {
    e = e || window.event;
    var i = e.target || e.srcElement;
    e.type == "keydown" && this._onKeyDown(e), e.type == "focus" && (t.domFocus = i);
    var n = o.getNodeFromTarget(i);
    n && n.onEvent(e)
  }, t.prototype._onKeyDown = function (e) {
    var i = e.which || e.keyCode, o = e.ctrlKey, n = e.shiftKey, s = !1;
    if (9 == i && setTimeout(function () {
      util.selectContentEditable(t.domFocus)
    }, 0), this.searchBox)if (o && 70 == i)this.searchBox.dom.search.focus(), this.searchBox.dom.search.select(), s = !0; else if (114 == i || o && 71 == i) {
      var r = !0;
      n ? this.searchBox.previous(r) : this.searchBox.next(r), s = !0
    }
    this.history && (o && !n && 90 == i ? (this._onUndo(), s = !0) : o && n && 90 == i && (this._onRedo(), s = !0)), s && (util.preventDefault(e), util.stopPropagation(e))
  }, t.prototype._createTable = function () {
    var e = document.createElement("div");
    e.className = "outer", this.contentOuter = e, this.content = document.createElement("div"), this.content.className = "content", e.appendChild(this.content), this.table = document.createElement("table"), this.table.className = "content", this.content.appendChild(this.table);
    var t = util.getInternetExplorerVersion();
    8 == t && (this.content.style.overflow = "scroll");
    var i;
    this.colgroupContent = document.createElement("colgroup"), this.mode.edit && (i = document.createElement("col"), i.width = "24px", this.colgroupContent.appendChild(i)), i = document.createElement("col"), i.width = "24px", this.colgroupContent.appendChild(i), i = document.createElement("col"), this.colgroupContent.appendChild(i), this.table.appendChild(this.colgroupContent), this.tbody = document.createElement("tbody"), this.table.appendChild(this.tbody), this.frame.appendChild(e)
  }, e.modes.tree = {editor: t, data: "json"}, e.modes.view = {editor: t, data: "json"}, e.modes.form = {editor: t, data: "json"}, e.modes.editor = {editor: t, data: "json"}, e.modes.viewer = {editor: t, data: "json"}, i.prototype._create = function (e, t, i) {
    if ("undefined" == typeof JSON)throw new Error("Your browser does not support JSON. \n\nPlease install the newest version of your browser.\n(all modern browsers support JSON).");
    t = t || {}, t.indentation && (this.indentation = Number(t.indentation)), this.options = t || {}, this.mode = t.mode == "code" ? "code" : "text", this.mode == "code" && ("undefined" == typeof ace && (this.mode = "text", util.log("WARNING: Cannot load code editor, Ace library not loaded. Falling back to plain text editor")), util.getInternetExplorerVersion() == 8 && (this.mode = "text", util.log("WARNING: Cannot load code editor, Ace is not supported on IE8. Falling back to plain text editor")));
    var o = this;
    this.container = e, this.editor = void 0, this.textarea = void 0, this.indentation = 4, this.width = e.clientWidth, this.height = e.clientHeight, this.frame = document.createElement("div"), this.frame.className = "jsoneditor", this.frame.onclick = function (e) {
      util.preventDefault(e)
    }, this.menu = document.createElement("div"), this.menu.className = "menu", this.frame.appendChild(this.menu);
    var n = document.createElement("button");
    n.className = "format", n.title = "Format JSON data, with proper indentation and line feeds", this.menu.appendChild(n), n.onclick = function () {
      try {
        o.format()
      } catch (e) {
        o._onError(e)
      }
    };
    var s = document.createElement("button");
    if (s.className = "compact", s.title = "Compact JSON data, remove all whitespaces", this.menu.appendChild(s), s.onclick = function () {
      try {
        o.compact()
      } catch (e) {
        o._onError(e)
      }
    }, this.content = document.createElement("div"), this.content.className = "outer", this.frame.appendChild(this.content), this.container.appendChild(this.frame), this.mode == "code") {
      this.editorDom = document.createElement("div"), this.editorDom.style.height = "100%", this.editorDom.style.width = "100%", this.content.appendChild(this.editorDom);
      var r = ace.edit(this.editorDom);
      r.setTheme("ace/theme/jsoneditor"), r.setShowPrintMargin(!1), r.setFontSize(13), r.getSession().setMode("ace/mode/json"), r.getSession().setUseSoftTabs(!0), r.getSession().setUseWrapMode(!0), this.editor = r;
      var a = document.createElement("a");
      a.appendChild(document.createTextNode("powered by ace")), a.href = "http://ace.ajax.org", a.target = "_blank", a.className = "poweredBy", a.onclick = function () {
        window.open(a.href, a.target)
      }, this.menu.appendChild(a), t.change && r.on("change", function () {
        t.change()
      })
    } else {
      var l = document.createElement("textarea");
      l.className = "content", l.spellcheck = !1, this.content.appendChild(l), this.textarea = l, t.change && (this.textarea.oninput === null ? this.textarea.oninput = function () {
        t.change()
      } : this.textarea.onchange = function () {
        t.change()
      })
    }
    "string" == typeof i ? this.setText(i) : this.set(i)
  }, i.prototype._delete = function () {
    this.frame && this.container && this.frame.parentNode == this.container && this.container.removeChild(this.frame)
  }, i.prototype._onError = function (e) {
    if (typeof this.onError == "function" && (util.log("WARNING: JSONEditor.onError is deprecated. Use options.error instead."), this.onError(e)), typeof this.options.error != "function")throw e;
    this.options.error(e)
  }, i.prototype.compact = function () {
    var e = util.parse(this.getText());
    this.setText(JSON.stringify(e))
  }, i.prototype.format = function () {
    var e = util.parse(this.getText());
    this.setText(JSON.stringify(e, null, this.indentation))
  }, i.prototype.focus = function () {
    this.textarea && this.textarea.focus(), this.editor && this.editor.focus()
  }, i.prototype.resize = function () {
    if (this.editor) {
      var e = !1;
      this.editor.resize(e)
    }
  }, i.prototype.set = function (e) {
    this.setText(JSON.stringify(e, null, this.indentation))
  }, i.prototype.get = function () {
    return util.parse(this.getText())
  }, i.prototype.getText = function () {
    return this.textarea ? this.textarea.value : this.editor ? this.editor.getValue() : ""
  }, i.prototype.setText = function (e) {
    this.textarea && (this.textarea.value = e), this.editor && this.editor.setValue(e, -1)
  }, e.modes.text = {editor: i, data: "text", load: i.prototype.format}, e.modes.code = {editor: i, data: "text", load: i.prototype.format}, o.prototype.setParent = function (e) {
    this.parent = e
  }, o.prototype.setField = function (e, t) {
    this.field = e, this.fieldEditable = 1 == t
  }, o.prototype.getField = function () {
    return this.field === void 0 && this._getDomField(), this.field
  }, o.prototype.setValue = function (e, t) {
    var i, n, s = this.childs;
    if (s)for (; s.length;)this.removeChild(s[0]);
    if (this.type = this._getType(e), t && t != this.type) {
      if ("string" != t || this.type != "auto")throw new Error('Type mismatch: cannot cast value of type "' + this.type + ' to the specified type "' + t + '"');
      this.type = t
    }
    if (this.type == "array") {
      this.childs = [];
      for (var r = 0, a = e.length; a > r; r++)i = e[r], void 0 === i || i instanceof Function || (n = new o(this.editor, {value: i}), this.appendChild(n));
      this.value = ""
    } else if (this.type == "object") {
      this.childs = [];
      for (var l in e)e.hasOwnProperty(l) && (i = e[l], void 0 === i || i instanceof Function || (n = new o(this.editor, {field: l, value: i}), this.appendChild(n)));
      this.value = ""
    } else this.childs = void 0, this.value = e
  }, o.prototype.getValue = function () {
    if (this.type == "array") {
      var e = [];
      return this.childs.forEach(function (t) {
        e.push(t.getValue())
      }), e
    }
    if (this.type == "object") {
      var t = {};
      return this.childs.forEach(function (e) {
        t[e.getField()] = e.getValue()
      }), t
    }
    return this.value === void 0 && this._getDomValue(), this.value
  }, o.prototype.getLevel = function () {
    return this.parent ? this.parent.getLevel() + 1 : 0
  }, o.prototype.clone = function () {
    var e = new o(this.editor);
    if (e.type = this.type, e.field = this.field, e.fieldInnerText = this.fieldInnerText, e.fieldEditable = this.fieldEditable, e.value = this.value, e.valueInnerText = this.valueInnerText, e.expanded = this.expanded, this.childs) {
      var t = [];
      this.childs.forEach(function (i) {
        var o = i.clone();
        o.setParent(e), t.push(o)
      }), e.childs = t
    } else e.childs = void 0;
    return e
  }, o.prototype.expand = function (e) {
    this.childs && (this.expanded = !0, this.dom.expand && (this.dom.expand.className = "expanded"), this.showChilds(), 0 != e && this.childs.forEach(function (t) {
      t.expand(e)
    }))
  }, o.prototype.collapse = function (e) {
    this.childs && (this.hideChilds(), 0 != e && this.childs.forEach(function (t) {
      t.collapse(e)
    }), this.dom.expand && (this.dom.expand.className = "collapsed"), this.expanded = !1)
  }, o.prototype.showChilds = function () {
    var e = this.childs;
    if (e && this.expanded) {
      var t = this.dom.tr, i = t ? t.parentNode : void 0;
      if (i) {
        var o = this.getAppend(), n = t.nextSibling;
        n ? i.insertBefore(o, n) : i.appendChild(o), this.childs.forEach(function (e) {
          i.insertBefore(e.getDom(), o), e.showChilds()
        })
      }
    }
  }, o.prototype.hide = function () {
    var e = this.dom.tr, t = e ? e.parentNode : void 0;
    t && t.removeChild(e), this.hideChilds()
  }, o.prototype.hideChilds = function () {
    var e = this.childs;
    if (e && this.expanded) {
      var t = this.getAppend();
      t.parentNode && t.parentNode.removeChild(t), this.childs.forEach(function (e) {
        e.hide()
      })
    }
  }, o.prototype.appendChild = function (e) {
    if (this._hasChilds()) {
      if (e.setParent(this), e.fieldEditable = this.type == "object", this.type == "array" && (e.index = this.childs.length), this.childs.push(e), this.expanded) {
        var t = e.getDom(), i = this.getAppend(), o = i ? i.parentNode : void 0;
        i && o && o.insertBefore(t, i), e.showChilds()
      }
      this.updateDom({updateIndexes: !0}), e.updateDom({recurse: !0})
    }
  }, o.prototype.moveBefore = function (e, t) {
    if (this._hasChilds()) {
      var i = this.dom.tr ? this.dom.tr.parentNode : void 0;
      if (i) {
        var o = document.createElement("tr");
        o.style.height = i.clientHeight + "px", i.appendChild(o)
      }
      e.parent && e.parent.removeChild(e), t instanceof n ? this.appendChild(e) : this.insertBefore(e, t), i && i.removeChild(o)
    }
  }, o.prototype.moveTo = function (e, t) {
    if (e.parent == this) {
      var i = this.childs.indexOf(e);
      t > i && t++
    }
    var o = this.childs[t] || this.append;
    this.moveBefore(e, o)
  }, o.prototype.insertBefore = function (e, t) {
    if (this._hasChilds()) {
      if (t == this.append)e.setParent(this), e.fieldEditable = this.type == "object", this.childs.push(e); else {
        var i = this.childs.indexOf(t);
        if (-1 == i)throw new Error("Node not found");
        e.setParent(this), e.fieldEditable = this.type == "object", this.childs.splice(i, 0, e)
      }
      if (this.expanded) {
        var o = e.getDom(), n = t.getDom(), s = n ? n.parentNode : void 0;
        n && s && s.insertBefore(o, n), e.showChilds()
      }
      this.updateDom({updateIndexes: !0}), e.updateDom({recurse: !0})
    }
  }, o.prototype.insertAfter = function (e, t) {
    if (this._hasChilds()) {
      var i = this.childs.indexOf(t), o = this.childs[i + 1];
      o ? this.insertBefore(e, o) : this.appendChild(e)
    }
  }, o.prototype.search = function (e) {
    var t, i = [], o = e ? e.toLowerCase() : void 0;
    if (delete this.searchField, delete this.searchValue, this.field != void 0) {
      var n = String(this.field).toLowerCase();
      t = n.indexOf(o), -1 != t && (this.searchField = !0, i.push({node: this, elem: "field"})), this._updateDomField()
    }
    if (this._hasChilds()) {
      if (this.childs) {
        var s = [];
        this.childs.forEach(function (t) {
          s = s.concat(t.search(e))
        }), i = i.concat(s)
      }
      if (void 0 != o) {
        var r = !1;
        s.length == 0 ? this.collapse(r) : this.expand(r)
      }
    } else {
      if (this.value != void 0) {
        var a = String(this.value).toLowerCase();
        t = a.indexOf(o), -1 != t && (this.searchValue = !0, i.push({node: this, elem: "value"}))
      }
      this._updateDomValue()
    }
    return i
  }, o.prototype.scrollTo = function (e) {
    if (!this.dom.tr || !this.dom.tr.parentNode)for (var t = this.parent, i = !1; t;)t.expand(i), t = t.parent;
    this.dom.tr && this.dom.tr.parentNode && this.editor.scrollTo(this.dom.tr.offsetTop, e)
  }, o.focusElement = void 0, o.prototype.focus = function (e) {
    if (o.focusElement = e, this.dom.tr && this.dom.tr.parentNode) {
      var t = this.dom;
      switch (e) {
        case"drag":
          t.drag ? t.drag.focus() : t.menu.focus();
          break;
        case"menu":
          t.menu.focus();
          break;
        case"expand":
          this._hasChilds() ? t.expand.focus() : t.field && this.fieldEditable ? (t.field.focus(), util.selectContentEditable(t.field)) : t.value && !this._hasChilds() ? (t.value.focus(), util.selectContentEditable(t.value)) : t.menu.focus();
          break;
        case"field":
          t.field && this.fieldEditable ? (t.field.focus(), util.selectContentEditable(t.field)) : t.value && !this._hasChilds() ? (t.value.focus(), util.selectContentEditable(t.value)) : this._hasChilds() ? t.expand.focus() : t.menu.focus();
          break;
        case"value":
        default:
          t.value && !this._hasChilds() ? (t.value.focus(), util.selectContentEditable(t.value)) : t.field && this.fieldEditable ? (t.field.focus(), util.selectContentEditable(t.field)) : this._hasChilds() ? t.expand.focus() : t.menu.focus()
      }
    }
  }, o.select = function (e) {
    setTimeout(function () {
      util.selectContentEditable(e)
    }, 0)
  }, o.prototype.blur = function () {
    this._getDomValue(!1), this._getDomField(!1)
  }, o.prototype._duplicate = function (e) {
    var t = e.clone();
    return this.insertAfter(t, e), t
  }, o.prototype.containsNode = function (e) {
    if (this == e)return!0;
    var t = this.childs;
    if (t)for (var i = 0, o = t.length; o > i; i++)if (t[i].containsNode(e))return!0;
    return!1
  }, o.prototype._move = function (e, t) {
    if (e != t) {
      if (e.containsNode(this))throw new Error("Cannot move a field into a child of itself");
      e.parent && e.parent.removeChild(e);
      var i = e.clone();
      e.clearDom(), t ? this.insertBefore(i, t) : this.appendChild(i)
    }
  }, o.prototype.removeChild = function (e) {
    if (this.childs) {
      var t = this.childs.indexOf(e);
      if (-1 != t) {
        e.hide(), delete e.searchField, delete e.searchValue;
        var i = this.childs.splice(t, 1)[0];
        return this.updateDom({updateIndexes: !0}), i
      }
    }
    return void 0
  }, o.prototype._remove = function (e) {
    this.removeChild(e)
  }, o.prototype.changeType = function (e) {
    var t = this.type;
    if (t != e) {
      if ("string" != e && "auto" != e || "string" != t && "auto" != t) {
        var i, o = this.dom.tr ? this.dom.tr.parentNode : void 0;
        i = this.expanded ? this.getAppend() : this.getDom();
        var n = i && i.parentNode ? i.nextSibling : void 0;
        this.hide(), this.clearDom(), this.type = e, "object" == e ? (this.childs || (this.childs = []), this.childs.forEach(function (e) {
          e.clearDom(), delete e.index, e.fieldEditable = !0, e.field == void 0 && (e.field = "")
        }), ("string" == t || "auto" == t) && (this.expanded = !0)) : "array" == e ? (this.childs || (this.childs = []), this.childs.forEach(function (e, t) {
          e.clearDom(), e.fieldEditable = !1, e.index = t
        }), ("string" == t || "auto" == t) && (this.expanded = !0)) : this.expanded = !1, o && (n ? o.insertBefore(this.getDom(), n) : o.appendChild(this.getDom())), this.showChilds()
      } else this.type = e;
      ("auto" == e || "string" == e) && (this.value = "string" == e ? String(this.value) : this._stringCast(String(this.value)), this.focus()), this.updateDom({updateIndexes: !0})
    }
  }, o.prototype._getDomValue = function (e) {
    if (this.dom.value && this.type != "array" && this.type != "object" && (this.valueInnerText = util.getInnerText(this.dom.value)), this.valueInnerText != void 0)try {
      var t;
      if (this.type == "string")t = this._unescapeHTML(this.valueInnerText); else {
        var i = this._unescapeHTML(this.valueInnerText);
        t = this._stringCast(i)
      }
      if (t !== this.value) {
        var o = this.value;
        this.value = t, this.editor._onAction("editValue", {node: this, oldValue: o, newValue: t, oldSelection: this.editor.selection, newSelection: this.editor.getSelection()})
      }
    } catch (n) {
      if (this.value = void 0, 1 != e)throw n
    }
  }, o.prototype._updateDomValue = function () {
    var e = this.dom.value;
    if (e) {
      var t = this.value, i = this.type == "auto" ? typeof t : this.type, o = "string" == i && util.isUrl(t), n = "";
      n = o && !this.editor.mode.edit ? "" : "string" == i ? "green" : "number" == i ? "red" : "boolean" == i ? "orange" : this._hasChilds() ? "" : null === t ? "#004ED0" : "black", e.style.color = n;
      var s = String(this.value) == "" && this.type != "array" && this.type != "object";
      if (s ? util.addClassName(e, "empty") : util.removeClassName(e, "empty"), o ? util.addClassName(e, "url") : util.removeClassName(e, "url"), "array" == i || "object" == i) {
        var r = this.childs ? this.childs.length : 0;
        e.title = this.type + " containing " + r + " items"
      } else"string" == i && util.isUrl(t) ? this.editor.mode.edit && (e.title = "Ctrl+Click or Ctrl+Enter to open url in new window") : e.title = "";
      this.searchValueActive ? util.addClassName(e, "highlight-active") : util.removeClassName(e, "highlight-active"), this.searchValue ? util.addClassName(e, "highlight") : util.removeClassName(e, "highlight"), util.stripFormatting(e)
    }
  }, o.prototype._updateDomField = function () {
    var e = this.dom.field;
    if (e) {
      var t = String(this.field) == "" && this.parent.type != "array";
      t ? util.addClassName(e, "empty") : util.removeClassName(e, "empty"), this.searchFieldActive ? util.addClassName(e, "highlight-active") : util.removeClassName(e, "highlight-active"), this.searchField ? util.addClassName(e, "highlight") : util.removeClassName(e, "highlight"), util.stripFormatting(e)
    }
  }, o.prototype._getDomField = function (e) {
    if (this.dom.field && this.fieldEditable && (this.fieldInnerText = util.getInnerText(this.dom.field)), this.fieldInnerText != void 0)try {
      var t = this._unescapeHTML(this.fieldInnerText);
      if (t !== this.field) {
        var i = this.field;
        this.field = t, this.editor._onAction("editField", {node: this, oldValue: i, newValue: t, oldSelection: this.editor.selection, newSelection: this.editor.getSelection()})
      }
    } catch (o) {
      if (this.field = void 0, 1 != e)throw o
    }
  }, o.prototype.clearDom = function () {
    this.dom = {}
  }, o.prototype.getDom = function () {
    var e = this.dom;
    if (e.tr)return e.tr;
    if (e.tr = document.createElement("tr"), e.tr.node = this, this.editor.mode.edit) {
      var t = document.createElement("td");
      if (this.parent) {
        var i = document.createElement("button");
        e.drag = i, i.className = "dragarea", i.title = "Drag to move this field (Alt+Shift+Arrows)", t.appendChild(i)
      }
      e.tr.appendChild(t);
      var o = document.createElement("td"), n = document.createElement("button");
      e.menu = n, n.className = "contextmenu", n.title = "Click to open the actions menu (Ctrl+M)", o.appendChild(e.menu), e.tr.appendChild(o)
    }
    var s = document.createElement("td");
    return e.tr.appendChild(s), e.tree = this._createDomTree(), s.appendChild(e.tree), this.updateDom({updateIndexes: !0}), e.tr
  }, o.prototype._onDragStart = function (e) {
    e = e || window.event;
    var t = this;
    this.mousemove || (this.mousemove = util.addEventListener(document, "mousemove", function (e) {
      t._onDrag(e)
    })), this.mouseup || (this.mouseup = util.addEventListener(document, "mouseup", function (e) {
      t._onDragEnd(e)
    })), this.editor.highlighter.lock(), this.drag = {oldCursor: document.body.style.cursor, startParent: this.parent, startIndex: this.parent.childs.indexOf(this), mouseX: util.getMouseX(e), level: this.getLevel()}, document.body.style.cursor = "move", util.preventDefault(e)
  }, o.prototype._onDrag = function (e) {
    e = e || window.event;
    var t, i, s, r, a, l, d, h, c, u, p, f, m, v, g = util.getMouseY(e), y = util.getMouseX(e), x = !1;
    if (t = this.dom.tr, c = util.getAbsoluteTop(t), f = t.offsetHeight, c > g) {
      i = t;
      do i = i.previousSibling, d = o.getNodeFromTarget(i), u = i ? util.getAbsoluteTop(i) : 0; while (i && u > g);
      d && !d.parent && (d = void 0), d || (l = t.parentNode.firstChild, i = l ? l.nextSibling : void 0, d = o.getNodeFromTarget(i), d == this && (d = void 0)), d && (i = d.dom.tr, u = i ? util.getAbsoluteTop(i) : 0, g > u + f && (d = void 0)), d && (d.parent.moveBefore(this, d), x = !0)
    } else if (a = this.expanded && this.append ? this.append.getDom() : this.dom.tr, r = a ? a.nextSibling : void 0) {
      p = util.getAbsoluteTop(r), s = r;
      do h = o.getNodeFromTarget(s), s && (m = s.nextSibling ? util.getAbsoluteTop(s.nextSibling) : 0, v = s ? m - p : 0, h.parent.childs.length == 1 && h.parent.childs[0] == this && (c += 23)), s = s.nextSibling; while (s && g > c + v);
      if (h && h.parent) {
        var b = y - this.drag.mouseX, C = Math.round(b / 24 / 2), N = this.drag.level + C, E = h.getLevel();
        for (i = h.dom.tr.previousSibling; N > E && i;) {
          if (d = o.getNodeFromTarget(i), d == this || d._isChildOf(this)); else {
            if (!(d instanceof n))break;
            var _ = d.parent.childs;
            if (!(_.length > 1 || _.length == 1 && _[0] != this))break;
            h = o.getNodeFromTarget(i), E = h.getLevel()
          }
          i = i.previousSibling
        }
        a.nextSibling != h.dom.tr && (h.parent.moveBefore(this, h), x = !0)
      }
    }
    x && (this.drag.mouseX = y, this.drag.level = this.getLevel()), this.editor.startAutoScroll(g), util.preventDefault(e)
  }, o.prototype._onDragEnd = function (e) {
    e = e || window.event;
    var t = {node: this, startParent: this.drag.startParent, startIndex: this.drag.startIndex, endParent: this.parent, endIndex: this.parent.childs.indexOf(this)};
    (t.startParent != t.endParent || t.startIndex != t.endIndex) && this.editor._onAction("moveNode", t), document.body.style.cursor = this.drag.oldCursor, this.editor.highlighter.unlock(), delete this.drag, this.mousemove && (util.removeEventListener(document, "mousemove", this.mousemove), delete this.mousemove), this.mouseup && (util.removeEventListener(document, "mouseup", this.mouseup), delete this.mouseup), this.editor.stopAutoScroll(), util.preventDefault(e)
  }, o.prototype._isChildOf = function (e) {
    for (var t = this.parent; t;) {
      if (t == e)return!0;
      t = t.parent
    }
    return!1
  }, o.prototype._createDomField = function () {
    return document.createElement("div")
  }, o.prototype.setHighlight = function (e) {
    this.dom.tr && (this.dom.tr.className = e ? "highlight" : "", this.append && this.append.setHighlight(e), this.childs && this.childs.forEach(function (t) {
      t.setHighlight(e)
    }))
  }, o.prototype.updateValue = function (e) {
    this.value = e, this.updateDom()
  }, o.prototype.updateField = function (e) {
    this.field = e, this.updateDom()
  }, o.prototype.updateDom = function (e) {
    var t = this.dom.tree;
    t && (t.style.marginLeft = this.getLevel() * 24 + "px");
    var i = this.dom.field;
    if (i) {
      this.fieldEditable == 1 ? (i.contentEditable = this.editor.mode.edit, i.spellcheck = !1, i.className = "field") : i.className = "readonly";
      var o;
      o = this.index != void 0 ? this.index : this.field != void 0 ? this.field : this._hasChilds() ? this.type : "", i.innerHTML = this._escapeHTML(o)
    }
    var n = this.dom.value;
    if (n) {
      var s = this.childs ? this.childs.length : 0;
      n.innerHTML = this.type == "array" ? "[" + s + "]" : this.type == "object" ? "{" + s + "}" : this._escapeHTML(this.value)
    }
    this._updateDomField(), this._updateDomValue(), e && e.updateIndexes == 1 && this._updateDomIndexes(), e && e.recurse == 1 && this.childs && this.childs.forEach(function (t) {
      t.updateDom(e)
    }), this.append && this.append.updateDom()
  }, o.prototype._updateDomIndexes = function () {
    var e = this.dom.value, t = this.childs;
    e && t && (this.type == "array" ? t.forEach(function (e, t) {
      e.index = t;
      var i = e.dom.field;
      i && (i.innerHTML = t)
    }) : this.type == "object" && t.forEach(function (e) {
      e.index != void 0 && (delete e.index, e.field == void 0 && (e.field = ""))
    }))
  }, o.prototype._createDomValue = function () {
    var e;
    return this.type == "array" ? (e = document.createElement("div"), e.className = "readonly", e.innerHTML = "[...]") : this.type == "object" ? (e = document.createElement("div"), e.className = "readonly", e.innerHTML = "{...}") : !this.editor.mode.edit && util.isUrl(this.value) ? (e = document.createElement("a"), e.className = "value", e.href = this.value, e.target = "_blank", e.innerHTML = this._escapeHTML(this.value)) : (e = document.createElement("div"), e.contentEditable = !this.editor.mode.view, e.spellcheck = !1, e.className = "value", e.innerHTML = this._escapeHTML(this.value)), e
  }, o.prototype._createDomExpandButton = function () {
    var e = document.createElement("button");
    return this._hasChilds() ? (e.className = this.expanded ? "expanded" : "collapsed", e.title = "Click to expand/collapse this field (Ctrl+E). \nCtrl+Click to expand/collapse including all childs.") : (e.className = "invisible", e.title = ""), e
  }, o.prototype._createDomTree = function () {
    var e = this.dom, t = document.createElement("table"), i = document.createElement("tbody");
    t.style.borderCollapse = "collapse", t.appendChild(i);
    var o = document.createElement("tr");
    i.appendChild(o);
    var n = document.createElement("td");
    n.className = "tree", o.appendChild(n), e.expand = this._createDomExpandButton(), n.appendChild(e.expand), e.tdExpand = n;
    var s = document.createElement("td");
    s.className = "tree", o.appendChild(s), e.field = this._createDomField(), s.appendChild(e.field), e.tdField = s;
    var r = document.createElement("td");
    r.className = "tree", o.appendChild(r), this.type != "object" && this.type != "array" && (r.appendChild(document.createTextNode(":")), r.className = "separator"), e.tdSeparator = r;
    var a = document.createElement("td");
    return a.className = "tree", o.appendChild(a), e.value = this._createDomValue(), a.appendChild(e.value), e.tdValue = a, t
  }, o.prototype.onEvent = function (e) {
    var t, i = e.type, o = e.target || e.srcElement, n = this.dom, s = this, r = this._hasChilds();
    if ((o == n.drag || o == n.menu) && ("mouseover" == i ? this.editor.highlighter.highlight(this) : "mouseout" == i && this.editor.highlighter.unhighlight()), "mousedown" == i && o == n.drag && this._onDragStart(e), "click" == i && o == n.menu) {
      var a = s.editor.highlighter;
      a.highlight(s), a.lock(), util.addClassName(n.menu, "selected"), this.showContextMenu(n.menu, function () {
        util.removeClassName(n.menu, "selected"), a.unlock(), a.unhighlight()
      })
    }
    if ("click" == i && o == n.expand && r) {
      var l = e.ctrlKey;
      this._onExpand(l)
    }
    var d = n.value;
    if (o == d)switch (i) {
      case"focus":
        t = this;
        break;
      case"blur":
      case"change":
        this._getDomValue(!0), this._updateDomValue(), this.value && (d.innerHTML = this._escapeHTML(this.value));
        break;
      case"input":
        this._getDomValue(!0), this._updateDomValue();
        break;
      case"keydown":
      case"mousedown":
        this.editor.selection = this.editor.getSelection();
        break;
      case"click":
        e.ctrlKey && this.editor.mode.edit && util.isUrl(this.value) && window.open(this.value, "_blank");
        break;
      case"keyup":
        this._getDomValue(!0), this._updateDomValue();
        break;
      case"cut":
      case"paste":
        setTimeout(function () {
          s._getDomValue(!0), s._updateDomValue()
        }, 1)
    }
    var h = n.field;
    if (o == h)switch (i) {
      case"focus":
        t = this;
        break;
      case"blur":
      case"change":
        this._getDomField(!0), this._updateDomField(), this.field && (h.innerHTML = this._escapeHTML(this.field));
        break;
      case"input":
        this._getDomField(!0), this._updateDomField();
        break;
      case"keydown":
      case"mousedown":
        this.editor.selection = this.editor.getSelection();
        break;
      case"keyup":
        this._getDomField(!0), this._updateDomField();
        break;
      case"cut":
      case"paste":
        setTimeout(function () {
          s._getDomField(!0), s._updateDomField()
        }, 1)
    }
    var c = n.tree;
    if (o == c.parentNode)switch (i) {
      case"click":
        var u = e.offsetX != void 0 ? e.offsetX < (this.getLevel() + 1) * 24 : util.getMouseX(e) < util.getAbsoluteLeft(n.tdSeparator);
        u || r ? h && (util.setEndOfContentEditable(h), h.focus()) : d && (util.setEndOfContentEditable(d), d.focus())
    }
    if (o == n.tdExpand && !r || o == n.tdField || o == n.tdSeparator)switch (i) {
      case"click":
        h && (util.setEndOfContentEditable(h), h.focus())
    }
    "keydown" == i && this.onKeyDown(e)
  }, o.prototype.onKeyDown = function (e) {
    var t, i, s, r, a = e.which || e.keyCode, l = e.target || e.srcElement, d = e.ctrlKey, h = e.shiftKey, c = e.altKey, u = !1;
    if (13 == a) {
      if (l == this.dom.value)(!this.editor.mode.edit || e.ctrlKey) && util.isUrl(this.value) && (window.open(this.value, "_blank"), u = !0); else if (l == this.dom.expand) {
        var p = this._hasChilds();
        if (p) {
          var f = e.ctrlKey;
          this._onExpand(f), l.focus(), u = !0
        }
      }
    } else if (68 == a)d && (this._onDuplicate(), u = !0); else if (69 == a)d && (this._onExpand(h), l.focus(), u = !0); else if (77 == a)d && (this.showContextMenu(l), u = !0); else if (46 == a)d && (this._onRemove(), u = !0); else if (45 == a)d && !h ? (this._onInsertBefore(), u = !0) : d && h && (this._onInsertAfter(), u = !0); else if (35 == a) {
      if (c) {
        var m = this._lastNode();
        m && m.focus(o.focusElement || this._getElementName(l)), u = !0
      }
    } else if (36 == a) {
      if (c) {
        var v = this._firstNode();
        v && v.focus(o.focusElement || this._getElementName(l)), u = !0
      }
    } else if (37 == a) {
      if (c && !h) {
        var g = this._previousElement(l);
        g && this.focus(this._getElementName(g)), u = !0
      } else if (c && h) {
        if (this.expanded) {
          var y = this.getAppend();
          s = y ? y.nextSibling : void 0
        } else {
          var x = this.getDom();
          s = x.nextSibling
        }
        s && (i = o.getNodeFromTarget(s), r = s.nextSibling, N = o.getNodeFromTarget(r), i && i instanceof n && this.parent.childs.length != 1 && N && N.parent && (N.parent.moveBefore(this, N), this.focus(o.focusElement || this._getElementName(l))))
      }
    } else if (38 == a)c && !h ? (t = this._previousNode(), t && t.focus(o.focusElement || this._getElementName(l)), u = !0) : c && h && (t = this._previousNode(), t && t.parent && (t.parent.moveBefore(this, t), this.focus(o.focusElement || this._getElementName(l))), u = !0); else if (39 == a) {
      if (c && !h) {
        var b = this._nextElement(l);
        b && this.focus(this._getElementName(b)), u = !0
      } else if (c && h) {
        x = this.getDom();
        var C = x.previousSibling;
        C && (t = o.getNodeFromTarget(C), t && t.parent && t instanceof n && !t.isVisible() && (t.parent.moveBefore(this, t), this.focus(o.focusElement || this._getElementName(l))))
      }
    } else if (40 == a)if (c && !h)i = this._nextNode(), i && i.focus(o.focusElement || this._getElementName(l)), u = !0; else if (c && h) {
      i = this.expanded ? this.append ? this.append._nextNode() : void 0 : this._nextNode(), s = i ? i.getDom() : void 0, r = this.parent.childs.length == 1 ? s : s ? s.nextSibling : void 0;
      var N = o.getNodeFromTarget(r);
      N && N.parent && (N.parent.moveBefore(this, N), this.focus(o.focusElement || this._getElementName(l))), u = !0
    }
    u && (util.preventDefault(e), util.stopPropagation(e))
  }, o.prototype._onExpand = function (e) {
    if (e) {
      var t = this.dom.tr.parentNode, i = t.parentNode, o = i.scrollTop;
      i.removeChild(t)
    }
    this.expanded ? this.collapse(e) : this.expand(e), e && (i.appendChild(t), i.scrollTop = o)
  }, o.prototype._onRemove = function () {
    this.editor.highlighter.unhighlight();
    var e = this.parent.childs, t = e.indexOf(this), i = this.editor.getSelection();
    e[t + 1] ? e[t + 1].focus() : e[t - 1] ? e[t - 1].focus() : this.parent.focus();
    var o = this.editor.getSelection();
    this.parent._remove(this), this.editor._onAction("removeNode", {node: this, parent: this.parent, index: t, oldSelection: i, newSelection: o})
  }, o.prototype._onDuplicate = function () {
    var e = this.editor.getSelection(), t = this.parent._duplicate(this);
    t.focus();
    var i = this.editor.getSelection();
    this.editor._onAction("duplicateNode", {node: this, clone: t, parent: this.parent, oldSelection: e, newSelection: i})
  }, o.prototype._onInsertBefore = function (e, t, i) {
    var n = this.editor.getSelection(), s = new o(this.editor, {field: void 0 != e ? e : "", value: void 0 != t ? t : "", type: i});
    s.expand(!0), this.parent.insertBefore(s, this), this.editor.highlighter.unhighlight(), s.focus("field");
    var r = this.editor.getSelection();
    this.editor._onAction("insertBeforeNode", {node: s, beforeNode: this, parent: this.parent, oldSelection: n, newSelection: r})
  }, o.prototype._onInsertAfter = function (e, t, i) {
    var n = this.editor.getSelection(), s = new o(this.editor, {field: void 0 != e ? e : "", value: void 0 != t ? t : "", type: i});
    s.expand(!0), this.parent.insertAfter(s, this), this.editor.highlighter.unhighlight(), s.focus("field");
    var r = this.editor.getSelection();
    this.editor._onAction("insertAfterNode", {node: s, afterNode: this, parent: this.parent, oldSelection: n, newSelection: r})
  }, o.prototype._onAppend = function (e, t, i) {
    var n = this.editor.getSelection(), s = new o(this.editor, {field: void 0 != e ? e : "", value: void 0 != t ? t : "", type: i});
    s.expand(!0), this.parent.appendChild(s), this.editor.highlighter.unhighlight(), s.focus("field");
    var r = this.editor.getSelection();
    this.editor._onAction("appendNode", {node: s, parent: this.parent, oldSelection: n, newSelection: r})
  }, o.prototype._onChangeType = function (e) {
    var t = this.type;
    if (e != t) {
      var i = this.editor.getSelection();
      this.changeType(e);
      var o = this.editor.getSelection();
      this.editor._onAction("changeType", {node: this, oldType: t, newType: e, oldSelection: i, newSelection: o})
    }
  }, o.prototype._onSort = function (e) {
    if (this._hasChilds()) {
      var t = "desc" == e ? -1 : 1, i = this.type == "array" ? "value" : "field";
      this.hideChilds();
      var o = this.childs, n = this.sort;
      this.childs = this.childs.concat(), this.childs.sort(function (e, o) {
        return e[i] > o[i] ? t : e[i] < o[i] ? -t : 0
      }), this.sort = 1 == t ? "asc" : "desc", this.editor._onAction("sort", {node: this, oldChilds: o, oldSort: n, newChilds: this.childs, newSort: this.sort}), this.showChilds()
    }
  }, o.prototype.getAppend = function () {
    return this.append || (this.append = new n(this.editor), this.append.setParent(this)), this.append.getDom()
  }, o.getNodeFromTarget = function (e) {
    for (; e;) {
      if (e.node)return e.node;
      e = e.parentNode
    }
    return void 0
  }, o.prototype._previousNode = function () {
    var e = null, t = this.getDom();
    if (t && t.parentNode) {
      var i = t;
      do i = i.previousSibling, e = o.getNodeFromTarget(i); while (i && e instanceof n && !e.isVisible())
    }
    return e
  }, o.prototype._nextNode = function () {
    var e = null, t = this.getDom();
    if (t && t.parentNode) {
      var i = t;
      do i = i.nextSibling, e = o.getNodeFromTarget(i); while (i && e instanceof n && !e.isVisible())
    }
    return e
  }, o.prototype._firstNode = function () {
    var e = null, t = this.getDom();
    if (t && t.parentNode) {
      var i = t.parentNode.firstChild;
      e = o.getNodeFromTarget(i)
    }
    return e
  }, o.prototype._lastNode = function () {
    var e = null, t = this.getDom();
    if (t && t.parentNode) {
      var i = t.parentNode.lastChild;
      for (e = o.getNodeFromTarget(i); i && e instanceof n && !e.isVisible();)i = i.previousSibling, e = o.getNodeFromTarget(i)
    }
    return e
  }, o.prototype._previousElement = function (e) {
    var t = this.dom;
    switch (e) {
      case t.value:
        if (this.fieldEditable)return t.field;
      case t.field:
        if (this._hasChilds())return t.expand;
      case t.expand:
        return t.menu;
      case t.menu:
        if (t.drag)return t.drag;
      default:
        return null
    }
  }, o.prototype._nextElement = function (e) {
    var t = this.dom;
    switch (e) {
      case t.drag:
        return t.menu;
      case t.menu:
        if (this._hasChilds())return t.expand;
      case t.expand:
        if (this.fieldEditable)return t.field;
      case t.field:
        if (!this._hasChilds())return t.value;
      default:
        return null
    }
  }, o.prototype._getElementName = function (e) {
    var t = this.dom;
    for (var i in t)if (t.hasOwnProperty(i) && t[i] == e)return i;
    return null
  }, o.prototype._hasChilds = function () {
    return this.type == "array" || this.type == "object"
  }, o.TYPE_TITLES = {auto: 'Field type "auto". The field type is automatically determined from the value and can be a string, number, boolean, or null.', object: 'Field type "object". An object contains an unordered set of key/value pairs.', array: 'Field type "array". An array contains an ordered collection of values.', string: 'Field type "string". Field type is not determined from the value, but always returned as string.'}, o.prototype.showContextMenu = function (e, t) {
    var i = this, n = o.TYPE_TITLES, r = [];
    if (r.push({text: "Type", title: "Change the type of this field", className: "type-" + this.type, submenu: [
      {text: "Auto", className: "type-auto" + (this.type == "auto" ? " selected" : ""), title: n.auto, click: function () {
        i._onChangeType("auto")
      }},
      {text: "Array", className: "type-array" + (this.type == "array" ? " selected" : ""), title: n.array, click: function () {
        i._onChangeType("array")
      }},
      {text: "Object", className: "type-object" + (this.type == "object" ? " selected" : ""), title: n.object, click: function () {
        i._onChangeType("object")
      }},
      {text: "String", className: "type-string" + (this.type == "string" ? " selected" : ""), title: n.string, click: function () {
        i._onChangeType("string")
      }}
    ]}), this._hasChilds()) {
      var a = this.sort == "asc" ? "desc" : "asc";
      r.push({text: "Sort", title: "Sort the childs of this " + this.type, className: "sort-" + a, click: function () {
        i._onSort(a)
      }, submenu: [
        {text: "Ascending", className: "sort-asc", title: "Sort the childs of this " + this.type + " in ascending order", click: function () {
          i._onSort("asc")
        }},
        {text: "Descending", className: "sort-desc", title: "Sort the childs of this " + this.type + " in descending order", click: function () {
          i._onSort("desc")
        }}
      ]})
    }
    if (this.parent && this.parent._hasChilds()) {
      r.push({type: "separator"});
      var l = i.parent.childs;
      i == l[l.length - 1] && r.push({text: "Append", title: "Append a new field with type 'auto' after this field (Ctrl+Shift+Ins)", submenuTitle: "Select the type of the field to be appended", className: "append", click: function () {
        i._onAppend("", "", "auto")
      }, submenu: [
        {text: "Auto", className: "type-auto", title: n.auto, click: function () {
          i._onAppend("", "", "auto")
        }},
        {text: "Array", className: "type-array", title: n.array, click: function () {
          i._onAppend("", [])
        }},
        {text: "Object", className: "type-object", title: n.object, click: function () {
          i._onAppend("", {})
        }},
        {text: "String", className: "type-string", title: n.string, click: function () {
          i._onAppend("", "", "string")
        }}
      ]}), r.push({text: "Insert", title: "Insert a new field with type 'auto' before this field (Ctrl+Ins)", submenuTitle: "Select the type of the field to be inserted", className: "insert", click: function () {
        i._onInsertBefore("", "", "auto")
      }, submenu: [
        {text: "Auto", className: "type-auto", title: n.auto, click: function () {
          i._onInsertBefore("", "", "auto")
        }},
        {text: "Array", className: "type-array", title: n.array, click: function () {
          i._onInsertBefore("", [])
        }},
        {text: "Object", className: "type-object", title: n.object, click: function () {
          i._onInsertBefore("", {})
        }},
        {text: "String", className: "type-string", title: n.string, click: function () {
          i._onInsertBefore("", "", "string")
        }}
      ]}), r.push({text: "Duplicate", title: "Duplicate this field (Ctrl+D)", className: "duplicate", click: function () {
        i._onDuplicate()
      }}), r.push({text: "Remove", title: "Remove this field (Ctrl+Del)", className: "remove", click: function () {
        i._onRemove()
      }})
    }
    var d = new s(r, {close: t});
    d.show(e)
  }, o.prototype._getType = function (e) {
    return e instanceof Array ? "array" : e instanceof Object ? "object" : "string" == typeof e && typeof this._stringCast(e) != "string" ? "string" : "auto"
  }, o.prototype._stringCast = function (e) {
    var t = e.toLowerCase(), i = Number(e), o = parseFloat(e);
    return"" == e ? "" : "null" == t ? null : "true" == t ? !0 : "false" == t ? !1 : isNaN(i) || isNaN(o) ? e : i
  }, o.prototype._escapeHTML = function (e) {
    var t = String(e).replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/  /g, " &nbsp;").replace(/^ /, "&nbsp;").replace(/ $/, "&nbsp;"), i = JSON.stringify(t);
    return i.substring(1, i.length - 1)
  }, o.prototype._unescapeHTML = function (e) {
    var t = '"' + this._escapeJSON(e) + '"', i = util.parse(t);
    return i.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
  }, o.prototype._escapeJSON = function (e) {
    for (var t = "", i = 0, o = e.length; o > i;) {
      var n = e.charAt(i);
      "\n" == n ? t += "\\n" : "\\" == n ? (t += n, i++, n = e.charAt(i), '"\\/bfnrtu'.indexOf(n) == -1 && (t += "\\"), t += n) : t += '"' == n ? '\\"' : n, i++
    }
    return t
  }, n.prototype = new o, n.prototype.getDom = function () {
    var e = this.dom;
    if (e.tr)return e.tr;
    var t = document.createElement("tr");
    if (t.node = this, e.tr = t, this.editor.mode.edit) {
      e.tdDrag = document.createElement("td");
      var i = document.createElement("td");
      e.tdMenu = i;
      var o = document.createElement("button");
      o.className = "contextmenu", o.title = "Click to open the actions menu (Ctrl+M)", e.menu = o, i.appendChild(e.menu)
    }
    var n = document.createElement("td"), s = document.createElement("div");
    return s.innerHTML = "(empty)", s.className = "readonly", n.appendChild(s), e.td = n, e.text = s, this.updateDom(), t
  }, n.prototype.updateDom = function () {
    var e = this.dom, t = e.td;
    t && (t.style.paddingLeft = this.getLevel() * 24 + 26 + "px");
    var i = e.text;
    i && (i.innerHTML = "(empty " + this.parent.type + ")");
    var o = e.tr;
    this.isVisible() ? e.tr.firstChild || (e.tdDrag && o.appendChild(e.tdDrag), e.tdMenu && o.appendChild(e.tdMenu), o.appendChild(t)) : e.tr.firstChild && (e.tdDrag && o.removeChild(e.tdDrag), e.tdMenu && o.removeChild(e.tdMenu), o.removeChild(t))
  }, n.prototype.isVisible = function () {
    return this.parent.childs.length == 0
  }, n.prototype.showContextMenu = function (e, t) {
    var i = this, n = o.TYPE_TITLES, r = [
      {text: "Append", title: "Append a new field with type 'auto' (Ctrl+Shift+Ins)", submenuTitle: "Select the type of the field to be appended", className: "insert", click: function () {
        i._onAppend("", "", "auto")
      }, submenu: [
        {text: "Auto", className: "type-auto", title: n.auto, click: function () {
          i._onAppend("", "", "auto")
        }},
        {text: "Array", className: "type-array", title: n.array, click: function () {
          i._onAppend("", [])
        }},
        {text: "Object", className: "type-object", title: n.object, click: function () {
          i._onAppend("", {})
        }},
        {text: "String", className: "type-string", title: n.string, click: function () {
          i._onAppend("", "", "string")
        }}
      ]}
    ], a = new s(r, {close: t});
    a.show(e)
  }, n.prototype.onEvent = function (e) {
    var t = e.type, i = e.target || e.srcElement, o = this.dom, n = o.menu;
    if (i == n && ("mouseover" == t ? this.editor.highlighter.highlight(this.parent) : "mouseout" == t && this.editor.highlighter.unhighlight()), "click" == t && i == o.menu) {
      var s = this.editor.highlighter;
      s.highlight(this.parent), s.lock(), util.addClassName(o.menu, "selected"), this.showContextMenu(o.menu, function () {
        util.removeClassName(o.menu, "selected"), s.unlock(), s.unhighlight()
      })
    }
    "keydown" == t && this.onKeyDown(e)
  }, s.prototype._getVisibleButtons = function () {
    var e = [], t = this;
    return this.dom.items.forEach(function (i) {
      e.push(i.button), i.buttonExpand && e.push(i.buttonExpand), i.subItems && i == t.expandedItem && i.subItems.forEach(function (t) {
        e.push(t.button), t.buttonExpand && e.push(t.buttonExpand)
      })
    }), e
  }, s.visibleMenu = void 0, s.prototype.show = function (e) {
    this.hide();
    var t = util.getWindowHeight(), i = e.offsetHeight, o = this.maxHeight, n = util.getAbsoluteLeft(e), r = util.getAbsoluteTop(e);
    t > r + i + o ? (this.dom.menu.style.left = n + "px", this.dom.menu.style.top = r + i + "px", this.dom.menu.style.bottom = "") : (this.dom.menu.style.left = n + "px", this.dom.menu.style.top = "", this.dom.menu.style.bottom = t - r + "px"), document.body.appendChild(this.dom.menu);
    var a = this, l = this.dom.list;
    this.eventListeners.mousedown = util.addEventListener(document, "mousedown", function (e) {
      e = e || window.event;
      var t = e.target || e.srcElement;
      t == l || a._isChildOf(t, l) || (a.hide(), util.stopPropagation(e), util.preventDefault(e))
    }), this.eventListeners.mousewheel = util.addEventListener(document, "mousewheel", function () {
      util.stopPropagation(event), util.preventDefault(event)
    }), this.eventListeners.keydown = util.addEventListener(document, "keydown", function (e) {
      a._onKeyDown(e)
    }), this.selection = util.getSelection(), this.anchor = e, setTimeout(function () {
      a.dom.focusButton.focus()
    }, 0), s.visibleMenu && s.visibleMenu.hide(), s.visibleMenu = this
  }, s.prototype.hide = function () {
    this.dom.menu.parentNode && (this.dom.menu.parentNode.removeChild(this.dom.menu), this.onClose && this.onClose());
    for (var e in this.eventListeners)if (this.eventListeners.hasOwnProperty(e)) {
      var t = this.eventListeners[e];
      t && util.removeEventListener(document, e, t), delete this.eventListeners[e]
    }
    s.visibleMenu == this && (s.visibleMenu = void 0)
  }, s.prototype._onExpandItem = function (e) {
    var t = this, i = e == this.expandedItem, o = this.expandedItem;
    if (o && (o.ul.style.height = "0", o.ul.style.padding = "", setTimeout(function () {
      t.expandedItem != o && (o.ul.style.display = "", util.removeClassName(o.ul.parentNode, "selected"))
    }, 300), this.expandedItem = void 0), !i) {
      var n = e.ul;
      n.style.display = "block", n.clientHeight, setTimeout(function () {
        t.expandedItem == e && (n.style.height = n.childNodes.length * 24 + "px", n.style.padding = "5px 10px")
      }, 0), util.addClassName(n.parentNode, "selected"), this.expandedItem = e
    }
  }, s.prototype._onKeyDown = function (e) {
    e = e || window.event;
    var t, i, o, n, s = e.target || e.srcElement, r = e.which || e.keyCode, a = !1;
    27 == r ? (this.selection && util.setSelection(this.selection), this.anchor && this.anchor.focus(), this.hide(), a = !0) : 9 == r ? e.shiftKey ? (t = this._getVisibleButtons(), i = t.indexOf(s), 0 == i && (t[t.length - 1].focus(), a = !0)) : (t = this._getVisibleButtons(), i = t.indexOf(s), i == t.length - 1 && (t[0].focus(), a = !0)) : 37 == r ? (s.className == "expand" && (t = this._getVisibleButtons(), i = t.indexOf(s), o = t[i - 1], o && o.focus()), a = !0) : 38 == r ? (t = this._getVisibleButtons(), i = t.indexOf(s), o = t[i - 1], o && o.className == "expand" && (o = t[i - 2]), o || (o = t[t.length - 1]), o && o.focus(), a = !0) : 39 == r ? (t = this._getVisibleButtons(), i = t.indexOf(s), n = t[i + 1], n && n.className == "expand" && n.focus(), a = !0) : 40 == r && (t = this._getVisibleButtons(), i = t.indexOf(s), n = t[i + 1], n && n.className == "expand" && (n = t[i + 2]), n || (n = t[0]), n && (n.focus(), a = !0), a = !0), a && (util.stopPropagation(e), util.preventDefault(e))
  }, s.prototype._isChildOf = function (e, t) {
    for (var i = e.parentNode; i;) {
      if (i == t)return!0;
      i = i.parentNode
    }
    return!1
  }, r.prototype.onChange = function () {
  }, r.prototype.add = function (e, t) {
    this.index++, this.history[this.index] = {action: e, params: t, timestamp: new Date}, this.index < this.history.length - 1 && this.history.splice(this.index + 1, this.history.length - this.index - 1), this.onChange()
  }, r.prototype.clear = function () {
    this.history = [], this.index = -1, this.onChange()
  }, r.prototype.canUndo = function () {
    return this.index >= 0
  }, r.prototype.canRedo = function () {
    return this.index < this.history.length - 1
  }, r.prototype.undo = function () {
    if (this.canUndo()) {
      var e = this.history[this.index];
      if (e) {
        var t = this.actions[e.action];
        t && t.undo ? (t.undo(e.params), e.params.oldSelection && this.editor.setSelection(e.params.oldSelection)) : util.log('Error: unknown action "' + e.action + '"')
      }
      this.index--, this.onChange()
    }
  }, r.prototype.redo = function () {
    if (this.canRedo()) {
      this.index++;
      var e = this.history[this.index];
      if (e) {
        var t = this.actions[e.action];
        t && t.redo ? (t.redo(e.params), e.params.newSelection && this.editor.setSelection(e.params.newSelection)) : util.log('Error: unknown action "' + e.action + '"')
      }
      this.onChange()
    }
  }, a.prototype.next = function (e) {
    if (this.results != void 0) {
      var t = this.resultIndex != void 0 ? this.resultIndex + 1 : 0;
      t > this.results.length - 1 && (t = 0), this._setActiveResult(t, e)
    }
  }, a.prototype.previous = function (e) {
    if (this.results != void 0) {
      var t = this.results.length - 1, i = this.resultIndex != void 0 ? this.resultIndex - 1 : t;
      0 > i && (i = t), this._setActiveResult(i, e)
    }
  }, a.prototype._setActiveResult = function (e, t) {
    if (this.activeResult) {
      var i = this.activeResult.node, o = this.activeResult.elem;
      "field" == o ? delete i.searchFieldActive : delete i.searchValueActive, i.updateDom()
    }
    if (!this.results || !this.results[e])return this.resultIndex = void 0, this.activeResult = void 0, void 0;
    this.resultIndex = e;
    var n = this.results[this.resultIndex].node, s = this.results[this.resultIndex].elem;
    "field" == s ? n.searchFieldActive = !0 : n.searchValueActive = !0, this.activeResult = this.results[this.resultIndex], n.updateDom(), n.scrollTo(function () {
      t && n.focus(s)
    })
  }, a.prototype._clearDelay = function () {
    this.timeout != void 0 && (clearTimeout(this.timeout), delete this.timeout)
  }, a.prototype._onDelayedSearch = function () {
    this._clearDelay();
    var e = this;
    this.timeout = setTimeout(function (t) {
      e._onSearch(t)
    }, this.delay)
  }, a.prototype._onSearch = function (e, t) {
    this._clearDelay();
    var i = this.dom.search.value, o = i.length > 0 ? i : void 0;
    if (o != this.lastText || t)if (this.lastText = o, this.results = this.editor.search(o), this._setActiveResult(void 0), void 0 != o) {
      var n = this.results.length;
      switch (n) {
        case 0:
          this.dom.results.innerHTML = "no&nbsp;results";
          break;
        case 1:
          this.dom.results.innerHTML = "1&nbsp;result";
          break;
        default:
          this.dom.results.innerHTML = n + "&nbsp;results"
      }
    } else this.dom.results.innerHTML = ""
  }, a.prototype._onKeyDown = function (e) {
    e = e || window.event;
    var t = e.which || e.keyCode;
    27 == t ? (this.dom.search.value = "", this._onSearch(e), util.preventDefault(e), util.stopPropagation(e)) : 13 == t && (e.ctrlKey ? this._onSearch(e, !0) : e.shiftKey ? this.previous() : this.next(), util.preventDefault(e), util.stopPropagation(e))
  }, a.prototype._onKeyUp = function (e) {
    e = e || window.event;
    var t = e.which || e.keyCode;
    27 != t && 13 != t && this._onDelayedSearch(e)
  }, l.prototype.highlight = function (e) {
    this.locked || (this.node != e && (this.node && this.node.setHighlight(!1), this.node = e, this.node.setHighlight(!0)), this._cancelUnhighlight())
  }, l.prototype.unhighlight = function () {
    if (!this.locked) {
      var e = this;
      this.node && (this._cancelUnhighlight(), this.unhighlightTimer = setTimeout(function () {
        e.node.setHighlight(!1), e.node = void 0, e.unhighlightTimer = void 0
      }, 0))
    }
  }, l.prototype._cancelUnhighlight = function () {
    this.unhighlightTimer && (clearTimeout(this.unhighlightTimer), this.unhighlightTimer = void 0)
  }, l.prototype.lock = function () {
    this.locked = !0
  }, l.prototype.unlock = function () {
    this.locked = !1
  }, util = {}, Array.prototype.indexOf || (Array.prototype.indexOf = function (e) {
    for (var t = 0; t < this.length; t++)if (this[t] == e)return t;
    return-1
  }), Array.prototype.forEach || (Array.prototype.forEach = function (e, t) {
    for (var i = 0, o = this.length; o > i; ++i)e.call(t || this, this[i], i, this)
  }), util.parse = function (e) {
    try {
      return JSON.parse(e)
    } catch (t) {
      throw util.validate(e), t
    }
  }, util.validate = function (e) {
    "undefined" != typeof jsonlint ? jsonlint.parse(e) : JSON.parse(e)
  }, util.extend = function (e, t) {
    for (var i in t)t.hasOwnProperty(i) && (e[i] = t[i]);
    return e
  }, util.clear = function (e) {
    for (var t in e)e.hasOwnProperty(t) && delete e[t];
    return e
  }, util.log = function () {
    console && typeof console.log == "function" && console.log.apply(console, arguments)
  };
  var d = /^https?:\/\/\S+$/;
  util.isUrl = function (e) {
    return("string" == typeof e || e instanceof String) && d.test(e)
  }, util.getAbsoluteLeft = function (e) {
    for (var t = e.offsetLeft, i = document.body, o = e.offsetParent; null != o && e != i;)t += o.offsetLeft, t -= o.scrollLeft, o = o.offsetParent;
    return t
  }, util.getAbsoluteTop = function (e) {
    for (var t = e.offsetTop, i = document.body, o = e.offsetParent; null != o && o != i;)t += o.offsetTop, t -= o.scrollTop, o = o.offsetParent;
    return t
  }, util.getMouseY = function (e) {
    var t;
    return t = "pageY"in e ? e.pageY : e.clientY + document.documentElement.scrollTop
  }, util.getMouseX = function (e) {
    var t;
    return t = "pageX"in e ? e.pageX : e.clientX + document.documentElement.scrollLeft
  }, util.getWindowHeight = function () {
    return"innerHeight"in window ? window.innerHeight : Math.max(document.body.clientHeight, document.documentElement.clientHeight)
  }, util.addClassName = function (e, t) {
    var i = e.className.split(" ");
    i.indexOf(t) == -1 && (i.push(t), e.className = i.join(" "))
  }, util.removeClassName = function (e, t) {
    var i = e.className.split(" "), o = i.indexOf(t);
    -1 != o && (i.splice(o, 1), e.className = i.join(" "))
  }, util.stripFormatting = function (e) {
    for (var t = e.childNodes, i = 0, o = t.length; o > i; i++) {
      var n = t[i];
      n.style && n.removeAttribute("style");
      var s = n.attributes;
      if (s)for (var r = s.length - 1; r >= 0; r--) {
        var a = s[r];
        a.specified == 1 && n.removeAttribute(a.name)
      }
      util.stripFormatting(n)
    }
  }, util.setEndOfContentEditable = function (e) {
    var t, i;
    document.createRange ? (t = document.createRange(), t.selectNodeContents(e), t.collapse(!1), i = window.getSelection(), i.removeAllRanges(), i.addRange(t)) : document.selection && (t = document.body.createTextRange(), t.moveToElementText(e), t.collapse(!1), t.select())
  }, util.selectContentEditable = function (e) {
    if (e && e.nodeName == "DIV") {
      var t, i;
      window.getSelection && document.createRange ? (i = document.createRange(), i.selectNodeContents(e), t = window.getSelection(), t.removeAllRanges(), t.addRange(i)) : document.body.createTextRange && (i = document.body.createTextRange(), i.moveToElementText(e), i.select())
    }
  }, util.getSelection = function () {
    if (window.getSelection) {
      var e = window.getSelection();
      if (e.getRangeAt && e.rangeCount)return e.getRangeAt(0)
    } else if (document.selection && document.selection.createRange)return document.selection.createRange();
    return null
  }, util.setSelection = function (e) {
    if (e)if (window.getSelection) {
      var t = window.getSelection();
      t.removeAllRanges(), t.addRange(e)
    } else document.selection && e.select && e.select()
  }, util.getSelectionOffset = function () {
    var e = util.getSelection();
    return e && "startOffset"in e && "endOffset"in e && e.startContainer && e.startContainer == e.endContainer ? {startOffset: e.startOffset, endOffset: e.endOffset, container: e.startContainer.parentNode} : null
  }, util.setSelectionOffset = function (e) {
    if (document.createRange && window.getSelection) {
      var t = window.getSelection();
      if (t) {
        var i = document.createRange();
        i.setStart(e.container.firstChild, e.startOffset), i.setEnd(e.container.firstChild, e.endOffset), util.setSelection(i)
      }
    }
  }, util.getInnerText = function (e, t) {
    var i = void 0 == t;
    if (i && (t = {text: "", flush: function () {
      var e = this.text;
      return this.text = "", e
    }, set: function (e) {
      this.text = e
    }}), e.nodeValue)return t.flush() + e.nodeValue;
    if (e.hasChildNodes()) {
      for (var o = e.childNodes, n = "", s = 0, r = o.length; r > s; s++) {
        var a = o[s];
        if (a.nodeName == "DIV" || a.nodeName == "P") {
          var l = o[s - 1], d = l ? l.nodeName : void 0;
          d && "DIV" != d && "P" != d && "BR" != d && (n += "\n", t.flush()), n += util.getInnerText(a, t), t.set("\n")
        } else a.nodeName == "BR" ? (n += t.flush(), t.set("\n")) : n += util.getInnerText(a, t)
      }
      return n
    }
    return e.nodeName == "P" && util.getInternetExplorerVersion() != -1 ? t.flush() : ""
  }, util.getInternetExplorerVersion = function () {
    if (-1 == h) {
      var e = -1;
      if (navigator.appName == "Microsoft Internet Explorer") {
        var t = navigator.userAgent, i = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
        i.exec(t) != null && (e = parseFloat(RegExp.$1))
      }
      h = e
    }
    return h
  };
  var h = -1;
  util.addEventListener = function (e, t, i, o) {
    if (e.addEventListener)return void 0 === o && (o = !1), "mousewheel" === t && navigator.userAgent.indexOf("Firefox") >= 0 && (t = "DOMMouseScroll"), e.addEventListener(t, i, o), i;
    var n = function () {
      return i.call(e, window.event)
    };
    return e.attachEvent("on" + t, n), n
  }, util.removeEventListener = function (e, t, i, o) {
    e.removeEventListener ? (void 0 === o && (o = !1), "mousewheel" === t && navigator.userAgent.indexOf("Firefox") >= 0 && (t = "DOMMouseScroll"), e.removeEventListener(t, i, o)) : e.detachEvent("on" + t, i)
  }, util.stopPropagation = function (e) {
    e || (e = window.event), e.stopPropagation ? e.stopPropagation() : e.cancelBubble = !0
  }, util.preventDefault = function (e) {
    e || (e = window.event), e.preventDefault ? e.preventDefault() : e.returnValue = !1
  };
  var c = {JSONEditor: e, JSONFormatter: function () {
    throw new Error('JSONFormatter is deprecated. Use JSONEditor with mode "text" or "code" instead')
  }, util: util}, u = function () {
    var e = document.getElementsByTagName("script"), t = e[e.length - 1].src.split("?")[0], i = t.substring(0, t.length - 2) + "css", o = document.createElement("link");
    o.type = "text/css", o.rel = "stylesheet", o.href = i, document.getElementsByTagName("head")[0].appendChild(o)
  };
  "undefined" != typeof module && "undefined" != typeof exports && (u(), module.exports = exports = c), "undefined" != typeof require && "undefined" != typeof define ? define(function () {
    return u(), c
  }) : window.jsoneditor = c
})();
