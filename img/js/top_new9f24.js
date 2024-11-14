$(function () {

    $(document).ready(function () {
        var timeZone = GetTimeZone();
        //用户时区处理 add by  2016-11-21
        $("#p_msg").html("Online Time:<font>  24/7 customer service </font>");
        $('#customer_service').click(function () {
            window.location.href = "/salesteam.html";
        });
        //$('#topRecharge').click(function () {
        //    $("#topRechargeDiv").show();
        //    layer.open({
        //        title: "<b>Recharge</b>",
        //        type: 1,
        //        shade: 0.3,
        //        shadeClose: false,
        //        area: '520px',
        //        content: $('#topRechargeDiv'), //捕获的元素
        //        cancel: function (index) {
        //            layer.close(index);
        //        }
        //    });
        //});



        $('.t_user').hover(function () {
            $(this).addClass('on').find('.t_user_box').show();
        }, function () {
            $(this).removeClass('on').find('.t_user_box').hide();
        })
        $('.t_box_tit a').hover(function () {
            $(this).addClass('on').siblings('a').removeClass('on');
        }, function () {

        });
        $(".nav-ubox").mouseout(function () {
            $(this).addClass("nav-ubox-active");
        });
        $(".nav-ubox").mouseleave(function () {
            $(this).removeClass("nav-ubox-active");
        });
        $("#menu1").on("mouseleave", function () {
            $('#menu1').hide();
        });
        $("#mainmemuzone a").not($("#mainmemuzone a:eq(2)")).on("mouseover", function () {
            $('#menu1').hide();
        });
        //头部提示
        $(".top-tips,.tips-box").mouseover(function () {
            $(".tips-box").show();
        }).mouseout(function () {
            $(".tips-box").hide();
        });
        //topbar
        $('.topbar').hover(function () {
            $(this).addClass('active');
        }, function () {
            $(this).removeClass('active');
        });

        var url = window.location.pathname;
        //if (url.indexOf("/product/") > -1) {
        //    SetMenuActive(1);
        //} else {
        //    SetMenuActive(0);
        //}

        //$.ajax({
        //    url: '/member/topcartlist',
        //    type: 'get',
        //    dataType: 'html',
        //    success: function (data) {
        //        $("#cartDropdownList").html(data);
        //    }
        //});
        //if ($("#nav-cart-num").text() > 0) {
        //    $('.header-car').hover(function () {
        //        $('.item-car').show();
        //        $('.header .header-car a').css('border-bottom', '0');
        //    }, function () {
        //        $('.item-car').hide();
        //        $('.header .header-car a').css('border-bottom', '1px solid #ddd');
        //    });
        //}

        //留言弹出框
        //$('.btn-message').click(function () {
        //    $('.maskLayer,.b-box').show();
        //});
        //$('.btn-cancle').click(function () {
        //    $('.maskLayer,.b-box').hide();
        //});


        //20180606 三级导航
        // capDropDownlist();
    });
})

function showRe() {
    $("#topRechargeDiv").show();
    layer.open({
        title: "<b>Top Up</b>",
        type: 1,
        shade: 0.3,
        shadeClose: false,
        area: '520px',
        content: $('#topRechargeDiv'), //捕获的元素
        cancel: function (index) {
            layer.close(index);
        }
    });
}

function SetMenuActive(i) {
    $("#mainmemuzone a").removeClass("active");
    $("#mainmemuzone a:eq(" + i + ")").addClass("active");
}

function isEmail(str) {
    var myReg = /^[-_A-Za-z0-9]+@@([_A-Za-z0-9]+\.)+[A-Za-z0-9]{2,3}$/;
    if (myReg.test(str)) return true;
    return false;
}


//班次工作时间处理
function ShowTimeZone(stime, etime) {
    var now = new Date();
    var cur = now.getTimezoneOffset() / 60 * -1;
    var zonediff = 8 - cur;
    var extime = "00";
    var ntime = zonediff.toString().split(".");
    if (ntime.length > 1) {
        zonediff = parseInt(ntime[0]);
        var smalltime = (parseFloat(ntime[1]) * 60 / 100);
        if (smalltime < 10)
            extime = smalltime.toString() + "0";
        else
            extime = smalltime.toString();
    }
    new_stime = stime - zonediff;
    if (new_stime < 0)
        new_stime = new_stime + 24;
    if (new_stime >= 24)
        new_stime = new_stime - 24;
    new_etime = etime - zonediff;
    if (new_etime < 0)
        new_etime = new_etime + 24;
    if (new_etime >= 24)
        new_etime = new_etime - 24;
    return new_stime + ":" + extime + "-" + new_etime + ":" + extime;

}

//获取时区
function GetTimeZone() {
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
}

function ChangePcbAdmin() {
    var url = "/NewMember/ChangePcbAdmin";
    layIndex = layer.open({
        title: "<b>Change Dedicated Sales</b>",
        type: 2,
        area: ['300px', '200px'],
        content: [url, 'no']
    });
}

function ChangeSmtAdmin() {
    var url = "/NewMember/ChangeSmtAdmin";
    layIndex = layer.open({
        title: "<b>Change Dedicated Sales</b>",
        type: 2,
        area: ['300px', '200px'],
        content: [url, 'no']
    });
}



var st = new Date();
$(function () {
    //$.get("/newmember/GetCartProCount", function (d) {
    //    debugger;
    //    if (d.success) {
    //        $("#nav-cart-num").text(d.attr);
    //    }
    //});
    //$.ajax({
    //    url: '/newmember/topcartlist',
    //    type: 'get',
    //    dataType: 'html',
    //    success: function (data) {
    //        $("#cartDropdownList").html(data);
    //    }
    //});
    //if ($("#nav-cart-num").text() > 0) {
    //    $('.header-car').hover(function () {
    //        $('.item-car').show();
    //        $('.header .header-car a').css('border-bottom', '0');
    //    }, function () {
    //        $('.item-car').hide();
    //        $('.header .header-car a').css('border-bottom', '1px solid #ddd');
    //    });
    //}

    ////下拉导航
    //DropDownNav();
    ////图标文字提示
    //RegisterTips();
});
//下拉导航
function DropDownNav() {
    $(".dropDownNav").hover(function () {
        $(this).find(".secondNav").show();
        $(this).parents("li").siblings("li#magic-line").hover(function () {
            $(".secondNav").show();
        })
    }, function () {
        $(".secondNav").hide();
    });
}
//图标文字提示
function RegisterTips() {
    $("body").on("mouseover mouseout", "[item-tips]", function (event,i) {
        var dom = this;
        if (event.type == "mouseover") {
            //鼠标悬浮
            var id = $(dom).attr("id");
            if (id == undefined || id == null || id == "") {
                id = "tips" + i;
                console.log(id);
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