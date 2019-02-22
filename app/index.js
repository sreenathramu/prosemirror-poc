const {Schema} = require("prosemirror-model")

const textSchema = new Schema({
  nodes: {
    text: {},
    doc: {content: "text*"}
  }
})

const noteSchema = new Schema({
  nodes: {
    text: {},
    note: {
      content: "text*",
      toDOM() { return ["note", 0] },
      parseDOM: [{tag: "note"}]
    },
    notegroup: {
      content: "note+",
      toDOM() { return ["notegroup", 0] },
      parseDOM: [{tag: "notegroup"}]
    },
    doc: {
      content: "(note | notegroup)+"
    }
  }
})

const {findWrapping} = require("prosemirror-transform")

function makeNoteGroup(state, dispatch) {
  // Get a range around the selected blocks
  let range = state.selection.$from.blockRange(state.selection.$to)
  // See if it is possible to wrap that range in a note group
  let wrapping = findWrapping(range, noteSchema.nodes.notegroup)
  // If not, the command doesn't apply
  if (!wrapping) return false
  // Otherwise, dispatch a transaction, using the `wrap` method to
  // create the step that does the actual wrapping.
  if (dispatch) dispatch(state.tr.wrap(range, wrapping).scrollIntoView())
  return true
}

let starSchema = new Schema({
  nodes: {
    text: {
      group: "inline",
    },
    star: {
      inline: true,
      group: "inline",
      toDOM() { return ["star", "🟊"] },
      parseDOM: [{tag: "star"}]
    },
    formula: {
      inline: true,
      group: "inline",
      content: "text*",
      toDOM() { return ["formula", 0] },
      parseDOM: [{tag: "formula"}]
    },
    name: {
      inline: true,
      group: "inline",
      content: "text*",
      toDOM() { return ["name", 0]},
      parseDOM: [{tag:"name"}]
    },
    paragraph: {
      group: "block",
      content: "(inline)* | (formula)* | (name)*",
      toDOM() { return ["p", 0] },
      parseDOM: [{tag: "p"}]
    },
    boring_paragraph: {
      group: "block",
      content: "text* | (formula)*",
      marks: "",
      toDOM() { return ["p", {class: "boring"}, 0] },
      parseDOM: [{tag: "p.boring", priority: 60}]
    },
    doc: {
      content: "block+"
    }
  },
  marks: {
    shouting: {
      toDOM() { return ["shouting"] },
      parseDOM: [{tag: "shouting"}]
    },
    link: {
      attrs: {proforma: {}},
      toDOM(node) { return ["span", {proforma: node.attrs.proforma}] },
      parseDOM: [{tag: "span[proforma]", getAttrs(dom) { return {proforma: dom.attributes.proforma.value} }}],
      inclusive: false
    },
    comment: {
      attrs: {comment: {}},
      toDOM(node) { return ["span", {title: node.attrs.comment}] },
      parseDOM: [{tag: "span[title]", getAttrs(dom) { return {comment: dom.attributes.title.value} }}],
      inclusive: false
    },
    formula: {
      attr: {formula: {}},
      toDOM(node) { return ["formula", {html}]}
    }
  }
})

const {toggleMark} = require("prosemirror-commands")
const {keymap} = require("prosemirror-keymap")

let starKeymap = keymap({
  "Mod-b": toggleMark(starSchema.marks.shouting),
  "Mod-q": toggleLink,
  "Mod-Space": insertStar,
  "Mod-k": toggleComment
})
function toggleLink(state, dispatch) {
  let {doc, selection} = state
  if (selection.empty) return false
  let attrs = null
  if (!doc.rangeHasMark(selection.from, selection.to, starSchema.marks.link)) {
    attrs = {proforma: prompt("Link to where?", "")}
    if (!attrs.proforma) return false
  }
  return toggleMark(starSchema.marks.link, attrs)(state, dispatch)
}
function toggleComment(state, dispatch) {
  let {doc, selection} = state
  if (selection.empty) return false
  let attrs = null
  if (!doc.rangeHasMark(selection.from, selection.to, starSchema.marks.comment)) {
    attrs = {comment: prompt("Add your comment:", "")}
    if (!attrs.comment) return false
  }
  return toggleMark(starSchema.marks.comment, attrs)(state, dispatch)
}
function insertStar(state, dispatch) {
  let type = starSchema.nodes.star
  let {$from} = state.selection
  if (!$from.parent.canReplaceWith($from.index(), $from.index(), type))
    return false
  dispatch(state.tr.replaceSelectionWith(type.create()))
  return true
}
function insertFormula(state, dispatch){
  let type = starSchema.node.formula
  let {$from} = state.selection
  
}


const {DOMParser} = require("prosemirror-model")
const {EditorState} = require("prosemirror-state")
const {EditorView} = require("prosemirror-view")
const {baseKeymap} = require("prosemirror-commands")
const {history, undo, redo} = require("prosemirror-history")

let histKeymap = keymap({"Mod-z": undo, "Mod-y": redo})

function start(place, content, schema, plugins = []) {
  let doc = DOMParser.fromSchema(schema).parse(content);
  let state = EditorState.create({
    doc,
    plugins: plugins.concat([histKeymap, keymap(baseKeymap), history()])
  });

  function generatePDF(){
    let doc = DOMParser.fromSchema(schema).parse(document.querySelector("#star-editor"));
    fetch("http://localhost:3000/pdf1",{
      method: "POST",
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"document":doc, state: JSON.parse(document.querySelector("#state").value)}),
    }) 
    .then(function(response) {
      return response.blob();
    })
    .then(blob => {
      //Create a Blob from the PDF Stream
          const file = new Blob(
            [blob], 
            {type: 'application/pdf'});
      //Build a URL from the file
          const fileURL = URL.createObjectURL(file);
      //Open the URL on new Window
          window.open(fileURL);
      })
      .catch(error => {
          console.log(error);
      });

  }
  document.querySelector("#button1").addEventListener("click",generatePDF,false);
  return new EditorView(place, {
    state
  })
}

function id(str) { return document.getElementById(str) }


//start(id("note-editor"), id("note-content"), noteSchema, [keymap({"Mod-Space": makeNoteGroup})])
start(id("star-editor"), id("star-content"), starSchema, [starKeymap])
