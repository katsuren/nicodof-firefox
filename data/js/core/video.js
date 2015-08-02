var _videoObjectId = 0;
var _videoList = {};

var VideoManager = function() {};
VideoManager.prototype.get = function(id) {
    if (_videoList[id]) {
        return _videoList[id];
    }
    else {
        return new Video(id);
    }
};
var videoManager = new VideoManager();

/**
 * Constructor
 */
var Video = function(id)
{
    EventDispatcher.call(this);

    _videoObjectId++;
    _videoList[_videoObjectId] = this;
    this._id = _videoObjectId;

    this.setId(id);
};
inherits(Video, EventDispatcher);

//-----------------------------
//
// callbacks
//
//-----------------------------

/**
 * ローカルストレージのデータを取得した
 */
self.port.on('onRetrieve', function(result) {
    var objId = result['request']['callerId'];
    if (_videoList[objId]) {
        var caller = _videoList[objId];
        var callback = result['request']['callback'] || null;
        if (callback && caller[callback]) {
            caller[callback].apply(caller, [result]);
        }
    }
});

/**
 * Ajaxコールが完了した
 */
self.port.on('onGetRequest', function(result) {
    var objId = result['request']['callerId'];
    if (_videoList[objId]) {
        var caller = _videoList[objId];
        var callback = result['request']['callback'] || null;
        if (callback && caller[callback]) {
            caller[callback].apply(caller, [result]);
        }
    }
});

Video.prototype.onGetVideoInfoFromStorage = function(result)
{
    var key = this.getKey();
    if (result['result'] && result['result'][key] && Object.keys(result['result'][key]).length > 0) {
        this.data = result['result'][key];
        var event = new Event('onData');
        event.data = this.data;
        return this.dispatch(event);
    }

    // もしなかった場合はネットから取得
    self.port.emit('getRequest', {
        url: 'http://ext.nicovideo.jp/api/getthumbinfo/' + this.id
        , callback: 'onGetVideoInfoFromNetwork'
        , callerId: this._id
    });
};

Video.prototype.onGetVideoInfoFromNetwork = function(result)
{
    if (result['result'] && Object.keys(result['result']).length > 0) {
        var v = JSON.parse(result['result']);
        if ($("video_id", v).text()) {
            var key = this.getKey();
            var data = {
                video_id: $("video_id", v).text()
                , title: $("title", v).text()
                , description: $("description", v).text()
                , watch_url: $("watch_url", v).text()
                , user_id: $("user_id", v).text()
                , user_nickname: $("user_nickname", v).text()
                , ch_id: $("ch_id", v).text()
                , ch_name: $("ch_name", v).text()
            };
            this.commit(key, data);
            this.data = data;
        }
        if (result['result']) {
            var event = new Event('onData');
            event.data = data;
            return this.dispatch(event);
        }
    }
};


//-----------------------------
//
// methods
//
//-----------------------------

Video.prototype.setId = function(id)
{
    var orgId = this.id;
    this.id = id || null;
    var key = this.getKey(id);
    if (id) {
        self.port.emit('retrieve', {
            keys: [key]
            , callback: 'onGetVideoInfoFromStorage'
            , callerId: this._id
        });
    }
    // 存在していたIDにnullをいれた場合はデータ削除
    else if (orgId && id === null) {
        this.commit(this.getKey(orgId), null);
    }
};

Video.prototype.getKey = function(id)
{
    var key = id || this.id;
    return 'video-' + key;
};

Video.prototype.commit = function(key, value)
{
    self.port.emit('commit', {
        key: key
        , value: value
    });
};

Video.prototype.requestData = function(getFromStorage)
{
    if (getFromStorage === null) {
        getFromStroage = true;
    }
    var key = this.getKey();
    if (getFromStorage) {
        self.port.emit('retrieve', {
            keys: [key]
            , callback: 'onGetVideoInfoFromStorage'
            , callerId: this._id
        });
    }
    return this.data;
};


