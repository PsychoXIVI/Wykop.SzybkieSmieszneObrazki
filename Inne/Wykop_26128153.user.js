// ==UserScript==
// @name        Wykop_26128153
// @version     0.2
// @description Dla https://www.wykop.pl/ludzie/roztoczanin/ z https://www.wykop.pl/wpis/26128153/
// @author      PsychoX
// @include     *://*wykop.pl/*
// @downloadURL https://raw.githubusercontent.com/PsychoXIVI/Wykop.SzybkieSmieszneObrazki/master/Inne/Wykop_26128153.user.js
// @updateURL   https://raw.githubusercontent.com/PsychoXIVI/Wykop.SzybkieSmieszneObrazki/master/Inne/Wykop_26128153.user.js
// ==/UserScript==

(function() {
    $(document).ready(function() {    
        //{ 1. Pokazuje ilość zakopów wykopanego znaleziska ? W tym momencie po wykopaniu ta informacja jest ukrywana. Trzeba wejść do znaleziska, żeby to zobaczyć.
        setTimeout(function() {
            $(".diggbox").each(function() {
                var diggbox = $(this);
                diggbox.find(".ajax").click(function() {
                    var downvotes = diggbox.find(".dropdown-show")[0].innerHTML;
                    downvotes = parseInt(downvotes.substring(downvotes.lastIndexOf("zakop") + 12));
                    setTimeout(function() {
                        diggbox.append("<a class=\"dropdown-show\" href=\"#\"> zakop (" + downvotes + ") </span>");
                    }, 333);
                });
            });
        }, 667); 
        //}

        //{ 2. Pokazuje dokładny czas dodania i dokładny czas opublikowania ?
        $("time").each(function() {
            var timeelement = $(this);
            timeelement.text(timeelement.text() + " (" + timeelement.attr("title") + ")");
        });
    });
    //}
})();
