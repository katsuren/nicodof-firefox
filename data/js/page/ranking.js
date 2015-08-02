var addUploaderName = function(el, html)
{
    var target = el.find('.itemTime');
    var base = target.html();
    target.html(base + html);
};

var addDisabledToggle = function(el)
{
    var target = el.find('.rankingNumWrap');
    target.append('<a href="javascript:void(0)" class="disabler">非表示にする</a>');
    target.append('<a href="javascript:void(0)" class="enabler disabledContent">表示する</a>');
    el.append('<div class="disabledContent floatingMessage">非表示にしました</div>');
};
