// ==UserScript==
// @name        Wykop.SzybkieSmieszneObrazki
// @description Dodatek dla Wykop.pl pozwalający na szybsze dodawanie obrazków.
// @author      PsychoX (psychoxivi@gmail.com)
// @version     1.0
// @include     *://*wykop.pl/*
// @grant       none
// @downloadURL https://raw.githubusercontent.com/PsychoXIVI/Wykop.SzybkieSmieszneObrazki/master/SzybkieSmieszneObrazki.user.js
// @updateURL   https://raw.githubusercontent.com/PsychoXIVI/Wykop.SzybkieSmieszneObrazki/master/SzybkieSmieszneObrazki.user.js
// ==/UserScript==

(function(){
    // Greasemonkey jQuery from current window
    $ = $ || unsafeWindow && unsafeWindow.$;
    
    $(document).ready(function() {
        //// Methods
        // Function that manages fast images adding
        const betterPaste = function(event) {
            var context = $(this).parent();
            
            // Get all clipboard items
            var items = (event.clipboardData || event.originalEvent.clipboardData).items;
            
            // For each item...
            for(let item = items[0], i = 0; i < items.length; item = items[i++]) {
                // Image by coping from browser (HTML)
                if(item.kind === "string" && item.type === "text/html") {
                    item.getAsString(function(url) {
                        if(~(url.indexOf("<img"))) {
                            // Get vaild URL
                            url = url.substring(url.indexOf("src=") + 5);
                            url = url.substring(0, url.indexOf("\""));
                            // Open (and hide) add media form 
                            context.find(".openAddMediaOverlay").click();
                            context.find(".addMediaOverlay").css("display", "none");
                            context.find(".overlay").css("display", "none");
                            // Set url and submit form
                            context.find(".embedUrl")[0].value = url; 
                            context.find(".embedUrl").closest("form").submit();
                        }
                    });
                } else
                
                // Image by coping from file (Images)
                if(item.kind === "file" && item.type.match(/image.*/)) {
                    var file = item.getAsFile();
                    // Open (and hide) add media form 
                    context.find(".openAddMediaOverlay").click();
                    context.find(".addMediaOverlay").css("display", "none");
                    context.find(".overlay").css("display", "none");
                    // Hacking Wykop' MFuploader script encapsulation through jQuery private event data
                    $._data(context.find(".embedFile").find('input[type=file]')[0], "events")["change"][0].handler({
                        preventDefault: function() {},
                        target: {
                            files: [file]
                        }
                    });
                }
            }
        }
        
        
        
        //// Hooks
        {
            // Hook to paste event of mikroblog post form
            $(".reply").bind("paste", betterPaste);
            
            // Keep hooking to paste events of comments form
            $(".btnReply").bind("click", function() {
                setTimeout(function() {
                    $(".replyOn").find(".reply").bind("paste", betterPaste);
                }, 333);
            });
        }
    });
}());
