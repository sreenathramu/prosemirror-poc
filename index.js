var PDFDocument = require('pdfkit');
var fs = require("fs");
const util = require('./util.js');

var document = {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This is a "},{"type":"star"},{"type":"text","text":"nice"},{"type":"star"},{"type":"text","text":" paragraph, it can have "},{"type":"text","marks":[{"type":"shouting"}],"text":"anything"},{"type":"text","text":" in it."}]},{"type":"paragraph","content":[{"type":"text","text":"aawdaw awdwad awdawdawdwadawd adawdwadawd awdawda awdawd awdawdawd wd wdwd dwdwdwdwd wdwd dwdwdwd dwdwdwd wdwdw wdwdw dwdwd w dwdwdw"}]},{"type":"paragraph","content":[{"type":"text","text":"wd wdwdwdwdwdwd dwdwdw dwdwdw wdwdwdw wdwdwdw wdwdwdwdwd wdwdwd wdwdwd wdwdwd wdwd awdawd awdadwa dwadaw dawd wadawd awdawd awdawdaw awdawdaw awdawd awd awdwad awdawd awdawda awdawdadawd awdawdaw awdawd"}]},{"type":"boring_paragraph","content":[{"type":"text","text":"This paragraph is boring, it can't have anything."}]},{"type":"paragraph","content":[{"type":"text","text":"Press ctrl/cmd-space to insert a star, ctrl/cmd-b to toggle shouting, and ctrl/cmd-q to add or remove a link."}]}]};
util.store(document);
const doc = new PDFDocument;
var handleContent = (doc, content) => {
    switch(content.type) {
        case 'text' :
        	handleText(doc, content)
        	break;
        case 'paragraph': {
        	handleParagraph(doc, content)
        	break;
        }
    }
}
var handleText = (doc, content, continued) => {
	if(content.marks && content.marks.length > 0) {
		if(content.marks[0].type === 'shouting') {
			doc.font('Courier-Bold')
		}
	} else {
		doc.font('Courier')
	}
	doc.fontSize(25)
           .text(content.text, {continued});
}

var handleParagraph =(doc, doct) => {
    doct.content.map((content, index) => {
    	switch(content.type) {
    		case 'text': 
    			handleText(doc, content, doct.content.length - 1 > index)
    			break;
    		
    		case 'star': 
    			//doc.image('star.png', {width: 15, height: 15, continued: doct.content.length - 1 > index})
    			break;
    		
    	}
    })
}

doc.pipe(fs.createWriteStream('output.pdf'));
document.content.map(content => {
	handleContent(doc, content)
});

doc.end();