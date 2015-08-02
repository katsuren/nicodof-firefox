profile.addEventListener('onUserData', function(e) {
    for (var key in e.data) {
        var data = e.data[key];
        var id = key.split('-')[1];
        if (data == 1) {
            $("li.item[data-user=" + id + "]").addClass('disabled');
            $("li.item[data-user=" + id + "]").removeClass('enabled');
        }
    }
});

$("li.item").each(function() {
    var el = $(this);
    var videoId = el.data('id');
    var video = videoManager.get(videoId);
    var data = video.requestData();
    if (data) {
        initElement(data);
    }
    else {
        video.addEventListener("onData", function(e) {
            if (e.data && e.data['video_id'] == videoId) {
                initElement(e.data);
            }
        });
    }
});

$("li.item").on("click", ".disabler", function(e) {
    var el = $(this).closest("li.item");
    var id = el.data('user');
    $("li.item[data-user=" + id + "]").addClass('disabled');
    $("li.item[data-user=" + id + "]").removeClass('enabled');

    var type = el.data('usertype');
    profile.setUserVisible(id, 1, type);
});

$("li.item").on("click", ".enabler", function(e) {
    var el = $(this).closest("li.item");
    var id = el.data('user');
    $("li.item[data-user=" + id + "]").addClass('enabled');
    $("li.item[data-user=" + id + "]").removeClass('disabled');

    var type = el.data('usertype');
    profile.setUserVisible(id, 0, type);
});


var initElement = function(data)
{
    if ( ! data['video_id'] || ! (data['video_id'].length > 0)) {
        return;
    }
    var videoId = data['video_id'];
    var el = $("li.item[data-id=" + videoId + "]");

    // すでに enable / disable がついていたら初期化済み
    if (el.hasClass('disabled') || el.hasClass('enabled')) {
        return;
    }

    // ユーザーIDをアトリビュートに追加
    var type = (data['ch_id'].length > 0) ? 'ch' : 'user';
    var key = type == 'ch' ? data['ch_id'] : data['user_id'];
    el.attr('data-usertype', type);
    el.attr('data-user', key);
    el.addClass('enabled');

    // 投稿者を表示する
    var name = type == 'ch' ? data['ch_name'] : data['user_nickname'];
    var link = type == 'ch'
        ? name + '（ch）'
        : '<a href="/user/' + key + '">' + name + '</a>';
    var div = '<div class="username">' + link + '</div>';
    addUploaderName(el, div);

    // 表示 / 非表示ボタンをつける
    addDisabledToggle(el);

    profile.getUserVisible(key, type);
};
