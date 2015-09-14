#!/bin/bash

if [[ $# -lt 1 ]]; then
cat <<- EOT
	Usage: $0 <db>

EOT
exit
fi

DB=$1

read -r -d '' COMMAND <<- EOC

db.portalArticles.find({'data.meta.name': 'image'}).forEach(function(x){
	
	x.data.forEach(function(block){
		if (block.meta.name === 'image'){
			block.meta.name = 'image656';
			block.meta.type = 'image';
			block.config = {};
			block.config.width = 656;
			block.config.height = 492;
		}
	});
	db.portalArticles.update({_id : x._id}, x);
});

db.portalArticles.find({'data.meta.name': 'image1170'}).forEach(function(x){
	
	x.data.forEach(function(block){
		if (block.meta.name === 'image1170'){
			block.meta.name = 'image1170';
			block.meta.type = 'image';
			block.config = {};
			block.config.width = 1170;
			block.config.height = 570;
		}
	});
	db.portalArticles.update({_id : x._id}, x);

});

db.portalArticles.find({ \$or: [
	{'data.meta.name': 'showcase'},
	{'data.meta.name': 'showcasevideo'},
	{'data.meta.name': 'overview'},
	{'data.meta.name': 'category'}]
	}).forEach(function(x){
	
	x.data.forEach(function(block){
		if (block.meta.name === 'showcase'){
			if (block.css && 
				(block.css.cssClass === 'portal-content-location'
				|| block.css.cssClass === 'portal-content-nextrace'
				|| block.css.cssClass === 'portal-content-riderszone'
				|| block.css.cssClass === 'portal-content-mediazone')) {
				block.meta.name = 'showcaseHorizontal';
				block.meta.type = 'showcaseHorizontal';
				block.meta.resolver = 'category';
				block.config = {};
				block.config.displayBlocks = ["title", "abstract", "content", "image656"];
				block.config.thumbnailBlock = "image656";
			} else if (block.css && block.css.cssClass === 'portal-content-titulka') {
				block.meta.resolver = 'category';
				block.config = {};
				block.config.displayBlocks = ["image1170"];
				block.config.thumbnailBlock = "image1170";
			} else {
				block.meta.resolver = 'category';
				block.config = {};
				block.config.displayBlocks = ["title", "abstract", "image656"];
				block.config.thumbnailBlock = "image656";
			}
		} else if (block.meta.name === 'category' || block.meta.name === 'overview') {
			block.meta.resolver = 'category';
			block.config = {};
			block.config.displayBlocks = ["title", "abstract", "image656"];
			block.config.thumbnailBlock = "image656";
		} else if (block.meta.name === 'showcasevideo') {
			block.meta.resolver = 'category';
			block.config = {};
			block.config.displayBlocks = ["video"]
		}
	});
	db.portalArticles.update({_id : x._id}, x);

});



EOC

mongo $DB --quiet --eval "$COMMAND"
