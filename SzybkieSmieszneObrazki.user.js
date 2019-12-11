// ==UserScript==
// @name        Wykop.SzybkieSmieszneObrazki
// @namespace   Wykop
// @description Dodatek dla Wykop.pl pozwalający na szybsze dodawanie obrazków.
// @author      PsychoX (psychoxivi@gmail.com)
// @version     1.5
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
		const youtubeURLRegex = /https?:\/\/[^\s]*youtu(?:be.com|.be)\/[^\s]*/gi;

		/* Functions */
		// Searches all matches regex pattern in string
		const searchString = (string, pattern) => {
			var result = [];

			const matches = string.match(new RegExp(pattern.source, pattern.flags));
			
			if (matches) {
				for (var i = 0; i < matches.length; ++i) {
					result.push(new RegExp(pattern.source, pattern.flags).exec(matches[i]));
				}
			}
			
			return result;
		};

		//
		const updateAttachmentByURL = function (context, url) {
			// Set the URL of image
			if (url) {
				// Open (and hide) add media form
				context.find('.openAddMediaOverlay')[0].click(); // Retarded, just as wykop.pl
				context.find('.addMediaOverlay').css('display', 'none');
				context.find('.overlay').css('display', 'none');

				// Set URL and submit form
				context.find('.embedUrl')[0].value = url;
				context.find('.embedUrl').closest('form').submit();
			}
			else {
				// Remove any attachment
				context.find('.removeAttachment').click();
			}
		}

        // Manages fast images adding
        const betterPaste = function (event) {
            var context = $(this).parent();

            // Get all clipboard items
            var items = (event.clipboardData || event.originalEvent.clipboardData).items;

            // For each item...
            for (var item = items[0], i = 0; i < items.length; item = items[i++]) {
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
									updateAttachmentByURL(context, url);
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
								// Find first image or YouTube URL in pasted text
								var firstImageMatch = imageURLRegex.exec(text);
								var firstYouTubeMatch = youtubeURLRegex.exec(text);
                                var url = '';
                                if (firstImageMatch) {
                                    if (firstYouTubeMatch) {
                                        url = firstImageMatch.index < firstYouTubeMatch.index ? firstImageMatch[0] : firstYouTubeMatch[0];
                                    }
                                    else {
                                        url = firstImageMatch[0];
                                    }
                                }
                                else {
                                    if (firstYouTubeMatch) {
                                        url = firstYouTubeMatch[0];
                                    }
                                    else {
                                        url = ''; // Not found
                                    }
                                }

								// Update
                                if (url) {  
                                    updateAttachmentByURL(context, url);
                                }
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
							$._data(context.find('.embedFile').find('input[type=file]')[0], 'events').change[0].handler({
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
		// Hook to paste event of mikroblog post form
		$('.reply').bind('paste', betterPaste);

		// Keep hooking to paste events of comments form
		$('.btnReply').bind('click', function () {
			setTimeout(function () {
				$('.replyOn').find('.reply').bind('paste', betterPaste);
			}, 777);
		});
    });
}());
