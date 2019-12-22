chrome.contextMenus.create({
    title: "Appeler %s",
    contexts:["selection"], 
	onclick: function(selected) {
		var query = selected.selectionText
		var query = query.replace(/\s/g, '');
		if (query.includes('+')) {var query = query.replace(/\(0\)/g,'')};
		chrome.tabs.create({url: "tel:" + query});
    }
});

