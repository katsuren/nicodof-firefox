// クラス継承用の関数
var inherits = function(childCtor, parentCtor)
{
    Object.setPrototypeOf(childCtor.prototype, parentCtor.prototype);
};


//---------------------------------
//
// Event
//
//---------------------------------
var Event = function(name)
{
    this.name = name;
}

Event.prototype.getName = function()
{
    return this.name;
}


//---------------------------------
//
// EventDispatcher
//
//---------------------------------
var EventDispatcher = function()
{
    this._listeners = {};
};

EventDispatcher.prototype.addEventListener = function(name, func, caller)
{
    if ( ! this._listeners[name]) {
        this._listeners[name] = [];
    }
    var obj = {f:func, c:caller};
    this._listeners[name].push(obj);
};

EventDispatcher.prototype.removeEventListener = function(name, func)
{
    if (this._listeners[name]) {
        for (var key in this._listeners[name]) {
            if (func == this._listeners[name][key]['f']) {
                this._listeners[name].splice(key, 1);
            }
        }
    }
};

EventDispatcher.prototype.dispatch = function(e)
{
    var name = e.getName();
    if (this._listeners[name]) {
        for (var key in this._listeners[name]) {
            var obj = this._listeners[name][key];
            var f = obj['f'];
            var c = obj['c'];
            f.apply(c, [e]);
        }
    }
};
