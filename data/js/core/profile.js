/**
 * Constructor
 */
var Profile = function()
{
    EventDispatcher.call(this);

    self.port.emit('retrieve', {
        keys: ['profile']
        , callback: 'onGetProfileInfo'
    });
};
inherits(Profile, EventDispatcher);
var profile = new Profile();

//-----------------------------
//
// callbacks
//
//-----------------------------

/**
 * ローカルストレージのデータを取得した
 */
self.port.on('onRetrieve', function(result) {
    var callback = result['request']['callback'] || null;
    if (callback && profile[callback]) {
        profile[callback].apply(profile, [result]);
    }
});

Profile.prototype.onGetProfileInfo = function(result)
{
    if (result['result'] && Object.keys(result['result']).length > 0) {
        this.data = result['result'];
        var event = new Event('onData');
        event.data = this.data;
        return this.dispatch(event);
    }
};

Profile.prototype.onGetUserVisible = function(result)
{
    if (result['result'] && Object.keys(result['result']).length > 0) {
        this.user = result['result'];
        var event = new Event('onUserData');
        event.data = this.user;
        return this.dispatch(event);
    }
}


//-----------------------------
//
// methods
//
//-----------------------------

Profile.prototype.setUserVisible = function(user, value, type)
{
    var key = this.getUserKey(user, type);
    self.port.emit('commit', {
        key: key
        , value: value
    });
};

Profile.prototype.getUserVisible = function(user, type)
{
    if (typeof user == 'string' || user instanceof String) {
        user = [user];
    }
    for (var k in user) {
        var key = user[k];
        user[k] = this.getUserKey(key, type);
    }
    self.port.emit('retrieve', {
        keys: user
        , callback: 'onGetUserVisible'
    });
};

Profile.prototype.getUserKey = function(user, type)
{
    var key = '';
    if ((typeof type == 'string' || type instanceof String) && type.toLowerCase() == 'ch') {
        key = 'ch-' + user;
    }
    else {
        key = 'user-' + user;
    }
    return key;
}
