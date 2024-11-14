
$(function () {
    var CurrentemuIndex = 0;
    Head.Init();
    LP.Init();
    RegisterTips();
    App.Init();
    //每月优惠券已更换，这里不需要了
    //LP.getMonthlyCoupon();
    ///滑动的锚点
    $('body a[href*=#]').click(function () {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var $target = $(this.hash);
            $target = $target.length && $target || $('[name=' + this.hash.slice(1) + ']');
            if ($target.length) {
                $('html,body').stop();
                var targetOffset = $target.offset().top;
                $('html,body').animate({ scrollTop: targetOffset }, 1000);
                return false;
            }
        }
    });
    $("#one-menu .mcm1 a").hover(function () {
        $(this).addClass("on").siblings().removeClass("on");
        $(this).parent().next().children().eq($(this).index()).addClass("on").siblings().removeClass("on");
        // $("#one-menu .mcm2>div").eq($(this).index()).addClass("on").siblings().removeClass("on");
    })
    $(".min-top-nav").on('click', 'i.back', function () {
        $('body').removeClass('ov showBK'); //移动计价
        if (typeof Pcb.clearPrice === 'function') {
            Pcb.clearPrice();
            $(".addCartDetail").hide();
        }
    })
    $(".quoteMobileBNRC .bnReset").click(function () {
        window.location.reload();
    });
    LP.loadBPage();
});



var LP = {
    Init: function () {
        LP.AllChecked();
        LP.WebStat();
        LP.InitLayuiDate();
        LP.dataPointJP();
    },
    OnLoadData: $.Callbacks(),
    //全选/反选
    AllChecked: function (name) {
        if ($("[name=chk_all]").length > 0) {
            $("[name=chk_all]").on("click", function () {
                $("[name=chk_list]").prop("checked", $(this).prop("checked"));
            });
        }
    },
    ///页面统计
    WebStat: function () {
        var domain = window.location.href;
        var referrer = document.referrer;
        var timezone = Tools.GetTimeZone();
        $.ajax({
            url: "https://www.allpcb.com/Ashx/Common.ashx?act=GetWebStat",
            type: "Post",
            async: 'true',
            data: { domain: domain, referrer: referrer, timezone: timezone },
            success: function (data) { },
            error: function (XMLHttpRequest, textStatus, errorThrown) { }
        });

    },
    InitLayuiDate: function () {
        //layui-laydate---   1：【年月日】选择器   2：【年月日时分秒】选择器  3：【时分秒】选择器  4：【年月】选择器
        var getLen = $("[layui-laydate]").length;
        if (getLen > 0) {
            $("[layui-laydate]").each(function (i, dom) {
                if ($(this).attr('layui-laydate') == "1") {
                    laydate.render({
                        elem: this
                    });
                }
                else if ($(this).attr('layui-laydate') == "2") {
                    laydate.render({
                        elem: this,
                        type: 'datetime'
                    });
                }
                else if ($(this).attr('layui-laydate') == "3") {
                    laydate.render({
                        elem: this,
                        type: 'time'
                    });
                }
                else if ($(this).attr('layui-laydate') == "4") {
                    laydate.render({
                        elem: this,
                        type: 'month'
                    });
                }
            });
        }
    },
    AjaxPage: function () {
        var totalpage = parseInt($(".pagination").attr("totalpage"));
        var pagesize = parseInt($(".pagination").attr("pagesize"));
        $.jqPaginator('.pagination', {
            totalPages: totalpage,
            visiblePages: pagesize,
            currentPage: LP.CurrentPage,
            onPageChange: function (num, type) {
                var oldUrl = window.location.href;
                if (type == "change") {
                    LP.CurrentPage = num;
                    LP.Search(num);
                }
                //   LP.DetailToUrl();
                //如果定义了回调的话的
                if (typeof asynccb == "function") {
                    asynccb();
                }
            }
        });
        if ($(".pagination").attr("totalcount")) {
            var totalcountnum = $(".pagination").attr("totalcount");
            $(".paginationzone").append("<div class='totalcountnum'>" + 'total items:' + totalcountnum + "</div>");
            $(".totalcountnum").css({ "float": "right", "line-height": "32px", "margin-top": "20px", "border": "1px solid #ccc", "border-radius": "5px 0 0 5px", "color": "#999", "padding": "0 5px" });
            $(".pagination").css({ "float": "right", "margin-right": "20px" });
            $(".pagination > li:first-child > a, .pagination > li:first-child > span").css("border-radius", "0")
        }
    },
    //Layui弹出窗口
    LayerShow: function (htmlid, w, h) {
        layer.open({
            time: 0,
            type: 1,
            title: ['message', 'font-size:18px;'],
            closeBtn: 1,
            area: [w + 'px', h + 'px'],
            maxmin: true,
            shadeClose: true,
            shade: 0.4,
            offset: 'auto',
            content: $("#" + htmlid),
            end: function () {
                layer.closeAll();
            },
            success: function (layero, index) {
            }
        });
    },
    LayerShowHaveTitle: function (htmlid, w, h, titles) {
        layer.open({
            type: 1,
            title: [titles, 'font-size:18px;'],
            closeBtn: 1,
            area: [w + 'px', h + 'px'],
            maxmin: true,
            shadeClose: true,
            shade: 0.4,
            offset: 'auto',
            content: $("#" + htmlid),
            end: function () {
                layer.closeAll();
            },
            success: function (layero, index) {
            }
        });
    },
    LayerUrlShow: function (Url, w, h, messageInfo) {
        messageInfo = (messageInfo == "" || messageInfo == null) ? "message" : messageInfo;
        //自定页
        var index = layer.open({
            type: 2,
            title: [messageInfo, 'font-size:18px;'],
            closeBtn: 1,
            area: [w + 'px', h + 'px'],
            maxmin: true,
            shadeClose: true,
            shade: 0.4,
            offset: 'auto',
            content: Url,
            end: function () {
                layer.closeAll();
            },
            success: function (layero, index) {
            }
        });
        return index;
    },
    Search: function (page) {
        if (page == undefined || page < 1) {
            page = 1;
        }
        var parm = $("#srarchForm").serialize() + "&page=" + page;
        var action = $("#srarchForm").attr("action");
        if (action == undefined || action == null || action == "") {
            action = window.location.pathname;//+ "?" + parm;
        }
        $.ajax({
            url: action,
            data: parm,
            type: 'get',
            dataType: 'html',
            beforeSend: function () {
                $("#listtable").html("");
                layer.msg('loading......', { icon: 16, shade: 0.21 });

            },
            success: function (data) {
                layer.closeAll();
                //if (data.indexOf('系统错误') > -1) {
                //    return;
                //}
                $("#listtable").html(data);
                //  Power.GlobalOperationButtonRegister();
                LP.AjaxPage();
                LP.AllChecked();
                LP.OnLoadData.fire();
                // LP.ShowHisotryEmail();
            }
        });
    },
    //重置
    FormReset: function () {
        document.getElementById("srarchForm").reset();//重置表单作用域
        var parm = $("#srarchForm").serialize();
        var action = $("#srarchForm").attr("action");
        if (action == undefined || action == null || action == "") {
            action = window.location.pathname;// + "?" + parm;
        }
        $.ajax({
            url: action,
            data: parm,
            dataType: 'html',
            beforeSend: function () {
                layer.msg('loading......', { icon: 16, shade: 0.21 });
            },
            success: function (data) {
                layer.closeAll();
                $("#listtable").html(data);
                // Power.GlobalOperationButtonRegister();
                LP.AllChecked();
            }
        });
    },
    //DG 文件上传
    getUpFileTK: function (fileInfo) {
        //name文件名、file文件:obj、size文件大小、maxSize限制字节:(2)M、types限制类型:('jpg,png')、note文件名备注、module文件分类('默认后缀')、barID进度条:('upopgs1')标签#ID、fileMD5:'*'、statistics:0/1。
        //{name:'xx.zip',file:file,size:6000,maxsize:2,types:'zip,rar',note:'allpcb',module:'key',barID:'upopgs1',rateID:'',ifmd5:0/1,fileMD5:'abcd1234',statistics:1}

        let lang = 'en'; //提示语言
        let aType = fileInfo.types;
        let file = fileInfo.file;
        let fileSize = fileInfo.size;
        let maxSize = fileInfo.maxSize;
        let fileName = fileInfo.name;
        let fileNameNote = fileInfo.note == null ? 'MA' : fileInfo.note;
        let barID = fileInfo.barID; //进度条ID
        let rateID = fileInfo.rateID; //进度条百分比文字ID
        let filetype = Tools.getFileSuffix(fileName).toLowerCase();
        let module = fileInfo.module == null ? filetype : fileInfo.module;
        let statistics = fileInfo.statistics == null ? 1 : 0;
        let isR50 = fileInfo.isR50 == null ? 0 : 1; //最多50%
        let hosturl = '';
        let fileMD5 = fileInfo.fileMD5;
        let ifmd5 = fileInfo.ifmd5 == null || fileInfo.ifmd5 === 0 ? 0 : 1;
        let xmlhttp = null;
        let RET = lang == 'en' ? getLanguage('serverErrTryLater') : '服务器错误，请稍后再试。';
        let RET2 = lang == 'en' ? getLanguage('psUpXXFiles', aType) : '请上传' + aType + '文件';
        let RET3 = lang == 'en' ? getLanguage('upFileMaxM', maxSize) : '上传的文件不能大于' + maxSize + 'M';
        let RET4 = lang == 'en' ? 'Error, the current browser does not support uploading files.' : '当前浏览器版本不支持上传文件，请更换chrome浏览器重试。';

        return new Promise((resolve, reject) => {
            if (typeof (aType) !== 'undefined' && aType.toLowerCase().indexOf(filetype) < 0) {
                return reject({ status: 0, msg: RET2 })
            }
            if (typeof (maxSize) !== 'undefined' && fileSize >= (maxSize * 1000000)) {
                return reject({ status: 0, msg: RET3 })
            }
            if (window.location.hostname == 'm2.allpcb.com' || window.location.hostname == 'manage2.allpcb.com' || window.location.hostname == 'ww2.allpcb.com' || window.location.hostname == '115.236.37.105') hosturl = 'http://115.236.37.105:1123/allpcbapi';
            else hosturl = "https://member.allpcb.com";
            if (window.XMLHttpRequest) { xmlhttp = new XMLHttpRequest() }
            else if (window.ActiveXObject) { xmlhttp = new ActiveXObject("Microsoft.XMLHTTP") }

            if (ifmd5 == 1) {
                try {
                    if ($.isFunction(SparkMD5.hashBinary)) {
                        const fileReader = new FileReader();
                        fileReader.readAsBinaryString(file);
                        fileReader.onload = e => {
                            fileMD5 = SparkMD5.hashBinary(e.target.result);
                            xres();
                        }
                    }
                } catch (e) {
                    $.getScript("/img/js/manage/spark-md5.min.js", function () {
                        const fileReader = new FileReader();
                        fileReader.readAsBinaryString(file);
                        fileReader.onload = e => {
                            fileMD5 = SparkMD5.hashBinary(e.target.result);
                            xres();
                        }
                    });
                }
            } else xres();

            function xres() {
                if (xmlhttp != null) {
                    upOssRequest().then(res => {
                        upFiles(res).then(resfile => {
                            resolve(resfile)
                        }).catch(err => {
                            reject(err)
                        })
                    }).catch(err => { reject({ status: 0, msg: err }) })
                } else {
                    reject({ status: 0, msg: RET4 })
                }
            }

        });
        function upOssRequest() {
            return new Promise((resolve, reject) => {
                try {
                    serverUrl = hosturl + '/api/settings/file/aliyun/oss-token?Module=' + module + '&FileName=' + encodeURI(fileNameNote + '.' + filetype);
                    xmlhttp.onreadystatechange = function () {
                        if (xmlhttp.status == 200) {
                            resolve(JSON.parse(xmlhttp.responseText))
                        }
                    }
                    xmlhttp.open("GET", serverUrl, false);
                    xmlhttp.send(null);
                } catch (err) {
                    reject(RET);
                }
            });
        }
        function upFiles(res) {
            return new Promise((resolve, reject) => {
                let fmData = new FormData();
                if (res.host) {
                    fmData.append('host', res.host);
                    fmData.append('fileName', fileName);
                    fmData.append('accessid', res.accessid);
                    fmData.append('signature', res.signature);
                    fmData.append('expire', parseInt(res.expire));
                    fmData.append('callbackbody', res.callback);
                    fmData.append('key', res.dir);
                    fmData.append('success_action_status', 200);
                    fmData.append('policy', res.policy);
                    fmData.append('OSSAccessKeyId', res.accessid);
                    fmData.append('dir', res.dir + '_${filename}');
                    fmData.append('file', file);
                    try {
                        xmlhttp.onreadystatechange = function () {
                            if (xmlhttp.status == 200 && xmlhttp.statusText == 'OK') {
                                if (statistics == 1) getStatistics(res.host + res.dir);
                                resolve({ status: 1, msg: 'ok', fileurl: res.host + res.dir, fileMD5: fileMD5 })
                            }
                        }
                        if (barID != null) {
                            xmlhttp.upload.onprogress = function (e) {
                                if (e.lengthComputable) {
                                    var rate = Math.round(e.loaded / e.total * 100);
                                    rate = isR50 ? (rate / 2).toFixed(0) + "%" : rate + '%';
                                    document.getElementById(barID).style.width = rate;
                                    if (rateID) document.getElementById(rateID).innerText = rate;
                                }
                            };
                        }
                        xmlhttp.open("POST", res.host, true);
                        xmlhttp.send(fmData);
                    } catch (err) {
                        reject(RET);
                    }
                } else {
                    reject({ status: 0, status: 'err' })
                }
            });
        }
        function getStatistics(fileUrl) {
            // /api/Client/file/statistics
            let TemporaryCustomerId = Tools.getCookie('TemporaryCustomerId');
            let data = {
                "FileCustomId": TemporaryCustomerId,
                "fileName": fileName,
                "filePath": fileUrl,
                "module": module,
                "fileSize": fileSize.toString(),
                "fileMD5": fileMD5
            }
            // $.ajax({
            //     url:hosturl + '/api/Client/file/statistics',
            //     type: "post",
            //     contentType: 'application/json',
            //     data: JSON.stringify(data),
            // });
            serverUrl = hosturl + '/api/settings/file';
            xmlhttp.open("POST", serverUrl, false);
            xmlhttp.setRequestHeader("Content-type", "application/json");
            statistics = 0;
            xmlhttp.send(JSON.stringify(data));
        }
    },
    //每月优惠券
    getMonthlyCoupon: function () {
        return;
        var ctc = $.cookie('coupon_tagcode');
        var usid = $(".nheadr21 span.headAccountName").attr('usid');
        if (usid && ctc && ctc != 'null') {
            $.ajax({
                url: '/newmember/getcoupons',
                data: { coupon_code: ctc },
                dataType: 'json',
                type: 'get',
                //async: true,
                success: function (res) {
                    // console.log(res)
                    if (res.attr.length > 0) {
                        let clist = '';
                        for (let i = 0; i < res.attr.length; i++) {
                            let ts = res.attr[i];
                            clist += `<li cid="${ts.Id}" desc="${ts.CnName}"><b class="m">${ts.CounpMoney}</b><div><b class="fontovdd" title="${ts.EnName}">${ts.EnName}</b><p class="fontovdd" title="${ts.Remark}">${ts.Remark}</p><p>Vaild Time: 15 Days</p></div></li>`;
                        }
                        $("body").append(`
                            <div class="boxAltCoupon boxMonthlyCoupon">
                                <div class="n">
                                    <ul>${clist}</ul>
                                    <div class="note">
                                        <b>Enterprise Account Benefits</b>
                                        <span go="quote" class="bn ok anmt3">Use Now</span>
                                        <span go="coupons" class="bn goC anmt3">My Coupons</span>
                                    </div>
                                <i class="closeMC anmt3"></i>
                                </div>
                            </div>
                        `);
                        $(".boxMonthlyCoupon .bn.ok,.boxMonthlyCoupon .bn.goC").click(function () {
                            var tsCoupon = $(".boxMonthlyCoupon li.on");
                            var cid = tsCoupon.attr('cid');
                            var goUrl = $(this).attr('go');
                            var desc = tsCoupon.attr('desc');
                            $.ajax({
                                url: '/newmember/sendcoupon',
                                data: JSON.stringify({ id: cid, Description: desc }),
                                dataType: 'json',
                                contentType: 'application/json',
                                type: 'post',
                                //async: true,
                                success: function (res) {
                                    console.log(res);
                                    if (res.success) {
                                        $.cookie('coupon_tagcode', 'null', { path: '/' });//测试注释
                                        if (goUrl == 'quote') {
                                            window.location.href = '/online_pcb_quote_new.html'
                                        } else window.location.href = '/membernew/couponlist';

                                    } else alt2021(res.message);
                                }
                            });
                        });
                        //默认第一个
                        $(".boxMonthlyCoupon li:first-of-type").addClass("on");
                        //选列表
                        $(".boxMonthlyCoupon li").click(function () {
                            $(this).addClass("on").siblings().removeClass("on");
                        });
                        //关闭
                        $(".boxMonthlyCoupon .closeMC").click(function () {
                            $.cookie('coupon_tagcode', 'null', { path: '/' });//测试注释
                            $(".boxMonthlyCoupon").removeClass("show");
                        });
                        //延迟显示弹窗
                        setTimeout(function () {
                            $(".boxMonthlyCoupon").addClass("show");
                        }, 300)

                    }
                },
                error: function (e) {
                    console.log(e)
                }
            });
        }
    },
    //展示面板详情细节
    fnShowPanelizationDetail: function () {
        var boxSPD = $(".isShowPanelizationDetail");
        if (boxSPD.attr('data-BV') == 'jpset') boxSPD.show();
        else return false;
        var params = JSON.parse(boxSPD.attr('data-config'));
        $("body").append(`
        <div class="boxShowPanelizationDetail pinbanBox_pinban_info pull-left">
            <div class="imposition-information-example">
                <a class="f12 cl-7B5822">* Panelization Detail </a>
                <div class="imposition-requires-presentation rel">
                    <div class="jpsettipsbox b-bradius4 f12">
                        ALLPCB will fabarciate with total qty of  <span class="cl-f90 f14 bold"> 0 </span> pcs
                    </div>
                </div>
                <div class="imposition-information imposition-informationExample rel">
                    <div class="imposition-information-item mt5 rel">
                        <p class="note f12 cl-999 text-left">Image for panelized board ↓ (for reference only)<span class="cl-b16a00 ml10">Scaling：<em class="proportion"></em>/1</span></p>
                        <div class="panel-x"><p class="number f12"><span><em class="panel-width">0.00</em> mm</span></p></div>
                        <div class="panel-box">
                            <div class="edgerailwidth edgerailwidth-top undis"></div>
                            <div class="panel-item clearfix">
                                <div class="edgerailwidth edgerailwidth-left pull-left undis"></div>
                                <div class="example-createpanel pull-left"></div>
                                <div class="edgerailwidth edgerailwidth-right pull-left undis"></div>
                            </div>
                            <div class="edgerailwidth edgerailwidth-bottom undis"></div>
                        </div>
                        <div class="panel-y"><p class="number f12"><span><em class="panel-height">0.00</em><br /> mm</span></p></div>
                    </div>
                </div>
            </div>
        </div>
        `);
        var showBox = $(".boxShowPanelizationDetail");
        fnShowPosition(boxSPD, showBox);
        boxSPD.hover(function () {
            fnShowPosition(boxSPD, showBox);
            showBox.addClass("show");
        }, function () {
            showBox.removeClass("show");
        })
        function fnShowPosition(boxSPD, showBox) {
            var left = ((boxSPD.offset().left + boxSPD.outerWidth() / 2) - (showBox.outerWidth() / 2)).toFixed(0) + 'px';
            var top = (boxSPD.offset().top - showBox.outerHeight() - 5).toFixed(0) + 'px';
            showBox.css({ 'top': top, 'left': left });
        }
        this.ImpositionInformationExample(params);
    },
    //展示面板详情参数解析
    ImpositionInformationExample: function (params) {
        var l = params.BoardHeight;
        var w = params.BoardWidth;
        var px = params.pinban_x;
        var py = params.pinban_y;
        var processeEdge_x = params.processeEdge_x;
        var processeEdge_y = params.processeEdge_y;
        var vCut = params.vCut || '';
        var caoX = params.cao_x;
        var caoY = params.cao_y;
        var setnum = params.Num;

        setnum = Math.ceil(setnum * px * py);
        $(".jpsettipsbox span").html(setnum);

        var c = l * px; var k = w * py;
        if (l > 0 && w > 0 && px > 0 && py > 0) {
            var panelWidth = w * py;
            var panelHeight = l * px;
            var panellistLength = $(".panel-list").length;
            if (panellistLength > 0) {
                $(".panel-list").remove();
            }

            var exampleCreatePanel = ("<ul class='panel-list'>");
            for (var i = 0; i < px; i++) {
                var examplePanelLi = "<li>";
                for (var j = 0; j < py; j++) {
                    var examplePanelSpan = ("<span class='item pull-left'></span>");
                    examplePanelLi += examplePanelSpan;
                }
                examplePanelLi += "</li>";
                exampleCreatePanel += examplePanelLi;
            }
            exampleCreatePanel += "</ul>";
            $(".example-createpanel").html(exampleCreatePanel);

            if (panelWidth > panelHeight) {
                var Proportion = parseFloat(100 / panelWidth).toFixed(2);
                var itemWidth = 100 / py;
                var itemHeight = panelHeight * Proportion / px;
            } else {
                var Proportion = parseFloat(100 / panelHeight).toFixed(2);
                var itemHeight = 100 / px;
                var itemWidth = panelWidth * Proportion / py;
            }

            $(".imposition-informationExample .proportion").text(Proportion);
            $(".panel-list .item").css({ "width": itemWidth, "height": itemHeight });

            var panelyWidth = $(".imposition-informationExample .example-createpanel").width();
            var panelyHeight = $(".imposition-informationExample .example-createpanel").height();
            var edgerailHeight = panelyHeight;

            if (processeEdge_x != "none" && parseFloat(processeEdge_y) < 3) {
                processeEdge_y = 3;
            }
            if (processeEdge_x == "none") {
                c = l * px;
                k = w * py;
                panelyHeight = $(".imposition-informationExample .example-createpanel").height();
                $(".imposition-informationExample .edgerailwidth-left").hide();
                $(".imposition-informationExample .edgerailwidth-right").hide();
                $(".imposition-informationExample .edgerailwidth-top").hide();
                $(".imposition-informationExample .edgerailwidth-bottom").hide();
            }
            if (processeEdge_x == "updown") {
                c += processeEdge_y * 2;
                processeEdge_y = 5;
                panelyHeight = $(".imposition-informationExample .example-createpanel").height() + (processeEdge_y * 2);
                edgerailHeight = panelyHeight - (processeEdge_y * 2);
                $(".imposition-informationExample .edgerailwidth-left").hide();
                $(".imposition-informationExample .edgerailwidth-right").hide();
                $(".imposition-informationExample .edgerailwidth-top").show();
                $(".imposition-informationExample .edgerailwidth-bottom").show();
            }
            if (processeEdge_x == "leftright") {
                k += processeEdge_y * 2;
                processeEdge_y = 5;
                panelyWidth = $(".imposition-informationExample .example-createpanel").width() + (processeEdge_y * 2);
                panelyHeight = $(".imposition-informationExample .example-createpanel").height();
                edgerailHeight = panelyHeight;
                $(".imposition-informationExample .edgerailwidth-left").show();
                $(".imposition-informationExample .edgerailwidth-right").show();
                $(".imposition-informationExample .edgerailwidth-top").hide();
                $(".imposition-informationExample .edgerailwidth-bottom").hide();
            }
            if (processeEdge_x == "both") {
                k += processeEdge_y * 2;
                c += processeEdge_y * 2;
                processeEdge_y = 5;
                panelyWidth = $(".imposition-informationExample .example-createpanel").width() + (processeEdge_y * 2);
                panelyHeight = $(".imposition-informationExample .example-createpanel").height() + (processeEdge_y * 2);
                edgerailHeight = panelyHeight - (processeEdge_y * 2);
                $(".imposition-informationExample .edgerailwidth-left").show();
                $(".imposition-informationExample .edgerailwidth-right").show();
                $(".imposition-informationExample .edgerailwidth-top").show();
                $(".imposition-informationExample .edgerailwidth-bottom").show();
            }

            $(".imposition-informationExample .edgerailwidth-left").css({ "width": processeEdge_y, "height": edgerailHeight });
            $(".imposition-informationExample .edgerailwidth-right").css({ "width": processeEdge_y, "height": edgerailHeight });
            $(".imposition-informationExample .edgerailwidth-top").css({ "width": panelyWidth, "height": processeEdge_y });
            $(".imposition-informationExample .edgerailwidth-bottom").css({ "width": panelyWidth, "height": processeEdge_y });
            $(".imposition-informationExample .panel-x").css("width", panelyWidth);
            $(".imposition-informationExample .panel-y .number").css("height", panelyHeight);

            if (vCut.indexOf("luocao") > -1) {
                caoX = parseFloat(caoX).toFixed(1);
                caoY = parseFloat(caoY).toFixed(1);
                k += (py - 1) * caoY;
                c += (px - 1) * caoX;
                if (processeEdge_x == "updown") {
                    c += caoX * 2;
                }
                if (processeEdge_x == "leftright") {
                    k += caoY * 2;
                }
                if (processeEdge_x == "both") {
                    c += caoX * 2;
                    k += caoY * 2;
                }
                $(".imposition-informationExample .panel-width").text(parseFloat(k).toFixed(2));
                $(".imposition-informationExample .panel-height").text(parseFloat(c).toFixed(2));

            } else {
                $(".imposition-informationExample .panel-width").text(parseFloat(k).toFixed(2));
                $(".imposition-informationExample .panel-height").text(parseFloat(c).toFixed(2));
            }
        }
    },
    getPcbNums: function () {
        let result = [5, 10, 15, 20, 25, 30, 50, 75, 100, 125, 200];
        for (let i = 250; i <= 500; i += 50) {
            result.push(i);
        }
        for (let i = 600; i <= 1000; i += 100) {
            result.push(i);
        }
        result.push(1200);
        result.push(1500);
        result.push(1600);
        result.push(1750);
        result.push(1800);
        result.push(2000);
        result.push(2400);
        result.push(2500);
        result.push(2800);
        for (let i = 3000; i <= 10000; i += 500) {
            result.push(i);
        }
        for (let i = 11000; i <= 18000; i += 1000) {
            result.push(i);
        }

        return result;
    },
    //计价数量修改data：id,e=$(this),num,resFn,x,y,hide
    fnShowSetQuoteQty: function (data) {
        // console.log('LP.fnShowSetQuoteQty',data.id,data.num,data.hide)
        // 隐藏老选框
        var lastEQQID = $("body .boxEditQuoteQty#" + $("body .boxEditQuoteQty").attr('id'));
        lastEQQID.removeClass('show');
        setTimeout(function () { lastEQQID.remove(); }, 200);
        if (data.hide) {
            $(".showSelQty").removeClass('active');
            return false;
        }

        // 创建新选框
        var e = data.e;
        var newNum = 0;
        var resFn = data.resFn;
        var ex = (e.offset().left + e.outerWidth() - 2).toFixed(2);
        var ey = e.offset().top.toFixed(2);
        var newEQQId = 'eqqId_' + new Date().getTime();
        var numList = '';

        var numArr = LP.getPcbNums();
        for (var i = 0; i < numArr.length; i++) {
            var n = numArr[i]; var active = ''; if (data.num == n) active = ' class="active"'; numList += `<li num="${n}"${active}><span>${n}</span></li>`;
        }
        var mutityNum = 100;
        var numMessage = getLanguage('qty20240130') + mutityNum;
        var html = `<div class="boxEditQuoteQty" id="${newEQQId}" style="top:${ey}px;left:${ex}px">
                <ul>${numList}</ul>
                <div class="ft">Other Quantity
                    <input type="number" name="eqqNum" id="eqqNum">
                    <input type="button" name="eqqSubmit" value="Submit">
                    <input type="button" name="eqqCancel" value="Cancel">
                    <span class="note">(${numMessage})</span>
                </div>
            </div>`;
        $('body').append(html);
        setTimeout(function () { $('#' + newEQQId).addClass('show'); }, 200);
        $(".boxEditQuoteQty li").click(function () {
            newNum = $(this).attr('num');
            // $(this).parents('.boxEditQuoteQty').attr('selNum',newNum);
            $(this).addClass('active').siblings().removeClass('active');
            resFunction(data.id, newNum);
        })
        $(".boxEditQuoteQty [name=eqqCancel]").click(function () {
            LP.fnShowSetQuoteQty({ hide: true });
        })
        $(".boxEditQuoteQty [name=eqqSubmit]").click(function () {
            var tsInput = $('#' + newEQQId + " [name=eqqNum]").val();
            let num = Number(tsInput);
            if (numArr.indexOf(num) < 0) {
                if (num <= 0 || num % mutityNum != 0) {
                    layer.msg(numMessage, {
                        skin: 'layui-layer-hui'
                    });
                    return false;
                }
            }
            resFunction(data.id, tsInput);
        })
        // 执行提交方法data.resFn
        function resFunction(id, num) {
            if (typeof resFn == 'function') {
                resFn(id, num, data.num);
                LP.fnShowSetQuoteQty({ hide: true });
            }
        }
        //移开隐藏
        $(".boxEditQuoteQty").hover(function () { }, function () { LP.fnShowSetQuoteQty({ hide: true }); })

    },
    //数据埋点{at:1,ac:"",an:"",ab:"",ext:""}///
    //at：当前行为操作类型 必需 {1页面;2功能/按钮;3事件}默认1///
    //ac：行为动作 如order_list///
    //an：行为对象/操作名称 如会员中心订单列表///
    //ab：操作请求参数 JSON格式///
    //ext：自定义拓展信息 JSON对象///
    behavior: function (arr) {
        arr.at = arr.at || 1;//{1页面;2功能/按钮;3事件}
        arr.uri = window.location.href;
        arr.ext = arr.ext === null ? null : JSON.stringify(arr.ext);
        arr.ab = arr.ab ? JSON.stringify(arr.ab) : null;
        arr.vt = new Date().toUTCString();
        arr.guid = $.cookie('newTemporayId');
        var url = 'https://collect.allpcb.com/behavior';
        if (window.location.hostname === 'ww2.allpcb.com' || window.location.hostname === 'ww4.allpcb.com' || window.location.hostname === '115.236.37.105') url = 'http://115.236.37.105:10023/behavior';
        $.ajax({
            type: 'post', url: url, data: JSON.stringify(arr), contentType: "application/json; charset=utf-8",
            beforeSend: function (request) {
                let cookies = Tools.getAllCookies();
                for (var i in cookies) {
                    var ki = i.trim();
                    if (ki === 'ApiToken') ki = 'Authorization';
                    request.setRequestHeader(ki, cookies[i])
                }
                // if(Authorization) request.setRequestHeader("Authorization",Authorization);
            },
        });
    },
    //记录页面行为
    loadBPage: function () {
        var tsUrl = window.location.pathname;
        var urlBPArr = [
            { title: '网站首页', url: '/' },
            { title: '登录页面', url: '/account/login' },
            { title: '注册页面', url: '/account/register' },
            { title: '领取优惠券专题', url: '/activity/free-pcb-prototype-2021.html' },
            { title: 'PCB计价页面', url: '/online_pcb_quote_new.html' },
            { title: '精品计价页面', url: '/superior_quote.html' },
            { title: 'PCBA计价页面', url: '/pcba_quote.html' },
            { title: 'CNC计价页面', url: '/cnc_quote.html' },
            { title: '购物车页面', url: '/cart/' },
            { title: '确认订单页面', url: '/order/confirmorder' },
            { title: '2023新客专享竞价', url: '/lp/prototype.html' },
            { title: '激活成功页面', url: '/account/activatesuccess' },
            { title: 'PCBA新客推广落地页面', url: '/lp/pcba.html' },
        ];
        for (var i = 0; i < urlBPArr.length; i++) {
            var ts = urlBPArr[i];
            if (tsUrl === ts.url) {
                this.behavior({ an: ts.title });
                break;
            }
        }
    },
    //记录2
    dataPointJP: function (eventInfo) {
        var notRecUrl = ['www.allpcb.kr', 'www.allpcb.com', 'allpcb.com', 'allpcb.kr', 'manage.allpcb.com'];
        var last_page = document.referrer;
        if (last_page) {
            var durl = /\/\/([^\/]+)\//i;
            var domain = last_page.match(durl);
            if (notRecUrl.indexOf(domain[1]) >= 0) {
                last_page = '';
            }
        }
        var params = {
            source_type: 1,
            sub_page: window.location.pathname,
            GUID: Tools.getCookie('newTemporayId') || 0,
            user_id: Tools.getCookie('allpcb_mbid') || 0,
            last_page: last_page,
            host_page: window.location.host,
            browser_type: Tools.getBrowserType(),
            system_type: Tools.getSystemType(),
            event_label: '',
            event_type: '',
            event_value: '',
        }
        if (typeof eventInfo === 'object') {
            params.event_label = eventInfo.label || '';
            params.event_type = eventInfo.type || '';
            params.event_value = eventInfo.value || '';
        }
        $.ajax({ type: 'post', url: "https://datapoint.jiepei.com:1818/api/data_transfer_new", data: JSON.stringify(params), contentType: "application/json; charset=utf-8" });
    },
    //修改订单别名
    editOrderAlias: function (ts, type = null) {
        var $input = ts;
        if ($input.val() !== "") {
            $input.parents(".edit_name").find(".edit_default").text($input.val())
        } else {
            $input.parents(".edit_name").find(".edit_default").text(getLanguage('addCustomName'));
        }

        var dataid = $input.attr("dataid");
        var proid = 0;
        $.ajax({
            url: '/newmember/AliasEdit',
            data: { id: dataid, Name: $input.val(), type: type },
            dataType: 'json',
            type: 'post',
            //async: true,
            success: function (data) {

            }
        })
    }
}
var flag = true;
jQuery.fn.shake = function (intShakes /*Amount of shakes*/, intDistance /*Shake distance*/, intDuration /*Time duration*/) {
    if (!flag) {
        return;
    }
    flag = false;
    this.each(function () {
        var jqNode = $(this);
        jqNode.css({ position: 'relative' });
        for (var x = 1; x <= intShakes; x++) {
            jqNode.animate({ left: (intDistance * -1) }, (((intDuration / intShakes) / 4)))
                .animate({ left: intDistance }, ((intDuration / intShakes) / 2))
                .animate({ left: 0 }, (((intDuration / intShakes) / 4)));
            if (x = intShakes) {
                flag = true;
            }
        }
    });
    return this;
}
///工具类
var Tools = {
    //获取时区
    GetTimeZone: function () {
        var now = new Date();
        var start = new Date();
        //得到一年的开始时间
        start.setMonth(0);
        start.setDate(1);
        start.setHours(0);
        start.setMinutes(0);
        start.setSeconds(0);

        var minZone = start.getTimezoneOffset();
        for (var i = 0; i <= 11; i++) {
            var temp = new Date(start.getTime());
            temp.setMonth(i);

            if (minZone < temp.getTimezoneOffset()) {
                minZone = temp.getTimezoneOffset();
            }
        }

        return (minZone / 60) * -1;
    },
    //图片缩放
    DrawImage: function (ImgD, FitWidth, FitHeight) {
        var image = new Image();
        image.src = ImgD.src;
        if (ImgD != undefined && ImgD != null && ImgD.src.length > 0) {
            if (image.width > 0 && image.height > 0) {
                if (image.width / image.height >= FitWidth / FitHeight) {
                    if (image.width > FitWidth) {
                        ImgD.width = FitWidth;
                        ImgD.height = (image.height * FitWidth) / image.width;
                    } else {
                        ImgD.width = image.width;
                        ImgD.height = image.height;
                    }
                } else {
                    if (image.height > FitHeight) {
                        ImgD.height = FitHeight;
                        ImgD.width = (image.width * FitHeight) / image.height;
                    } else {
                        ImgD.width = image.width;
                        ImgD.height = image.height;
                    }
                }
            }
        }
    },
    //单个滚动
    moveH: function (id, type, isstop) {
        //多行应用@Mr.Think
        var _wrap = $("#" + id + ""); //定义滚动区域
        var _interval = 3000; //定义滚动间隙时间
        var _moving; //需要清除的动画
        if (isstop == 0) {
            _wrap.hover(function () {
                clearInterval(_moving); //当鼠标在滚动区域中时,停止滚动
            },
                function () {
                    _moving = setInterval(function () {
                        var _field = _wrap.find('dd:first'); //此变量不可放置于函数起始处,dd:first取值是变化的
                        var _hw;
                        var marginTop;
                        if (type == "h") {
                            _hw = _field.height();
                            if (id == 'share_itemList') {
                                _hw = _field.height() + 40;
                            }
                            marginTop = _hw;
                        }
                        _field.animate({
                            marginTop: -marginTop + 'px'
                        },
                            600,
                            function () { //通过取负margin值,隐藏第一行
                                _field.css('marginTop', 0).appendTo(_wrap); //隐藏后,将该行的margin值置零,并插入到最后,实现无缝滚动
                            })
                    },
                        _interval) //滚动间隔时间取决于_interval
                }).trigger('mouseleave'); //函数载入时,模拟执行mouseleave,即自动滚动
        } else {
            _moving = setInterval(function () {
                var _field = _wrap.find('dd:first'); //此变量不可放置于函数起始处,dd:first取值是变化的
                var _hw;
                var marginTop;
                if (type == "h") {
                    _hw = _field.height();
                    if (id == 'share_itemList') {
                        _hw = _field.height() + 40;
                    }
                    marginTop = _hw;
                }
                _field.animate({
                    marginTop: -marginTop + 'px'
                },
                    2600,
                    function () { //通过取负margin值,隐藏第一行
                        _field.css('marginTop', 0).appendTo(_wrap); //隐藏后,将该行的margin值置零,并插入到最后,实现无缝滚动
                    })
            },
                _interval)
        }
    },
    isEmail: function (str) {
        var myReg = /^[-_A-Za-z0-9]+@([_A-Za-z0-9]+\.)+[A-Za-z0-9]{2,3}$/;
        if (myReg.test(str)) return true;
        return false;
    },
    ////设置*
    Setxin: function (str, cnt) {

        var len = str.length;
        var resut = str;
        resut = str.substring(0, 2);
        for (var i = 0; i < cnt; i++) {
            resut += "*";

        }
        resut += str.substring(len - 3, len - 1);

        return resut;
    },
    //HandleOrderDate格式化日期：
    FormatDate: function (dt, isshowtime, format) {
        if (format == undefined || format == null || format == "") {
            format = "-";
        }
        if (isshowtime == undefined || isshowtime == null || isshowtime == "") {
            isshowtime = false;
        }
        var orderdate = new Date(dt);
        var currdate = new Date();
        if (orderdate.toLocaleDateString() == currdate.toLocaleDateString()) {
            return orderdate.getHours() + ":" + orderdate.getMinutes() + ":" + orderdate.getSeconds();
        } else {
            var dt = orderdate.getFullYear() + format + orderdate.getMonth() + format + orderdate.getDay();
            if (isshowtime) {
                dt += + " " + orderdate.getHours() + ":" + orderdate.getMinutes() + ":" + orderdate.getSeconds();
            }
            return dt;
        }

    },
    //格式化日期时间(date,'yyyy-MM-dd hh:mm')
    formatDateFMT(date, fmt) {
        if (!date || date == '0001-01-01T00:00:00') return '';
        date = new Date(date);
        if (!fmt) fmt = 'yyyy-MM-dd hh:mm';
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
        }
        let o = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds()
        }
        for (let k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                let str = o[k] + ''
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : Tools.padLeftZero(str))
            }
        }
        return fmt
    },
    padLeftZero(str) {
        return ('00' + str).substr(str.length);
    },
    //json转url参数
    JsonToUrlParams: function (data) {
        try {
            var tempArr = [];
            for (var i in data) {
                var key = encodeURIComponent(i);
                var value = encodeURIComponent(data[i]);
                tempArr.push(key + '=' + value);
            }
            var urlParamsStr = tempArr.join('&');
            return urlParamsStr;
        } catch (err) {
            return '';
        }
    },
    ///URL参数转JSON
    UrlToJsonParams: function (url) {
        try {
            var index = url.indexOf('?');
            if (index > -1) {
                url = url.match(/\?([^#]+)/)[1];
            }
            var obj = {}, arr = url.split('&');
            for (var i = 0; i < arr.length; i++) {
                var subArr = arr[i].split('=');
                var key = decodeURIComponent(subArr[0]);
                var value = decodeURIComponent(subArr[1]);
                obj[key] = value;
            }
            return obj;

        } catch (err) {
            return null;
        }
    },
    ///图片错误的时候
    ImgError: function (e, src) {
        setTimeout(function () {
            var img = $(e);
            if (src != undefined && src != null && src != "")
                img.src = src;
            else
                img.src = img.src;
        }, 3000);
    },
    //当前日期
    getNowFormatDate: function () {
        var date = new Date();
        var seperator1 = "";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = year + seperator1 + month + seperator1 + strDate;
        return currentdate;
    },
    //获取单个cookies
    getCookie: function (sname) {
        var acookie = document.cookie.split("; ");
        for (var i = 0; i < acookie.length; i++) {
            var arr = acookie[i].split("=");
            if (sname == arr[0]) {
                if (arr.length > 1)
                    return unescape(arr[1]);
                else
                    return "";
            }
        }
        return "";
    },
    //获取文件名后缀
    getFileSuffix: function (pathfilename) {
        var reg = /(\\+)/g;
        var pString = pathfilename.replace(reg, "#");
        var arr = pString.split("#");
        var lastString = arr[arr.length - 1];
        var arr2 = lastString.split(".");
        return arr2[arr2.length - 1];
    },
    //获取url中的参数
    getUrlParam: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    },
    //获取url参数转对象
    getQuery: function (queryStr) {
        const obj = {};
        const arr = queryStr.split('&');
        for (item of arr) {
            const keyValue = item.split('=');
            obj[keyValue[0]] = keyValue[1]
        }
        return obj;
    },
    getAllCookies: function () {
        var cookieArr = document.cookie.split(";");
        let cookieObj = {};
        for (let i = 0; i < cookieArr.length; i++) {
            if (cookieArr[i]) {
                cookieSplit = cookieArr[i].split("=");
                cookieObj[cookieSplit[0]] = cookieSplit[1];
            }
        }
        return cookieObj;
    },
    //获取浏览器类型
    getBrowserType: function () {
        var ua = navigator.userAgent
        var isOpera = ua.indexOf('Opera') > -1
        if (isOpera) { return 'Opera' }
        var isIE = (ua.indexOf('compatible') > -1) && (ua.indexOf('MSIE') > -1) && !isOpera
        var isIE11 = (ua.indexOf('Trident') > -1) && (ua.indexOf("rv:11.0") > -1)
        if (isIE11) { return 'IE11' }
        else if (isIE) {
            var re = new RegExp('MSIE (\\d+\\.\\d+);')
            re.test(ua)
            var ver = parseFloat(RegExp["$1"])
            // 返回结果
            if (ver == 7) {
                return 'IE7'
            } else if (ver == 8) {
                return 'IE8'
            } else if (ver == 9) {
                return 'IE9'
            } else if (ver == 10) {
                return 'IE10'
            } else if (ver == 11) {
                return 'IE11'
            } else { return "IE" }
        }
        var isEdge = (ua.indexOf("Edge") || ua.indexOf("deg")) > -1;
        if (isEdge) { return 'Edge' }

        var isFirefox = ua.indexOf("Firefox") > -1
        if (isFirefox) { return 'Firefox' }

        var isSafari = (ua.indexOf("Safari") > -1) && (ua.indexOf("Chrome") == -1)
        if (isSafari) { return "Safari" }

        var isChrome = (ua.indexOf("Chrome") > -1) && (ua.indexOf("Safari") > -1) && (ua.indexOf("Edge") == -1)
        if (isChrome) { return 'Chrome' }

        return ''
    },
    //获取系统类型
    getSystemType: function () {
        var os_type = '';
        var windows = (navigator.userAgent.indexOf("Windows", 0) != -1) ? 1 : 0;
        var android = /(Android)/i.test(navigator.userAgent) ? 1 : 0;
        var iphone = /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent) ? 1 : 0;
        var mac = (navigator.userAgent.indexOf("mac", 0) != -1) ? 1 : 0;
        var linux = (navigator.userAgent.indexOf("Linux", 0) != -1) ? 1 : 0;
        var unix = (navigator.userAgent.indexOf("X11", 0) != -1) ? 1 : 0;
        if (windows) os_type = "Windows";
        else if (android) os_type = "Android";
        else if (iphone) os_type = "Apple iOS";
        else if (mac) os_type = "Apple mac";
        else if (linux) os_type = "Lunix";
        else if (unix) os_type = "Unix";
        return os_type;
    },
    //获取产品类型图片
    getProTypeImg: function (tp1, tp2) {
        if (tp1) {
            let pic = '';
            switch (tp1) {
                case 1: pic = "i"; break;
                case 2: pic = "h";
                    if (tp2 == 1) pic = "fpc";
                    else if (tp2 == 2) pic = "rfp";
                    else if (tp2 == 3) pic = "superior";
                    break;
                case 4: pic = "s"; break;
                case 5: pic = "a"; break;
                case 22: pic = "sm"; break;
                case 21: pic = "3d"; break;
                case 24: pic = "c"; break;
            }
            return '/img/img/hyzs/new/producelogo_' + pic + '.png'
        }
        return '';
    },
    //获取产品类型名称
    getProTypeName: function (orderNo, info) {
        if (orderNo) {
            var orderNoPrefix = orderNo.slice(0, 1).toLowerCase();
            var result = '';
            switch (orderNoPrefix) {
                case "i":
                case "j":
                case "b": result = "Electronic Components"; break;
                case "h": result = "PCB Products"; break;
                case "u": result = "Universal Boards"; break;
                case "s": result = info && info.length > 0 ? (info.indexOf("CustomSize") >= 0 ? "Non-frameWork" : "Stencil with frame") : ''; break;
                case "a": result = "PCB Assembly(Stencil included)"; break;
                case "k": result = "Membrane Switch"; break;
                case "m": result = "Graphic Overlay"; break;
                default: result = "Code"; break;
            }
            return result;
        }
        return '';
    },
    //url文件下载
    downloadFile: function (fileUrl, type) {
        if (!fileUrl) { alt2021(getLanguage('subFAL'), 'e'); return; }
        if (!type) type = GetFileName(fileUrl);
        var theFileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1, fileUrl.length);
        var URL = window.URL || window.webkitURL;
        var fileType = '';
        switch (type) {
            case 'pdf': fileType = 'application/pdf'; break;
            case 'jpg': fileType = 'image/jpeg'; break;
            case 'png': fileType = 'image/png'; break;
            case 'ppt': fileType = 'application/vnd.ms-powerpoint'; break;
        }
        if (fileType === '') {
            window.open(fileUrl); return;
        }
        var oReq = new XMLHttpRequest();
        oReq.open("GET", fileUrl, true);
        oReq.responseType = "blob";
        oReq.onload = function () {
            var file = new Blob([oReq.response], { type: fileType });
            saveAs(file, theFileName);
        };
        oReq.send();
        function saveAs(blob, filename) {
            var type = blob.type;
            var force_saveable_type = 'application/octet-stream';
            if (type && type != force_saveable_type) {
                var slice = blob.slice || blob.webkitSlice || blob.mozSlice;
                blob = slice.call(blob, 0, blob.size, force_saveable_type);
            }
            var url = URL.createObjectURL(blob);
            var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
            save_link.href = url;
            save_link.download = filename;
            var event = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                view: window
            });
            save_link.dispatchEvent(event);
            URL.revokeObjectURL(url);
        }
    },
    // 拷贝文本 text：要复制的文本
    copyText: function (text) {
        var textarea = document.createElement("textarea");//创建input对象
        var currentFocus = document.activeElement;//当前获得焦点的元素
        document.body.appendChild(textarea);//添加元素
        textarea.value = text;
        //textarea.focus();
        //if (textarea.setSelectionRange)
        //    textarea.setSelectionRange(0, textarea.value.length);//获取光标起始位置到结束位置
        //else
        textarea.select();
        try {
            var flag = document.execCommand("copy");//执行复制
        } catch (eo) {
            var flag = false;
        }
        document.body.removeChild(textarea);//删除元素
        //currentFocus.focus();
        return flag;
    }
}

//头部JS
var Head = {

    Init: function () {
        Head.InitMenu();
        Head.ResizeWindow();
        Head.Noticecookie();
        var st = new Date();



        var navoff = true;

    },


    RegisterEvent: function () {
        $(".menu-toggle").on("click", function () {
            if (navoff) {
                $(".menutop").show();
                navoff = false
            } else {
                $(".menutop").hide();
                navoff = true
            }
        });

        //my allpcb
        $('.t_user,.t_user_box').mouseover(function () {
            $(this).addClass('on');
            $('.t_user i').css('background-position', '-22px -294px');
            $('.t_user_box').show();
        }).mouseout(function () {
            $(this).removeClass('on');
            $('.t_user i').css('background-position', '-11px -294px');
            $('.t_user_box').hide();
        });
        $('.t_box_tit a').hover(function () {
            $(this).addClass('on').siblings('a').removeClass('on');
        });
        //留言弹出框
        $('.btn-message').click(function () {
            $('.maskLayer,.b-box').show();
        });
        $('.btn-cancle').click(function () {
            $('.maskLayer,.b-box').hide();
        });
        ///?提示信息显示
        $(".Explanation").mouseover(function () {
            $(this).parent().find(".explanationDetails").show();
        }).mouseout(function () {
            $(this).parent().find(".explanationDetails").hide();
        });


    },
    ResizeWindow: function () {
        //显示二级导航
        var timer = null;
        $(".twokhover").hover(function () {
            clearTimeout(timer)
            $(".con-menu").hide()
            $(this).find(".con-menu").show()
        }, function () {
            timer = setTimeout(function () {
                $(".con-menu").hide()
            }, 100)

        })

    },
    //初始化菜单
    InitMenu: function () {

        var url = window.location.pathname;
        // var urlarr = [//对应菜单从前0到后顺序放置。
        //     ['/membernew'],
        //     ['/online_pcb_quote_new.html','/pcba_quote.html','/bom_distribution.html','/smt_stencil_quote.html','/rigidflex_quote.html','/salesteam.html'],
        //     ['/superior_quote.html','/hdi_quote.html','/premiumpcb/'],
        //     ['/pcba.html'],
        //     ['/fpc_quote.html','/advancedfpc'],
        //     ['/cncOrder','/cnc_quote.html'],
        //     ['/advanced_pcb_manufacturing_capability.html','/standard_pcb_manufacturing_capability.html','/advanced_pcb_manufacturing_capability.html','/pcb_assembly_capability.html','/rfpProcesscapability.html','/aluminum_pcb_capability.html','/fpc_assembly_capability.html','/pcb_assembly_capability.html'],
        //     ['/feedback'],
        //     ['/integralStore','/sponsor.html','/sns','/software','/pcb_unit.html','/faq'],
        //     ['/about_us.html','/contact_us.html','/news','/FactoryAudit.html'],
        // ];
        var urlarr2 = [];//自动获取
        $("#one-menu>li").each(function (e) {
            urlarr2.push([]);
            $("#one-menu>li:nth-child(" + (e + 1) + ") a").each(function (x) {
                let href = $(this).attr('href').replace(/(\/*$)/g, "");
                urlarr2[e][x] = href;
            })
        });
        var isHome = 1;

        for (let i = 0; i < urlarr2.length; i++) {
            var urlfont = urlarr2[i].toString().toUpperCase();
            if (url === '/') break;
            if (typeof urlarr2[i] === 'undefined' || urlfont == '') continue;
            if (urlfont.indexOf(url.toUpperCase()) >= 0) {
                Head.SetMenuActive(i);
                isHome = 0;
                break;
            }
            if (isHome == 0) { break; }
        }
        isHome == 1 ? Head.SetMenuActive(0) : '';


        var timer1 = null;
        $(".account").hover(function () {
            $(".accountshowhide").show()
        }, function () {
            $(".accountshowhide").hide()
        })



        $("#gotop-btn").on("click", function () {
            $("body,html").animate({ scrollTop: 0 }, 500)
        })
        $(".overnotic").on("click", function () {
            $(".notic").animate({ height: "0px" });
            setTimeout(function () { $(".notic").hide(); }, 1000)
        })

        $(".two-menu").hover(function () {
            $(this).parents("li").find('a').eq("0").css({ "color": "#f90" })
        }, function () {
            $(this).parents("li").find('a').eq("0").css({ "color": "#fff" })
        })

        $(".two-menu li").hover(function () {
            $(this).find(".three-menu").show();
        }, function () {
            $(this).find(".three-menu").hide();
        })


        $(".minone-meun li").unbind('click').click(function (event) {
            if ($(this).is(".acitve1")) {
                $(this).removeClass("acitve1").css({ "color": "#c9c9c9" })
                $(this).find(".mintwo-menu").eq(0).hide();
                $(this).find("img").eq(0).removeClass("rotate12").addClass("rotate11")
            } else {
                $(this).addClass("acitve1").css({ "color": "#f90" })
                $(this).find(".mintwo-menu").eq(0).show();
                $(this).find("img").eq(0).removeClass("rotate11").addClass("rotate12")
            }
            event.stopPropagation(); //  阻止事件冒泡
        })

        $(".mintwo-menu li").on("click", function (event) {
            event.stopPropagation(); //  阻止事件冒泡
            if ($(this).is(".acitve2")) {
                $(this).removeClass("acitve2").css({ "color": "#c9c9c9" })
                $(this).find(".minthree-menu").hide();
                $(this).find("img").removeClass("rotate12").addClass("rotate11")
            } else {
                $(this).addClass("acitve2").css({ "color": "#f90" })
                $(this).find(".minthree-menu").show();
                $(this).find("img").removeClass("rotate11").addClass("rotate12")
            }

        })

        $(".meunswitch").unbind('click').click(function () {
            event.stopPropagation();
            if ($(".min-menu").is(".undis")) {
                $(".min-menu").removeClass("undis")
            } else {
                $(".min-menu").addClass("undis")
            }
            return false;
        })

        $(".one-menu>.twokhover").hover(function () {
            $(this).find(".onejiantou").eq(0).attr("src", "/img/img/index/hoveronejian.png")
        }, function () {
            $(this).find(".onejiantou").eq(0).attr("src", "/img/img/index/onejian.png")
        })

        $(".top-nav .t_user").hover(function () {
            $(".top-nav .t_user_box").show();
        }, function () {
            $(".top-nav .t_user_box").hide();
        })
        $('.suggestions').click(function () {
            $('.maskLayer,.b-box').show();
        });
        $('.btn-cancle').click(function () {
            $('.maskLayer,.b-box').hide();
        });
        $('.b-box').click(function () {
            $(".box-con").shake(4, 5, 200);//次数 距离 时间
        })

        $('.maskLayer').click(function () {
            $(".box-con").shake(4, 5, 200);//次数 距离 时间
        })
        $('.box-con').click(function () {
            event.stopPropagation()
        })

        //底部
        var leftnum = $(window).width();
        if (leftnum < 750) {
            footbtn();
        }
        $(window).resize(function () {
            leftnum = $(window).width();
            if (leftnum < 750) {
                footbtn();
            } else {
                $(".bottom-navigation dt").unbind();
                $(".bottom-navigation dt").siblings("dd").show().find("a").css({ "fontSize": "16px" });
                $(".bottom-navigation dt").find("span").css({ "color": "#fff" });
            }
        })

    },


    ///选中菜单
    SetMenuActive: function (i) {
        CurrentemuIndex = i;
        // console.log(i);
        if ($("#one-menu>li").length > 0) {
            $("#one-menu>li").removeClass("active");
            $("#one-menu>li").eq(i).addClass("active");
        }
    },
    //公告cookie
    Noticecookie: function () {
        if ($(".overnotic").length > 0 && $.cookie != undefined) {
            $(".overnotic").on("click", function () {

                $(".notic").animate({ height: "0px" });
                setTimeout(function () { $(".notic").hide(); }, 1000)
            })
            if ($.cookie("isClose") !== "yes") {
                $(".notic").show();
                $(".overnotic").on("click", function () {
                    $.cookie('isClose', 'yes', { expires: 1 / 24 });
                })
            } else {
                $(".notic").hide();
            }
            //$.cookie('isClose', null);清除cookie
        }
    },

    AddMessage: function () {
        var name = $("#name1").val();
        var email = $("#email1").val();
        var tel = $("#tel1").val();
        var message = $("#message1").val();
        if (name == "") {
            layer.msg(getLanguage('psEnYourName'));
            $("#name1").focus();
            return false;
        }
        if (email == "") {
            layer.msg(getLanguage('psEnYourMail'));
            $("#email1").focus();
            return false;
        }
        else {
            if (!Tools.isEmail(email)) {
                layer.msg(getLanguage('psEnYourMail'));
                $("#email1").focus();
                return false;
            }
        }
        if (message == "") {
            alert(getLanguage('psEnMsg'), function () {
                $("#message").focus();
            });

            return false;
        }
        $.ajax({
            type: 'POST',
            dataType: 'json',
            async: true,
            url: '/NewMember/AddMesg',
            data: { name: name, email: email, tel: tel, message: message },
            contentType: "application/x-www-form-urlencoded; charset=utf-8", //解决中文提交乱码问题
            success: function (data) {
                if (data) {
                    layer.msg(getLanguage('subSuccWeSP'), function () {
                        $('.maskLayer,.b-box').hide();
                    });

                }
            }
        });
    }



}


var App = {
    Init: function () {
        //小屏选泽数量
        $(".minul li").on("click", function () {
            $(".minul li").removeClass("active");
            $(this).addClass("active");
            var index = $(this).index();
            $(".countuls").hide().eq(index).show();
        })

        $("#pcbnumbtn").on("click", function () {
            //iframe层
            layer.open({
                type: 1,
                skin: 'layui-layer-rim', //加上边框
                area: ['320px', '540px'], //宽高
                content: $('#minpcbnun')
            });
        })


        $("#minpcbnun li input").on("click", function () {
            var text = $('input[name="countNumer"]:checked').val();
            $("#pcbnumbtn").val(text)
            layer.closeAll();
        })
    },
    IninWindows: function () {
        if ($(screen).width() <= 768) {
            $(".mobile").show();

        }


    }



}


function footbtn() {
    $(".bottom-navigation dt").unbind('click').click(function (event) {
        if ($(this).is(".acitve1")) {
            $(this).removeClass("acitve1").find("span").css({ "color": "#fff" })
            $(this).siblings("dd").hide();
            $(this).find("img").eq(0).removeClass("rotate12").addClass("rotate11")
        } else {
            $(this).addClass("acitve1").find("span").css({ "color": "#f90" })
            $(this).siblings("dd").show().find("a").css({ "fontSize": "16px" });
            $(this).find("img").eq(0).removeClass("rotate11").addClass("rotate12")
        }
        event.stopPropagation(); //  阻止事件冒泡
    })
}


function SetMenuActive(i) {
    CurrentemuIndex = i;
    if ($("#one-menu .mainNav").length > 0) {
        var mnuLeft = $("#one-menu .mainNav").eq(i).parent("li").position().left;
        mnuLeft += 15
        var mnuWidth = $("#one-menu .mainNav").eq(i).parent("li").width() - 15;

        $("#magic-line").css({ 'left': mnuLeft, "width": mnuWidth });
    }
}


//图标文字提示
function RegisterTips() {
    $("body").on("mouseover mouseout", "[item-tips]", function (event) {
        var dom = this;
        if (event.type == "mouseover") {
            //鼠标悬浮
            var id = $(dom).attr("id");
            if (id == undefined || id == null || id == "") {
                id = "tips" + i;
                $(dom).attr("id", id);
            }
            var tips = $(dom).attr("item-tips");
            $(this).find("[tipshtml]").html(tips);
            $(this).find("[tipshtml]").show();
        } else if (event.type == "mouseout") {
            //鼠标离开
            $("[tipshtml]").html();
            $("[tipshtml]").hide();
        }
    });
}
//示例图片
function ExampleDiagram() {
    $(".example-diagram").hover(function () {
        if ($('body').hasClass('isMobile')) {
            var pTop = $(this).offset().top - 180;
            $(this).find(".example-diagram-con").css({ "top": pTop + 'px' })
        }
        $(this).find(".example-diagram-con").show();
    }, function () {
        $(this).find(".example-diagram-con").hide();
    });
}
//用户行为数据收集
function mb(data) {
    var script = document.createElement('script');
    script.type = 'text/javascript';

    // 传参一个回调函数名给后端，方便后端返回时执行这个在前端定义的回调函数
    var url = window.location.href;
    var mbid = $("#basembid").val();
    var action = "In";
    var pv = "";
    var pn = "";
    if (data != null && data != "") {
        action = "click";
        pv = data.v;
        pn = data.n;
    }

    script.src = 'https://mbe.jiepei.com/api/MemberBehaviorCollection/Record?u=' + url + '&ma=' + action + '&i=' + mbid + '&pv=' + pv + '&pn=' + pn;
    document.head.appendChild(script);

    // 回调执行函数
    function handleCallback(res) {
        alert(JSON.stringify(res));
    }
}

//1提示文字，2按钮文字，3链接，4按钮标签1:A|0:SPAN，5按钮class，6隐藏关闭按钮0，7关闭按钮文字，8box样式，9icon=w

function altNotice(note, bntxt, gourl, isAlink = 1, bnClass, hidBnClose = 0, csft = getLanguage('cancel'), style = '', icon = 'w', bodyClass) {
    let bn = '';
    if (bntxt || gourl) {
        if (isAlink == 1) bn = '<a class="bnsa sk" href="' + gourl + '"><span>' + bntxt + '</span></a>';
        else bn = '<span class="bnsa sk ' + bnClass + '"><span>' + bntxt + '</span></span>';
    }
    if (hidBnClose == 0) bn += '<span class="bnsa sk close"><span>' + csft + '</span></span>';
    var showAIDTime = 'BAN_' + new Date().getTime();
    $("body").append(`

    <div class="boxAltNote" id="${showAIDTime}">
        <div class="box"${style}>
            <div class="t ${icon}">${getLanguage('notice')}<i class="boxClose"></i></div>

            <div class="n ${bodyClass}">${note}</div>
            <div class="bn">${bn}</div>
        </div>
    </div>
    `);
    readyBoxAltNote(showAIDTime);
}
function readyBoxAltNote(id) {
    setTimeout(function () {
        $(".boxAltNote#" + id).addClass('on');
    }, 100)
    $(".boxAltNote .close,.boxAltNote .boxClose").click(function () {
        hidaltNotice($(this).parents('.boxAltNote').attr('id'));
    });
}

function hidaltNotice(id) {
    $(".boxAltNote#" + id).removeClass('on');
    setTimeout(function () {
        $(".boxAltNote#" + id).remove();
    }, 300)
}
//弹窗确认取消订单
function altDelOrder(id) {
    var showAIDTime = 'BAN_' + new Date().getTime();
    console.log(id)
    $("body").append(`
    <div class="boxAltNote boxAltDelOrder" id="${showAIDTime}">
        <div class="box">
            <div class="t noicon">${getLanguage('removeOdCF')}<i class="boxClose"></i></div>
            <div class="n">
                <p class="note">${getLanguage('psOdDelSelR')}<br>${getLanguage('psSelReasonUYRB')}</p>
                <select class="delReason">
                <option value="">${getLanguage('selectHere')}</option>
                <option value="${getLanguage('delOdR1')}">${getLanguage('delOdR1')}</option>
                <option value="${getLanguage('delOdR2')}">${getLanguage('delOdR2')}</option>
                <option value="${getLanguage('delOdR3')}">${getLanguage('delOdR3')}</option>
                <option value="${getLanguage('delOdR4')}">${getLanguage('delOdR4')}</option>
                <option value="${getLanguage('delOdR5')}">${getLanguage('delOdR5')}</option>
                <option value="${getLanguage('delOdR6')}">${getLanguage('delOdR6')}</option>
                <option value="${getLanguage('delOdR7')}">${getLanguage('delOdR7')}</option>
</select>
            </div>
            <div class="bn"><span class="bnsa sk bnDelOd" data-orderId="${id}"><span>${getLanguage('confirm')}</span></span><span class="bnsa sk close"><span>${getLanguage('cancel')}</span></span></div>
        </div>
    </div>
    `);
    readyBoxAltNote(showAIDTime);
    $(".boxAltDelOrder .bnDelOd").click(function () {
        var reason = $(".boxAltDelOrder .delReason").val();
        if (reason == '') {
            alt2021(getLanguage('psSelReasonUYRB'))
            return false;
        }
        alt2021('Loading..');
        $.ajax({
            url: '/newmember/delcartdetail',
            data: { cartId: id, reason: reason },
            dataType: 'json',
            type: 'post',
            success: function (result) {
                if (result > 0 || result.success) {
                    alt2021(getLanguage('successful'));
                    hidaltNotice(showAIDTime);
                    setTimeout(function () {
                        window.location.reload();
                    }, 1000)
                    // layer.msg("Deleted", { time: 1000 }, function () {
                    //     window.location.reload();
                    // });
                } else {
                    alt2021(getLanguage('subFailure'));
                    // layer.msg(getLanguage('delFailure'));
                }
            },
            error: function (e) {
                alt2021(getLanguage('subFailure'));
            }
        });
    })
}
//弹窗上传文件
function altUploadFiles(id, refresh = 0, data) {
    var fileType = data.fileType;
    var maxSize = data.maxSize;
    var showAIDTime = 'BAN_' + new Date().getTime();
    $("body").append(`
    <div class="boxAltNote" id="${showAIDTime}">
        <div class="box boxAltUploadFiles">
            <div class="t noicon">${getLanguage('upFiles')}<i class="boxClose"></i></div>
            <div class="n">
                <div class="upfileInfo">
                    <div class="bnsa sk bnsaUpFile" toUpInput="altUpfile" data-fileType="${fileType}" data-maxSize="${maxSize}"><span>+ ${getLanguage('upFiles')}</span></div>
                    <div class="fileInfo"></div>
                    <input style="display: none" id="altUpfile" type="file" onchange="fnClickAltUploadFiles('altUpfile')">
                    <p>.Rar or .Zip Maximum 10M</p>
                    <p>${getLanguage('cartAltGFT')}</p>
                    <div id="altUFBarID"></div>
                </div>
                <p class="note">${getLanguage('upFailedPSService')}</p>
            </div>
            <div class="bn"><span class="bnsa sk bnCFUP" data-orderId="${id}" data-refresh="${refresh}"><span>${getLanguage('confirm')}</span></span><span class="bnsa sk close"><span>${getLanguage('skipForNow')}</span></span></div>
        </div>
    </div>
    `);
    readyBoxAltNote(showAIDTime);
    $(".boxAltUploadFiles .bnsaUpFile").click(function () {
        if (!$(this).hasClass("isLoading")) {
            var bnID = $(this).attr('toUpInput');
            $("#" + bnID).click();
        } else {
            alt2021('Loading..');
        }
    })
    $(".boxAltUploadFiles .bnCFUP").click(function () {
        var orderId = $(this).attr('data-orderId');
        var isRefresh = $(this).attr('data-refresh');
        var fileUrl = $(".boxAltUploadFiles .fileInfo").attr('fileUrl');
        var fileName = $(".boxAltUploadFiles .fileInfo").text();
        if (fileUrl == '' || fileUrl === undefined) {
            alt2021(getLanguage('psUpFile'), 'e')
            return false;
        }
        $(".boxAltUploadFiles").append('<div class="boxloading fx bw c"><span></span></div>')
        $.ajax({
            url: '/newmember/SaveCartFile',
            data: { cartId: orderId, filePath: fileUrl, fileName: fileName, type: 1 },
            dataType: 'json',
            type: 'post',
            //async: true,
            success: function (data) {
                if (data.success) {
                    alt2021(getLanguage('successful'), 's')
                    if (isRefresh == 1) {
                        setTimeout(function () {
                            window.location.reload();
                        }, 2000)
                    }
                } else {
                    $(".boxAltUploadFiles>.boxloading").remove()
                    layer.alert(getLanguage('failToUpload'), { icon: 5 }, function () {
                        layer.closeAll();
                        window.location.reload();
                    });
                }
            },
            error: function (e) {
                $(".boxAltUploadFiles>.boxloading").remove()
                var errormsg = getLanguage('upErr') + ": " + e.statusText;
                layer.alert(errormsg, { icon: 5 }, function () {
                    layer.closeAll();
                    window.location.reload();
                });
            }
        });
    });
}
function fnClickAltUploadFiles(e) {
    var f = document.getElementById(e);
    var maxSize = $("[toUpInput=" + e + "]").attr('data-maxSize');
    var fileType = $("[toUpInput=" + e + "]").attr('data-fileType');
    let getFile = f.files[0];
    let fileInfo = { name: getFile.name, file: getFile, types: fileType, size: getFile.size, maxSize: maxSize, module: 'PCB_File', maxSize: 20, barID: 'altUFBarID' }
    $("[toUpInput=" + e + "]").addClass("isLoading").parents('.boxAltUploadFiles').append('<div class="boxloading fx bw c"><span></span></div>')
    LP.getUpFileTK(fileInfo).then(upFile => {
        $(".boxAltUploadFiles .fileInfo").attr('fileUrl', upFile.fileurl).text(getFile.name).show();
        $(".boxAltUploadFiles .bnsaUpFile,.boxAltUploadFiles .upfileInfo p").hide();
        document.getElementById(e).value = null;
    }).catch(err => {
        alt2021(err.msg, 'e');
    }).finally(() => {
        document.getElementById(e).value = null;
        $(".boxAltUploadFiles>.boxloading").remove()
        $("[toUpInput=" + e + "]").removeClass('isLoading');
        $(".boxAltUploadFiles .upfileInfo .boxloading").remove();
        $(".boxAltUploadFiles .upfileInfo #altUFBarID").css('width', '0px');
    });
}

var boxalt2021_in = null;
var boxalt2021_ot = null;
// 2021 new 弹窗提示(描述，对s|错e|加载l|提醒w，input标签，自关时间2000|0不关闭)
function alt2021(note = '', icon = 'l', e, timeout = 2000) {
    clearTimeout(boxalt2021_in);
    clearTimeout(boxalt2021_ot);
    $(".boxalt2021").remove();
    $("body").append("<div class=\"boxalt2021\"><div class='note'><i class='close'></i><span class=\"icon\"></span><span class=\"text\"></span></div></div>");
    $(".boxalt2021").removeClass("on");
    // if(icon=="l") icon='l';
    // else if(icon=="s") icon="s";
    // else if(icon=="e") icon="e";
    // else icon="w";
    boxalt2021_in = setTimeout(function () {
        $(".boxalt2021 .icon").addClass(icon);
        $(".boxalt2021 .text").html(note);
        $(".boxalt2021").addClass("on");
        $(".boxalt2021 .close").click(function () { hidload(e); });
        // if(timeout!=0){
        boxalt2021_ot = setTimeout(function () { hidload(e); }, 2000);
        // }
    }, 200);
}
// 2024 new 弹窗提示(描述，对s|错e|加载l|提醒w，input标签，自关时间2000|0不关闭)
function alt2024(note = '', icon = 'l', e, timeout = 2000) {
    clearTimeout(boxalt2021_in);
    clearTimeout(boxalt2021_ot);
    $(".boxalt2021").remove();
    $("body").append("<div class=\"boxalt2021\"><div class='note'><i class='close'></i><span class=\"icon\"></span><span class=\"text\"></span></div></div>");
    $(".boxalt2021").removeClass("on");
    // if(icon=="l") icon='l';
    // else if(icon=="s") icon="s";
    // else if(icon=="e") icon="e";
    // else icon="w";
    boxalt2021_in = setTimeout(function () {
        $(".boxalt2021 .icon").addClass(icon);
        $(".boxalt2021 .text").html(note);
        $(".boxalt2021").addClass("on");
        $(".boxalt2021 .close").click(function () { hidload(e); });
         if(timeout!=0){
             boxalt2021_ot = setTimeout(function () { hidload(e); }, timeout);
         }
    }, 200);
}
function hidload(e) {
    clearTimeout(boxalt2021_in);
    $(".boxalt2021").removeClass("on").addClass('');
    setTimeout(function () { $(".boxalt2021").remove(); }, 300);
    if (e != null && e != '') e.focus();
}
//数字变动
function numAutoPlus(targetEle, options) {
    options = options || {}
    // 获取dom元素
    let $this = document.getElementById(targetEle)
    // 动画时长(毫秒数)
    // 也可以将需要的参数写在dom上如：[data-XXX]
    let time = 2000 //options.time || $this.getAttribute('data-time')
    // 最终要显示的数字
    let finalNum = options.toNum // || $this.getAttribute('data-time')
    // 调节器(毫秒数) 改变数字增加速度
    let rate = options.rate || $this.getAttribute('data-rate')
    // 计数器
    let count = parseInt($this.getAttribute('data-nub'))
    // 步长
    let step = finalNum / (time / rate)//(finalNum%count)/time * rate;//
    // 初始值
    let initNum = 0
    // 定时器
    let timer = setInterval(function () {
        if (finalNum > count) {
            count = count + step
            if (count >= finalNum) {
                clearInterval(timer)
                count = finalNum
            }
        } else {
            count = count - step
            if (count <= finalNum) {
                clearInterval(timer)
                count = finalNum
            }
        }
        // count = count + step
        // if (count >= finalNum) {
        //     clearInterval(timer)
        //     count = finalNum
        // }
        // t未发生改变的话就直接返回
        // 减少dom操作 提高DOM性能
        let t = Math.floor(count)
        if (t === initNum) return
        initNum = t
        $this.innerHTML = initNum
    }, 30)
}
//过滤中间字符 1***2
function fontSubstring(str, frontLen, endLen) {
    var len = str.length - frontLen - endLen;
    var xing = '***';
    // for (var i=0;i<len;i++) {
    //     xing+='*';
    // }
    return str.substring(0, frontLen) + xing + str.substring(str.length - endLen);
}

//Instant PCB Quote  - Table
function tt_quote(e) {
    e.addClass("active").siblings().removeClass('active');
}

// var showTopAlt = $.cookie('showTopAlt20220913');
// if(Tools.getNowFormatDate() < 20220913 && showTopAlt != 'No'){
//     setTimeout(function (){
//         if($(".add-show-box,.login_r").length<1){
//             actTimes220429();
//         }
//     },1000)
// }
function actTimes220429() {
    // console.log(Tools.getNowFormatDate())
    if (Tools.getNowFormatDate() <= 20230624) {// && showTopAlt != '220429'
        setTimeout(function () {
            $("body").prepend('<div class="topAlts" style="display: none; position: relative; background-color:#fff; color:#f90; font-size:14px; padding:.6em 2em;"><div class="boxW" style="padding-right:2em;"><i style="font-family: iconfont_dg; margin-right:.5em;">&#xeca5;</i>Dragon Boat Festival Schedule: The factory and the logstics service will be off from 22nd Jun. to 23rd Jun. (GMT+8).<a href="https://www.allpcb.com/news/celebrating-dragon-boat-festival-shipment-schedule_240.html" target="_blank" style="color:#f90; margin-left:1em; text-decoration: underline">Learn More >></a><div class="boxClose"></div></div></div>');
            $(".topAlts").slideDown();
            $(".topAlts .boxClose").click(function () {
                $(".topAlts").slideUp();
                // $.cookie('showTopAlt','220429',{path:'/'});
            })
        }, 300)
    }
}
//注册激活弹券
var myMCT = $.cookie('MemberCounpTip');
if (myMCT != 'null' && myMCT != null) {
    $.cookie('MemberCounpTip', 'null', { path: '/' });
    $.cookie('MemberCounpTipText', 'null', { path: '/' });
    // var ifUG = $.cookie('MemberCounpTipText');
    // $.post("/NewMember/GetRegCounps", { ekey: myMCT }, function (data, status) {
    //     let t0 = '';
    //     let t1 = '';
    //     let FPCFREE = '';
    //     let li = '';
    //     let array = data.attr.CounpList;
    //     //新注册弹券
    //     if (array.length==1 && ifUG != 'upgrade' && array[0].CounpAmount <= 10){
    //         var pageUrl = window.location.href;
    //         if (pageUrl.indexOf('/membernew/index')<0) return false;
    //         let tsCounp = array[0];
    //         $.cookie('MemberIndexTipCounp', tsCounp.CounpAmount, {path: '/'});
    //         $("body").append(`
    //             <div class="boxAltCoupon boxNMCoupon">
    //                 <div class="n">
    //                     <div class="note">
    //                         <p>1-2 Layer, 10 pcs, 100mm x 100mm</p>
    //                         <p>PCB prototype with just $${tsCounp.CounpAmount}-$${tsCounp.CounpAmount}=<b>$0</b>!</p>
    //                     </div>
    //                     <a href="/online_pcb_quote.html" class="bn">Use it now</a>
    //                     <i class="closeMC anmt3"></i>
    //                 </div>
    //             </div>
    //         `);
    //         //关闭
    //         $(".boxNMCoupon .closeMC").click(function (){
    //             $.cookie('coupon_tagcode', 'null', { path: '/' });//测试注释
    //             $(".boxNMCoupon").removeClass("show");
    //         });
    //         //延迟显示弹窗
    //         setTimeout(function () {
    //             $(".boxNMCoupon").addClass("show");
    //         }, 300)
    //         $.cookie('MemberCounpTip', 'null', { path: '/' });//测试注释
    //         $.cookie('MemberCounpTipText', 'null', { path: '/' });//测试注释
    //         return false;
    //     }
    //     //老样式弹券
    //     for (let i = 0; i < array.length; i++) {
    //         let arr = array[i];
    //         if (arr.CounpType == 2 || arr.CounpType == 4 || arr.FullAmount == 0) {
    //             if (arr.CounpAmount == 30) t1 += '<div class="points21box t b"><b>$' + arr.CounpAmount + `</b><div><span>${getLanguage('noThreshold')}</span><em>${getLanguage('cpVFxM', arr.ValidMonth)}</em></div><p>` + arr.Description + '</p></div>';
    //             else if (arr.CounpType == 4 && arr.FullAmount == 0) {
    //                 FPCFREE += `<div class="points21box t"><b>Free</b><div><span>FPC Free Prototype</span><em>${getLanguage('cpVFxM', 1)}</em></div></div>`;
    //             }
    //             else t1 += `<div class="points21box t"><b>$` + arr.CounpAmount + `</b><div><span>${getLanguage('noThreshold')}</span><em>${getLanguage('cpVFxM', arr.ValidMonth)}</em></div></div>`;
    //         } else {
    //             li += '<li class="points21box"><b>$' + arr.CounpAmount + '</b><div><span>Over $' + arr.FullAmount + ' - $' + arr.CounpAmount + `</span><em>${getLanguage('cpVFxM', arr.ValidMonth)}</em></div></li>`
    //         }
    //     }
    //     if (ifUG == 'upgrade') { t0 = '<b class="t">Get the $' + data.attr.TotalAmount + ' first bonus of 2022, <a href="/membernew/upgrade" target="_blank">click here</a> to get up to $235.</b>'; }
    //     else { t0 = '<b class="t">' + getLanguage('welcomeBonus', '$' + data.attr.TotalAmount) + ' ' + getLanguage('youCCGo', '<a href="/membernew/couponlist" target="_blank">' + getLanguage('myCoupons') + '</a>') + '.</b>'; }
    //     $("body").append(`<div class="altFXbox altSP21box">
    //         <div class="box">
    //             ${t0}
    //             ${t1}${FPCFREE}
    //             <ul>${li}</ul>
    //             <div class="bn"><div class="bnsa sk"><span>OK</span></div></div>
    //         </div>
    //     </div>`);
    //     setTimeout(function () {
    //         $(".altSP21box").addClass('on');
    //     }, 600);
    //     $.cookie('MemberCounpTip', 'null', { path: '/' });//测试注释
    //     $.cookie('MemberCounpTipText', 'null', { path: '/' });//测试注释
    //     $(".altSP21box .bnsa").click(function () {
    //         $(".altSP21box").removeClass('on');
    //         setTimeout(function () { $(".altSP21box").remove(); }, 600)
    //     });
    // });
}
var ApiQuote2 = {
    cncApi: function () {
        var url = "https://jerpclientapi.jiepei.com";
        if (window.location.hostname == 'ww2.allpcb.com' || window.location.href.startsWith('http://')) url = "http://115.236.37.105:6066";
        return url;
    },
    smApi: function () {
        var url = "https://smapip.jiepei.com";
        if (window.location.href.startsWith('http://') || window.location.hostname == 'ww2.allpcb.com') url = "http://115.236.37.105:8900";
        return url;
    },
    cncUpfileApi: function () {
        var url = "https://member.allpcb.com";
        if (window.location.hostname == 'ww2.allpcb.com' || window.location.href.startsWith('http://')) url = "http://115.236.37.105:1123/allpcbapi";
        return url;
    },
}
var apiUrl_w = {
    member: function () {
        var url = "https://member.allpcb.com";
        if (window.location.hostname == 'ww2.allpcb.com' || window.location.href.startsWith('http://')) url = "http://115.236.37.105:1123/allpcbapi";
        return url;
    }
}
function getDayTime(day, type) {
    var myDate = new Date;
    if (day != null) {
        myDate = new Date(myDate.setDate(myDate.getDate() + day));
    }
    // var monarr = ['Jan', 'Feb', 'Mar', 'Apr ', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var monarr = ['January', 'February', 'March', 'April ', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var year = myDate.getFullYear(); //获取当前年
    var mon = myDate.getMonth(); //获取当前月
    var date = myDate.getDate(); //获取当前日
    // var h = myDate.getHours();//获取当前小时数(0-23)
    // var m = myDate.getMinutes();//获取当前分钟数(0-59)
    // var s = myDate.getSeconds();//获取当前秒
    var week = myDate.getDay();
    if (type == "YMD") {
        return year + "/" + (mon + 1) + "/" + date;
    } else {
        return monarr[mon] + ' ' + date + ", " + year;
    }
}
function upfiles_request(fileName) {
    var xmlhttp = null;
    if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
    else if (window.ActiveXObject) xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    if (xmlhttp != null) {
        serverUrl = ApiQuote2.cncUpfileApi() + '/api/settings/file/aliyun/oss-token?Module=gerberfile&FileName=' + encodeURI(fileName);
        xmlhttp.open("GET", serverUrl, false);
        xmlhttp.send(null);
        return JSON.parse(xmlhttp.responseText)
    }
    else alt2021("Your browser does not support XMLHTTP.", 'e', 0);
}
//获取文件后缀名
function GetFileName(pathfilename) {
    var reg = /(\\+)/g;
    var pString = pathfilename.replace(reg, "#");
    var arr = pString.split("#");
    var lastString = arr[arr.length - 1];
    var arr2 = lastString.split(".");
    return arr2[arr2.length - 1];
}
function clearNoNum(obj) {
    if (obj.value) {
        obj.value = obj.value.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符
        obj.value = obj.value.replace(/^\./g, "");
        obj.value = obj.value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
        obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数
        if (obj.value.indexOf(".") < 0 && obj.value != "") {//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02
            obj.value = parseFloat(obj.value);
        }
    } else {
        obj = obj.toString();
        obj = obj.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符
        obj = obj.replace(/^\./g, "");
        obj = obj.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
        obj = obj.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        obj = obj.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数
        if (obj.indexOf(".") < 0 && obj != "") {//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02
            obj = parseFloat(obj);
        }
        return obj;
    }
}

//2022年会倒计时
function new2022(endDateStr) {
    $.ajax({
        url: "/common/getdatetimenow",
        type: "get",
        success: function (data) {
            setTimeout(function () {
                banner2022Time(data.attr, endDateStr);
            }, 1000)
        },
        error: function () { console.log('getSevTime error') }
    });
}
function banner2022Time(time1, endDateStr) {
    // console.log(time1,endDateStr)
    var nowDate = new Date(time1);//当前时间
    var endDate = new Date(endDateStr);//结束时间
    // console.log(time1,endDate.getTime())
    if (time1 < endDate.getTime()) {
        var totalSeconds = parseInt((endDate - nowDate) / 1000);//相差的总秒数
        var days = Math.floor(totalSeconds / (60 * 60 * 24));//天数
        var modulo = totalSeconds % (60 * 60 * 24);//取模（余数）
        var hours = Math.floor(modulo / (60 * 60));//小时数
        modulo = modulo % (60 * 60);
        var minutes = Math.floor(modulo / 60);//分钟
        var seconds = modulo % 60;//秒
        $(".boxOCTime .D").text(days);
        $(".boxOCTime .H").text(hours);
        $(".boxOCTime .M").text(minutes);
        //输出到页面
        // console.log("还剩:" + days + "天" + hours + "小时" + minutes + "分钟" + seconds + "秒");
        setTimeout(function () {
            banner2022Time((time1 + 1000), endDateStr);
        }, 1000)
    }
}
//国家选择下拉框
var fnSelectSCS = (function () {
    var that;
    var valueSPC = {};
    var dataList = [];
    var clearShowTimeoutSPC;
    var hoverSPC = false;
    return {
        Init: function (data, defaultArr) {
            if (dataList === null) return false;
            defaultArr = defaultArr === null ? { value: "231", text: "UNITED STATES OF AMERICA" } : defaultArr;
            that = this;
            valueSPC = defaultArr;
            dataList = data;
            $(".boxSelSPC").hover(function () { hoverSPC = true; }, function () { hoverSPC = false; })
            $("#shippingCost").attr({ 'dataId': valueSPC.value, 'value': valueSPC.text, 'placeholder': valueSPC.text });
            $("#shippingCost").focus(function () {
                clearTimeout('clearShowTimeoutSPC');
                clearShowTimeoutSPC = setTimeout(function () {
                    $("#shippingCost").attr({ 'dataId': '', }).val('');
                    that.searchSPC('');
                }, 100)
            })
            $("#shippingCost").focusout(function () { that.hideListSPC(false) });
        },
        searchSPC: function (key) {
            var listHtmlSPC = '';
            key = key.toLowerCase();
            var listLenth = 0;
            if (typeof dataList === 'undefined') return false;
            for (var i = 0; i < dataList.length; i++) {
                var set = true;
                var ts = dataList[i];
                if (key != '' && ts.text.toLowerCase().indexOf(key) < 0) {
                    set = false;
                }
                var thisOn = valueSPC.value === ts.value ? "on" : '';
                if (set) {
                    listLenth++;
                    listHtmlSPC += `<li class="${thisOn}" dataId="${ts.value}" title="${ts.text}">${ts.text}</li>`;
                }
            }
            that.showListSPC(listHtmlSPC, listLenth);
        },
        showListSPC: function (list, length) {
            $(".listSPC_sel").html('<ul>' + list + '</ul>');
            var listLH = $(".listSPC_sel li:nth-child(1)").outerHeight();
            $(".listSPC_sel ul").css({ height: (listLH * length) + 'px' });
            $(".listSPC_sel").addClass("show");
            $(".listSPC_sel li").click(function () {
                var ts = $(this);
                $("#shippingCost").attr({ 'dataId': ts.attr('dataid'), 'placeholder': ts.html() }).val(ts.html());
                // $("#shippingCost").attr({'dataId':ts.value,'value':ts.html(),'placeholder':ts.html()});
                valueSPC = { value: ts.attr('dataId'), text: ts.html() }
                that.hideListSPC(true);
            })
        },
        hideListSPC: function (hide) {
            clearTimeout('clearShowTimeoutSPC');
            if (!hoverSPC || hide) {
                clearShowTimeoutSPC = setTimeout(function () {
                    $("#shippingCost").attr({ 'dataId': valueSPC.value, 'placeholder': valueSPC.text }).val(valueSPC.text);
                    $.cookie('countryid', valueSPC.value, { expires: 7 });
                    $(".listSPC_sel").removeClass("show")
                    $(".listSPC_sel ul").css({ height: '0px' });
                }, 100)
            }
        }
    }
}());
//【ID1003479】03.27 ALLPCB 百度统计
var _hmt = _hmt || [];
(function () {
    var hm = document.createElement("script");
    hm.src = "https://hm.baidu.com/hm.js?8ff4f95ff898c85481bea3d53d4b2774";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(hm, s);
})();

/** 节日活动 */
var FestivalEvent = {
    /** 2023 圣诞活动 */
    christmas2023: function () {
        layer.load()
        $.post('/Activity/GetChristmas2023', function (data) {
            if (data.Code == 203) {//已经领取
                layer.closeAll('loading');
                FestivalEvent.christmas2023GetSuccess();
            }
            else {
                layer.open({
                    type: 2,
                    title: false,
                    closeBtn: 0,
                    area: ['900px', '700px'],
                    shadeClose: true,
                    offset: 'auto',
                    content: '/Activity/Christmas2023',
                    success: function (layero, index) {
                        layer.closeAll('loading')
                    }
                });
            }

        });
    },
    christmas2023Get: function () {
        layer.load()
        $.post('/Activity/GetChristmas2023?isAutoGet=true', function (data) {
            layer.closeAll('loading');
            if (data.IsSuccess) {
                layer.closeAll();
                FestivalEvent.christmas2023GetSuccess();
            }
            else if (data.Code == 401) {//未登录
                layer.msg(data.Msg);
                setTimeout(function () {
                    window.top.location = '/account/login';
                }, 300);
            }
            else {
                layer.msg(data.Msg);
            }
        })
    },
    christmas2023GetSuccess: function () {
        layer.open({
            type: 2,
            title: false,
            closeBtn: 0,
            area: ['900px', '700px'],
            shadeClose: true,
            offset: 'auto',
            content: '/Activity/Christmas2023?success=true',
            success: function (layero, index) {
                layer.closeAll('loading')
            }
        });
    }


}



