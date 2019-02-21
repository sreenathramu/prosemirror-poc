var PDFDocument = require('pdfkit');
var fs = require("fs");
const util = require('./util.js');
const fileSystem = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');




const port = 3000


const app = express();
app.use(express.json())

app.get('/',(req,res) => res.send("Hello World!"));

app.post('/pdf1',(req,res) => {

	console.log(req.body.document);
	
});

app.get('/pdf',(req,res)=>{
	var filePath = path.join(__dirname, 'output.pdf');
    var stat = fileSystem.statSync(filePath);
    
    res.writeHead(200, {
        'Content-Type': 'application/pdf', 
        'Content-Length': stat.size
    });
    
    var readStream = fileSystem.createReadStream(filePath);
    readStream.on('data', function(data) {
        res.write(data);
    });
    
    readStream.on('end', function() {
        res.end();        
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

  

var document = {"type":"doc","content":[{"type":"boring_paragraph","content":[{"type":"text","text":"This paragraph is ,boring, it can't have anything."}]},{"type":"paragraph","content":[{"type":"text","text":"Press ctrl/cmd-space to insert a star, ctrl/cmd-b to toggle shouting, and ctrl/cmd-q to add or remove a link."}]}]};
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