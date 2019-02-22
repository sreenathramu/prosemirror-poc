const uuid = require('uuid/v4');
module.exports =  {
	store: (doc) => {
		const getContent = (document, result) => {
			
			
			if(!document.id) {
				const id = uuid();
				document.id = id;
			}
			if(!result.startNode) {
				result.startNode = document.id;
			}
			if(!document.content) {
				result.acc[document.id ] = (document);
				result.childrens[document.id] = [];
				return result;
			}

			const { content, ...doc } = document;
			result.childrens[document.id ] = content.map(item => {
				const id = uuid();
				item.id = id;
				return id;
			}) ;
			result.acc[document.id ] = (doc);
			return content.reduce((acc, item)=> getContent(item, acc), result);
		}
		const content = getContent(doc, {
			acc: {},
			childrens: {}
		});
		return content;
		//console.log(content.acc);
	},
	restore: (state) => {
		const {[state.startNode]:startNode, ...startState} = state.acc;
		const restoreDocument = (document) => {
			const childrens = state.childrens[document.id];
			if(childrens.length === 0) {
				return document;
			}
			const finalDocument = {
				...document,
				content: childrens.map(childId => {
					const child = state.acc[childId];
					return restoreDocument(child);
				})
			}
			return finalDocument;
		};
		const finalDocument = restoreDocument(startNode);
		return finalDocument;
	}
}