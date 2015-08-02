var addUploaderName = function(el, html)
{
    var target = el.find('.itemTime');
    var base = target.html();
    target.html(base + html);
};

var addDisabledToggle = function(el)
{
    var target = el.find('.itemTime');
    target.append('<button class="disabler">非表示にする</button>');
    target.append('<button class="enabler disabledContent">表示する</button>');
    el.append('<div class="disabledContent floatingMessage">非表示にしました</div>');
};
