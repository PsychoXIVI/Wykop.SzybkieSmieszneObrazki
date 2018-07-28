// ==UserScript==
// @name        Wykop.SzybkieSmieszneObrazki
// @namespace   Wykop
// @description Dodatek dla Wykop.pl pozwalający na szybsze dodawanie obrazków.
// @author      PsychoX (psychoxivi@gmail.com)
// @version     1.2.1
// @include     *://*wykop.pl/*
// @downloadURL https://raw.githubusercontent.com/PsychoXIVI/Wykop.SzybkieSmieszneObrazki/master/SzybkieSmieszneObrazki.user.js
// @updateURL   https://raw.githubusercontent.com/PsychoXIVI/Wykop.SzybkieSmieszneObrazki/master/SzybkieSmieszneObrazki.user.js
// ==/UserScript==

(function (){
	// Configuration
	//	Here you can configure the script.
	var config = {
		'pasteImageFile': 		true,
		'pasteImageHTML': 		true,
		'pasteImageLink': 		true,
		'doNotChangeIfLink': 	true
	};
	config.get = function (what) {
		return this[what];
	}
	
	// Greasemonkey jQuery from current window
    var $ = $ || unsafeWindow && unsafeWindow.$;
	if (!$) {
		return;
	}
    
    $(document).ready(function () {
        /* Consts */
		const imageURLRegex = /https?:\/\/[^\s]*\/[^\s]*(?:jpe?g|png|gif|bmp|svg)/gi;
		
		/* Functions */
		// Searches all matches regex pattern in string
		const searchString = (string, pattern) => {
			var result = [];

			const matches = string.match(new RegExp(pattern.source, pattern.flags));

			for (var i = 0; i < matches.length; i++) {
				result.push(new RegExp(pattern.source, pattern.flags).exec(matches[i]));
			}

			return result;
		};
		
		//
		const updateImageByURL = function (context, url) {
			// Set the URL of image
			if (url) {
				// Open (and hide) add media form 
				context.find('.openAddMediaOverlay').click();
				context.find('.addMediaOverlay').css('display', 'none');
				context.find('.overlay').css('display', 'none');
				
				// Set URL and submit form
				context.find('.embedUrl')[0].value = url; 
				context.find('.embedUrl').closest('form').submit();
			}
			else {
				// Remove any attachment
				context.find('.removeAttachemnt').click();
			}
		}
		
		
        // Manages fast images adding
        const betterPaste = function (event) {
            var context = $(this).parent();
            
            // Get all clipboard items
            var items = (event.clipboardData || event.originalEvent.clipboardData).items;
            
            // For each item...
            for (var item = items[0], i = 0; i < items.length; item = items[i++]) {
                console.log(item);
				
                switch (item.kind) {
					case 'string': 
					{
						// Image by coping from browser (HTML)
						if (config.get('pasteImageHTML') && item.type === 'text/html') {		
							item.getAsString(function (html) {
								if (~(html.indexOf('<img'))) {
									// Get vaild URL from HTML
									html = html.substring(html.indexOf('src=') + 5);
									var url = html.substring(0, html.indexOf('"'));
									
									// Update
									updateImageByURL(context, url);
								}
							});
						} else
							
						// Image by coping link (only if no other already pasted)
						if (config.get('pasteImageLink') && item.type === 'text/plain') {
							// Do not change by link, if there is already choosen
							if (config.get('doNotChangeIfLink')) {
								if (context.find('.files')[0]) {
									break;
								}
							}
							
							item.getAsString(function (text) {
								// Find first image URL in pasted text
								var url = searchString(text, imageURLRegex)[0];
								
								// Update
								updateImageByURL(context, url);
							});
						}
						
						break;
					}
					
					case 'file':
					{
						// Image by coping from file (Images)
						if (config.get('pasteImageFile') && item.type.match(/image.*/)) {
							var file = item.getAsFile();
							
							// Open (and hide) add media form 
							context.find('.openAddMediaOverlay').click();
							context.find('.addMediaOverlay').css('display', 'none');
							context.find('.overlay').css('display', 'none');
							
							// Hacking Wykop' MFuploader script encapsulation through jQuery private event data
							$._data(context.find('.embedFile').find('input[type=file]')[0], 'events')['change'][0].handler({
								preventDefault: function () {},
								target: {
									files: [file]
								}
							});
							
							break;
						}
					}
                }
            }
        }
        
        
        
        /* Hooks */
        {
            // Hook to paste event of mikroblog post form
            $('.reply').bind('paste', betterPaste);
            
            // Keep hooking to paste events of comments form
            $('.btnReply').bind('click', function () {
                setTimeout(function () {
                    $('.replyOn').find('.reply').bind('paste', betterPaste);
                }, 777);
            });
        }
    });
}());
