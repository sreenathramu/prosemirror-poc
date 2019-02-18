const uuid = require('uuid/v4');
module.exports =  {
	store: (doc) => {
		const getContent = (document, result) => {
			const id = uuid();
			document.id = id;
			if(!document.id) {
				document.id = id;
			}
			if(result.acc.length === 0) {
				result.startNode = id;
			}
			if(!document.content) {
				result.acc[id] = (document);
				result.childrens[document.id] = [];
				return result;
			}

			const { content, ...doc } = document;
			result.childrens[id] = content.map(item => {
				const id = uuid();
				item.id = id;
				return id;
			}) ;
			result.acc[id] = (doc);
			return content.reduce((acc, item)=> getContent(item, acc), result);
		}
		const content = getContent(doc, {
			acc: {},
			childrens: {}
		});
		console.log(content.acc);
	},
	restore: (state) => {
		const {[state.startNode]:startNode, ...startState} = state.acc;
		const restoreDocument = (currentState, document) => {
			const childrens = state.childrens[document.id];
			if(childrens.length === 0) {
				return document;
			}
			childrens.map(child => {
				
			})
		};
		const finalDocument = restoreDocument(startState, startNode);
	}
}