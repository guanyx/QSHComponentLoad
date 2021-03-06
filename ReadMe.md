# QSHComponentLoad

分区组件加载

####特性：

* 工具依赖JQuery 1.5+
* 简而易之，这是一个能够同时加载css，js，html的小工具
* 同一个页面，css与js脚本将不会重复加载（当前处理的机制是，根据url进行排重）'a.js'与'./a.js'将会使脚本嵌入两次，所以同一个资源的url路径保持统一
* css与js会嵌入到head中
* html默认会插入到指定的dom对象中，也可以不根据选项选择不插入

####接口说明

<pre>
 QSHComponentLoad(source, dom, cb)         return: Promise
   source:Object
        {
            js: [jsurl:String],
            css: [cssurl:String],
            html: [htmlurl:String|Object]
        }
        jsurl: 'a.js'
        cssurl: 'a.css',
        htmlurl: 'a.html'
        htmlurl: {insert: false, url: 'a.html'}        insert: false|请求但不插入(通常用于请求模板)

   dom: $()的封装
   cb: 回调（不推荐使用）
</pre>

####目录说明
* dist 压缩后的代码 生产环境使用
* src debug源文件
* test 使用示例

####Start
以下内容请打开test文件夹的内容去测试

引入脚本

```html
<script src="http://cdn.bootcss.com/jquery/1.11.3/jquery.min.js"></script>
```

直接调用
```js
<script src="../src/mLoad.js"></script>
QSHComponentLoad({
    js: ['snippet.js'],
    css: ['snippet.css'],
    html: ['snippet.html', {url: 'snippet2.html'}]
}, 'body')
        .done(function(htmls){
            //全部内容已加载完成。此时可调用snippet.js的方法，以及一些其他操作
            console.log(htmls)  //htmls内容为html数组 示例是 [snippet.html的内容， snippet2.html的内容]
        })
        .fail(function(){
            alert('fail');
        })
```

seajs方式
```js
seajs.config({
  alias: {
    "load": "../src/mLoad.js"
  }
})
define(function(require, exports, module) {
  // 通过 require 引入依赖
  var QSHComponentLoad = require('load');
  ....
});
```

commonJS方式
```js
var QSHComponentLoad = require('../src/mLoad.js');
.....
```

####使用场景模拟
以手机首页的热卖商品为例
热卖商品作为一个组件
包含了一个热卖商品列表的样式文件。remai.css
包含了一个热卖商品结构HTML。remai.html
包含了一个热卖商品item的template。remai.item.html
包含了热卖商品的交互脚本。remai.js

如果要把组件的功能独立，需要把这些内容一次性加载进来
而这个加载组件就是为了完成这样的简单功能
先加载css与html。再加载js
加载完成后，可以通过Promise或者回调通知调用者组件就绪

获取热卖商品内容这部分的逻辑，应该是在remai.js中完成

```js
QSHComponentLoad({
    js: ['remai.js'],
    css: ['remai.css'],
    html: ['remai.html', {url: 'remai.item.html', insert: false}]
}, 'body')
        .done(function(htmls){
            remai.fetchData();
            remai.Render(htmls[1])
            //hideLoading //隐藏加载中图片
            ....
        })
        .fail(function(){
            alert('fail');
        })
```


####附加
<p>写的有些草率，功能也比较单一。如果在使用中有什么问题，或者需要新增哪些特性，请直接在群里面@我修改</p>
<p>seajs以及commonJs调用方式未经过测试</p>