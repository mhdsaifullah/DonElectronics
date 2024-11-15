/** 顶部通知 */
var TopNotice = new (function () {
    var that = this
    function GetHtml(notice) {
        if (!notice || !notice.Content) {
            return null
        }
        var content = notice.Content;
        var goUrl = notice.GoUrl || '';
        var html = '';
        if (content != '') {
            html += '<div class="topAlts" style="display: none; position: relative; background-color:#fff; color:#f90; font-size:14px; padding:.6em 2em;">';
            html += '<div class="boxW" style="padding-right:2em;">';
            html += '<i style="font-family: iconfont_dg; margin-right:.5em;">&#xeca5;</i>';
            html += content
            if (goUrl != '') {
                html += '<a href="' + goUrl + '" target="_blank" style="color:#f90; margin-left:1em; text-decoration: underline">Learn More >></a>';
            }
            html += '<div class="boxClose"></div></div></div>';
        }
        return html;
    }
    function ShowNotice(noticeData) {
        var notice = GetHtml(noticeData);
        if (notice != undefined && notice != null && notice != '') {
            $('.topAlts').remove();
            setTimeout(function () {
                //$("body").prepend('<div class="topAlts" style="display: none; position: relative; background-color:#fff; color:#f90; font-size:14px; padding:.6em 2em;"><div class="boxW" style="padding-right:2em;"><i style="font-family: iconfont_dg; margin-right:.5em;">&#xeca5;</i>Dragon Boat Festival Schedule: The factory and the logstics service will be off from 22nd Jun. to 23rd Jun. (GMT+8).<a href="https://www.allpcb.com/news/celebrating-dragon-boat-festival-shipment-schedule_240.html" target="_blank" style="color:#f90; margin-left:1em; text-decoration: underline">Learn More >></a><div class="boxClose"></div></div></div>');
                $("body").prepend(notice);
                $(".topAlts").slideDown();
                $(".topAlts .boxClose").click(function () {
                    $(".topAlts").slideUp();
                    // $.cookie('showTopAlt','220429',{path:'/'});
                })
            }, 300)
        }

    }
    this.ShowNotice = ShowNotice;
    /**
     * 获取并展示通知
     * @param {any} position
     */
    this.Notice = function (position) {
        that.GetNoticeData(position, function (data) {
            that.ShowNotice(data)
        });
    }


    this.GetNoticeData = function (position, callback) {
        $.get('/GetWebNotice', { position: position }, callback)
    }

});
