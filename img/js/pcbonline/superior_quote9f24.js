var valuateResult = ""; var OrderTextSet = "";
var ifQuote = false;
var ifQuotePcba = false;
var goCartInfo = {};
$(function () {
    $("[name=WriteNote]").click(function () {
        let val = $(this).val();
        if (val == "1") {
            $('[name=txtNote]').addClass("undis");
            $('[name=txtNote]').val("");
        } else {
            $('[name=txtNote]').removeClass("undis");
        }
    })
    $(".tsgy1").click(function () {
        Pcb.clearPrice();
    });
    //计价结果勾选
    $(".listTable").on('click', 'li.ck', function () {
        if ($(this).parent().hasClass("on")) {
            $(this).parent().removeClass("on");
        } else {
            $(this).parent().addClass("on");
            $(this).parent().siblings().removeClass("on");
        }
        Pcb.newSumPrice();
    })
    //是否PCBA计价
    $(".boxQuotePcba>.titleSel").click(function () {
        if ($(".boxQuotePcba").hasClass("show")) {
            $(".boxQuotePcba").removeClass("show");
            ifQuotePcba = false;
            $(".listTable.pcba .n").remove();
            $(".ifQuotePcba").slideUp(500);
            $(".boxQuotePcba .pcba-con").slideUp(500);
        } else {
            Pcb.clearPrice();
            $(".boxQuotePcba").addClass("show");
            ifQuotePcba = true;
            $(".ifQuotePcba").slideDown(500);
            $(".boxQuotePcba .pcba-con").slideDown(500);
        }
    });
    //PCBA选项样式
    $(".boxQuotePcba .option-choose li").click(function () {
        var ts = $(this);
        var tsLabel = ts.children('label');
        var tsCLabel = ts.siblings().children('label');
        tsLabel.addClass('choose');
        tsLabel.append('<i class="jp-ico subscript-ico"></i>');
        tsCLabel.removeClass('choose');
        tsCLabel.children('i').remove();
    });
    //PCBA清空计价
    $(".boxQuotePcba input,.boxQuotePcba select").on('input propertychange', function () {
        if ($(this).attr('name')=='ProductNum'){
            var pcbNum = Number($('#Num').val());
            var BoardType = getCkVal('BoardType');
            if (BoardType!='pcs'){
                pcbNum = pcbNum * Number($("[name=pinban_x]").val()) * Number($("[name=pinban_y]").val());
            }
            if (Number($(this).val()) > pcbNum){
                altNotice('The SMT QTY should less than single PCB QTY');
                $(this).val(pcbNum);
            }
        }
        Pcb.clearPrice();
    });
    //板层+*
    $(".selListBL").each(function () {
        if ($(this).attr('selbl') >= 6) { $(this).addClass('red') }
    })
    //加购
    $(".bnAddCart").click(function () {
        if (!Pcb.ParmValid()) return false;
        var selPcbs = $(".listTable.pcb .n.on");
        var selPcbLength = selPcbs.length;
        if (selPcbLength <= 0) {
            altNotice(getLanguage('psSelOPR'));
            return false;
        }
        var userId = $("#userId").val();
        if (userId == 0) {
            CartFormSubmit();
            return;
        }
        var formDB = $("#fm").serialize().replace(/\+/g, " ");
        formDB = Tools.UrlToJsonParams(formDB);

        //加购参数拼接
        var TestReport_arry = [];
        $("[name='TestReport']:checked").each(function (index) { TestReport_arry[index] = $(this).val(); });
        //加购特殊工艺
        var SpecialTechnique = {}
        $(".tsgy1 input").each(function () {
            if ($(this).val() == 1) {
                var name = $(this).attr('name');
                SpecialTechnique[name] = $(this).val();
            }
        })
        var jsonData = {
            // "adjustdeliverystep":0,
            // "bganun":0,
            // "bgapadspacing":0,
            // "bgasize":0.0,
            // "boardholenum":0,
            // "camengineer":1,
            // "canusefreecoupon":false,
            // "changeitemnum":false,
            // "changeperiod":false,
            "coretypecode": selPcbs.attr('data-coretypecode'),
            // "countryid":0,
            // "createtime":"2022-10-17 15:29:29",
            // "deliverheight":0.0,
            // "deliverwidth":0.0,
            // "deliverydays":1,
            // "deliverysteptag":0,
            // "deliverysteptype":0,
            // "dontneedcheckparm":false,
            // "eqcount":0,
            // "extdeliverydays":0,
            // "factoryid":4,
            // "folladminid":0,
            // "follstatus":0,
            "fr4tg": selPcbs.attr('data-fr4tg'),
            "PcbProType": selPcbs.attr('data-PcbProType'),
            "fr4type": selPcbs.attr('data-fr4type'),
            "BoardBrand": selPcbs.attr('data-brand'),
            // "freecouponid":0,
            // "freemoney":0.0,
            "gerberremark": "",
            // "goldfinger":0.0,
            // "grooveheight":0.0,
            // "groovewidth":0.0,
            // "groupstatus":0,
            // "havebga":0,
            // "id":0,
            // "immersiongoldarea":0.0,
            // "ipclevel":2,
            // "isblindvias":false,
            // "isclear":1,
            // "isdiscount":false,
            // "ishigherprice":0,
            "ishighquality": selPcbs.attr('data-qualitytag'),
            // "isjiaji":false,
            // "isnew":false,
            // "isnotjdb":false,
            // "isoutfactory":false,
            // "isreorder":0,
            // "isstep":0,
            // "istejia":0,
            // "level":0,
            // "mbid":$("#userId").val(),
            // "mbtype":0,
            "needreportlist": TestReport_arry.toString(),
            // "note":"",
            // "ordermark":1,
            // "ordertype":0,
            // "parsingstatus":0,
            // "pcborderext":[],
            // "pcbprotype":"fr4",
            // "pcbsetnum":50,
            // "pcsheight":0.0,
            // "pcswidth":0.0,
            "pinbantype": formDB.pinban_x + 'x' + formDB.pinban_y,
            // "procardinfoid":0,
            "processedges": $("[name=processeEdge_x]:checked").val() + ":" + $("[name=processeEdge_y]").val(),
            // "processedgeswidth":0.0,
            // "proordercreatetime":"0001-01-01 00:00:00",
            // "resinplughole":false,
            // "routlength":0.0,
            // "shipmoney":"0",
            "smtorderno": "",
            "QuoteStatus": "1",
            // "totalweight":0.0,
            // "usefreecoupon":0,
            // "utilizationrate":0.0,
            //特殊工艺
            SpecialTechnique: SpecialTechnique
        }
        jsonData = Object.assign(formDB, jsonData)
        var params = [{
            ProType: 13,
            jsonData: JSON.stringify(jsonData)
        }]
        if (ifQuotePcba) {
            if ($(".listTable.pcba .n.on").length > 0) {
                params.push({
                    ProType: 5,
                    jsonData: JSON.stringify(Pcb.getQuotePcbaInfo())
                })
            }
        }
        $.ajax({
            url: '/Order/AddCart',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(params),
            // data: params,
            type: 'post',
            beforeSend: function () {
                //加载层-默认风格
                $(".loader").show();
                $(".loader p").hide();
            },
            success: function (data) {
                var proType = 13;
                if (data.success) {
                    for (var i in data.attr) {
                        if (data.attr[i].ProType == proType) goCartInfo = data.attr[i];
                        if (data.attr[i].ProType == 5) proType = 5;
                    }
                    layer.open({
                        type: 1,
                        shade: 0.3,
                        closeBtn: 1,
                        shadeClose: true,
                        area: '370px',
                        content: $('.goToCar') //捕获的元素
                    });
                    $(".goCartOrder").click(function () {
                        window.location.href = '/cart?protype=' + proType + '&upfileid=' + goCartInfo?.CartId;
                    })
                } else {
                    layer.open({
                        type: 1,
                        shade: 0.3,
                        closeBtn: 1,
                        shadeClose: true,
                        area: '300px',
                        content: $('.addFail') //捕获的元素
                    });
                    $(".cart_item").removeAttr("disabled", "disabled");
                }
                $(".loader").hide();
            }
        });
    });
    //滚动时计价按钮的事件
    // $(document).scroll(function () {
    //     var wHeight = $(window).height();
    //     var dHeight = $(document).scrollTop();
    //     var specilHeight = $(".specil_progress").offset().top + 170;
    //     if (specilHeight - wHeight < dHeight) {
    //         $(".price_btn2").show();
    //         $(".price_btn1").hide();
    //     } else {
    //         $(".price_btn2").hide();
    //         $(".price_btn1").show();
    //     }
    // })
    //inch和mm转换
    $("#dvConvertSize").click(function () {
        //页面层
        layer.open({
            type: 1,
            title: 'Inch ⇒ mm Conversion',
            skin: 'layui-layer-rim', //加上边框
            area: '370px', //宽高
            content: $(".inchChangeBox")
        });
    })
    $("#btnConvert").click(function () {
        layer.closeAll();
        var x = parseFloat($.trim($("#iptSizeX").val()));
        var y = parseFloat($.trim($("#iptSizeY").val()));

        if (x) {
            $("#BoardHeight").val((25.4 * x).toFixed(1));
        }

        if (y) {
            $("#BoardWidth").val((25.4 * y).toFixed(1));
        }
    })
    $('[data-toggle="tooltip"]').tooltip();
    //详细参数hover显示
    $('.hover_detail_title').hover(function () {
        if (Pcb.ParmValid()) {
            $(this).next().show();
            Pcb.commonParamSerialize();
            if ($(".DeliveryType").text() > 3) {
                $(".pcb-delivery-days i").removeClass("yellow red").addClass("bg-a38459");
                $(".pcb-delivery-days em").text("D");
            } else {
                $(".hover_detail .Fee-Area em").text($(".pcbDetail .area_val").text() + "㎡");
            }
        }
    }, function () { $(this).next().hide(); });
    $('.hover_detail_content').hover(function () { $(this).show(); }, function () { $(this).hide(); })
    //示例图片
    ExampleDiagram();
    Pcb.Init();
    $(window).ready(function () {
        var url = window.location.href;
        var newUrl = url.split("?");
        newUrl = newUrl[newUrl.length - 1];
        if (url.indexOf("hidLength") > 0) {
            $('#BoardHeight').val(getUrlParam('hidLength'));
        }
        if (url.indexOf("hidWidth") > 0) {
            $('#BoardWidth').val(getUrlParam('hidWidth'));
        }
        if (url.indexOf("hidNum") > 0) {
            $('#Num').val(getUrlParam('hidNum'));
        }
        if (url.indexOf("hidLayers") > 0) {
            layer.closeAll();
            var BLayers = getUrlParam('hidLayers');
            if (BLayers <= 1) {
                Pcb.Checked("BoardLayers", "2");
            }
        }
        if (url.indexOf("proCategory") > 0) {
            layer.closeAll();
            Pcb.Checked("proCategory", getUrlParam('proCategory'));
        }
        if (url.indexOf("BoardThickness") > 0) {
            layer.closeAll();
            Pcb.Checked("BoardThickness", getUrlParam('BoardThickness'));
        }
        var BoardHeight = $('#BoardHeight').val();
        var BoardWidth = $('#BoardWidth').val();
        var Num = $('#Num').val();
        Pcb.superior_quote('BoardLayers');
        if (BoardHeight && BoardWidth && Num) {
            var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
            $(".common_area").show();
            $(".common_area span").text(area);
            Pcb.basicProRule('BoardLayers');
            Pcb.areaEvent();
            Pcb.calcPrice();
        } else {
            $(".common_area span").text(0);
            return false;
        }

    })
    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            //return unescape(r[2]);
            return r[2];
        }
        return null;
    }
    //计价
    $(".calc_btn").click(function () {
        if (getCkVal('BoardLayers') >= 8 && (getCkVal('CopperThickness') != 1 || getCkVal('InnerCopperThickness') != 1)) altNotice(getLanguage('layers8pcb1oz'), null, null, 0, '', 0, 'OK', 'style="width:400px"');
        Pcb.screen();
        Pcb.calcPrice(true);
    })
    //仿select
    $(".divselect-box").hover(function () { $(this).find("ul").show() }, function () { $(this).find("ul").hide() });
    $(".divselect-box ul li").click(function () {
        if (!$(this).find("label").hasClass("not-selectable")) {
            var txt = $(this).html();
            $(this).parents("ul").siblings("cite").html(txt);
        }
        $(".divselect-list").hide();
    })
    //特殊工艺点击
    $(".specil_progress").on("click", "li label", function () {
        if ($(this).hasClass("not-selectable")) {
            return false;
        }
        let NewName = $(this).find("input").attr("name")
        $(".zz_load").show();
        $(".output_price").hide();
        $(".para_select").addClass("canPrice");
        if ($(this).hasClass("choose")) {
            $(this).removeClass("choose");
            $(this).find("input").prop("checked", false);
            $(this).find("input").val("0");
            $(this).find("i").remove();
        } else {
            $(this).addClass("choose");
            $(this).find("input").prop("checked", true);
            $(this).find("input").before("<i class='jp-ico subscript-ico'></i>");
            $(this).find("input").val("1");
        }
        $(".specil_progress li label input").each(function (i, item) {
            if ($(item).is(":checked")) {

                $(".specil_progress .TestTextSpecial").show();
                return false
            } else {
                $(".specil_progress .TestTextSpecial").hide();
            }
        })
        return false;
    })
    $(".deleteLayer").click(function () {
        $(this).parents("[for=set]").hide();
    })
    $(".info_basic_tsgy .option:visible").each(function (m) {
        if (m % 4 == 3) {
            $(this).addClass("noBorder");
        }
    })
    $(".add-cart").click(function () {
        if (parseInt($("[name=selShipCountry]").val()) <= 0) {
            layer.msg(getLanguage('psSelCountry'));
            return false;
        }
        if (parseInt($("[name=selShip]").val()) <= 0) {
            layer.msg(getLanguage('psSelST'));
            return false;
        }
        layer.closeAll();
        var fr4type = $("#AddCart-FR4Type").val();
        var fr4tg = $("#AddCart-FR4Tg").val();
        var boardbrand = $("#AddCart-BoardBrand").val();
        var pcbProType = $("#Fee-PcbProType").val();
        var stepTag = $('.totalpricezone').attr('data-tag');
        var CoreTypeCode = $("#Fee-CoreTypeCode").val();
        Pcb.AddCart(fr4type, fr4tg, boardbrand, pcbProType, stepTag, CoreTypeCode);
    })
    Pcb.BoardTypeTips();

    let the_country = $.cookie('countryid');
    if (the_country) {
        $("select[name=selShipCountry]").find("option[value=" + the_country + "]").attr("selected", true);
    }
})
var pcbQuotePriceDetail = [];
var Pcb = {
    Init: function () {
        //Add to Cart确认信息
        Pcb.sureInfo();
        //特殊工艺
        Pcb.tsProcess();
        //点击事件
        Pcb.OptionsItemClick();
        //数量
        Pcb.numEvent();
        //槽间距
        $("#cao_x,#cao_y").on("change", function () {
            Pcb.luocao();
            Pcb.BoardTypeData();
            //Pcb.areaEvent();
        })
        $("[name=PinBanNum]").on("change", function () {
            Pcb.clearPrice()
            if ($('[name=PinBanNum]').val() == "") {
                $('[name=PinBanNum]').val("1")
            }
        })
        //工艺边he拼版方式改变
        $("[name=processeEdge_y],[name=pinban_x],[name=pinban_y]").on("change", function () {
            if ($('[name=pinban_x]').val() == "" || $('[name=pinban_x]').val() == "0") {
                $('[name=pinban_x]').val("1")
            } else if (parseInt($('[name=pinban_x]').val()) > 300) {
                $('[name=pinban_x]').val("300")
            }
            if ($('[name=pinban_y]').val() == "" || $('[name=pinban_y]').val() == "0") {
                $('[name=pinban_y]').val("1")
            } else if (parseInt($('[name=pinban_y]').val()) > 300) {
                $('[name=pinban_y]').val("300")
            }
            Pcb.areaEvent();
            Pcb.BoardTypeData();
            Pcb.ImpositionInformationExample();
            Pcb.Checked("BoardThickness", "1.6");
        })
        $("#BoardHeight,#BoardWidth").change(function () {
            var h = $("[name=BoardHeight]").val();
            var w = $("[name=BoardWidth]").val();
            var num = $("[name=Num]").val();
            if (h == 0 || h == null || w == 0 || w == null || num == 0 || num == null) {
                //$(".common_area").hide();
                $(".common_area span").text(0);
                return false;
            } else {
                var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
                $(".common_area").show();
                $(".common_area span").text(area);
            }
            $(".zz_load").show();
            $(".output_price").hide();
            $(".para_select").addClass("canPrice");
            Pcb.BoardTypeTips();
            Pcb.BoardTypeData();
            Pcb.areaEvent();
        });
        Pcb.QutoliEv("[name=FlyingProbe][value='aoi']", 1);
        //默认绿油白字
        Pcb.defaultColor();
        Pcb.basicProRule('FR4Type');
    },
    //基本参数序列化
    commonParamSerialize: function (commonData) {
        var conventional = {
            proCategory: "fr4Item",
            BoardType: "pcs",
            BoardLayers: "2",
            InnerCopperThickness: "1",
            BoardThickness: "1.6",
            LineWeight: "6",
            Vias: "0.3",
            SolderColor: "green",
            FontColor: "white",
            SurfaceFinish: "haslwithlead",
            Goldfinger: "0",
            SolderCover: "converoil",
            FlyingProbe: "free",
            CopperThickness: "1",
            ImGoldThinckness: "0",
            AcceptCrossed: "1",
            IsBlindVias: "0",
            IsHalfHole: "0",
            ResinPlugHole: "0",
            MetalEdging: "0",
            ImpedanceSize: "0", IsImpedance: "0", Goldfinger: "0", CarbonOil_: "0", HoleThickness_: "0", BlueGlue_: "0", StepHole_: "0", Pressfit_: "0", vacuumpack: "0",
            BGANun: "0",
            ImpedanceReport: "0",
            BeforePlating: "copperdeposition",
            ProductFileSure: "0"  //确认稿默认不需要

        };
        var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
        var formarr = $("#fm").serializeArray();
        var templayer = "";
        var BoardType = $("[name=BoardType]:checked").val();
        for (var i = 0; i < formarr.length; i++) {
            var item = formarr[i];
            if (item.name == 'TestReport') {
                break;
            }
            var classname = ".hover_detail .Fee-" + item.name;
            if (!$(".pcbonline-options [name=" + item.name + "]:checked").parents(".option").is(":hidden")) {
                var val = $(".pcbonline-options [name=" + item.name + "]:checked").parent().text().trim();
                if (val == undefined || val == null || val == "") {
                    val = $(".pcbonline-options [name=" + item.name + "]").val();
                }
                if (item.name == "BoardLayers") {
                    templayer = val;
                }
                if (item.name == "InnerCopperThickness" && templayer <= 2) {
                    val = "-";
                }

                if (item.name == "proCategory") {
                    if ($("#AddCart-BoardBrand").val() == "") {
                        $(classname).find("em").text(val);
                    } else {
                        $(classname).find("em").text($("#AddCart-BoardBrand").val());
                    }
                } else {
                    $(classname).find("em").text(val);

                }
                $(classname).show();
                $(classname).find("em").text(val);

                if (item.name == "Num" && BoardType == "jpset") {
                    $(classname).find("em").text(val * ($("[name=pinban_x]").val()) * ($("[name=pinban_y]").val()) + 'pcs');

                }
                if (item.name == "SolderMask") {
                    $(classname).find("input").val(item.value)
                }
            } else {
                $(classname).hide();
            }
            $(".Fee-BoardLayers").find("em").text($(".pcbonline-options [name=BoardLayers]:checked").parent().text());
            $(".Fee-HeightWidth").find("em").html($("[name=BoardHeight]").val() + "mm" + ' x ' + $("[name=BoardWidth]").val() + "mm");
            $(".hover_detail .Fee-PinBanType").find("em").html($("[name=pinban_x]").val() + ' x ' + $("[name=pinban_y]").val());
            $(".hover_detail .Fee-cao").find("em").html("Horizontal:" + $("[name=cao_x]").val() + 'mm ,' + "Vertical:" + $("[name=cao_y]").val() + "mm");

            var val2 = $(".pcbonline-options [name=" + item.name + "]:checked").val();
            if (val2 == undefined || val2 == null || val2 == "") {
                val2 = $(".pcbonline-options [name=" + item.name + "]").val();
            }
            $(classname).find("input").val(val2);

            $(".hover_detail .Fee-PinBanType").find("input").val($("[name=pinban_x]").val() + 'x' + $("[name=pinban_y]").val());
            var common_area = $('.common_area span').text();

            $(".area_val").text(common_area);
            //特殊工艺参数显示问题
            $(".info_ts_title li").each(function (i, dom) {
                var tsName = $(dom).find("input").attr("name");
                if (!$(dom).find("input").prop("checked") || $(dom).is(":hidden")) {
                    $(".hover_detail .Fee-" + tsName).hide();
                    $(".hover_detail .Fee-" + tsName).find("input").val("");
                } else {
                    $(".hover_detail .Fee-" + tsName).show();
                    $(".hover_detail [data-for=" + tsName + "]").show();
                    $(".hover_detail .Fee-" + tsName).find("em").text("Yes");
                    $(".hover_detail .Fee-" + tsName).find("input").val(1);
                }
            })
            // var SFLval = $("[name=SpecifiesLamination]:checked").val();
            // if(SFLval==1){
            //     $(".Fee-SpecifiesLamination").show();
            // }else $(".Fee-SpecifiesLamination").hide();

            if ($(".info_ts_title li").find(".choose").length == 0) {
                $(".pcbDetail_titlets").hide();
            } else {
                $(".pcbDetail_titlets").show();
            }
            //沉金厚度显示问题
            if ($(".imgoldthincknesszone").is(":hidden")) {
                $(".Fee-ImGoldThinckness").hide();
                $(".Fee-ImGoldThinckness").find("em").text("0")
            } else {
                $(".Fee-ImGoldThinckness").show();
            }

            //如果铝基板没选
            if ($(".aluminumOption").is(":hidden")) {
                $(".pcbDetail [data-for='aluminumOption']").hide();
            } else {
                $(".pcbDetail [data-for='aluminumOption']").show();
            }
        }
        // $("." + commonData + " .pcbDetail li").each(function (j, elem) {
        //     var conventionalName = $(elem).find("input").attr("name");
        //     var conventionalValue = $(elem).find("input").attr("value");
        //     for (var key in conventional) {
        //         var name = "Fee-" + key;
        //         if (conventionalName == name) {
        //             if (conventionalValue != undefined && conventionalValue !== conventional[key]) {
        //                 $(elem).find("em").addClass("cl-f00");
        //             }
        //         }
        //     }
        // })
    },
    //加购车确认信息
    sureInfo: function () {
        //点击Add to Cart
        $(".xgpp_cont").on("click", ".cart_item", function () {
            var userId = $("#userId").val();
            if (userId == 0) {
                CartFormSubmit();
                return;
            }
            var _this = $(this);
            var hidBtnBuyNow = $("#hiddenBtnBuyNow").val(2);
            var totalMoney = $(this).parents("tr").find(".table-OrderMoney .span-OrderMoney").eq(index).text(); //折扣价
            var OrgOrderMoney = $(this).parents("tr").find(".table-OrderMoney").eq(index).attr('data-orgordermoney');  //原价

            var totalWeight = $(this).parents("tr").find(".cart_item").attr("data-totalweight"); //重量
            //var jq = $(this).parents("tr").find(".table-DeliveryDays").attr("data-DeliveryDays");
            var index = _this.parent('.cartbox').attr('data-index');
            var totalMoney = $(this).parents("tr").find(".table-OrderMoney .span-OrderMoney").eq(index).text();

            var jq = $(this).parents("tr").find(".jqbox").eq(index).attr("data-DeliveryDays");
            var rq = $(this).parents("tr").find(".jqbox").eq(index).find("[name='AddCart-DeliveryDate']").val();

            //判断是否有铅无铅  data-plumbum
            var havePlumbum = _this.parent('.cartbox').attr('data-plumbum');
            if (havePlumbum == "1") {
                $("#fm1").find(".Fee-SurfaceFinish em").text("HASL with lead");
                $("#fm1").find("[name='Fee-SurfaceFinish']").val("haslwithlead");
            } else if (havePlumbum == "2") {
                $("#fm1").find(".Fee-SurfaceFinish em").text("HASL Lead free");
                $("#fm1").find("[name='Fee-SurfaceFinish']").val("haslwithfree");
            }

            //面积
            var common_aera = $('.common_area  span').text();
            $("#fm1").find(".Fee-Area .area_val").text(common_aera);
            //pcs数
            var BoardType = $("[name=BoardType]:checked").val();
            var Num = $('#Num').val();
            if (BoardType == "jpset") {
                $("#fm1").find(".Fee-Num em").text(Num * ($("[name=pinban_x]").val()) * ($("[name=pinban_y]").val()));
            }
            $(".total-money span").text(totalMoney); //产品价 折扣价
            $(".total-money span").attr("data-money", totalMoney);
            totalMoney = totalMoney.split("$");
            if (totalMoney[1] != OrgOrderMoney) {
                $(".OrgOrderMoney").text(OrgOrderMoney);  //原价
                $(".OrgOrderMoney").removeClass('undis');  //原价
            } else {
                $(".OrgOrderMoney").addClass('undis');  //原价
            }
            checkFree()

            $(".DeliveryType").text(parseInt(jq));
            $(".price-delivery-list .Fee-Area").text($(".pcbDetail .area_val").text() + "㎡");

            $(".addCartDetail .Fee-proCategory em").text($(this).parents("tr").find(".table-FR4Type").text());
            var fr4type = $(this).parents("td").find("[name='AddCart-FR4Type']").val();
            var fr4tg = $(this).parents("td").find("[name='AddCart-FR4Tg']").val();
            var boardbrand = $(this).parents("td").find("[name='AddCart-BoardBrand']").val();
            var pcbProType = $(this).attr("data-pcbprotype");
            var IsHighQuality = $(this).parents("tr").attr("data-type");
            var CoreTypeCode = $(this).parents("td").find("[name='AddCart-CoreTypeCode']").val();
            let TestReport_arry_tit = [];
            let TestReport_arry_key = [];
            $("[name='TestReport']:checked").each(function (index) {
                TestReport_arry_tit[index] = $(this).attr('data-tit');
                TestReport_arry_key[index] = $(this).val();
            });
            $(".Fee-NeedReportList em").text(TestReport_arry_tit);
            $("[name='Fee-NeedReportList']").val(TestReport_arry_key);

            $("#Fee-PcbProType").val(pcbProType);
            $("#AddCart-FR4Type").val(fr4type);
            $("#AddCart-FR4Tg").val(fr4tg);
            $("#Fee-CoreTypeCode").val(CoreTypeCode);
            $("#AddCart-BoardBrand").val(boardbrand);
            $("#Fee-IsHighQuality").val(IsHighQuality);
            Pcb.commonParamSerialize("addCartDetail");
            var stepTag = $('.totalpricezone').attr('data-tag');

            var pricetag = $(this).parents(".cartbox").attr('data-tag');
            $('.totalpricezone').attr('data-tag', pricetag);

            layer.open({
                type: 1,
                shade: 0.3,
                title: 'PCB Detailed Parameters and Special Requirements',
                skin: 'beizhuModel',
                closeBtn: 1,
                shadeClose: true,
                area: ['1280px', '670px'],
                //area: '1280px',
                //minHeight: '680px',
                content: $('.addCartDetail') //捕获的元素
            });
            $('#selShip').attr('data-weight', totalWeight);
            $(".remarks textarea").val("");
            $(".remarks .customize-input").val("");
            if ($(".DeliveryType").text() > 3) {
                $(".pcb-delivery-days i").removeClass("yellow red").addClass("bg-a38459");
                $(".pcb-delivery-days em").text("D");
            }
            else {
                $(".pcb-delivery-days em").text("H");
                $(".DeliveryType").text($(".DeliveryType").text() * 24);
                if ($(".DeliveryType").text() == "0") {
                    $(".pcb-delivery-days i").removeClass("bg-a38459 yellow").addClass("red");
                    $(".DeliveryType").text(12);
                } else if ($(".DeliveryType").text() == "1") {
                    $(".pcb-delivery-days i").removeClass("bg-a38459 yellow").addClass("red");
                } else if ($(".DeliveryType").text() == "2") {
                    $(".pcb-delivery-days i").removeClass("bg-a38459 red").addClass("yellow");
                } else {
                    $(".pcb-delivery-days i").removeClass("yellow red").addClass("bg-a38459");
                }
            }
            $(".market-price .market-price-item").parents("li").show();
            $(".market-price .market-price-item").each(function (i, dom) {
                var proFee = $(dom).attr("data-price-item");
                var result = _this.parent("td").find("[name='" + proFee + "']").val()
                if ($(dom).hasClass("fixed2")) {
                    result2 = parseFloat(result).toFixed(2);
                    $(dom).text(result2);
                }
                if (proFee !== "AddCart-originalJdbTestMoney") {
                    if ($(dom).text() == "0.00" || $(dom).text() == "0") {
                        $(dom).parents("li").hide();
                    }
                }

            })

            //当喷镀费为负的时,加到板材费
            if ($("[data-price-item='AddCart-JdbCostMetallize']").text() < 0) {
                $("[data-price-item='AddCart-JdbCostBoard']").text(parseFloat($("[data-price-item='AddCart-JdbCostBoard']").text()) + parseFloat($("[data-price-item='AddCart-JdbCostMetallize']").text()));
                $("[data-price-item='AddCart-JdbCostMetallize']").text("0");
                $("[data-price-item='AddCart-JdbCostMetallize']").parents("li").hide();
            }
            //其他费费用的值
            var JdbCostBoardFee = $("[data-price-item='AddCart-JdbCostBoard']").text()//板费
            var JdbCostCostructionFee = $("[data-price-item='AddCart-JdbCostCostruction']").text()//工程费
            var JdbCostFilmFee = $("[data-price-item='AddCart-JdbCostFilm']").text()//菲林费
            var JdbCostMetallizeFee = $("[data-price-item='AddCart-JdbCostMetallize']").text()//喷镀费
            var JdbCostTestFee = $("[data-price-item='AddCart-JdbCostTest']").text()//测试费
            var JdbCostColorFee = $("[data-price-item='AddCart-JdbCostColor']").text()//颜色费
            var JdbCostPinBanFee = $("[data-price-item='AddCart-JdbCostPinBan']").text()//拼版费
            var JdbCostJiaJiFee = $("[data-price-item='AddCart-JdbCostJiaJi']").text()//工艺费
            var JdbCostShapFee = $("[data-price-item='AddCart-JdbCostShap']").text()//成型费
            var totalMoney = $(".total-money span").attr("data-money");
            totalMoney = totalMoney.split("$");
            newJdbCostOtherFee = totalMoney[1] - JdbCostBoardFee - JdbCostCostructionFee - JdbCostFilmFee - JdbCostMetallizeFee - JdbCostTestFee - JdbCostColorFee - JdbCostPinBanFee - JdbCostJiaJiFee - JdbCostShapFee;
            if (newJdbCostOtherFee == "0") {
                $("[data-price-item='AddCart-JdbCostOther']").parents("li").hide();
            } else {
                $("[data-price-item='AddCart-JdbCostOther']").parents("li").show();
                $("[data-price-item='AddCart-JdbCostOther']").text(newJdbCostOtherFee.toFixed(2));
            }
            //当原始测试费小于测试费
            if ($("[data-price-item='AddCart-originalJdbTestMoney']").text() <= $("[data-price-item='AddCart-JdbCostTest']").text()) {
                $(".originalJdbTest").hide();
            }
            //
            $(".market-price").height($(".market-price ul").height());
            CalShip();
            sumPrice();
            //   CalShip(totalWeight);
        });
        $(".aboutFeeDetail").hover(function () {
            $(".market-price").show();
        }, function () {
            $(".market-price").hide();
        })
    },
    //筛选
    screen: function () {
        $.ajax({
            url: '/ashx/PcbOnline.ashx?act=GetParameterList',
            dataType: 'json',
            type: 'post',
            beforeSend: function () {
                //$(".loader").show();
            },
            success: function (data) {
                if (data.success) {
                    var scrList = data.attr;
                    Pcb.selectContent(scrList);
                }
            }
        })
    },
    //筛选数据填充
    selectContent: function (scrList) {
        var html2 = "";//装每一项工艺的具体值
        var html4 = "";//装ul
        var changeTableThead = "";
        for (var i = 0; i < scrList.length; i++) {
            var seleList = scrList[i].List;
            if (i == 0) {
            } else {
                if (i == 4) {
                    html2 = "";
                    for (var j = 0; j < seleList.length; j++) {
                        if (seleList[j] != null && seleList[j] != "") {
                            html2 += '<li onclick="fnSelectd(this)"><label class="item rel">' + seleList[j] + '</label></li>'
                        }
                    }
                    html4 += '<ul class="clearfix option-choose">' + html2 + '<input class="undis hide_input" name="' + scrList[i].Name + '"  value=""></ul>'

                } else {
                    var explain = scrList[i].EnExplain;
                    if (explain != "" && explain != null && explain != 'undefined') {
                        html2 = "";
                        for (var j = 0; j < seleList.length; j++) {
                            if (seleList[j] !== null) {
                                html2 += '<li onclick="fnSelectd(this)"><label class="item rel">' + seleList[j] + '</label></li>'
                            }
                        }
                        html4 += '<ul class="clearfix option-choose undis">' + html2 + '<input class="undis hide_input" name="' + scrList[i].Name + '"  value=""></ul>'

                    } else {
                        html2 = "";
                        for (var j = 0; j < seleList.length; j++) {
                            if (seleList[j] !== null) {
                                html2 += '<li onclick="fnSelectd(this)"><label class="item rel">' + seleList[j] + '</label></li>'
                            }
                        }
                        html4 += '<ul class="clearfix option-choose undis">' + html2 + '<input class="undis hide_input" name="' + scrList[i].Name + '"  value=""></ul>'
                    }

                }
            }
            changeTableThead += '<th data_name="' + scrList[i].Name + '"><div class="th_item bold">' + scrList[i].EnglishName + '</div></th>';
            $(".select_item_box").html(html4);
            $(".change-table .xgpp-table-title").html(changeTableThead);
            $('[data-toggle="tooltip"]').tooltip();
        }
        $(".other_option [name=DielectricConstant],.other_option [name=DissipationFactor],.other_option [name=VolumeResistance]").parents("dd").hide();

        //相关匹配
        $(".t_right").width($(".xgpp").width() - 60 - $(".t_left").width() - 1)
        fnInitChange($(".coordination-table"));
        $('.fl-scrolls').scroll(function (e) {
            $('.search-table-wrapper').scrollLeft($(this).scrollLeft());
        });
        changeScroll();
        fnFixed();
    },
    //数量
    numEvent: function () {
        var fnshow = function () {
            $("#boardnumber").show();
            $("#Num").css({ borderBottom: "1px solid #eee" });
            var num = $("#Num").val();
            $("[name=countNumer][value='" + num + "']").prop("checked", true);
        };
        $("#Num").click(fnshow);
        $("#Num,#boardnumber").hover(fnshow, function () {
            CloseSelectNumDiv();
        });
        $("#boardnumber").find("label").each(function (i, dom) {
            $(dom).on("click", function (e) {
                Pcb.clearPrice();
                var num = $(this).find("[name='countNumer']").val();
                $("[name=countNumer][value='" + num + "']").prop("checked", true);
                $("#Num").val(num);
                $("#hidParmChanged").val("yes");
                $("#txtSelNum").val("");
                CloseSelectNumDiv();
                Pcb.BoardTypeData();
                Pcb.areaEvent();
                // Pcb.onetierFn();// //控制所有一层板材最小孔径不可选0.2mm
                $("[for=set]").hide();
                var h = $("[name=BoardHeight]").val();
                var w = $("[name=BoardWidth]").val();
                if (h == 0 || h == null || w == 0 || w == null || num == 0 || num == null) {
                    //$(".common_area").hide();
                    $(".common_area span").text(0);
                    return false;
                } else {
                    var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
                    $(".common_area").show();
                    $(".common_area span").text(area);
                }
                $(".zz_load").show();
                $(".output_price").hide();
                $(".para_select").addClass("canPrice");
                Pcb.superior_quote('countNumer');
                // Pcb.Newrule();

                return false;
            });
        });
    },
    //获取选中的国家
    InitCountry: function () {
        var the_country = $("select[name=selShipCountry]").find(':selected').val();
        if (the_country > 0) {
            //选中，设置cookie
            $.cookie('countryid', the_country, { expires: 7 });
        } else {
            //未选中国家，而cookie已经选中过
            if ($.cookie('countryid') != undefined && $.cookie('countryid') > 0) {
                $("select[name=selShipCountry]").val($.cookie('countryid'));
                ShipCountryChange();
            }
        }
    },
    OptionsItemClick: function () {
        $(".info_basic_top,.info_basic_tsgy").unbind("click").on("click", ".option-choose .item", function (e) {
            var _con = $('.pinbanBox');   // 设置目标区域</span>
            if (!_con.is(e.target) && _con.has(e.target).length === 0) { // 点击区域不是目标本身，也排除目标区域的子元素
                $("[for=set]").hide();
            }
            $(".zz_load").show();
            $(".output_price").hide();
            Pcb.clearPrice();
            $(".para_select").addClass("canPrice");
            if ($(this).hasClass("not-selectable")) {
                return false;
            }
            var name = $(this).find("input").attr("name");
            //单独拿出来的Test Report  是静态不是循环生成
            if (name == "TestReport") {
                if (Pcb.ParmValid()) {
                    let value = $(this).find("input").attr("value");
                    if ($(this).hasClass('choose')) {
                        $(this).removeClass('choose');
                        $(this).find('.jp-ico').remove();
                        $("[name='" + name + "'][value='" + value + "']").prop("checked", false);
                    } else {
                        $(this).addClass("choose");
                        $("[name='" + name + "'][value='" + value + "']").before("<i class='jp-ico subscript-ico'></i>");
                        $("[name='" + name + "'][value='" + value + "']").prop("checked", true);
                    }
                }
            } else {
                Pcb.Checked($(this).find("input").attr("name"), $(this).find("input").val());
            }
            //板子层数
            if (name == "BoardLayers") {
                Pcb.BoardLayersSort();
                Pcb.basicProRule(name);
                Pcb.BoardTypeTips();

                var BoardLayers = $("[name=BoardLayers]:checked").val(); //板子层数
                if (BoardLayers == "4" || BoardLayers == "6") {
                    Pcb.Checked("InnerCopperThickness", "0.5");
                } else {
                    Pcb.Checked("InnerCopperThickness", "1");
                }
            }
            //有锣槽的时候显示槽间距
            if (name == "BoardType" || name == "VCut") {
                var BoardType = $("[name=BoardType]:checked").val();
                var VCut = $("[name=VCut]:checked").val();
                $(".luocao-state").hide();
                $("#unit").text("pcs");
                $(".table-BoardType").text("pcs");
                if (name == "BoardType") {
                    if (BoardType == "pcs") {
                        $("[for=set]").hide();
                        $("[for2=jpset]").hide();
                        Pcb.Checked("VCut", "none");
                        $("[name=BoardType]").siblings('.arr_bottom').removeClass("arrow_top");
                    } else if (BoardType == "set") {
                        $("[for=set]").show();
                        $("[for2=jpset]").hide();
                        $("#unit").text("sets");
                        $(".table-BoardType").text("sets");
                        $("[name=BoardType][value=set]").parents("label").find(".arr_bottom").addClass("arrow_top");
                        $("[name=BoardType][value=jpset]").parents("label").find(".arr_bottom").removeClass("arrow_top");

                    } else if (BoardType == "jpset") {
                        $("#unit").text("sets");
                        $("[for=set]").show();
                        $("[for2=jpset]").show();
                        $("[name=BoardType][value=set]").parents("label").find(".arr_bottom").removeClass("arrow_top");
                        $("[name=BoardType][value=jpset]").parents("label").find(".arr_bottom").addClass("arrow_top");

                    }
                    Pcb.BoardTypeTips();
                }

                Pcb.luocao();
                Pcb.BoardTypeData();
                Pcb.ImpositionInformationExample();
                Pcb.leadNum();

                var h = Number($("#BoardHeight").val())
                var w = Number($("#BoardWidth").val())
                var neww = Number($("[name='pinban_x']").val())
                var newy = Number($("[name='pinban_y']").val())
                //2021/8/4特殊提示
                if (BoardType == "set" || BoardType == "jpset") {
                    if (BoardType == "jpset") {
                        if (VCut == "vcut") {
                            if ((neww * h) < 80 && (newy * w) < 80) {
                                layer.msg("V-Scoring is not available when the panel size is smaller than 80*80mm");
                                Pcb.Checked("VCut", "none");
                                return
                            }
                        }
                    } else {
                        if (VCut == "vcut") {
                            if (w < 80 && h < 80) {
                                layer.msg("V-Scoring is not available when the panel size is smaller than 80*80mm");
                                Pcb.Checked("VCut", "none");
                            }
                        }
                    }

                }
            }
            if (name == "processeEdge_x") {
                Pcb.BoardTypeData()
                Pcb.ImpositionInformationExample();
            }
            Pcb.basicProRule();
            Pcb.areaEvent();
            //默认绿油白字，白油黑字
            if (name == "SolderColor") {
                var solderColor = $("[name='SolderColor']:checked").val();
                Pcb.QutoliEv("[name='FontColor']", 3);
                if (solderColor == 'black' || solderColor == 'matteblack') {
                    Pcb.QutoliEv("[name='FontColor'][value='green'],[name='FontColor'][value='black'],[name='FontColor'][value='blue'],[name='FontColor'][value='matteblack'],[name='FontColor'][value='mattegreen'],[name='FontColor'][value='red']", 2);
                    Pcb.QutoliEv("[name='FontColor'][value='white']", 3);
                    Pcb.Checked("FontColor", "white");
                } else if (solderColor == 'white' || solderColor == 'warmwhite') {
                    Pcb.QutoliEv("[name='FontColor'][value='white']", 2);
                    Pcb.QutoliEv("[name='FontColor'][value='black']", 3);
                    Pcb.Checked("FontColor", "black");
                } else if (solderColor == 'green' || solderColor == 'mattegreen') {
                    Pcb.QutoliEv("[name='FontColor'][value='green'],[name='FontColor'][value='mattegreen']", 2);
                    Pcb.QutoliEv("[name='FontColor'][value='white']", 3);
                    Pcb.Checked("FontColor", "white");
                } else if (solderColor == 'yellow') {
                    Pcb.QutoliEv("[name='FontColor'][value='yellow']", 2);
                    Pcb.Checked("FontColor", "white");
                } else if (solderColor == 'red') {
                    Pcb.QutoliEv("[name='FontColor'][value='red']", 2);
                    Pcb.Checked("FontColor", "white");
                } else if (solderColor == 'blue') {
                    Pcb.QutoliEv("[name='FontColor'][value='blue']", 2);
                    Pcb.Checked("FontColor", "white");
                } else if (solderColor == 'none') {
                    Pcb.Checked("FontColor", "white");
                }
            }
            if ($(".info_basic").height() > $(".info_comm").height()) {
                $(".info_comm").height($(".info_basic").height())
            }

            //拼版框样式
            if ($(".pinbanBox").is(":visible")) {
                $(".pinbanBox .option:visible:last").addClass("lastEle");
            }
            $(".info_basic_tsgy .option").removeClass("noBorder")
            $(".info_basic_tsgy .option:visible").each(function (m) {
                if (m % 4 == 3) {
                    $(this).addClass("noBorder");
                }
            })
            $(".divselect-box ul").hide();
            //判断拼版弹窗拼版信息事件
            if ($(".pinbanBox").is(":visible")) {
                $(".pinban_info").hide();
            } else {
                $(".pinban_info").show();
            }
            var BoardType = $("[name=BoardType]:checked").val();

            var jpsetnum = $("[name=Num]").val();
            var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), jpsetnum, GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());

            if (area == "NaN") {
                area = 0;
            }
            $(".common_area span").text(area);

            Pcb.superior_quote(name);//精品PCB
            return false;
        })
        //拼版事件
        function nameFn(name) {
            $("[name='" + name + "']").blur(function () {
                blurFn($(this))
            })
        }
        nameFn("pinban_x");
        nameFn("pinban_y");

        function blurFn(data) {
            let w = data.parents(".pinbanBox").find(".pbchoicesize").attr("data-width");
            let h = data.parents(".pinbanBox").find(".pbchoicesize").attr("data-height");
            var vCut = $("[name=VCut]:checked").val();
            if (vCut == "vcut" || vCut == "vcutluocao") {
                if (w <= 70 || h <= 70) {
                    layer.msg("The min. width/length after panelization should be over 70mm");
                    return false
                }
            }

        }
        $(document).click(function (e) {
            var _con = $('.pinbanBox');   // 设置目标区域</span>
            if (!_con.is(e.target) && _con.has(e.target).length === 0) { // 点击区域不是目标本身，也排除目标区域的子元素
                $("[for=set]").hide();
            }
            //判断拼版弹窗拼版信息事件
            if ($(".pinbanBox").is(":visible")) {
                $(".pinban_info").hide();
            } else {
                $(".pinban_info").show();
            }
        });
        $("[name=processeEdge_y],[name=pinban_x],[name=pinban_y]").on("click", function (e) {
            var _con = $('.pinbanBox');   // 设置目标区域</span>
            if (!_con.is(e.target) && _con.has(e.target).length === 0) { // 点击区域不是目标本身，也排除目标区域的子元素
                $("[for=set]").hide();
            }
            return false;
        })
    },
    //基本信息规则
    basicProRule: function (name) {
        var BoardLayers = $("[name='BoardLayers']:checked").val();
        var BoardThickness = $("[name='BoardThickness']:checked").val();
        var CopperThickness = $("[name='CopperThickness']:checked").val();
        var InnerCopperThickness = $("[name='InnerCopperThickness']:checked").val();
        Pcb.QutoliEv("[name='CopperThickness'][value='1.5']", 1);

        if (name == 'BoardLayers' && BoardLayers == 1) {
            $(".border_color").slideDown(300);
            Pcb.Checked("SolderMask", "top");
        } else if (name == 'BoardLayers' && BoardLayers != 1) {
            $(".border_color").slideUp(300);
            Pcb.Checked("SolderMask", "none");
        }

        if (name == 'BoardLayers') {
            switch (BoardLayers) {
                case '1': eqchBoardLayersShow(0.4, 2, 1.6); break;
                case '2': eqchBoardLayersShow(0.4, 3, 1.6); break;
                case '4': eqchBoardLayersShow(0.6, 2, 1.6); break;
                case '6': eqchBoardLayersShow(0.8, 2, 1.6); break;
                case '8': eqchBoardLayersShow(1, 3, 1.6); break;
                case '10': eqchBoardLayersShow(1.2, 3, 1.6); break;
                case '12': eqchBoardLayersShow(1.6, 3, 1.6); break;
                default: eqchBoardLayersShow(2, 3, 2);
            }
        }
        //板层、板厚基本规则  min<to>max、CK激活
        function eqchBoardLayersShow(min, max, ck = null) {
            $("[name=BoardThickness]").each(function () {
                let value = $(this).val();
                if (value < min || value > max) Pcb.QutoliEv("[name=BoardThickness][value='" + value + "']", 2);
                else Pcb.QutoliEv("[name=BoardThickness][value='" + value + "']", 3);
            })
            if (ck != null) Pcb.ifCK_tf("BoardThickness", ck);
        }
        selectVal("CopperThickness", "1");
        selectVal("BoardThickness", "1.6");
        selectVal("InnerCopperThickness", "1");
        Pcb.superior_quote(name);
    },
    //板数层弹窗
    BoardLayersSort: function () {
        var BoardLayers = $("[name=BoardLayers]:checked").val(); //板子层数
        $(".layersort").empty();
        if (BoardLayers > 2) {
            $(".singTip").hide();
            return false;
            for (var i = 1; i <= BoardLayers; i = i + 1) {
                var l = i;
                if (l == 0) l = 1;
                var html = '<span><em>L' + l + '</em><input class="form-control b-bradius0 h30 ml5 mr5"  name="layersort" type="text"  value=""></span>';
                $(".layersort").append(html);
            }
            //$(".layersortzone").slideDown(300);
            //内层铜箔厚度显示
            // $(".inner-layer-thickness").slideDown(300);

            Pcb.Checked("SolderMask", "top");
            $(".blindHole").show();
            var url = window.location.href;
            if (url.indexOf("BoardLayers") == "-1") {
                layer.open({
                    type: 1,
                    shade: 0.5,
                    title: "Requirements for the layers order of the multilayer board",
                    skin: 'layui-layer-layersortzone', //加上边框
                    area: ["650px", "430px"],
                    content: $('.multilayer-board'), //捕获的元素，注意：最好该指定的元素要存放在body最外层，否则可能被其它的相对元素所影响
                    btn: ['Confirm', 'Cancel'],
                    yes: function (index, layero) {//确定按钮
                        //do something;
                        if ($(".list-wrap li").eq(0).hasClass("active")) {
                            var boardLayer = $("[name=BoardLayers]:checked").val();
                            var _layrerTrue = true;
                            $("[name=layersort]").each(function (i, dom) {
                                var va = $(dom).val();
                                if (va == "") {
                                    _layrerTrue = false;
                                    layer.msg('Please fill in the order layers of the multilayer board or select the one of the latter two options.', { time: 2000 });
                                    return false;
                                }
                            });
                            if (_layrerTrue) {
                                layer.closeAll();
                            } else {
                                return false;
                            }
                        } else {
                            layer.closeAll();
                        }
                    },
                    btn2: function (index, layero) {//取消按钮
                        //do something;
                        if ($(".list-wrap li").eq(0).hasClass("active")) {
                            var boardLayer = $("[name=BoardLayers]:checked").val();
                            var _layrerTrue = true;
                            $("[name=layersort]").each(function (i, dom) {
                                var va = $(dom).val();
                                if (va == "") {
                                    _layrerTrue = false;
                                    layer.msg('Please fill in the order layers of the multilayer board or select the one of the latter two options.', { time: 2000 });
                                    return false;
                                }
                            });
                            return _layrerTrue;
                        } else {
                            layer.closeAll();
                        }
                    },
                    cancel: function () {
                        //layer.msg('捕获就是从页面已经存在的元素上，包裹layer的结构', { time: 5000, icon: 6 });
                        if ($(".list-wrap li").eq(0).hasClass("active")) {
                            var boardLayer = $("[name=BoardLayers]:checked").val();
                            var _layrerTrue = true;
                            $("[name=layersort]").each(function (i, dom) {
                                var va = $(dom).val();
                                if (va == "") {
                                    _layrerTrue = false;
                                    layer.msg('Please fill in the order layers of the multilayer board or select the one of the latter two options.', { time: 2000 });
                                    return false;
                                }
                            });
                            return _layrerTrue;
                        } else {
                            layer.closeAll();
                        }
                    }
                })
            }
            $(".list-wrap li").unbind("click").click(function () {
                var n = $(this).index();
                $(".list-wrap li").removeClass("active");
                $(this).addClass("active");
                if (n != 0) {
                    $(".layersort_box").hide();
                } else {
                    $(".layersort_box").show()
                }
            })
        }
        else {
            //内层铜箔厚度隐藏
            // $(".inner-layer-thickness").slideUp(300);
            Pcb.Checked("InnerCopperThickness", "1");
            $(".blindHole").hide();
            if (BoardLayers > 1) {
                $(".singTip").hide();
            } else {
                $(".singTip").show();
            }
        }
        $(".otherBoard").show();
        if (BoardLayers > 1) {
            Pcb.QutoliEv("[name='FormingType'][value='vcutseparate'],[name='FormingType'][value='module']", 2);
        }
    },
    defaultColor: function () {
        //默认绿油白字
        Pcb.QutoliEv("[name=SolderColor]", 3);
        Pcb.Checked("SolderColor", "green");
        Pcb.QutoliEv("[name=FontColor]", 3);
        Pcb.QutoliEv("[name='FontColor'][value='green'],[name='FontColor'][value='mattegreen']", 2);
        Pcb.Checked("FontColor", "white");
    },
    //客户单片出货的单片尺寸或者拼板出货的拼板尺寸小于50*50mm,加提示
    BoardTypeTips: function () {
        var boardType = $("[name=BoardType]:checked").val();
        var BoardLayers = $("[name=BoardLayers]:checked").val();
        var l = $("[name=BoardHeight]").val();
        var w = $("[name=BoardWidth]").val();

        if (boardType == "pcs" || boardType == "set") {
            if ((l < 50 && l != "") || (w < 50 && w != "")) {
                layer.msg(getLanguage('quoteNumMin'), { time: 3000 });
            }
        }
        if (BoardLayers == 2) {
            if (l > 650 || w > 520) {
                $("[name=BoardHeight]").val(l > 650 ? 650 : l);
                $("[name=BoardWidth]").val(w > 520 ? 520 : w);
                layer.msg(getLanguage('theSizeMaxT', '650 * 520mm'), { time: 3000 });
            }
        }
        if (BoardLayers > 2) {
            if (l > 640 || w > 480) {
                $("[name=BoardHeight]").val(l > 640 ? 640 : l);
                $("[name=BoardWidth]").val(w > 480 ? 480 : w);
                layer.msg(getLanguage('theSizeMaxT', '640 * 480mm'), { time: 3000 });
            }
        }

    },
    //验证长宽数量是否为空
    checkPara: function () {
        var BoardHeight = $("[name=BoardHeight]").val();
        var BoardWidth = $("[name=BoardWidth]").val();
        var Num = $("[name=Num]").val();
        var flag = true;
        if (BoardHeight == "" || BoardHeight == undefined) {
            $('html,body').animate({ scrollTop: 97 }, 800);
            $("#BoardHeight").addClass("active"), setTimeout(function () {
                $("#BoardHeight").removeClass("active");
            }, 3000);
            $(".size_tips_1").show(), setTimeout(function () {
                $(".size_tips_1").hide();
            }, 3000);
            flag = false;
            return flag;
        }
        if (BoardWidth == "" || BoardWidth == undefined) {
            $('html,body').animate({ scrollTop: 97 }, 800);
            $("#BoardWidth").addClass("active"), setTimeout(function () {
                $("#BoardWidth").removeClass("active");
            }, 3000);
            $(".size_tips_1").show(), setTimeout(function () {
                $(".size_tips_1").hide();
            }, 3000);
            flag = false;
            return flag;
        }
        if (Num == "" || Num == undefined) {
            $('html,body').animate({ scrollTop: 97 }, 800);
            $("#Num").addClass("active"), setTimeout(function () {
                $("#Num").removeClass("active");
            }, 3000);
            $(".size_tips_num").show(), setTimeout(function () {
                $(".size_tips_num").hide();
            }, 3000);
            flag = false;
            return flag;
        }
        if ($('.xgpp-table-cont').length == 0) {
            layer.msg(" Please quote online first  ");
            flag = false;
            return flag;
        }
        return flag;
    },
    //转拼版方式板子数量变化以及工艺边和工艺边宽度事件
    BoardTypeData: function () {
        var boardType = $("[name=BoardType]:checked").val();
        var area = 0;
        var l = $("[name=BoardHeight]").val();
        var w = $("[name=BoardWidth]").val();
        var num = $("[name=Num]").val();
        if (boardType == "pcs") {
            $("[name=pinban_x]").val(1);
            $("[name=pinban_y]").val(1);
            Pcb.Checked("processeEdge_x", "none");
            $("[name=processeEdge_y]").val("0");
            Pcb.Checked("AcceptCrossed", "1");
            Pcb.Checked("VCut", "none")
            $("#cao_y").val("0");
            $("#cao_x").val("0");
            area = (l * w * num).toFixed(2);
            $(".imposition-information-example").hide();
            $(".tptsinfo").html("");
            $(".common_area span").text(parseFloat(area / 1000000).toFixed(4));
        } else {
            //Pcb.Checked("VCut", "vcut")
            var px = $("[name=pinban_x]").val();
            var py = $("[name=pinban_y]").val();
            //$(".panel-separatingWay").on("change", function () {
            //    Pcb.CommonRelation(this);
            //});
            if (GetCheckedVal("processeEdge_x") == "none") {
                $("[name=processeEdge_y]").val(0);
            }
            if (GetCheckedVal("processeEdge_x") != "none" && parseFloat($("[name=processeEdge_y]").val()) < 4) {
                $("[name=processeEdge_y]").val(4);
            }
            var gybx = $("[name=processeEdge_x]:checked").val();
            var gyby = $("[name=processeEdge_y]").val();
            var pcsCount = px * py * num;
            var c = l * px; var k = w * py;
            if (boardType == "set") {
                Pcb.Checked("processeEdge_x", "none");
                $("[name=processeEdge_y]").val("0");
                $(".imposition-information-example").hide();
                var setnum = num;
                var html = '<span class="cl-f90 bold pbchoicetype">' + num + ' SET=' + pcsCount + '(pcs)</span>means<span class="pbchoicesize undis"data-width="' + (parseFloat(l).toFixed(2) * parseFloat(px).toFixed(2)) + '" data-height="' + (parseFloat(w).toFixed(2) * parseFloat(py).toFixed(2)) + '">' + parseFloat(l).toFixed(2) + "X" + parseFloat(w).toFixed(2) + "cm" + '</span> ';
                // area = px * l * py * w * num;
                //$(".imposition-requires-presentation").show();
                $(".tptsinfo").html(html);
                $("#cao_y").val("0");
                $("#cao_x").val("0");
                area = l * w * num;
                $(".common_area span").text(parseFloat(area / 1000000).toFixed(4));
            } else if (boardType == 'jpset') {
                $(".imposition-information-example").show();
                //拼版信息示例
                //$(".imposition-information-example").hover(function () {
                //    $(".imposition-informationExample").css("z-index", "1000");
                //}, function () {
                //    $(".imposition-informationExample").css("z-index", "-10");
                //});
                $(".suggest-masklayer").height($(document).height());
                $(".suggest-masklayer").click(function () {
                    $("#informationpinban").css({ "z-index": "-999", "opacity": "0" });
                    $(".suggest-masklayer").hide();
                });
                if (gybx == "updown") c += gyby * 2;
                if (gybx == "leftright") k += gyby * 2;
                if (gybx == "both") { k += gyby * 2; c += gyby * 2; }
                var pcsnum = num * px * py;
                var sets = Math.round(pcsnum / (px * py) * 100) / 100;
                // var sets = Math.round(num / (px * py));
                var vCut = $("[name=VCut]:checked").val();
                var caoX = $("[name=cao_x]").val(), caoY = $("[name=cao_y]").val();
                var html = "";
                if (vCut.indexOf("luocao") > -1) {
                    caoX = $("[name=cao_x]").val();
                    caoY = $("[name=cao_y]").val();
                    caoX = parseFloat(caoX).toFixed(1);
                    caoY = parseFloat(caoY).toFixed(1);
                    k += (py - 1) * caoY;
                    c += (px - 1) * caoX;
                    if (gybx == "updown") {
                        c += caoX * 2;
                    }
                    if (gybx == "leftright") {
                        k += caoY * 2;
                    }
                    if (gybx == "both") {
                        c += caoX * 2;
                        k += caoY * 2;
                    }
                    html = '根据要求，拼版尺寸为：<span class="cl-f90 bold pbchoicesize" data-width="' + parseFloat(c).toFixed(2) + '" data-height="' + parseFloat(k).toFixed(2) + '">' + parseFloat(c).toFixed(2) + "X" + parseFloat(k).toFixed(2) + "cm" + '</span>,';
                } else {
                    html = '根据要求，拼版尺寸为：<span class="cl-f90 bold pbchoicesize"  data-width="' + parseFloat(c).toFixed(2) + '" data-height="' + parseFloat(k).toFixed(2) + '">' + parseFloat(c).toFixed(2) + "X" + parseFloat(k).toFixed(2) + "cm" + '</span>,';
                    $(".luocao-state").hide();
                }
                if (sets % 5 == 0) {
                    html += ' 工厂按<span class="cl-f90 bold pbchoicetype">' + sets + ' SET=' + num + '单片(pcs)</span>制作          ';
                } else {
                    html += '拼版数<span class="cl-f90 bold pbchoicetype">' + sets + ' SET=' + num + '单片(pcs)</span> ';
                    sets = Math.floor(sets / 5) * 5 + 5;
                    num = Math.ceil(sets * px * py);
                    html += ' 工厂只能按<span class="cl-f90 bold pbchoicetype">' + sets + ' SET=' + num + '单片(pcs)</span>制作          ';
                    //$("[name=Num]").val(num);
                    $("[name=countNumer]").prop("checked", false);
                    if (num > 100) {
                        $("[name=txtSelNum]").val(num);
                    } else {
                        $("[name=countNumer][value='" + num + "']").prop("checked", true);
                    }

                }
                //num = Math.ceil(sets * px * py);

                if (!(l && w)) return;
                area = sets * c * k;
                //  var area = Math.ceil(num * px * py * l * w);
                //拼版信息示例
                //Pcb.ImpositionInformationExample();
                Pcb.ImpositionInformationExample();
                $(".tptsinfo").html(html);
                //$(".imposition-requires-presentation").show();
                var setnum = $('#Num').val();
                setnum = Math.ceil(setnum * px * py);
                $(".jpsettipsbox span").html(setnum);
                $(".common_area span").text(parseFloat(area / 1000000).toFixed(4));
            }

        }
    },
    //拼版信息示例
    ImpositionInformationExample: function () {
        var l = $("[name=BoardHeight]").val();
        var w = $("[name=BoardWidth]").val();
        var px = $("[name=pinban_x]").val();
        var py = $("[name=pinban_y]").val();
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

            var createPanel = ("<ul class='panel-list'>");
            for (var i = 0; i < px; i++) {
                var panelLi = "<li>";
                for (var j = 0; j < py; j++) {
                    var panelSpan = ("<span class='item pull-left'></span>");
                    panelLi += panelSpan;
                }
                panelLi += "</li>";
                createPanel += panelLi;
            }
            createPanel += "</ul>";
            $(".createpanel").html(createPanel);


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

            var panelyWidth = $(".imposition-informationExample .createpanel").width();
            var panelyHeight = $(".imposition-informationExample .createpanel").height();
            var edgerailHeight = panelyHeight;

            if (GetCheckedVal("processeEdge_x") != "none" && parseFloat($("[name=processeEdge_y]").val()) < 3) {
                $("[name=processeEdge_y]").val(3);
            }
            var processeEdge_y = $("[name=processeEdge_y]").val();
            if (GetCheckedVal("processeEdge_x") == "none") {
                c = l * px;
                k = w * py;
                panelyHeight = $(".imposition-informationExample .createpanel").height();
                $(".imposition-informationExample .edgerailwidth-left").hide();
                $(".imposition-informationExample .edgerailwidth-right").hide();
                $(".imposition-informationExample .edgerailwidth-top").hide();
                $(".imposition-informationExample .edgerailwidth-bottom").hide();
            }
            if (GetCheckedVal("processeEdge_x") == "updown") {
                c += processeEdge_y * 2;
                processeEdge_y = 5;
                panelyHeight = $(".imposition-informationExample .createpanel").height() + (processeEdge_y * 2);
                edgerailHeight = panelyHeight - (processeEdge_y * 2);
                $(".imposition-informationExample .edgerailwidth-left").hide();
                $(".imposition-informationExample .edgerailwidth-right").hide();
                $(".imposition-informationExample .edgerailwidth-top").show();
                $(".imposition-informationExample .edgerailwidth-bottom").show();
            }
            if (GetCheckedVal("processeEdge_x") == "leftright") {
                k += processeEdge_y * 2;
                processeEdge_y = 5;
                panelyWidth = $(".imposition-informationExample .createpanel").width() + (processeEdge_y * 2);
                panelyHeight = $(".imposition-informationExample .createpanel").height();
                edgerailHeight = panelyHeight;
                $(".imposition-informationExample .edgerailwidth-left").show();
                $(".imposition-informationExample .edgerailwidth-right").show();
                $(".imposition-informationExample .edgerailwidth-top").hide();
                $(".imposition-informationExample .edgerailwidth-bottom").hide();
            }
            if (GetCheckedVal("processeEdge_x") == "both") {
                k += processeEdge_y * 2;
                c += processeEdge_y * 2;
                processeEdge_y = 5;
                panelyWidth = $(".imposition-informationExample .createpanel").width() + (processeEdge_y * 2);
                panelyHeight = $(".imposition-informationExample .createpanel").height() + (processeEdge_y * 2);
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
            var vCut = $("[name=VCut]:checked").val();
            var caoX = $("[name=cao_y]").val(), caoY = $("[name=cao_y]").val();
            if (vCut.indexOf("luocao") > -1) {
                caoX = $("[name=cao_x]").val();
                caoY = $("[name=cao_y]").val();
                caoX = parseFloat(caoX).toFixed(1);
                caoY = parseFloat(caoY).toFixed(1);
                k += (py - 1) * caoY;
                c += (px - 1) * caoX;
                if (GetCheckedVal("processeEdge_x") == "updown") {
                    c += caoX * 2;
                }
                if (GetCheckedVal("processeEdge_x") == "leftright") {
                    k += caoY * 2;
                }
                if (GetCheckedVal("processeEdge_x") == "both") {
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
    //锣槽事件
    luocao: function () {
        var BoardType = $("[name=BoardType]:checked").val();
        var VCut = $("[name=VCut]:checked").val();
        if (BoardType == "jpset") {
            if (VCut.indexOf("luocao") > -1) {
                $(".luocao-state").show();
                var cao_x = $("#cao_x").val();
                var cao_y = $("#cao_y").val();
                if (VCut == "luocao") {
                    if ((10 >= cao_x && cao_x >= 2) && (10 >= cao_y && cao_y >= 2)) {

                    } else {
                        if (cao_x < 2) {
                            $("#cao_x").val("2");
                        }
                        if (cao_y < 2) {
                            $("#cao_y").val("2");
                        }
                        if (cao_x > 10 || cao_y > 10) {
                            layer.msg("Please enter a number between 2-10 for the spacing between tab-routings.");
                            return false;
                        }
                    }
                } else if (VCut == "vcutluocao") {
                    if ((cao_x == 0 && (10 >= cao_y && cao_y >= 2)) || (cao_y == 0 && (10 >= cao_x && cao_x >= 2))) {

                    } else {
                        if ((cao_x == 0) && (cao_y == 0)) {
                            layer.msg("The tab-routings in horizontal and vertical direction cannot be 0 at the same time.");
                            return false;
                        }
                        layer.msg("If the tab-routings in horizontal or vertical direction needs to be 0, the other is a number between 2-10.");
                        return false;
                    }
                }
            } else {
                $(".luocao-state").hide();
                $("#cao_x").val("0");
                $("#cao_y").val("0");
            }
        }
    },
    //参数验证
    ParmValid: function () {
        var flag = true;
        var BoardHeight = $("#BoardHeight").val();
        var BoardWidth = $("#BoardWidth").val();
        var Num = $("#Num").val();
        var VCut = $("[name=VCut]:checked").val();
        var cao_x = $("[name=cao_x]").val();
        var cao_y = $("[name=cao_y]").val();
        let w = $(".pbchoicesize").attr("data-width");
        let h = $(".pbchoicesize").attr("data-height");
        var BoardType = $("[name=BoardType]:checked").val();
        $("[name=Fee-BoardHeight]").val(BoardHeight);
        $("[name=Fee-BoardWidth]").val(BoardWidth);
        $("[name=Fee-cao_x]").val(cao_x);
        $("[name=Fee-cao_y]").val(cao_y);
        if (BoardHeight == "" || BoardHeight == undefined || BoardHeight == 0) {
            $('html,body').animate({ scrollTop: 97 }, 800);
            $("#BoardHeight").addClass("active"), setTimeout(function () {
                $("#BoardHeight").removeClass("active");
            }, 3000);
            $(".size_tips_1").show(), setTimeout(function () {
                $(".size_tips_1").hide();
            }, 3000);
            return false;
        }
        if (BoardWidth == "" || BoardWidth == undefined || BoardWidth == 0) {
            $('html,body').animate({ scrollTop: 97 }, 800);
            $("#BoardWidth").addClass("active"), setTimeout(function () {
                $("#BoardWidth").removeClass("active");
            }, 3000);
            $(".size_tips_1").show(), setTimeout(function () {
                $(".size_tips_1").hide();
            }, 3000);
            return false;
        }
        if (Num == "" || Num == undefined) {
            $('html,body').animate({ scrollTop: 97 }, 800);
            $("#Num").addClass("active"), setTimeout(function () {
                $("#Num").removeClass("active");
            }, 3000);
            $(".size_tips_num").show(), setTimeout(function () {
                $(".size_tips_num").hide();
            }, 3000);
            return false;
        }
        if (BoardType == 'jpset' && VCut.indexOf("luocao") > -1) {
            if (VCut == "luocao") {
                if (!(10 >= cao_x && cao_x >= 2) && (10 >= cao_y && cao_y >= 2)) {
                    layer.msg("Please enter a number between 2-10 for the spacing between tab-routings.");
                    return;
                }
            } else if (VCut == "vcutluocao") {
                if (!((cao_x == 0 && (10 >= cao_y && cao_y >= 2)) || (cao_y == 0 && (10 >= cao_x && cao_x >= 2)))) {
                    if ((cao_x == 0) && (cao_y == 0)) {
                        layer.msg("The tab-routings in horizontal and vertical direction cannot be 0 at the same time.");
                        return false;
                    }
                    layer.msg("If the tab-routings in horizontal or vertical direction needs to be 0, the other is a number between 2-10.");
                    return false;
                }
            }
        }
        var vCut = $("[name=VCut]:checked").val();
        if (vCut == "vcut" || vCut == "vcutluocao") {
            if (BoardType == 'set' || BoardType == 'jpset') {
                if (w <= 70 || h <= 70) {
                    layer.msg("The min. width/length after panelization should be over 70mm")
                    return false;
                }
            }
        }

        //PCBA 计价交验
        if (ifQuotePcba) {
            var ProductNum = $("[name=ProductNum]");
            var PointNum = $("[name=PointNum]");
            var DIPPointNum = $("[name=DIPPointNum]");
            var PatchElementType = $("[name=PatchElementType]");
            // var MoreThan16PinNum = $("[name=MoreThan16PinNum]");
            if(!ProductNum.val()){setInputBT(ProductNum); ProductNum.focus(); return false;}
            if (!PointNum.val()) { setInputBT(PointNum); PointNum.focus(); return false; }
            if (!DIPPointNum.val()) { setInputBT(DIPPointNum); DIPPointNum.focus(); return false; }
            if (!PatchElementType.val()) { setInputBT(PatchElementType); PatchElementType.focus(); return false; }
            // if(!MoreThan16PinNum.val()){setInputBT(MoreThan16PinNum); MoreThan16PinNum.focus(); return false;}

        }
        return flag;
    },
    //计算价格
    calcPrice: function (checkShipCost) {
        if (Pcb.ParmValid()) {
            // if (true == checkShipCost && !Pcb.selSpCost()) {
            //     return false;
            // }
            $.cookie('calcShipId', $(".selShip li.on input").val(), { path: '/' });
            $(".zz_load").hide();
            var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
            var formarr = $("#fm").serializeArray();
            var templayer = "";
            for (var i = 0; i < formarr.length; i++) {
                var item = formarr[i];
                // if (item.name == "SolderMask") {}
                if (item.name == 'TestReport') {
                    break;
                }
                var classname = ".pcbDetail .Fee-" + item.name;
                if (!$(".pcbonline-options [name=" + item.name + "]:checked").parents(".option").is(":hidden")) {

                    var val = $(".pcbonline-options [name=" + item.name + "]:checked").parent().text().trim();
                    if (val == undefined || val == null || val == "") {
                        val = $(".pcbonline-options [name=" + item.name + "]").val();
                    }
                    if (item.name == "BoardLayers") {
                        templayer = val;
                    }
                    if (item.name == "InnerCopperThickness" && templayer <= 2) {
                        val = "-";
                    }

                    $(classname).show();
                    $(classname).find("em").text(val);
                } else {
                    $(classname).hide();
                    //  $(classname).parent('tr').hide();
                }
                $(".Fee-BoardLayers").find("em").text($(".pcbonline-options [name=BoardLayers]:checked").parent().text());
                $(".Fee-HeightWidth").find("em").html($("[name=BoardHeight]").val() + "mm" + ' x ' + $("[name=BoardWidth]").val() + "mm");
                $(".pcbDetail .Fee-PinBanType").find("em").html($("[name=pinban_x]").val() + ' x ' + $("[name=pinban_y]").val() + "pcs");
                $(".pcbDetail .Fee-cao").find("em").html(" Horizontal:" + $("[name=cao_x]").val() + 'mm ,' + "Vertical:" + $("[name=cao_y]").val() + "mm");

                var val2 = $(".pcbonline-options [name=" + item.name + "]:checked").val();
                if (val2 == undefined || val2 == null || val2 == "") {
                    val2 = $(".pcbonline-options [name=" + item.name + "]").val();
                }
                $(classname).find("input").val(val2);
                $(".pcbDetail .Fee-PinBanType").find("input").val($("[name=pinban_x]").val() + 'x' + $("[name=pinban_y]").val());
                $(".area_val").text(area);
                if ($(".info_ts_title li").find(".choose").length == 0) {
                    $(".pcbDetail_titlets").hide();
                } else {
                    $(".pcbDetail_titlets").show();
                }
                //沉金厚度显示问题
                if ($(".imgoldthincknesszone").is(":hidden")) {
                    $(".Fee-ImGoldThinckness").hide();
                    $(".Fee-ImGoldThinckness").find("em").text("0")
                } else {
                    $(".Fee-ImGoldThinckness").show();
                }

                //如果铝基板没选
                if ($(".aluminumOption").is(":hidden")) {
                    $(".pcbDetail [data-for='aluminumOption']").hide();
                } else {
                    $(".pcbDetail [data-for='aluminumOption']").show();
                }
            }

            let pinban_x = $("[name=pinban_x]").val();
            let pinban_y = $("[name=pinban_y]").val();
            let processeEdge_y = $("[name=processeEdge_y]").val();
            var parm = {
                'act': 'CalcPrice',
                'BoardHeight': $("#BoardHeight").val(),
                'BoardWidth': $("#BoardWidth").val(),
                'Num': $("#Num").val(),
                // 'txtSelNum':'',
                'BoardLayers': getCkVal('BoardLayers'),
                'BoardType': getCkVal('BoardType'),
                'AcceptCrossed': getCkVal('AcceptCrossed'),
                'pinban_x': pinban_x,
                'pinban_y': pinban_y,
                'processeEdge_x': getCkVal('processeEdge_x'),
                'processeEdge_y': processeEdge_y,
                'VCut': getCkVal('VCut'),
                'cao_x': $('#cao_x').val(),
                'cao_y': $('#cao_y').val(),
                'FR4Type': getCkVal('FR4Type'),
                'FR4Tg': getCkVal('FR4Tg'),
                'SolderMask': getCkVal('SolderMask'),
                'BoardThickness': getCkVal('BoardThickness'),
                'SolderColor': getCkVal('SolderColor'),
                'FontColor': getCkVal('FontColor'),
                'PinBanNum': $('[name=PinBanNum]').val(),
                'CopperThickness': getCkVal('CopperThickness'),
                'InnerCopperThickness': getCkVal('InnerCopperThickness'),
                'LineWeight': getCkVal('LineWeight'),
                'Vias': getCkVal('Vias'),
                'SolderCover': getCkVal('SolderCover'),
                'FlyingProbe': getCkVal('FlyingProbe'),
                'SurfaceFinish': getCkVal('SurfaceFinish'),
                'ImGoldThinckness': getCkVal('ImGoldThinckness'),
                'FormingType': getCkVal('FormingType'),
                'HaveBGA': getCkVal('HaveBGA'),
                'BGApadspacing': getCkVal('BGApadspacing'),
                'ImpedanceSize': getCkVal('ImpedanceSize'),
                'ImpedanceReport': getCkVal('ImpedanceReport'),
                'ProductFileSure': getCkVal('ProductFileSure'),
                'CamEngineer': getCkVal('CamEngineer'),
                'IPCLevel': getCkVal('IPCLevel'),
                'HalfHole': getCkVal('HalfHole'),
                'PinBanType': pinban_x + "x" + pinban_y,
                'ProcessEdges': $("[name=processeEdge_x]:checked").val() + ":" + processeEdge_y,
                'NeedReportList': $('[name=Fee-TestReport]').val(),
                'SmtOrderNo': $("#SmtOrderNo").val(),
                'selShipCountry': $("#selShipCountry").val(),
                'selShip': $(".selShip li.on input").val(),
                't': new Date()
            }
            var SFLval = $("[name=SpecifiesLamination]:checked").val();
            if (SFLval == 1) {
                parm.SpecifiesLamination = SFLval
            }
            //特殊工艺参数显示问题
            $(".info_ts_title li").each(function (i, dom) {
                var tsName = $(dom).find("input").attr("name");
                if (!$(dom).find("input").prop("checked") || $(dom).is(":hidden")) {
                    $(".pcbDetail .Fee-" + tsName).hide();
                    $(".pcbDetail .Fee-" + tsName).find("input").val("");
                } else {
                    $(".pcbDetail .Fee-" + tsName).show();
                    $(".pcbDetail [data-for=" + tsName + "]").show();
                    $(".pcbDetail .Fee-" + tsName).find("em").text("Yes");
                    $(".pcbDetail .Fee-" + tsName).find("input").val(1);
                    parm[tsName] = 1;
                }
            })
            // console.log(parm); debugger;
            $.ajax({
                url: '/ashx/SuperiorPcbQuote.ashx',
                data: parm,
                dataType: 'json',
                type: 'post',
                beforeSend: function () {
                    $(".loader").show();
                    $(".loader p").show();
                    $("#fixed-table tbody").html("");
                    $(".change-table tbody").html("");
                    $(".no-content").show();
                    $(".choose-result").hide();
                    $(".sel-title .sel-item .sel_result").text("0");
                },
                success: function (data) {
                    $(".loader").hide();
                    // $(".output_price").show();
                    $(".para_select").removeClass("canPrice");
                    if (data.success) {
                        valuateResult = data.attr;
                        //$(".para_detail_title").show();
                        if (data.attr.Success) {
                            $("body,html").animate({ scrollTop: 110 }, 300);

                            Pcb.newPcbOutputPrice(data.attr.List);
                            return false;
                            BuildShipHtml(data.attr.CalcShipList, null, 1);
                            $(".online_hd li").removeClass("current")
                            $(".online_hd li").eq(1).addClass("current")
                            $("body,html").animate({ scrollTop: 110 }, 300);
                            var info = data.attr.List;

                            Pcb.paraRend(info, "PcbOrder", "FR4Type", "Num", "DeliveryDays", "FR4Tg");
                            // Pcb.paixu($(".resultPrice .top-order"), "Price", "0");
                            if (info.length == 0) {
                                // layer.msg(getLanguage('quoteNoDataToS'));
                                altNotice(getLanguage('quoteNoDataToS'), 'Yes', '/salesteam.html', 1, '', '', 'No', 'style="width:477px"', 'w', 'textLeft')
                                $(".zz_load").show();
                                $(".output_price").hide();
                                $(".para_select").addClass("canPrice");
                                return false;
                            }
                            var selectList = data.attr.CoreTypeList;
                            Pcb.selectContent(selectList);
                            $(".choose-result").show();

                            $("html, body").animate({ scrollTop: $("#calcpriceresut").offset().top }, 1000);
                            //判断优品标品精品的数量
                            $(".sel-title .sel-item").each(function (i, dom) {
                                var resNum = $(dom).attr("data-type");
                                $(".sel-title [data-type='" + resNum + "'] .sel_result").text($("#fixed-table [data-type='" + resNum + "']").length);
                            })
                            //判断点击的参数是优品标品精品
                            var productType = $("[name='productType']:checked").val();
                            $(".sel-title .sel-item").removeClass("sel-active");
                            $(".sel-title [data-type='" + productType + "']").addClass("sel-active");
                            var sel_count = 0;
                            $(".sel_result").each((index, item) => {
                                sel_count += parseInt($(item).text());
                            })
                        } else {
                            // layer.msg(getLanguage('quoteNoDataToS'));
                            altNotice(getLanguage('quoteNoDataToS'), 'Yes', '/salesteam.html', 1, '', '', 'No', 'style="width:477px"', 'w', 'textLeft')
                            $(".zz_load").show();
                            $(".output_price").hide();
                            $(".para_select").addClass("canPrice");
                            $(".sidebar_hover_cont").show();
                            return false;
                        }
                    } else {
                        layer.msg(getLanguage('psCTService'));
                        $(".zz_load").show();
                        $(".sidebar_hover_cont").show();
                        return false;
                    }
                }
            });
        }

    },
    //计价结果
    newPcbOutputPrice: function (data) {
        if (data?.length == 0) {
            altNotice(getLanguage('quoteNoDataToS'), 'Yes', '/salesteam.html', 1, '', '', 'No', 'style="width:477px"', 'w', 'textLeft')
            return false;
        }
        ifQuote = true;
        $(".listTable .n").remove();
        $(".price_btn").hide();
        $(".ifQuote").show();
        $(".boxQuoteRightInfo .calc_btn").hide();
        $("#selShipS").show();
        var userId = $("#userId").val();
        var BoardType = $(".BoardType").val();
        var theNum = 0;
        var NumPCS = $("[name=Num]").val();
        if (BoardType == 'pcs') theNum = NumPCS;
        else theNum = $('[name=pinban_x]').val() * $('[name=pinban_y]').val() * NumPCS;
        var odmoPF0 = userId == 0 && theNum <= 20;
        let pf0 = odmoPF0 ? `<a class="tag" href="/account/login?returnurl=${window.location.href}" target="_blank">${getLanguage('quoteLogTGC')}</a>` : '';
        var html = '';
        pcbQuotePriceDetail = [];
        var otherWeight;
        for (let i in data) {
            var ts = data[i];
            var ct = ts.CoreType;
            var od = ts.PcbOrder;
            pcbQuotePriceDetail.push(od);
            var pcsNum = (ts.TotalMoney / od.PcsNum).toFixed(2);
            var ddSuper = ts.DeliveryDays <= 1 ? 'sp' : '';
            var deliveryDays = ts.DeliveryDays > 3 ? ts.DeliveryDays + ' days' : (ts.DeliveryDays * 24) + ' hours';
            otherWeight = od.TotalWeight;
            html += `
            <ul class="n" data-fr4tg="${ct.CoreTg}" data-brand="${ct.CoreType_}" data-fr4type="${ts.FR4Type}" data-PcbProType="${ct.ProType}" data-totalMoney="${ts.TotalMoney}" data-weight="${otherWeight}" data-coretypecode="${ct.CoreTypeCodes_}" data-QualityTag="${ts.QualityTag}">
                <li class="ck"><i></i></li>
                <li class="laminate ${ct.ULCertification === 1 ? 'ul' : ''}"><a href="${ct.Captions_}">${ct.EnCoreType.replace(/\//g,'<br>')}</a></li>
                <li><span>${ct.TgType}</span></li>
                <li class="cy ${ddSuper}"><span>${deliveryDays}</span></li>
                <li><span>${pcsNum}/pc</span></li>
                <li class="cost odmn"><span>$${ts.TotalMoney}${pf0}</span></li>
            </ul>
            `;
        }
        $(".boxQuoteRightInfo .noteFPIS").remove();
        $(".ifQuotePcba").after(`<span class="noteFPIS">${getLanguage('fpistor')}</span>`);
        $(".listTable.pcb").append(html);
        $(".listTable.pcb ul.n").hover(function () {
            $(this).addClass("hover").siblings().removeClass('hover');
            if (window.location.host == 'ww2.allpcb.com' || window.location.host.indexOf('115.236') >= 0) {
                Pcb.showPcbMarketPrice($(this), $(this).index());
            }
        }, function () {
            $(".boxMarketPrice").remove();
        })
        if (odmoPF0) $(".listTable.pcb ul.n:nth-child(2)").addClass("hover");
        $(".boxQuoteRightInfo .totalCost dl dd.ss").attr('data-weight', otherWeight);
        Pcb.getShippingCost(cookieCountryId, otherWeight);
        if (ifQuotePcba) {
            var pcbaParams = Pcb.getQuotePcbaInfo();
            $.getJSON("/ashx/smt.ashx?act=GetDelieveryPrice&t=" + new Date().getTime(), pcbaParams, function (data) {
                var list = data.attr;
                if (list != undefined && list != null && list.length > 0) {
                    var html = '';
                    // var pcbaNUM = $("[for-group='pcba'] [name='ProductNum']").val();
                    for (var i = 0; i < list.length; i++) {
                        var item = list[i];
                        if (i > 3) continue;
                        html += `
                                <ul class="n" data-totalmoney="${item.DiscountPrice}" data-pcs="${item.ProductNum}">
                                    <li class="ck"><i></i></li>
                                    <li>${item.DeliveryDaysStr}<a class="item-tips ml5 rel" style="z-index:1;" href="https://www.allpcb.com/news/6-1-start-a-pcb-assembly-new-chapter_79.html" target="_blank">
                                            <span class="wen_tip optiontip-ico" item-tips="${getLanguage('pcbaQTD')}" id="tipsundefined">
                                                <i class="tipscon" tipshtml="true" style="width: 400px; overflow-wrap: break-word; word-break: normal; display: none;">${getLanguage('pcbaQTD')}</i>
                                            </span>
                                    </a></li>
                                    <li>$${(item.DiscountPrice / item.ProductNum).toFixed(2)}/pc</li>
                                    <li class="cy">${item.ProductNum}pcs</li>
                                    <li class="cost">$${item.DiscountPrice}</li>
                                </ul>`;
                    }
                    $(".listTable.pcba").append(html);
                }
            });
        }
    },
    showPcbMarketPrice: function (e, index) {
        var detail = pcbQuotePriceDetail[index - 1];
        $("body").append(`
            <div class="boxMarketPrice">
                <ul>
                    <li><span>板材费</span><p><span>￥</span><span>${detail.JdbCostBoard}</span></p></li>
                    <li><span>工程费</span><p><span>￥</span><span>${detail.JdbCostCostruction}</span></p></li>
                    <li><span>菲林费</span><p><span>￥</span><span>${detail.JdbCostFilm}</span></p></li>
                    <li><span>喷镀费</span><p><span>￥</span><span>${detail.JdbCostMetallize}</span></p></li>
                    <li><span>颜色费</span><p><span>￥</span><span>${detail.JdbCostColor}</span></p></li>
                    <li><span>拼版费</span><p><span>￥</span><span>${detail.JdbCostPinBan}</span></p></li>
                    <li><span>工艺费</span><p><span>￥</span><span>${detail.JdbCostJiaJi}</span></p></li>
                    <li><span>成型费</span><p><span>￥</span><span>${detail.JdbCostShap}</span></p></li>
                    <li><span>其他费</span><p><span>￥</span><span>${detail.JdbCostOther}</span></p></li>
                    <li><span>测试费</span><p><span>￥</span><span>${detail.JdbCostTest}</span></p></li>
                </ul>
            </div>
        `);
        $(".boxMarketPrice").css({ 'display': 'block', 'width': e.outerWidth() + 'px', 'top': (e.offset().top + e.outerHeight()) + 'px', 'left': e.offset().left + 'px' })
    },
    //清除计价结果
    clearPrice: function () {
        $(".listTable .n").remove();
        $(".totalCost dd").text('--');
        ifQuote = false;
        $("#selShipS").hide();
        $(".ifQuote").hide();
        $(".price_btn").show();
        $(".boxQuoteRightInfo .calc_btn").show();
    },
    //获取快递公司列表
    getShippingCost: function (cid, weight) {
        $.getJSON("/ashx/common.ashx?act=CalcShipList", { cid: cid, otherweight: weight }, function (data) {
            Pcb.BuildShipHtml(data)
        });
    },
    //选择国家
    selectSC: function () {
        var cid = $("#shippingCost").attr('dataId');
        var weight = $(".boxQuoteRightInfo .totalCost dl dd.ss").attr('data-weight');
        if (!cid) return false;
        if (weight && weight > 0) {
            Pcb.getShippingCost(cid, weight);
        }
    },
    //解析物流列表
    BuildShipHtml: function (data) {
        var html;
        $("#selShipS").html('');
        if (data.attr.length > 0) {
            var first = data.attr[0];
            for (var i in data.attr) {
                var ts = data.attr[i];
                html += `<option value="${ts.ShipId}" data-days="${ts.ShipDays}" data-ShipPrice="${ts.ShipPrice}" data-Weight="${ts.Weight}" data-Pic="${ts.Pic}">${ts.ShipName}</option>`;
            }
            Pcb.showShipInfo(first.ShipDays, first.Weight, first.ShipPrice, first.Pic)
        } else html = `<option value="0" style="display: none;">Choose express</option>`;
        $("#selShipS").html(html);
        var aShipNo = $.cookie('AllpcbShipNo');
        if(aShipNo){
            $("#selShipS option").each(function (index) {
                if (aShipNo == $(this).val()){
                    $("#selShipS")[0].selectedIndex = index;
                    Pcb.selShipping($('#selShipS'))
                }
            })
        }
        Pcb.newSumPrice();
    },
    //选择物流信息
    selShipping: function (e) {
        var sel = $("#" + e.attr('id') + " option:selected");
        Pcb.showShipInfo(sel.attr('data-days'), sel.attr('data-Weight'), sel.attr('data-ShipPrice'), sel.attr('data-Pic'));
        Pcb.newSumPrice();
    },
    //显示物流信息
    showShipInfo: function (days, weight, price, Pic) {
        var shipPic = Pic ? `<i class="expresslogo" style="background-image: url('/img/images/country/${Pic}')"></i>` : '';
        $(".boxSelSC .info .detail").html(`${shipPic} Shipping info: <b>${days || '*'} days   Wt: ${parseFloat(weight).toFixed(2)} kg</b>　Shipping cost: <b class="w">$${price}</b>`)
        $(".boxQuoteRightInfo .totalCost .ss").html(`$${price}`);
    },
    //计算总价
    newSumPrice: function () {
        var total = 0;
        var pcbCost = 0;
        $(".listTable .n.on").each(function () {
            pcbCost = pcbCost + parseFloat($(this).attr('data-totalmoney'));
        })
        total = parseFloat($("#selShipS option:selected").attr('data-shipprice')) + pcbCost;
        if (pcbCost == 0) {
            total = pcbCost = '--';
        } else {
            total = '$' + total.toFixed(2)
            pcbCost = '$' + pcbCost.toFixed(2)
        }
        $(".boxQuoteRightInfo .totalCost .cs").html(`${pcbCost}`);
        $(".boxQuoteRightInfo .totalCost .ts").html(`${total}`);
    },
    //获取PCBA计价参数
    getQuotePcbaInfo: function () {
        var formPcba = Tools.UrlToJsonParams($("#smtorderForm").serialize());
        var proNum = $('[name=ProductNum]').val();
        var pcbaParams = {
            "PcbSizeY": $("[name=Fee-BoardHeight]").val(),
            "PcbSizeX": $("[name=Fee-BoardWidth]").val(),
            "ProductNum": proNum,
            "PcbaPackageType": "2",
            "FirstSure": "0",
            // "PcbOrderNo": "",
            "ProductPCBType": "1",
            "XrayTestNum": "",
            "IsBurn": "true",
            "IsPcbaSubShipment": "false",
            "IsFuncTest": "false",
            "IsBrushThreeLacquer": "0",
            "PadLineKathy": "0"
        }
        return Object.assign(formPcba, pcbaParams)
    },
    //表格数据渲染   LevelTag  0 标品 1 优品 2 精品 3 普品
    paraRend: function (info, PcbOrder, FR4Type, Num, DeliveryDays, FR4Tg) {
        //'<br/>' + info[i].PcbOrderOld.OrderMoney +
        var fixedTableHtml = "";
        var changeTableHtml = "";
        $("#fixed-table tbody").html("");
        $("#change-table tbody").html("");
        var priceArr = [{ "TotalMoney": "50", "DeliveryType": "24小时", "isqian": 0, "priceDetail": { "OrderMoney": "20", "JdbCostMetallize": "10", "otherMoney": "10" }, "FreeCouponId": "-1", "StepPriceDetail": { "JdbCostBoard": 147, "JdbCostCostruction": 50, "JdbCostFilm": 0, "JdbCostMetallize": 1.5, "JdbCostOther": 0.5, "JdbCostTest": 0, "HoleMoney": 0, "JdbCostPinBan": 0, "JdbCostJiaJi": 0, "JdbCostColor": 0, "JdbCostShap": 0, "RoutLengthMoney": 0 }, "StepTag": 0 }, { "TotalMoney": "30", "isqian": 0, "DeliveryType": "56小时", "priceDetail": { "OrderMoney": "20", "JdbCostMetallize": "10", "otherMoney": "10" }, "FreeCouponId": 0, "StepPriceDetail": { "JdbCostBoard": 147, "JdbCostCostruction": 50, "JdbCostFilm": 0, "JdbCostMetallize": 1.5, "JdbCostOther": 0.5, "JdbCostTest": 0, "HoleMoney": 0, "JdbCostPinBan": 0, "JdbCostJiaJi": 0, "JdbCostColor": 0, "JdbCostShap": 0, "RoutLengthMoney": 0 }, "StepTag": 1 }, { "TotalMoney": "24", "DeliveryType": "72小时", "isqian": 0, "priceDetail": { "OrderMoney": "20", "JdbCostMetallize": "10", "otherMoney": "10" }, "FreeCouponId": 0, "StepPriceDetail": { "JdbCostBoard": 147, "JdbCostCostruction": 50, "JdbCostFilm": 0, "JdbCostMetallize": 1.5, "JdbCostOther": 0.5, "JdbCostTest": 0, "HoleMoney": 0, "JdbCostPinBan": 0, "JdbCostJiaJi": 0, "JdbCostColor": 0, "JdbCostShap": 0, "RoutLengthMoney": 0 }, "StepTag": 1 }, { "TotalMoney": "20", "DeliveryType": "76小时", "isqian": 1, "priceDetail": { "OrderMoney": "20", "JdbCostMetallize": "10", "otherMoney": "10" }, "StepTag": 4, "FreeCouponId": -1, "StepPriceDetail": { "JdbCostBoard": 147, "JdbCostCostruction": 50, "JdbCostFilm": 0, "JdbCostMetallize": 1.5, "JdbCostOther": 0.5, "JdbCostTest": 0, "HoleMoney": 0, "JdbCostPinBan": 0, "JdbCostJiaJi": 0, "JdbCostColor": 0, "JdbCostShap": 0, "RoutLengthMoney": 0 } }]
        if (info.length > 0) {
            $(".choose-result span").text(info.length);
            for (var i = 0; i < info.length; i++) {
                var tableName = info[i].PcbOrder;
                var coreType = info[i].CoreType;
                //   var totalWeight = tableName.TotalWeight;
                var suppliers = info[i].SupplierList;
                //var oldPcb = info[i].PcbOrderOld;
                var supllyCode = info[i].SupplierCodes;
                if (tableName.OrgOrderMoney == null || tableName.OrgOrderMoney == 'undefind') {
                    var OrgOrderMoney = '';
                } else {
                    var OrgOrderMoney = tableName.OrgOrderMoney.toFixed(2);
                }
                //单片价格
                //    var pcsnumPrice = (tableName.OrderMoney / tableName.PcsNum).toFixed(2);
                var priceArr = info[i].CalcDelvieryItems;
                var priceStr = jqStr = addcartStr = pcsnumStr = Captions_Text = '';
                for (var k = 0; k < priceArr.length; k++) {
                    var priceDetail = priceArr[k].StepPriceDetail;
                    // if (priceArr[k].DeliveryDays >= 10) {
                    //     stepDeliveryDays = (priceArr[k].DeliveryDays - 3) + "-" + priceArr[k].DeliveryDays;
                    // } else {
                    stepDeliveryDays = priceArr[k].DeliveryDays
                    // }
                    // if (info[i].DeliveryDays >= 10) {
                    //     trDeliveryDays = (info[i].DeliveryDays - 3) + "-" + info[i].DeliveryDays
                    // } else {
                    trDeliveryDays = info[i].DeliveryDays;
                    // }
                    //标识有铅无铅  HASL with Free 无铅   HASL with Lead 有铅
                    var havePlumbum = priceArr[k].SuchSurfaceType == "1" ? 'HASL with Lead' : (priceArr[k].SuchSurfaceType == "2" ? 'HASL Lead Free' : $("[name=SurfaceFinish]:checked").parent().text());
                    //判断是否免费打样
                    //   console.log(priceArr[k].CanUseFreeId);
                    if (priceArr[k].CanUseFreeId == '-1' || priceArr[k].CanUseFreeId > 0) {
                        priceStr += '<div class="OrderMoneybox rel"><div class="isQian inline-block mr10">HASL lead free</div><div class="span-OrderMoney" style="display:none" TotalMoney="' + priceArr[k].TotalMoney + '">$' + priceArr[k].TotalMoney + '</div><div class="inline-block cl-red" style="margin-left:5px">free</div>' +
                            '<span class="TotalAmount" style="float: right;color:#f90;font-weight:bold; min-width:90px; text-align:center;">$' + info[i].TotalAmount + '</span><div class="market-price undis">' +
                            '<ul class="clearfix">' +
                            ' <li><span class="market-price-title">板材费</span><span class="free-urgent-box dis"><span>￥</span>' +
                            '<span class="fixed2 market-price-item" data-price-item="AddCart-JdbCostBoard">' + priceDetail.JdbCostBoard + '</span></span></li>' +
                            '<li><span class="market-price-title">工程费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostCostruction">' + priceDetail.JdbCostCostruction + '</span></span></li><li><span class="market-price-title">菲林费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostFilm">' + priceDetail.JdbCostFilm + '</span></span></li><li><span class="market-price-title">喷镀费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostMetallize">' + priceDetail.JdbCostMetallize + '</span></span></li><li><span class="market-price-title">颜色费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostColor">' + priceDetail.JdbCostColor + '</span></span></li><li><span class="market-price-title">拼版费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostPinBan">' + priceDetail.JdbCostPinBan + '</span></span></li><li><span class="market-price-title">工艺费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostJiaJi">' + priceDetail.JdbCostJiaJi + '</span></span></li><li><span class="market-price-title">成型费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostShap">' + priceDetail.JdbCostShap + '</span></span></li><li><span class="market-price-title">其他费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostOther">' + priceDetail.JdbCostOther + '</span></span></li><li><span class="market-price-title">测试费</span><div class="clearfix market-price-box" style="vertical-align:bottom;"><span><span class="ceshi_m">￥</span><span class="fixed2 market-price-item" data-price-item="AddCart-JdbCostTest">' + priceDetail.JdbCostTest + '</span></span></div></li></ul></div></div>';
                        addcartStr += '<div class="cartbox" style="margin-top:12px;" data-plumbum="' + priceArr[k].SuchSurfaceType + '" data-tag="' + priceArr[k].StepTag + '" data-index="' + k + '"><span class="cart_item Newcart_item"  data-totalWeight="' + tableName.TotalWeight + '" data-code="' + supllyCode + '" data-pcbprotype="' + tableName.PcbProType + '">Order Now</span></div>';
                        pcsnumStr += "<div class='pcsnumbox'><span class='cl-red'> 0.00</span>/pcs</div>";
                    }
                    else {
                        priceStr += '<div class="OrderMoneybox rel"><div class="isQian inline-block mr10">' + havePlumbum + '</div><div class="odmn inline-block" TotalMoney="' + priceArr[k].TotalMoney + '"><span class="span-OrderMoney">$' + priceArr[k].TotalMoney + '</span></div>' +
                            '<span class="TotalAmount" style="float: right;color:#f90;font-weight:bold; min-width:90px; text-align:center;">$' + info[i].TotalAmount + '</span><div class="market-price undis">' +
                            '<ul class="clearfix">' +
                            ' <li><span class="market-price-title">总费用</span><span class="free-urgent-box dis"><span>￥</span>' +
                            '<span class="fixed2 market-price-item" data-price-item="AddCart-JdbCostBoard">' + tableName.JdbMoney + '</span></span></li>' +
                            ' <li><span class="market-price-title">板材费</span><span class="free-urgent-box dis"><span>￥</span>' +
                            '<span class="fixed2 market-price-item" data-price-item="AddCart-JdbCostBoard">' + priceDetail.JdbCostBoard + '</span></span></li>' +
                            '<li><span class="market-price-title">工程费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostCostruction">' + priceDetail.JdbCostCostruction + '</span></span></li><li><span class="market-price-title">菲林费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostFilm">' + priceDetail.JdbCostFilm + '</span></span></li><li><span class="market-price-title">喷镀费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostMetallize">' + priceDetail.JdbCostMetallize + '</span></span></li><li><span class="market-price-title">颜色费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostColor">' + priceDetail.JdbCostColor + '</span></span></li><li><span class="market-price-title">拼版费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostPinBan">' + priceDetail.JdbCostPinBan + '</span></span></li><li><span class="market-price-title">工艺费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostJiaJi">' + priceDetail.JdbCostJiaJi + '</span></span></li><li><span class="market-price-title">成型费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostShap">' + priceDetail.JdbCostShap + '</span></span></li><li><span class="market-price-title">其他费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostOther">' + priceDetail.JdbCostOther + '</span></span></li><li><span class="market-price-title">测试费</span><div class="clearfix market-price-box" style="vertical-align:bottom;"><span><span class="ceshi_m">￥</span><span class="fixed2 market-price-item" data-price-item="AddCart-JdbCostTest">' + priceDetail.JdbCostTest + '</span></span></div></li></ul></div></div>';
                        addcartStr += '<div class="cartbox" style="margin-top:12px;" data-plumbum="' + priceArr[k].SuchSurfaceType + '" data-tag="' + priceArr[k].StepTag + '" data-index="' + k + '"><span class="cart_item"  data-totalWeight="' + tableName.TotalWeight + '" data-code="' + supllyCode + '" data-pcbprotype="' + tableName.PcbProType + '"><i class="ico-cart"></i>Add to Cart</span></div>';
                        //单片价格
                        pcsnumStr += "<div class='pcsnumbox'>" + (priceArr[k].TotalMoney / tableName.PcsNum).toFixed(2) + "/pcs</div>";

                    }

                    //加急
                    if (priceArr[k].StepType == "1") {
                        jqStr += '<div class="jqbox cl-f90" data-DeliveryDays="' + stepDeliveryDays + '">' + stepDeliveryDays + 'D <input name="AddCart-DeliveryDate" type="hidden" value="' + priceArr[k].DeliveryDate + '" /><img src="/img/img/onlineNew/fast.png" class="delivery_img" ></div>';

                    }
                    else if (priceArr[k].StepType == "2") {
                        jqStr += '<div class="jqbox cl-f90" data-DeliveryDays="' + stepDeliveryDays + '">' + stepDeliveryDays + 'D <input name="AddCart-DeliveryDate" type="hidden" value="' + priceArr[k].DeliveryDate + '" /><img src="/img/img/onlineNew/rapidly.png" class="delivery_img" ></div>';

                    }
                    else {
                        jqStr += '<div class="jqbox cl-f90" data-DeliveryDays="' + stepDeliveryDays + '">' + stepDeliveryDays + 'D <input name="AddCart-DeliveryDate" type="hidden" value="' + priceArr[k].DeliveryDate + '" /><img src="/img/img/onlineNew/normal.png" class="delivery_img" ></div>';
                    }
                }
                var brandType = "";
                var ulImg = '';
                if (info[i].CoreType.ULCertification == 0) {
                    ulImg = '';
                } else {
                    ulImg = '<img class="ml5" src="/img/img/onlineNew/ul.png" style="min-height: 20px;min-width:20px">';
                }
                if (info[i].CoreType.Captions_ != null && info[i].CoreType.Captions_ != "") { //是否有无地址
                    Captions_Text = '<a class="ml10" href=' + info[i].CoreType.Captions_ + ' target="_blank" title="PCB Specification File"><img src="/img/img/onlineNew/pdf.png"><span class="ml10">' + coreType.EnCoreType + '</span>' + ulImg + '</a>'
                } else {
                    Captions_Text = '<span style="display:inline-block;margin-left:6px">' + coreType.EnCoreType + '</span>' + ulImg;
                }
                fixedTableHtml += '<tr class="xgpp-table-cont" IsHidden="' + info[i].IsHidden + '" data-type="' + info[i].QualityTag + '">' +
                    '<td class="table-FR4Type"><img src="/img/img/onlineNew/mark' + info[i].QualityTag + '.png" style="display: inline-block;max-width:89px;" >' + Captions_Text + '</a></td>' +
                    '<td class="table-OrderMoney  f14 rel" data-OrgOrderMoney="' + OrgOrderMoney + '">' + priceStr + '<div class="market-price undis"><ul class="clearfix"><li><span class="market-price-title">板材费</span><span class="free-urgent-box dis"><span>￥</span><span class="fixed2 market-price-item" data-price-item="AddCart-JdbCostBoard">' + tableName.JdbCostBoard + '</span></span></li><li><span class="market-price-title">工程费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostCostruction">' + tableName.JdbCostCostruction + '</span></span></li><li><span class="market-price-title">菲林费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostFilm">' + tableName.JdbCostFilm + '</span></span></li><li><span class="market-price-title">喷镀费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostMetallize">' + tableName.JdbCostMetallize + '</span></span></li><li><span class="market-price-title">颜色费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostColor">' + tableName.JdbCostColor + '</span></span></li><li><span class="market-price-title">拼版费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostPinBan">' + tableName.JdbCostPinBan + '</span></span></li><li><span class="market-price-title">工艺费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostJiaJi">' + tableName.JdbCostJiaJi + '</span></span></li><li><span class="market-price-title">成型费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostShap">' + tableName.JdbCostShap + '</span></span></li><li><span class="market-price-title">其他费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostOther">' + tableName.JdbCostOther + '</span></span></li><li><span class="market-price-title">测试费</span><div class="clearfix market-price-box" style="vertical-align:bottom;"><span><span class="ceshi_m">￥</span><span class="fixed2 market-price-item" data-price-item="AddCart-JdbCostTest">' + tableName.JdbCostTest + '</span></span></div></li></ul></div>' +
                    '<td>' + pcsnumStr + '</td>' +
                    '<td class="table-DeliveryDays" data-DeliveryDays=' + trDeliveryDays + ' data-status="on" ><div class="td_box_style">' + jqStr + '</div></td><td><div class="td_box_style"><input name="AddCart-FR4Type" type="hidden" value=' + tableName.FR4Type + ' /><input name="AddCart-TotalWeight" type="hidden" value=' + tableName.TotalWeight + ' /><input name="AddCart-FR4Tg" type="hidden" value=' + tableName.FR4Tg + ' /><input name="AddCart-BoardBrand" type="hidden" value="' + tableName.BoardBrand + '" /><input name="AddCart-DeliveryDate" type="hidden" value="' + tableName.DeliveryDate + '" /><input name="AddCart-JdbCostBoard" type="hidden" value="' + tableName.JdbCostBoard + '" /><input name="AddCart-JdbCostCostruction" type="hidden" value="' + tableName.JdbCostCostruction + '" /><input name="AddCart-JdbCostFilm" type="hidden" value="' + tableName.JdbCostFilm + '" /><input name="AddCart-JdbCostMetallize" type="hidden" value="' + tableName.JdbCostMetallize + '" /><input name="AddCart-JdbCostColor" type="hidden" value="' + tableName.JdbCostColor + '" /><input name="AddCart-JdbCostPinBan" type="hidden" value="' + tableName.JdbCostPinBan + '" /><input name="AddCart-JdbCostJiaJi" type="hidden" value="' + tableName.JdbCostJiaJi + '" /><input name="AddCart-JdbCostShap" type="hidden" value="' + tableName.JdbCostShap + '" /><input name="AddCart-JdbCostOther" type="hidden" value="' + tableName.JdbCostOther + '" /><input name="AddCart-JdbCostTest" type="hidden" value="' + tableName.JdbCostTest + '" /><input name="AddCart-originalJdbTestMoney" type="hidden" value="' + tableName.originalJdbTestMoney + '" /><input name="AddCart-CoreTypeCode" type="hidden" value="' + info[i].CoreType.CoreTypeCodes_ + '" />' + addcartStr + '</div></td></tr>'


                var changeTableTd = "";
                $(".change-table th").each(function (j, elem) {
                    var selecVal = $(elem).attr("data_name");
                    changeTableTd += '<td data_name="' + selecVal + '"></td>'

                })
                changeTableHtml += '<tr class="xgpp-table-cont" IsHidden="' + info[i].IsHidden + '" data-type="' + info[i].QualityTag + '">' + changeTableTd + '</tr>'
            }

            $("#fixed-table tbody").append(fixedTableHtml);
            $("#change-table tbody").append(changeTableHtml);

            // debugger;
            $(".change-table [data_name='DielectricConstant']").hide();
            $(".change-table [data_name='DissipationFactor']").hide();
            $(".change-table [data_name='VolumeResistance']").hide();

            //价格明细
            $(".table-OrderMoney .market-price li").each(function (o, dom) {
                if ($(dom).find(".market-price-item").text() == 0) {
                    $(dom).hide();
                }
            })

            $(".table-OrderMoney .OrderMoneybox").hover(function () {
                // $(this).find(".market-price").show();
                $(this).find(".market-price").width($(this).find(".market-price li").eq(0).width() * $(this).find(".market-price li:visible").length);
                $(this).find(".market-price").css("top", $(this).height() / 2 + 15);
                totalMoney = $(this).find(".span-OrderMoney").text();
                totalMoney = totalMoney.split("￥");
                //  Pcb.boardDeteil($(this), totalMoney);
                $(this).find(".market-price").width($(this).find(".market-price li").eq(0).width() * $(this).find(".market-price li:visible").length);
                $(this).find(".market-price").css("top", $(this).height() / 2 + 30)
            }, function () {
                //  $(".table-OrderMoney .market-price").hide();
            })
            //给td赋值
            $(".change-table .xgpp-table-cont").each(function (m, trElem) {
                var chageTable = info[m].CoreType;
                $(trElem).find("td").each(function (n, tdElem) {
                    var tdDataName = $(tdElem).attr("data_name");
                    if (tdDataName != undefined) {
                        var tdTxt = chageTable[tdDataName];
                        if (tdTxt == false) {
                            tdTxt = "No";
                        } else if (tdTxt == "" || tdTxt == null) {
                            tdTxt = "-"
                        }
                        else if (tdTxt == true) {
                            tdTxt = "Yes";
                        }
                        $(tdElem).text(tdTxt);
                    }
                })
            })
            $(".table-no-content").hide();
        } else {
            $(".table-no-content").show();
        }
        //相关匹配
        $(".t_right").width($(".xgpp").width() - 60 - $(".t_left").width() - 1)
        fnInitChange($(".coordination-table"));
        $('.fl-scrolls').scroll(function (e) {
            $('.search-table-wrapper').scrollLeft($(this).scrollLeft());
        });
        changeScroll();
        fnFixed();
        var type = $('.xgpp .sel-active').attr('data-type');
        // selP2(type);
        fnInitChange($(".coordination-table"));

        checkFree()

    },
    //传参数
    transferPara: function (fr4type, fr4tg, boardbrand, pcbProType, stepTag, CoreTypeCode) {
        var param = $("#fm1").serializeArray();
        var parm = {}
        for (var i = 0; i < param.length; i++) {
            parm[param[i].name] = param[i].value;
        }
        parm.QuoteStatus = 1;
        parm["Fee-StepTag"] = stepTag;
        parm["Fee-FR4Type"] = fr4type;
        // parm["Fee-Fr4Tg"] = fr4tg;
        parm["Fee-BoardBrand"] = boardbrand;
        parm["Fee-PcbProType"] = pcbProType;
        parm["Fee-IsHighQuality"] = $("#Fee-IsHighQuality").val();
        parm["Fee-ProcessEdges"] = $("[name=processeEdge_x]:checked").val() + ":" + $("[name=processeEdge_y]").val();
        if ($("#gerberremark1").val() == undefined || $("#gerberremark1").val() == null && $("#gerberremark2").val() == undefined || $("#gerberremark2").val() == null) {

        } else {
            parm["Fee-GerberRemark"] = escape($("#gerberremark1").val()) + "" + escape($("#gerberremark2").val());

        }

        parm["IsAddCart"] = 1;
        parm["Fee-CoreTypeCode"] = CoreTypeCode;


        return parm;
    },
    //添加购物车
    AddCart: function (fr4type, fr4tg, boardbrand, pcbProType, stepTag, CoreTypeCode) {
        if (!Pcb.ParmValid()) { return false; }
        var parm = {};
        parm = Pcb.transferPara(fr4type, fr4tg, boardbrand, pcbProType, stepTag, CoreTypeCode)
        var isFlag = true;
        var note = "";
        if ($("[name=Note]").val() != "")
            note = "[Other]:" + $("[name=Note]").val().replace("|", "");
        var borderlayerStr = [];
        if (boardLayer > 2) {
            if ($(".list-wrap li").eq(0).hasClass("active")) {
                var boardLayer = $("[name=BoardLayers]:checked").val();
                var _layrerTrue = true;
                $("[name=layersort]").each(function (i, dom) {
                    var va = $(dom).val();
                    if (va == "") {
                        _layrerTrue = false;
                        layer.msg('Please fill in the order layers of the multilayer board or select the one of the latter two options.', { time: 2000 });
                        return false;
                    }
                    borderlayerStr.push(va);
                });
                $("#Fee-borderLayer").val(borderlayerStr);
                if (_layrerTrue) {
                    layer.closeAll();
                } else {
                    return false;
                }
            } else {
                $("#Fee-borderLayer").val("");
                if ($(".list-wrap li").eq(0).hasClass("active")) {
                    $("#Fee-borderLayer").val("Contact customer service to confirm")
                } else if ($(".list-wrap li").eq(1).hasClass("active")) {
                    $("#Fee-borderLayer").val("Stated in the file")
                }
            }
        }
        if ($("#Fee-borderLayer").val() != "") { note += "|[层序]:" + $("#Fee-borderLayer").val(); }
        Pcb.HideSuggestImpositionInformation();
        // var SFLval = parm['Fee-SpecifiesLamination'];
        // parm['Fee-SpecifiesLamination']=SFLval==0?'':SFLval;
        if (isFlag) {
            parm["Fee-Note"] = escape(note)
            var free = $('.order-free-box input[name="Free"]').val();
            parm["Fee-Free"] = free;
            $(".cart_item").attr("disabled", "disabled");
            var SmtOrderNo = $("#SmtOrderNo").val();
            parm["Fee-SmtOrderNo"] = SmtOrderNo;
            parm["act"] = "AddCart";
            $.ajax({
                url: '/ashx/SuperiorPcbQuote.ashx?',
                dataType: 'json',
                data: parm,
                type: 'post',
                beforeSend: function () {
                    //加载层-默认风格
                    $(".loader").show();
                    $(".loader p").hide();
                },
                success: function (data) {
                    if (data.success) {
                        layer.open({
                            type: 1,
                            shade: 0.3,
                            closeBtn: 1,
                            shadeClose: true,
                            area: '370px',
                            content: $('.goToCar') //捕获的元素
                        });
                        //  SidebarCarListLoad();
                        $(".cart_item").removeAttr("disabled", "disabled");
                        //layer.closeAll();
                    }
                    else {
                        layer.open({
                            type: 1,
                            shade: 0.3,
                            closeBtn: 1,
                            shadeClose: true,
                            area: '300px',
                            content: $('.addFail') //捕获的元素
                        });
                        $(".cart_item").removeAttr("disabled", "disabled");
                        //layer.closeAll();
                    }
                    $(".loader").hide();
                }
            });
        }
    },
    //跟面积有关的事件
    areaEvent: function () {
        Pcb.leadNum();
    },
    //有铅无铅关于数量的关系
    leadNum: function () {
        var px = $("[name=pinban_x]").val();
        var py = $("[name=pinban_y]").val();
        //9.3控制打叉板显示隐藏
        if (px == "1" && py == "1") { //打叉板默认为 是 否不可选
            Pcb.QutoliEv("[name='AcceptCrossed'][value='0']", 2);
            Pcb.Checked("AcceptCrossed", "1");
        } else {
            Pcb.QutoliEv("[name='AcceptCrossed'][value='0']", 3);
        }
    },
    //面积计算
    CalcArea: function (l, w, n, t, p1, p2, b1, b2) {
        Pcb.BoardTypeData();
        //针对捷配代拼订单且分割方式包含锣槽的订单增加额外尺寸，单边2mm
        var vCut = $("[name=VCut]:checked").val();
        var m2 = "";
        l = parseFloat(l);
        w = parseFloat(w);
        p1 = parseFloat(p1);
        p2 = parseFloat(p2);
        b2 = parseFloat(b2);
        if (t == "jpset") {
            var newsets = n
            //b2 = b2 / 10;
            var caoX = $("[name=cao_y]").val(), caoY = $("[name=cao_y]").val();
            if (vCut.indexOf("luocao") >= 0) {
                caoX = $("[name=cao_x]").val();
                caoY = $("[name=cao_y]").val();
                caoX = parseFloat(caoX).toFixed(1);
                caoY = parseFloat(caoY).toFixed(1);
                if (b1 == "updown") {
                    l = l * p1 + (p1 + 1) * caoX + b2 * 2;
                    w = w * p2 + (p2 - 1) * caoY;
                } else if (b1 == "leftright") {
                    l = l * p1 + (p1 - 1) * caoX;
                    w = w * p2 + (p2 + 1) * caoY + b2 * 2;
                } else if (b1 == "both") {
                    l = l * p1 + (p1 + 1) * caoX + b2 * 2;
                    w = w * p2 + (p2 + 1) * caoY + b2 * 2;
                } else if (b1 == "none") {
                    l = l * p1 + (p1 - 1) * caoX;
                    w = w * p2 + (p2 - 1) * caoY;
                }


            } else {
                if (b1 == "updown") {
                    l = l * p1 + b2 * 2;
                    w = w * p2;
                } else if (b1 == "leftright") {
                    l = l * p1;
                    w = w * p2 + b2 * 2;
                } else if (b1 == "both") {
                    l = l * p1 + b2 * 2;
                    w = w * p2 + b2 * 2;
                } else if (b1 == "none") {
                    l = l * p1;
                    w = w * p2;
                }
            }
            m2 = (l * w * newsets) / 1000000;
        } else {
            m2 = (l * w * n) / 1000000;
        }
        m2 = m2.toFixed(4)
        return m2;
    },
    //隐藏示例图
    HideSuggestImpositionInformation: function () {
        $("#informationpinban").css({ "z-index": "-999", "opacity": "0" });
        $(".suggest-masklayer").hide();
        return false;
    },
    //精品PCB
    superior_quote: function (name) {
        var BoardThickness = $("[name='BoardThickness']:checked").val();  //板子厚度
        var BoardLayers = $("[name='BoardLayers']:checked").val();  //板子层数
        var FR4Type = $("[name='FR4Type']:checked").val();  //板型
        var CopperThickness = $("[name='CopperThickness']:checked").val();  //外铜
        var InnerCopperThickness = $("[name='InnerCopperThickness']:checked").val();  //内铜
        var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());

        if (HtmlLang != 'ko-kr') Pcb.QutoliEv('[name=BoardLayers][value=1]', 1);

        Pcb.QutoliEv("[name=FR4Tg][value=tg130],[name=FR4Tg][value=tg140]", 1);
        if (BoardLayers == 1) {
            Pcb.Checked('HalfHole', '0');
            $(".halfHole").hide();
            // if (name === 'BoardLayers') {
            //     Pcb.QutoliEv('[name=TestReport]', 5);
            // }
            // Pcb.QutoliEv('[name=TestReport][value=EPTR],[name=TestReport][value=WQ]', 4);
        } else if (BoardLayers > 1) {
            $(".halfHole").show();
            // Pcb.QutoliEv('[name=TestReport][value=EPTR],[name=TestReport][value=WQ],[name=TestReport][value=FPIR],[name=TestReport][value=MSR],[name=TestReport][value=CTTR],[name=TestReport][value=WTR],[name=TestReport][value=TSTR]', 4);
        }

        let TestReport_arry_tit = [];
        let TestReport_arry_key = [];
        $("[name='TestReport']:checked").each(function (index) {
            TestReport_arry_tit[index] = $(this).attr('data-tit');
            TestReport_arry_key[index] = $(this).val();
        });
        $(".Fee-TestReport em").text(TestReport_arry_tit);
        $("[name='Fee-TestReport']").val(TestReport_arry_key);

        //基本信息规则 -> Pcb.basicProRule

        //表面处理
        if (BoardLayers == 1 && name == 'BoardLayers') {
            Pcb.QutoliEv("[name=SurfaceFinish][value=immersionsilver],[name=SurfaceFinish][value=immersiontin],[name=SurfaceFinish][value='immersiongold2u+osp'],[name=FR4Tg][value=tg170]", 2);
        } else if (name == 'BoardLayers') {
            Pcb.QutoliEv("[name=SurfaceFinish][value=immersionsilver],[name=SurfaceFinish][value=immersiontin],[name=SurfaceFinish][value='immersiongold2u+osp']", 3);
        }
        //板材类型
        if (name == 'BoardLayers' || name == 'FR4Type') {
            Pcb.QutoliEv("[name=FR4Tg]", 2);
            if (BoardLayers == 1) {
                if (FR4Type == 'fr4') {//单面板生益板材TG值必须为tg140或tg150
                    Pcb.QutoliEv("[name=FR4Tg][value=tg150]", 3);
                    Pcb.Checked('FR4Tg', 'tg150');
                } else if (FR4Type == 'fr4jt') {//单面板建滔板材只支持tg130
                    // Pcb.QutoliEv("[name=FR4Tg][value=tg130]",3);
                    Pcb.Checked('FR4Tg', 'tg150');
                }
            } else if (BoardLayers == 2) {
                if (FR4Type == 'fr4') {//双面板生益板材TG值必须为tg140或tg150或tg170
                    Pcb.QutoliEv("[name=FR4Tg][value=tg150],[name=FR4Tg][value=tg170]", 3);
                    Pcb.Checked('FR4Tg', 'tg150');
                } else if (FR4Type == 'fr4jt') {//双面板建滔板材TG值必须为tg130或tg150
                    Pcb.QutoliEv("[name=FR4Tg][value=tg150],[name=FR4Tg][value=tg170]", 3);
                    Pcb.Checked('FR4Tg', 'tg150');
                }
            } else if (BoardLayers > 2) {
                if (FR4Type == 'fr4' || FR4Type == 'fr4jt') {//多层板生益板材TG值必须为tg150或tg170
                    Pcb.QutoliEv("[name=FR4Tg][value=tg150],[name=FR4Tg][value=tg170]", 3);
                    Pcb.Checked('FR4Tg', 'tg150');
                }
            }
        }

        //0.4、0.6板厚表面处理不支持有铅喷锡和无铅喷锡
        if (BoardThickness == 0.4 || BoardThickness == 0.6) {
            Pcb.QutoliEv("[name=SurfaceFinish][value=haslwithfree],[name=SurfaceFinish][value=haslwithlead]", 2);
            if (name == 'BoardThickness') Pcb.ifCK_tf('SurfaceFinish', 'immersiongold');
        } else {
            Pcb.QutoliEv("[name=SurfaceFinish][value=haslwithfree],[name=SurfaceFinish][value=haslwithlead]", 3);
            if (name == 'BoardThickness') Pcb.ifCK_tf('SurfaceFinish', 'haslwithfree');
        }
        // 0.15mm最小孔径最多支持1.6mm板厚
        if (name == 'BoardThickness' && BoardThickness <= 1.6) {
            Pcb.QutoliEv("[name=Vias][value='0.15']", 3);
            Pcb.ifCK_tf('Vias', '0.8');
        } else if (name == 'BoardThickness' && BoardThickness > 1.6) {
            Pcb.QutoliEv("[name=Vias][value='0.15']", 2);
            Pcb.ifCK_tf('Vias', '0.8');
        }

        //外内铜规则
        if (BoardLayers <= 2) {
            Pcb.QutoliEv("[name=InnerCopperThickness]", 2);
            // Pcb.Checked("CopperThickness",1);
            Pcb.Checked("InnerCopperThickness", 1);
            $(".inner-layer-thickness").slideUp(300);
        }
        else {
            Pcb.QutoliEv("[name=CopperThickness]", 3);
            $(".inner-layer-thickness").slideDown(300);
        }
        if ((BoardLayers == 4 || BoardLayers == 6) && (name == 'BoardLayers' || name == 'CopperThickness')) {
            if (CopperThickness == 1) {
                Pcb.QutoliEv("[name=InnerCopperThickness]", 2);
                Pcb.Checked("InnerCopperThickness", 1);
            } else if (BoardLayers == 4 && CopperThickness == 2) {
                Pcb.QutoliEv("[name=InnerCopperThickness]", 2);
                Pcb.QutoliEv("[name=InnerCopperThickness][value=1],[name=InnerCopperThickness][value=2]", 3);
                Pcb.Checked("InnerCopperThickness", 1);
            } else if (BoardLayers == 4 && CopperThickness == 3) {
                Pcb.QutoliEv("[name=InnerCopperThickness]", 2);
                Pcb.QutoliEv("[name=InnerCopperThickness][value=2],[name=InnerCopperThickness][value=3]", 3);
                Pcb.Checked("InnerCopperThickness", 2);
            } else if (BoardLayers == 4 && CopperThickness == 4) {
                Pcb.QutoliEv("[name=InnerCopperThickness]", 2);
                Pcb.QutoliEv("[name=InnerCopperThickness][value=3],[name=InnerCopperThickness][value=4]", 3);
                Pcb.Checked("InnerCopperThickness", 3);
            } else if (BoardLayers == 6 && CopperThickness == 2) {
                Pcb.QutoliEv("[name=InnerCopperThickness]", 2);
                Pcb.QutoliEv("[name=InnerCopperThickness][value=1],[name=InnerCopperThickness][value=2],[name=InnerCopperThickness][value=3]", 3);
                Pcb.Checked("InnerCopperThickness", 1);
            } else if (BoardLayers == 6 && CopperThickness == 3) {
                Pcb.QutoliEv("[name=InnerCopperThickness]", 2);
                Pcb.QutoliEv("[name=InnerCopperThickness][value=3],[name=InnerCopperThickness][value=4]", 3);
                Pcb.Checked("InnerCopperThickness", 3);
            } else if (BoardLayers == 6 && CopperThickness == 4) {
                Pcb.QutoliEv("[name=InnerCopperThickness]", 2);
                Pcb.QutoliEv("[name=InnerCopperThickness][value=4]", 3);
                Pcb.Checked("InnerCopperThickness", 4);
            }
        }
        else if (BoardLayers > 6 && name == 'BoardLayers') {
            Pcb.QutoliEv("[name=CopperThickness],[name=InnerCopperThickness]", 3);
        }
        if (name == 'CopperThickness' && CopperThickness > 1) {
            Pcb.QutoliEv("[name=LineWeight][value=3],[name=LineWeight][value=4]", 2);
            Pcb.ifCK_tf('LineWeight', '10');
        }
        else if (name == 'CopperThickness' && CopperThickness == 1) { Pcb.QutoliEv("[name=LineWeight][value=3],[name=LineWeight][value=4]", 3); }

        //试验方法
        Pcb.QutoliEv("[name=FlyingProbe]", 2);
        if (BoardLayers == 1) {
            Pcb.QutoliEv("[name=FlyingProbe][value='full']", 1);
            if (area < 5) {
                Pcb.Checked('FlyingProbe', 'aoi');
                Pcb.QutoliEv("[name=FlyingProbe][value='teststand']", 2);
            } else {
                Pcb.QutoliEv("[name=FlyingProbe][value='aoi']", 0);
                Pcb.QutoliEv("[name=FlyingProbe][value='aoi']", 2);
                Pcb.Checked('FlyingProbe', 'teststand');
            }
        }
        else if (BoardLayers > 1) {
            Pcb.QutoliEv("[name=FlyingProbe][value='aoi']", 1);
            if (area < 5) {
                Pcb.Checked('FlyingProbe', 'full');
                Pcb.QutoliEv("[name=FlyingProbe][value='teststand']", 2);
            } else {
                Pcb.Checked('FlyingProbe', 'teststand');
                Pcb.QutoliEv("[name=FlyingProbe][value='full']", 2);
            }
        }
        // let if_DCB = (name=='BoardLayers'||name=='countNumer') && BoardLayers==1; //单层板
        // let if_MCB = (name=='BoardLayers'||name=='countNumer') && BoardLayers>1; //多层板
        // if(area<3){Pcb.QutoliEv("[name=FlyingProbe][value='teststand']",2); tgDMCB_F();}
        // else{Pcb.QutoliEv("[name=FlyingProbe][value='teststand']",3); tgDMCB_F();}
        // function tgDMCB_F() {
        //     if(if_DCB){ //单层板
        //         Pcb.QutoliEv("[name=FlyingProbe][value='full']",1);
        //         Pcb.Checked('FlyingProbe','aoi');
        //     }else if(if_MCB){  //多层板
        //         Pcb.QutoliEv("[name=FlyingProbe][value='aoi']",1);
        //         Pcb.Checked('FlyingProbe','full');
        //     }
        // }

        // BGA
        $("[name=HaveBGA]:checked").val() == 1 ? $(".BGApadspacing").slideDown(300) : $(".BGApadspacing").slideUp(300);

        //阻抗
        if (BoardLayers > 1) {
            $(".impedance_option").show(); $("[name=ImpedanceSize]:checked").val() == 1 ? $(".impedance_report").slideDown(300) : $(".impedance_report").slideUp(300);
        } else { Pcb.Checked('ImpedanceSize', 0); $(".impedance_option,.impedance_report").hide(); }

        //浸金
        if (getCkVal('SurfaceFinish') == "immersiongold") { $(".imgoldthincknesszone").show(); } else { $(".imgoldthincknesszone").hide(); }
        //特殊工艺
        Pcb.tsPross(name);
    },
    //特殊工艺复选框
    tsProcess: function () {
        $.ajax({
            url: '/ashx/SuperiorPcbQuote.ashx?act=GetPcbQuoteConfig',
            dataType: 'json',
            type: 'post',
            beforeSend: function () {
                //$(".loader").show();
            },
            success: function (data) {
                if (data.success) {
                    var tsList = data.attr;
                    var tsHtml1 = "";
                    var tsHtml2 = "";
                    var tsParaHtml = "";
                    for (var i = 0; i < tsList.length; i++) {
                        //IsNew=1显示
                        if (tsList[i].IsNew == 1) {
                            var desc = tsList[i].EnOptionDesc;
                            var desc_kr = tsList[i].KrOptionDesc;
                            if (HtmlLang === 'ko-kr') desc = desc_kr || desc;
                            var pic = tsList[i].OptionPic;
                            // if(tsList[i].TypeName_!='SpecifiesLamination'){
                            if (tsList[i].IsNeed == 1) {
                                if (desc != "" && desc != null && desc != 'NULL') {
                                    if (pic != "" && pic != null) {
                                        tsHtml1 += '<li class="rel r1"><label class="item rel"><input class="undis" type="checkbox" name="' + tsList[i].TypeName_ + '" value="0">' + tsList[i].EnCaption + '<span class="wen_tip pointer ml5" data-html="true" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="' + desc + '<br/><img src=\'' + pic + '\'/>"></i></label></li>';
                                    } else {
                                        tsHtml1 += '<li class="rel r2"><label class="item rel"><input class="undis" type="checkbox" name="' + tsList[i].TypeName_ + '" value="0">' + tsList[i].EnCaption + '<span class="wen_tip pointer ml5" data-html="true" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="' + desc + '"></i></label></li>';
                                    }

                                } else {
                                    tsHtml1 += '<li><label class="item"><input class="undis" type="checkbox" name="' + tsList[i].TypeName_ + '" value="0">' + tsList[i].EnCaption + '</label></li>';
                                }
                            } else if (tsList[i].IsNeed == 2) {
                                if (desc != "" && desc != null && desc != 'NULL') {
                                    if (tsList[i].OptionPic != "" && tsList[i].OptionPic != null) {
                                        tsHtml2 += '<li class="rel r3"><label class="item rel"><input class="undis" type="checkbox" name="' + tsList[i].TypeName_ + '" value="0">' + tsList[i].EnCaption + '<span class="wen_tip pointer ml5" data-html="true" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="' + desc + '<br/><img src=\'' + pic + '\'/>"></i></label></li>';
                                    } else {
                                        tsHtml2 += '<li class="rel r4"><label class="item rel"><input class="undis" type="checkbox" name="' + tsList[i].TypeName_ + '" value="0">' + tsList[i].EnCaption + '<span class="wen_tip pointer ml5" data-html="true" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="' + desc + '"></i></label></li>';
                                    }

                                } else {
                                    tsHtml2 += '<li><label class="item rel"><input class="undis" type="checkbox" name="' + tsList[i].TypeName_ + '" value="0">' + tsList[i].EnCaption + '</label></li>';
                                }
                            }
                            // }
                            tsParaHtml += '<li class="Fee-' + tsList[i].TypeName_ + '"><span>' + tsList[i].EnCaption + '</span><em></em><input type="hidden" name="Fee-' + tsList[i].TypeName_ + '" /></li>';
                        }
                    }
                    $(".tsgy1").append(tsHtml1);
                    $(".tsgy1").append(tsHtml2);
                    $(".ts_process_para").append(tsParaHtml);
                    $('[data-toggle="tooltip"]').tooltip();
                    Pcb.tsPross();
                }
            }
        })
    },
    //特殊工艺规则
    tsPross: function (name) {
        var BoardThickness = $("[name='BoardThickness']:checked").val();  //板子厚度
        var BoardLayers = $("[name='BoardLayers']:checked").val();  //板子层数
        var FR4Type = $("[name='FR4Type']:checked").val();  //板型
        var CopperThickness = $("[name='CopperThickness']:checked").val();  //外铜

        if (BoardLayers == 1) { //name=='BoardLayers' &&
            Pcb.QutoliEv("[name=Goldfinger],[name=HoleThickness_],[name=Pressfit_],[name=vacuumpack],[name=IsBlindVias],[name=IsHalfHole],[name=ResinPlugHole],[name=MetalEdging],[name=HDI],[name=HDI],[name=SpecifiesLamination]", 2);
        } else if (BoardLayers > 1) {
            Pcb.QutoliEv("[name=Goldfinger],[name=HoleThickness_],[name=Pressfit_],[name=vacuumpack],[name=IsHalfHole],[name=ResinPlugHole],[name=MetalEdging]", 3);
        }
        Pcb.SpecifiesLamination();
        if (BoardLayers <= 4) { Pcb.QutoliEv("[name=IsBlindVias]", 2); } else if (BoardLayers > 4) { Pcb.QutoliEv("[name=IsBlindVias]", 3); }
        if (FR4Type == 'fr4jt' && BoardLayers > 1 && (BoardThickness >= 1 && BoardThickness <= 1.6) && CopperThickness == 1) {
            Pcb.QutoliEv("[name=CTI_]", 3);
        } else Pcb.QutoliEv("[name=CTI_]", 2);

        //喇叭孔/台阶孔 Countersink Hole/Step Hole
        if (BoardLayers <= 2 && BoardThickness >= 1 && BoardThickness <= 2.4) {
            Pcb.QutoliEv('[name=StepHole_]', 3);
        } else {
            Pcb.QutoliEv('[name=StepHole_]', 2);
        }
    },
    //选中样式处理
    Checked: function (name, value) {
        $("[name='" + name + "']").parents("li").siblings().find(".item").removeClass("choose").find("i").remove();
        $("[name='" + name + "']").parents("li").siblings().find("input").prop("checked", false);
        $("[name='" + name + "'][value='" + value + "']").parents(".item").addClass("choose");
        $("[name='" + name + "'][value='" + value + "']").parents(".item").removeClass("not-selectable");
        $("[name='" + name + "'][value='" + value + "']").before("<i class='jp-ico subscript-ico'></i>");
        $("[name='" + name + "'][value='" + value + "']").prop("checked", true);
        $("[name='" + name + "'][value='" + value + "']").parents("li").show();
        if (name == "SolderColor" || name == "FontColor") {
            var colorhtml = $("[name='" + name + "'][value='" + value + "']").parents("label").eq(0).clone(true);
            $("[name='" + name + "'][value='" + value + "']").parents(".divselect-box").find("cite").html(colorhtml);
        } else {
            $("[name='" + name + "'][value='" + value + "']").parents(".divselect-box").find("cite a,cite .item").text($("[name='" + name + "'][value='" + value + "']").parents(".item").eq(0).text());
        }

    },
    ///计价页的li显示隐藏:0显示,1隐藏，2去除点击事件，3添加点击事件，4选中并不可复选，5清空并可复选。
    QutoliEv: function (dom, type) {
        if (type == 0) {
            $(dom).parents("li").show();
        } else if (type == 1) {
            $(dom).parents("li").hide();
            $(dom).parents("li").find(".item").removeClass("choose").find(".subscript-ico").remove();
        } else if (type == 2) {//不可点击
            //  $("[name='radFontColor'][value='Green']")
            $(dom).parents("li").find(".item").addClass("not-selectable").removeAttr("click");
            $(dom).parents("li").find(".item").removeClass("choose").find("i").remove();
            $(dom).removeAttr('checked');
        } else if (type == 3) {//添加点击事件
            $(dom).parents("li").find(".item").attr("click", Pcb.OptionsItemClick()).removeClass("not-selectable");
        } else if (type == 4) {//选中不可复选
            $(dom).parents("li").find("i").remove();
            $(dom).parents("label").removeClass("item").addClass("choose").addClass("item_ck");
            $(dom).before("<i class='jp-ico subscript-ico'></i>");
            $(dom).prop("checked", true).prop("disabled", true);
        } else if (type == 5) {//取消不可复选
            $(dom).parents("li").find("i").remove();
            $(dom).parents("label").addClass("item").removeClass("choose").removeClass("item_ck");
            $(dom).removeAttr("checked").removeAttr("disabled");
        }
    },
    //激活可选选项(name,val)
    ifCK_tf: function (e, k) {
        if (getCkVal(e) == null) Pcb.Checked(e, k);
    },
    selSpCost: function () {
        if (parseInt($("[name=selShipCountry]").val()) <= 0) {
            layer.msg(getLanguage('psSelCountry'));
            $('html,body').animate({ scrollTop: $("select[name=selShipCountry]").offset().top - 100 }, 1000);
            return false;
        } else {
            return true;
        }
    },
    //特殊工艺单独选项 Customized Stack-Up => SpecifiesLamination
    SpecifiesLamination: function () {
        var BoardLayers = $("[name='BoardLayers']:checked").val();  //板子层数
        if (BoardLayers < 4) {
            // $(".showSpecifiesLamination").hide();
            // Pcb.Checked('SpecifiesLamination',0);
            Pcb.QutoliEv("[name=HDI],[name=SpecifiesLamination]", 2);
        } else if (BoardLayers >= 4) {
            // $(".showSpecifiesLamination").show();
            Pcb.QutoliEv("[name=HDI],[name=SpecifiesLamination]", 3);
        }
    }

}
//获取当前选中的值
function GetCheckedVal(name) {
    var data = $("[name=" + name + "]:checked").val();
    if (data == undefined || data == null) {
        data = $("[name=" + name + "][checked=checked]").val()
    }
    return data;
}
//判断选中的值是否不可点击
function selectVal(name, val) {
    var data = $("[name=" + name + "]:checked").val();
    if ($("[name='" + name + "'][value='" + data + "']").parents(".item").hasClass("not-selectable")) {
        Pcb.Checked(name, val)
    }
}
//相关匹配宽度，高度
function fnInitChange(initObj) {
    var th_height = "";
    var t_left = $(initObj).find('.t_left').width();
    $(initObj).find('.t_right').css('width', $(".xgpp").width() - $(".t_left").width() - 6);
    var width2 = 0;
    var this_changeTable = $(initObj).find('.change-table .xgpp-table-title th');
    for (let i = 0; i < this_changeTable.length; i++) {
        var item_width = this_changeTable[i];
        width2 += item_width.offsetWidth;
    }
    $(initObj).find('.change-table').width(width2 + 45);
    for (var l = 0; l < $('.change-table tbody tr').length; l++) {
        var lth_height = $(initObj).find('.fixed-table tbody tr').eq(l).outerHeight(true);
        var rth_height = $(initObj).find('.change-table tbody tr').eq(l).outerHeight(true);
        if (lth_height >= rth_height) {
            th_height = lth_height;
        } else {
            th_height = rth_height;
        }
        $(initObj).find('#fixed-table tbody tr').eq(l).height(parseInt(th_height));
        $(initObj).find('.change-table tbody tr').eq(l).height(parseInt(th_height));
        $(initObj).find('#fixed-table tbody tr .table-mark').eq(l).outerHeight(parseInt(th_height + 0));
        $(initObj).find('#fixed-table tbody tr .table-FR4Type').eq(l).outerHeight(parseInt(th_height + 0));
    }

}
// 悬浮滚动条的宽度变化
function changeScroll() {
    var change_outer_width = $('.search-table-wrapper').outerWidth();
    var change_width = $('.search-table-wrapper .change-table').outerWidth();
    var table_all_width = $('.coordination-table').outerWidth();
    var fixed_table_width = $('.fixed-table').outerWidth();
    $('.fl-scrolls').css({
        'left': $(".xgpp").width() - (fixed_table_width + 30) + '+px',
        // 'width':'calc(100% - '+fixed_table_width+'px)'
        'width': change_outer_width + 'px'
    });
    if (change_width > (table_all_width - change_outer_width)) {
        $('.fl-scrolls div').width(change_width);
    }
}
//悬浮滚动条的显示控制
function fnFixed() {
    var table_offset_top = $('.coordination-table').offset().top;
    var table_height = $('.change-table').height();
    var winHeight = $(window).height();
    var document_height = $(document).height();
    var c = $(window).height();
    var b = document_height - table_offset_top;
    if (table_height + table_offset_top < document_height) {
        $('.fl-scrolls').addClass('fl-scrolls-hidden');
    }
    $(document).scroll(function () {
        var scrollTop = $(document).scrollTop();
        var a = $('.fl-scrolls').offset().top;
        if (winHeight < (table_height + table_offset_top)) {
            if ((scrollTop + winHeight) > (table_height + table_offset_top)) {
                $('.fl-scrolls').addClass('fl-scrolls-hidden');

            } else {
                $('.fl-scrolls').removeClass('fl-scrolls-hidden');
                $('.fl-scrolls').scroll(function (e) {
                    $('.search-table-wrapper').scrollLeft($(this).scrollLeft());
                });
            }
            if (scrollTop < (table_offset_top - winHeight + 50)) {
                $('.fl-scrolls').addClass('fl-scrolls-hidden');
            }
        }
    })
}
//只能输入数字和两位小数
function validationSizeNumber(e, num, size) {
    var regu = /^[0-9]+\.?[0-9]*$/;
    if (e.value != "") {
        if (!regu.test(e.value)) {
            $(e).addClass("active"), setTimeout(function () {
                $(e).removeClass("active");
            }, 2000);
            $(".size_tips_1").show(), setTimeout(function () {
                $(".size_tips_1").hide();
            }, 2000);

            //layer.msg('请输入正确的板子尺寸', { time: 2000 });
            e.value = e.value.substring(0, e.value.length - 1);
            e.focus();
        } else {
            if (num == 0) {
                if (e.value.indexOf('.') > -1) {
                    e.value = e.value.substring(0, e.value.length - 1);
                    e.focus();
                }
            }
            if (e.value.indexOf('.') > -1) {
                if (e.value.split('.')[1].length > num) {
                    e.value = e.value.substring(0, e.value.length - 1);
                    e.focus();
                }
            }
        }
    }

    var reg = /\s/g;
    var Sizevalue = size.val().replace(reg, "");

    if (Sizevalue > 650) {
        //layer.msg('输入尺寸不能大于65cm', { time: 3000 });
    } else if (Sizevalue == "" || Sizevalue < 0 || isNaN(Sizevalue) || Sizevalue == 0) {
        $(e).addClass("active"), setTimeout(function () {
            $(e).removeClass("active");
        }, 2000);
        $(".size_tips_1").show(), setTimeout(function () {
            $(".size_tips_1").hide();
        }, 2000);
        //layer.msg('请输入正确的板子的尺寸值', {
        //    skin: 'layui-layer-hui',
        //    time: 2000
        //});
    }
    // Pcb.BoardTypeTips();
    Pcb.superior_quote('countNumer');
}
//数量提交时
function SetInputNum(srcemt) {
    var num = $("#txtSelNum").val();
    var BoardType = $("[name=BoardType]:checked").val();

    if (num == 75 || num == 125) { }
    else if ((num % 10 != 0 && num > 200) || num < 200) {
        layer.msg(getLanguage('qtyMO30B10'), {
            skin: 'layui-layer-hui',
            time: 2000
        });
        return false;
    }
    $(".boardnumber li label input").prop("checked", false);

    CloseSelectNumDiv();
    $("[name=Num]").val($("#txtSelNum").val());
    var h = $("[name=BoardHeight]").val();
    var w = $("[name=BoardWidth]").val();
    if (h == 0 || h == null || w == 0 || w == null || num == 0 || num == null) {
        //$(".common_area").hide();
        $(".common_area span").text(0);
        return false;
    } else {
        var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
        $(".common_area").show();
        $(".common_area span").text(area);
    }
    $(".zz_load").show();
    $(".output_price").hide();
    $(".para_select").addClass("canPrice");
    Pcb.areaEvent();

}
//数量隐藏
function CloseSelectNumDiv() {
    $('#boardnumber').hide();
    $("#Num").css({ border: "" });
}
//成功添加购物车后待动画完成后跳转
function AddCartSetTimeout() {
    var userId = $("#HidUserId").val();
    if (userId == 0) {
        window.location.href = "/Account/LogOff?returnurl=/pcbonlinenew.html";
        return;
    }
}
//参数列表选中效果
function fnSelectd(obj) {
    if (!Pcb.checkPara()) { return false; }
    //参数集合
    var plist = $(obj).parents(".option-choose").find(".hide_input").val();
    //当前点击的参数值
    var paramId = $(obj).find(".item").text();
    //标记是否已存在(若存在则去掉为1,不存在则加入为0)
    var bj = 0;
    if ($(obj).find(".item").hasClass('choose')) {
        //此为取消
        $(obj).find(".item").removeClass('choose');
        $(obj).find(".item i").remove();
        bj = 1;//标记为曾选中(参数编号已存在于编号集合)
    }
    else {
        $(obj).find(".item").addClass('choose');  //加选中的效果
        var selected_val = $(obj).find(".item").text();  //取得选中的值
        $(obj).find(".item").append('<i class="jp-ico subscript-ico"></i>');
        bj = 0; //标记为未选中(参数编号不存在于编号集合)
    }

    //参数处理
    if (plist.length > 0) {
        if (bj == 0) {
            plist = plist + "," + paramId;
        }
        else {
            //按照','分割字符串,组成"[参数编号]"这样的数组,用于遍历
            var ids_s = plist.split(',');
            var ids = "";
            for (var i = 0; i < ids_s.length; i++) {
                //遍历的数组单元
                if (ids_s[i] != paramId) {
                    if (ids.length > 0) {
                        ids = ids + "," + ids_s[i];
                    }
                    else {
                        ids = ids_s[i];
                    }
                }
            }
            plist = ids;
        }
    }
    else {
        plist = paramId;
    }
    $(obj).parents(".option-choose").find(".hide_input").val(plist);
    //选择之后回调查询数量
    searchProCount();
    goAndSearch();
}

function getzf(num) {
    return num = parseInt(num) < 10 ? '0' + num : num;
}

//添加到购物车提交事件
function CartFormSubmit(jumpUrl) {
    if (jumpUrl == 'login') {
        Pcb.calcPrice(true);
        return false;
    }
    setTimeout(function () { $("#btnAddCart").removeAttr("disabled", "disabled"); }, 1000)
    var isFlag = true;
    if (isFlag) {
        $("#btnAddCart").attr("disabled", "disabled");
        $.ajax({
            url: '/ashx/common.ashx?act=IsLogin',
            type: 'get',
            dataType: 'json',
            beforeSend: function () { layer.load(); },
            success: function (data) {
                var mbid = parseInt(data.attr);
                $("#userId").val(mbid);
                if (mbid == 0) {
                    layer.closeAll('loading');
                    layer.open({
                        title: 'Log in or sign up to add to cart',
                        type: 2,
                        area: ['900px', '500px'],
                        content: ['/account/loginwin?jumpUrl=/superior_quote.html', 'no']
                    });
                    return;
                }
            }
        });
    }

}

//计算运费 calcType:产品运费计算类型，1、pcb运费计算，2、钢网运费计算  1:dhl 3:hkpost 4：sf 5：tnt
//计算运费 calcType:产品运费计算类型，1、pcb运费计算，2、钢网运费计算  1:dhl 3:hkpost 4：sf 5：tnt
function CalShip(k) {
    // var optype = QC.GetOpType();
    var optype = 3;
    //var sid = $(".selShip").val();
    $(".expresslogo").show();
    var shippic = $(".selShip option:selected").attr("pic");
    if (shippic != undefined)
        $(".expresslogo").attr("src", "/img/images/country/" + shippic);
    var x = y = num = Thickness = 0;
    //var shipname = $.trim($('.selShip option:selected').text());
    //var countryname = $.trim($('select[name=selShipCountry] option:selected').text());
    var cid = $("select[name=selShipCountry]").val();
    //if (sid == 2) {
    //    $(".HK-post-metion").show();
    //} else {
    //    $(".HK-post-metion").hide();
    //}
    var otherWeight = 0;
    var pcbtotal = $(".xgpp_cont .cart_item").parents("tr").find(".cart_item").attr("data-totalweight");//$(".selShip").attr('data-weight');

    if (pcbtotal != undefined)
        otherWeight += parseFloat(pcbtotal);
    //  $(".express_weight").text("wt : " + pcbtotal + " kg");
    if (optype == 1 || optype == 2) {
        var untitwei = parseFloat($("#sProName").find("option:selected").attr("data-unitweight"));
        var sNum = $("input[name='StencilNum']").val();
        otherWeight += untitwei * parseFloat(sNum);
    }
    if (otherWeight <= 0) return;
    k = k == null ? 2 : 1;
    if (cid > 0 && k == 1) {
        $.getJSON("/ashx/common.ashx?act=CalcShipList", { cid: cid, otherweight: otherWeight }, function (data) {
            BuildShipHtml(data.attr, optype, k);
        });
    } else {
        //  Pcb.calcPrice();
    }
}
function BuildShipHtml(d, optype, k) {
    // if($("#selShipCountry").val()=='231'){
    //     d=null;
    // }
    var str = "";
    if (isNaN(optype) || optype == undefined)
        optype = 3;
    var seatips = seaicon = "";
    if (d && d.length > 0) {
        for (var i = 0; i < d.length; i++) {
            if (d[i].ShipId == '14') {
                seatips = "<div class='cl-b16a00 ml5 inline-block'>*The final sea shipping cost need to be quoted manually.</div>";
                seaicon = "<img src='/img/img/pcbonline/chuan.png' class='ml5' style='margin-right:5px'>";
            } else {
                seaicon = "<img class='expresslogo fl ml10 mr5' src='/img/images/country/" + d[i].Pic + "' style='margin-top:7px'>" +
                    "<img src='/img/img/pcbonline/plane.jpg'>";
            }
            str += "<li class='mt10' data-shipPrice='" + d[i].ShipPrice + "'>" +
                "<input type='radio' name='selShip' hidden value='" + d[i].ShipId + "'/><span class='radioIcon' onclick='radioCheck(this)'></span>" + d[i].ShipName + "" +
                "<div class='inline-block' style='height:30px;line-height:30px'>" +
                seaicon +
                "<span class='expresstype_delieveryday'>( " + d[i].ShipDays + " days </span>" +
                "<span class='express_weight ml5' data-weight='" + (d[i].Weight).toFixed(2) + "'>wt : " + (d[i].Weight).toFixed(2) + " kg</span>" +
                "<span class='shipPrice ml5 cl-b16a00' freeshipprice=" + d[i].ShipPrice + " >$ " + d[i].ShipPrice + "</span> )" +
                seatips +
                "<input type='hidden' id='StencilWeight' value='0'>" +
                "</div>" +
                "</li>";
        }
        $('.selShip').html(str);
        var shipPrice = 0;
        var the_shipid = $.cookie('calcShipId');
        if (k == 1 && the_shipid == null) {
            $('.selShip li:first-of-type').find('.radioIcon').addClass('radioActive');
            $('.selShip li:first-of-type').addClass('on');
            $('.selShip li:first-of-type').find('input[name=selShip]').attr('checked', true);
            shipPrice = $('.selShip li:first-of-type').attr('data-shipPrice');
            listTotalMoney(shipPrice);
        }
        else if (the_shipid != null) {
            let o = true;
            $(".selShip li").each(function () {
                if ($(this).find("input").val() == the_shipid) {
                    radioCheck($(this).find("input"))
                    shipPrice = $(this).attr('data-shipPrice');
                    o = false;
                }
            });
            if (o) {
                radioCheck($(".selShip li:first-of-type input"))
                shipPrice = $('.selShip li:first-of-type').attr('data-shipPrice');
            }
        } else {
            shipPrice = $('.selShip li.on').attr('data-shipPrice');
        }

        $("#spShipMoeny").text("$" + shipPrice);
        checkFree()

        //var days = d.days;
        //if (d.kg == undefined)
        //    days = 0;
        //$(".expresstype_delieveryday").text(days + " days");
        //var weight = d.kg;
        //if (d.kg == undefined)
        //    weight = 0;
        //var price = d.price;
        //if (!price) {
        //    price = "0"
        //}
        //else {
        //    price = price.replace(",", "");
        //};

        var totalWeight = 0;
        var totalShipMoney = 0;
        optype = 3;
        //pcb运费及重量计算
        if (optype == 2 || optype == 3 || optype == 4) {

            //   $("#PcbWeight").val(weight);
            //   $("#PcbWeightMoney").val(price);
            //   var num = $("#PcbWeight").val()
            //    totalWeight = parseFloat(num.replace(/[^\d\.-]/g, ""));
            //totalWeight += parseFloat($("#PcbWeight").val());
            //  totalShipMoney += parseFloat($("#PcbWeightMoney").val());
        }
        else if (optype == 1) {
            $("#StencilWeight").val(otherWeight);
            //  $("#StencilWeightMoney").val(price);

            totalWeight += parseFloat($("#StencilWeight").val());
            //  totalShipMoney += parseFloat($("#StencilWeightMoney").val());
        }
        else {
            $("#StencilWeight").val("0.00");
            //   $("#StencilWeightMoney").val(0);

            totalWeight = 0;
            totalShipMoney = 0;
        }
        //重量处理
        //weight = totalWeight.toFixed(2);
        //$(".express_weight").text("wt : " + weight + " kg");
        // $(".express_weight").attr("data-weight", weight);

        //if (days) {
        //    if ($("#PCBAssemblyService").prop("checked")) {
        //        $("#predictdelievery").text("Pending");
        //        $("#predictrecieve").text("Pending");
        //    } else {
        //        var stencilCurrentTime = new Date();//当前日期
        //        var stencilCurrentTimehours = stencilCurrentTime.getHours();//当前小时
        //        var stencilDays = $("[for-group='stencil'] .DeliveryDaysStr").text();//钢网的天数
        //        var maxStencilDays = parseInt(stencilDays.split('-')[1]);//钢网的最大天数
        //        var maxarriveDays = parseInt(days.split('-')[1]);//运费的最大天数
        //        var stencilTime = null;
        //        var allFinallyTime = null;
        //        if ($("#SMDStencil").prop("checked") && (!$("#PCBSpecifications").prop("checked"))) {
        //            if (stencilCurrentTimehours >= 18) {
        //                stencilTime = new Date(stencilCurrentTime.setDate(stencilCurrentTime.getDate() + maxStencilDays + 1));
        //                stencilFinallyTime = new Date(stencilCurrentTime.setDate(stencilCurrentTime.getDate() + maxarriveDays));//最终时间，加上运费
        //                //var dt = new Date(stencilTime);
        //                $("#predictdelievery").text(stencilTime.getFullYear() + "-" + (stencilTime.getMonth() + 1) + "-" + stencilTime.getDate());
        //                $("#stencilDateTime").val(stencilTime.getFullYear() + "-" + (stencilTime.getMonth() + 1) + "-" + stencilTime.getDate());
        //                $("#predictrecieve").text(stencilFinallyTime.getFullYear() + "-" + (stencilFinallyTime.getMonth() + 1) + "-" + stencilFinallyTime.getDate());
        //            } else {
        //                stencilTime = new Date(stencilCurrentTime.setDate(stencilCurrentTime.getDate() + maxStencilDays));
        //                stencilFinallyTime = new Date(stencilCurrentTime.setDate(stencilCurrentTime.getDate() + maxarriveDays));//最终时间，加上运费
        //                //var dt = new Date(stencilTime);
        //                $("#predictdelievery").text(stencilTime.getFullYear() + "-" + (stencilTime.getMonth() + 1) + "-" + stencilTime.getDate());
        //                $("#stencilDateTime").val(stencilTime.getFullYear() + "-" + (stencilTime.getMonth() + 1) + "-" + stencilTime.getDate());
        //                $("#predictrecieve").text(stencilFinallyTime.getFullYear() + "-" + (stencilFinallyTime.getMonth() + 1) + "-" + stencilFinallyTime.getDate());
        //            }


        //        }
        //        if ((!$("#SMDStencil").prop("checked")) && $("#PCBSpecifications").prop("checked")) {
        //            var predictdelievery = $("#pcbDateTime").val();
        //            $("#predictdelievery").text(predictdelievery)
        //            var preD = predictdelievery.split('-');
        //            var dateTT = new Date(predictdelievery);
        //            dateTT.setDate(dateTT.getDate() + maxarriveDays);
        //            $("#predictrecieve").text(dateTT.getFullYear() + "-" + (dateTT.getMonth() + 1) + "-" + dateTT.getDate());
        //        }
        //        if ($("#PCBSpecifications").prop("checked") && $("#SMDStencil").prop("checked")) {
        //            var predictdelievery = $("#pcbDateTime").val();//pcb的交期
        //            if (stencilCurrentTimehours >= 18) {
        //                stencilTime = new Date(stencilCurrentTime.setDate(stencilCurrentTime.getDate() + maxStencilDays + 1));
        //                $("#stencilDateTime").val(stencilTime.getFullYear() + "-" + (stencilTime.getMonth() + 1) + "-" + stencilTime.getDate());
        //            } else {
        //                stencilTime = new Date(stencilCurrentTime.setDate(stencilCurrentTime.getDate() + maxStencilDays));
        //                $("#stencilDateTime").val(stencilTime.getFullYear() + "-" + (stencilTime.getMonth() + 1) + "-" + stencilTime.getDate());
        //            }
        //            var stencildelievery = $("#stencilDateTime").val();//钢网交期
        //            var allFinallyTime;
        //            var stcdevdate = new Date(stencildelievery), pcbdevdate = new Date(predictdelievery);
        //            if (stcdevdate >= pcbdevdate) {
        //                $("#predictdelievery").text(stencildelievery);
        //                allFinallyTime = new Date(stcdevdate.setDate(stcdevdate.getDate() + maxarriveDays));

        //            } else {
        //                $("#predictdelievery").text(predictdelievery);
        //                allFinallyTime = new Date(pcbdevdate.setDate(pcbdevdate.getDate() + maxarriveDays));
        //            }
        //            $("#predictrecieve").text(allFinallyTime.getFullYear() + "-" + (allFinallyTime.getMonth() + 1) + "-" + allFinallyTime.getDate());
        //        }
        //    }
        //}
        sumPrice();
        //运费处理
        //price = parseFloat(totalShipMoney.toFixed(2));
        //$("#spShipTotal").html("$" + price);
        //$("#spShipMoeny").html("$" + price);
        //$("#hidShipMoney").val(price);
        //$("#hidShipName").val(shipname);
        //$("#hidCountryName").val(countryname);
        //$("#hidCountryId").val(cid);
        //$("#spShipDays").html(d.days + " Days" + " , &nbsp; wt : " + d.kg + " kg");

        //长宽为空所有都可点击
        var h = $("[name=hidLength]").val();
        var w = $("[name=hidWidth]").val();
        if (h == 0 || h == null || w == 0 || w == null) {
            $("#predictrecieve").text(" ")
        }
        //  Pcb.calcPrice();
    }
    else {
        $("#spShipMoeny").text("$0");
        listTotalMoney(0);
        $('.selShip').html('');
        sumPrice();
    }
}
function radioCheck(obj) {
    let ckid = $(obj).parents('li').index() + 1;
    $('.selShip li').removeClass('on');
    $(obj).parents('li').addClass('on');
    $('.selShip li').siblings().find('.radioIcon').removeClass('radioActive');
    $('.selShip li').siblings().find('input[name=selShip]').removeAttr('checked');
    $('.selShip li:nth-child(' + ckid + ')').find('input[name=selShip]').attr('checked', true);
    $('.selShip li:nth-child(' + ckid + ')').find('.radioIcon').addClass('radioActive');

    $.cookie('calcShipId', $(".selShip li.on input").val(), { path: '/' });

    var shipPrice = $(obj).parents('li').attr('data-shipPrice');
    $("#spShipMoeny").text("$" + shipPrice);
    listTotalMoney(shipPrice);
    checkFree()
    sumPrice();
}
function listTotalMoney(shipPrice) {
    shipPrice = shipPrice || 0
    if ($(".xgpp-table-cont").length > 0) {
        $('.TotalAmount').each(function () {
            let totalmoney = $(this).siblings('.odmn').attr('totalmoney');
            $(this).html('$' + (parseInt(totalmoney) + parseInt(shipPrice)));
        });
    }
}
//计算总价
function sumPrice() {
    var productPrice = $('.total-money span').text();
    productPrice = productPrice.split('$');
    var shipPrice = $('#spShipMoeny').text();
    if (shipPrice != '0.00') {
        shipPrice = shipPrice.split("$");
        shipPrice = shipPrice[1];
    }
    var sumPrice = (parseFloat(shipPrice) + parseFloat(productPrice[1])).toFixed(2);  //产品费加运费
    $('.sumPrice span').html("$" + sumPrice);
}

function ShipCountryChange(e) {
    Pcb.InitCountry();
    if (!Pcb.ParmValid()) return false;
    $(".selShip").val("1")
    $("select[name=selShipCountry]").val(e.value)
    var cid = e.value;
    $("select[name=selShipCountry]").find("option[value=" + cid + "]").attr("selected", true);
    $(".selShip option").each(function (i, dom) {
        var ids = $(dom).attr("ids");
        if (ids != undefined && $(dom).attr("ids").indexOf("," + cid + ",") > -1) {
            if ($(dom).val() == "12") {
                $(".selShip").val("12")
            } else if ($(dom).val() == "12") {
                $(".selShip").val("13")
            }
            $(dom).show();
        } else {
            $(dom).hide();
        }
    });

    if (cid == "85" || cid == "135" || cid == "206" || cid == "42") {
        $(".selShip").val("4")
        $(".selShip").find("option[value='1']").hide()
    }
    CalShip('ckct');
}

function checkFree() {
    // if ($('#Num').val()=="5") {
    //     if ($(".order-free-box").find("input").prop("checked")) {
    //         $("#spShipMoeny").text("$0")
    //         $(".sumPrice span").text("$0")
    //         $(".total-money span").text("$0")
    //         $(".shipPrice").each(function (index, dom) { $(dom).text("$0") })
    //     }
    // }
}
//获取checked值
function getCkVal(e) {
    return $("[name=" + e + "]:checked").val();
}

function setInputBT(e) {
    e.css({ backgroundColor: '#ffe2e2' });
    setTimeout(function () {
        e.css({ backgroundColor: '#fff' });
    }, 2000)
}
