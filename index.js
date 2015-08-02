//---------------------------------
//
// Properties
//
//---------------------------------
const self = require('sdk/self');
const ss = require('sdk/simple-storage');
const pm = require('sdk/page-mod');
const request =  require('sdk/request').Request;


//---------------------------------
//
// Main code listeners
//
//---------------------------------

/**
 * ストレージを利用するためのリスナー
 */
function addStorageListener(worker)
{
    worker.port.on('commit', function(obj) {
        var result = {'request': obj};
        try {
            if (obj.key) {
                if (obj.value) {
                    ss.storage[obj.key] = obj.value;
                }
                else {
                    delete ss.storage[obj.key];
                }
                result['result'] = true;
            }
            else {
                result['result'] = false;
                result['message'] = 'no key';
            }
        } catch(e) {
            result['result'] = false;
            result['message'] = e.name + ': ' + e.message;
        }
        // console.log(result);
        worker.port.emit('onCommit', result);
    });

    worker.port.on('retrieve', function(obj) {
        var result = {'request': obj};
        if (typeof obj == 'string' || obj instanceof String) {
            obj = {'keys': [obj]};
        }
        else if (typeof obj == 'array' || obj instanceof Array) {
            obj = {'keys': obj};
        }
        var keys = obj.keys;
        if ( ! keys.isArray) {
            keys = [keys];
        }
        var data = {};
        var len = keys.length;
        for (var i = 0; i < len; i++) {
            var key = keys[i];
            if (key) {
                data[key] = ss.storage[key];
            }
        }
        result['result'] = data;
        worker.port.emit('onRetrieve', result);
    });
}

/**
 * Ajax を利用するためのリスナー
 */
function addAjaxListener(worker)
{
    var complete = function(result) {
        worker.port.emit('onGetRequest', result);
    };

    worker.port.on('getRequest', function(obj) {
        var result = {'request': obj};
        if ( ! obj.url) {
            result['result'] = false;
            result['message'] = 'url should not empty';
            return complete(result);
        }
        console.log('GET REQUEST: ' + obj.url);

        var r = request({
            url: obj.url
            , content: obj.params
            , onComplete: function(response) {
                // console.log(response.text);
                result['result'] = JSON.stringify(response.text);
                complete(result);
            }
        });

        var method = obj.method || "";
        switch (method.toLowerCase()) {
            case "post":
                r.post();
                break;
            case "head":
                r.head();
                break;
            case "put":
                r.put();
                break;
            case "get":
            default:
                r.get();
                break;
        }
    });
}


//---------------------------------
//
// Content scripts
//
//---------------------------------

pm.PageMod({
    include: /https?:\/\/.*nicovideo.jp\/ranking.*/
    , contentStyleFile: [
        self.data.url('css/common.css')
    ]
    , contentScriptFile: [
        self.data.url('js/vendor/jquery.js')
        , self.data.url('js/core/base.js')
        , self.data.url('js/core/video.js')
        , self.data.url('js/core/profile.js')
        , self.data.url('js/page/filterbase.js')
        , self.data.url('js/page/ranking.js')
    ]
    , onAttach: function(worker) {
        addStorageListener(worker);
        addAjaxListener(worker);
    }
});

pm.PageMod({
    include: /https?:\/\/.*nicovideo.jp\/(search|tag)\/.*/
    , contentStyleFile: [
        self.data.url('css/common.css')
    ]
    , contentScriptFile: [
        self.data.url('js/vendor/jquery.js')
        , self.data.url('js/core/base.js')
        , self.data.url('js/core/video.js')
        , self.data.url('js/core/profile.js')
        , self.data.url('js/page/filterbase.js')
        , self.data.url('js/page/tag.js')
    ]
    , onAttach: function(worker) {
        addStorageListener(worker);
        addAjaxListener(worker);
    }
});
