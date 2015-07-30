(function (global) {
    'use strict';

    //tools
    function isType(type) {
        return function(obj) {
            return {}.toString.call(obj) == "[object " + type + "]"
        }
    }

    var isFunction = isType("Function");
    var isObject = isType("Object")
    var isUndefined = isType("Undefined")
    var isArray = Array.isArray || isType("Array")
    var isString = isType("String")

    //css, js缓存，如果页面中已经加载，则不重复引用
    var cache = {};
    var isWebWorker = typeof window === 'undefined' && typeof importScripts !== 'undefined' && isFunction(importScripts)
    /**
     * @param source:Object
     *      source:
     *      {
     *          js: ['http://xxx/.js'],
     *          css: [],
     *          html: []
     *      }
     *
     * @param dom:Element html holder
     * @param cb:Function callback
     */
    function QSHComponentLoad(source, dom, cb){
        var dtd = $.Deferred();
        var promises = [];
        var $dom = $(dom);
        if(!$dom.length){
            logError('unvaild dom');
            return;
        }
        source.css && (promises = promises.concat());
        promises = promises.concat();

        //css 与 html 加载完成之后，加载js
        $.when(appendCss(source.css, $dom), appendHtml(source.html, $dom))
            .done(function(v, htmls){
                if(isString(htmls)){
                    htmls = [htmls];
                }
                loadScript(htmls);
            })
            .fail(function(){
                logError('something error when load css and html');
            });

        function loadScript(htmls){
            if(source.js && source.js.length){
                $.when.apply($, appendScript(source.js, $dom))
                    .done(function(){
                        cb && cb(htmls);
                        dtd.resolve(htmls);
                    })
                    .fail(function(){
                        cb && cb(true);
                        dtd.reject();
                    })
            }
            else {
                cb && cb();
                dtd.resolve();
            }
        }

        return dtd;
    }

    function appendHtml(list, dom){
        if(isUndefined(list)){
            list = [];
        }
        list = list.map(function(url){
            var dtd = $.Deferred();
            var link = url;
            var insert = true;
            if(isObject(url)){
                link = url.url;
                !isUndefined(url.insert) && (insert = url.insert);
            }
            $.ajax({
                url: link,
                dataType: 'html',
                async: true,
                timeout: 3000
            })
                .done(function(html){
                    if(insert){
                        $(dom).append(html);
                    }
                    dtd.resolve(html);
                })
                .fail(function(){
                    logError({
                        url: link,
                        msg: 'load with error'
                    });
                    dtd.reject();
                });

            return dtd;
        });

        return $.when.apply($, list);
    }

    function appendCss(list, dom){
        if(isUndefined(list)){
            list = [];
        }
        list = list.map(function(url){
            var link = createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            return appendNode(link, dom, url);
        });

        return $.when.apply($, list);
    }

    function appendScript(list, dom){
        return list.map(function(url){
            requestFromWebWorker(url, dom);
        })
    }

    function appendNode(node, dom, url){
        if(cache[url]){
            return cache[url];
        }
        var dtd = $.Deferred();

        addOnLoad(node, function(error){
            node.onload = node.onerror = node.onreadystatechange = null;
            if(error === true){
                dtd.reject();
            }
            else {
                dtd.resolve();
            }
        });

        $(document.head).append(node);

        cache[url] = dtd;
        return dtd;
    }

    function addOnLoad(node, onload){
        var supportOnload = "onload" in node;

        if (supportOnload) {
            node.onload = onload;
            node.onerror = function() {
                logError("error", { node: node });
                onload(true)
            }
        }
        else {
            node.onreadystatechange = function() {
                if (/loaded|complete/.test(node.readyState)) {
                    onload()
                }
            }
        }
    }

    function logError(msg){
        console.error(msg);
    }

    function createElement(name){
        return document.createElement(name);
    }

    var requestFromWebWorker;
    if (isWebWorker) {
        requestFromWebWorker = function requestFromWebWorker(url) {
            // Load with importScripts
            var dtd = $.Deferred();
            var error;
            try {
                importScripts(url);
                dtd.resolve();
            } catch (e) {
                error = e;
                dtd.reject();
            }
        }
    }
    else {
        requestFromWebWorker = function(url, dom){
            var script = createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            script.defer = true;
            script.async = true;
            return appendNode(script, dom, url);
        }
    }

    // expose mLoad to the global object
    global.QSHComponentLoad = QSHComponentLoad;

    // expose as a common js module
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = QSHComponentLoad;
    }

    // expose mLoad as an AMD module or CMD module
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function() {
            return QSHComponentLoad;
        });
    }
})(window);