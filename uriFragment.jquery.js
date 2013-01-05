/*
 Media Fragment URI - Spatial Dimentions polyfill
 Spec: http://www.w3.org/TR/media-frags/#naming-space
 2013 by Fabrice Weinberg (http://fabrice.weinberg.me)
*/

(function($) {
  /*global  jQuery:true, browser:true */

  $.fn.uriFragment = function() {
    var clearCssPattern = /\s*(?!<\")\/\*[^\*]+\*\/(?!\")\s*| |\n|\r/gm,
        cssPattern = /\s*(.*?)\s*\{(.*?)\}/g,
        bgPattern = /(background(?:-image)*):(.*?);/,

        uriPattern = /url\((.*?#.*?)\)/g,
        spPattern = /(.*?)#xywh=(pixel|percent)*:*(\d+),(\d+),(\d+),(\d+)/,

                                  // Test for CSSCanvasContext => https://www.webkit.org/blog/176/css-canvas-drawing/
        supportBackgroundCanvas = !!document.getCSSCanvasContext,

                                  //Test for -moz-image-rect support => https://developer.mozilla.org/en-US/docs/CSS/-moz-image-rect
        supportMozImageRect     = (function(){
                                      var style = "-moz-image-rect(url(\"\"), 0, 0, 0, 0)",
                                          div   = document.createElement('div');
                                          div.style.backgroundImage = style;
                                      return div.style.backgroundImage === style;
                                  })(),
       globaleImageCount = 0;

    var cssCanvas = function(src, x, y, w, h, isPercent){
      globaleImageCount++;
      var name = "poly_img_"+globaleImageCount,
           img = new Image();

      img.onload = function(){
        if (isPercent){
           var imageWidth = img.width, imageHeight = img.height;

           w = imageWidth * (w*0.01);
           h = imageHeight * (h*0.01);

           x = imageWidth * (x*0.01);
           y = imageHeight * (y*0.01);
        }
        document.getCSSCanvasContext("2d", name, 0, 0);
        var ctx = document.getCSSCanvasContext("2d", name, w, h);
            ctx.drawImage(img, x,y,w,h,0,0,w,h);
      };
      img.src = src;
      return "-webkit-canvas("+name+")";
    };


    var parseURI = function(URI){
      var frag = spPattern.exec(URI),
          result = "", src, isPercent, x, y, w, h;
      if (frag !== null){
            src = frag[1];
            isPercent = (frag[2] !== undefined && frag[2].toLowerCase() === "percent");
            x = parseInt(frag[3],10);
            y = parseInt(frag[4],10);
            w = parseInt(frag[5],10);
            h = parseInt(frag[6],10);

        if (supportBackgroundCanvas){
          result = cssCanvas(src, x, y, w, h, isPercent);
        }else if(supportMozImageRect){
          var bottom = y + h,
              right  = x + w,
              unit   = isPercent ? "%" : "";
          result = "-moz-image-rect(url("+src+"),"+y+unit+","+right+unit+","+bottom+unit+","+x+unit+")";
        }
        return [result, x, y, w, h, isPercent];
      }
      return null;
    };


    var parse = function(css){
       var updatedCSS = "", matches, uri;
       css = css.replace(clearCssPattern, '');


       while ((matches = cssPattern.exec(css)) !== null){
         var selector = matches[1],
             rule     = matches[2];

         if (rule === "") continue;

         var bgMatch =  bgPattern.exec(rule);
         if (bgMatch !== null){
           var bgProp = bgMatch[1],
               bg     = bgMatch[2],
               bgMod  = bg;
           while ((uri = uriPattern.exec(bg)) !== null){
             bgMod = bgMod.replace(uri[0], parseURI(uri[1])[0]);
           }
           updatedCSS += selector+"{"+bgProp+":"+bgMod+" !important}";
         }
        }
        var style = document.createElement('style');
        style.innerHTML = updatedCSS;
        document.head.appendChild(style);
    };

    var runPolyfill = function(){
        // Update CSS
      $('style').each(function() {
          if ($(this).is('link')) $.get(this.href).success(function(css) { parse(css); }); else parse($(this).text());
      });

      // Update IMG-Tag
      $('img').each(function(){
        var uri = this.src;
        var parsedURI = parseURI(uri);
        if (parsedURI !== null){
          var w = parsedURI[3],
              h = parsedURI[4];
          if (parsedURI[5] === true){
              w = this.width * (w*0.01);
              h = this.height * (h*0.01);
          }
          this.setAttribute("style", "display:block;background-image:"+parsedURI[0]+";width:"+w+"px;height:"+h+"px;");
          this.src = "";
        }
      });
    };

    if (supportBackgroundCanvas || supportMozImageRect){
      runPolyfill();
    }
  };
})(jQuery);

$.fn.uriFragment();