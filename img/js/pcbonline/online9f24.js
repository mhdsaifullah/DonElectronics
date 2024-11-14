var valuateResult = ""; var OrderTextSet = "";
var ifQuote = false;
var ifQuotePcba = false;
var ifassemblyboxQuotePcba = false;
var goCartInfo = {};
var selPcbOrderInfo = {};
var letBoardThickness = '';
var isMobile;
//是否一使用过url上的参数
var isRequst = false;
if (!!$.isArray) { $.isArray = Array.isArray }
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
    //计价结果勾选
    $(".listTable").on('click', 'li.ck', function () {
        //if ($(this).parent().hasClass("on")) {
        //    $(this).parent().removeClass("on");
        //    selPcbOrderInfo = {}
        //} else {
        //    $(this).parent().addClass("on");
        //    $(this).parent().siblings().removeClass("on");
        //    if ($(this).parents('.listTable').hasClass('pcb')) {
        //        var selIndex = $(this).parent().index() - 1;
        //        var selDB = pcbQuoteDB[selIndex];
        //        selPcbOrderInfo = {
        //            FR4Tg: selDB.FR4Tg,
        //            FR4Type: selDB.FR4Type,
        //            CoreTypeCode: selDB.PcbOrder.CoreTypeCode,
        //        }
        //        // console.log(selPcbOrderInfo)
        //    }
        //}
        //上面是可以取消单选按钮，这里是不允许取消，必须选中一个
        $(this).parent().addClass("on");
        $(this).parent().siblings().removeClass("on");
        if ($(this).parents('.listTable').hasClass('pcb')) {
            var selIndex = $(this).parent().index() - 1;
            var selDB = pcbQuoteDB[selIndex];
            selPcbOrderInfo = {
                FR4Tg: selDB.FR4Tg,
                FR4Type: selDB.FR4Type,
                CoreTypeCode: selDB.PcbOrder.CoreTypeCode,
                SkuCode: selDB.SkuCode,
                BusinessType: selDB.BusinessType
            }
            // console.log(selPcbOrderInfo)
        }
        //Pcb.clearSFCDShipByPrice();
        Pcb.newSumPrice();
    })

    $(".option-parames input").on("change", function () {
        var name = $(this).prop('name');
        //Smt.onChange(name, Smt.getFormData());
        Pcb.clearPrice();
        if (name == "t_pinban_y" || name == "t_pinban_x") {
            Pcb.PcbCalcArea();
        }

    });
    $("#smtorderForm select").on("change", function () {
        var name = $(this).prop('name');
        if (name == "ApplicationAreaId" || name == "Layer") {
            Pcb.clearPrice();
            Pcb.PcbCalcArea();
        }

    });
    $(".xiaoban-ai input").on("change", function () {
        var name = $(this).prop('name');
        if (name == "t_pinban_y" || name == "t_pinban_x") {
            Pcb.clearPrice();
            Pcb.PcbCalcArea();
        }

    });
    //是否PCBAquote计价 初始化组装计价数据
    $(".assemblyboxQuotePcba>.assemblytitleSel").click(function () {
        if ($(".assemblytitleSel").hasClass("show")) {
            $(".assemblytitleSel").removeClass("show");
            //ifassemblyboxQuotePcba = false;
            ifQuotePcba = false;
            $(".listTable.pcba .n").remove();
            $(".ifQuotePcba").slideUp(500);
            $(".assemblyboxQuotePcba .pcba-con").slideUp(500);
        } else {
            $("[name='ProductNum']").val(Number($('#Num').val()));
            $("[name='PcbSizeY']").val(Number($('#BoardHeight').val()));
            $("[name='PcbSizeX']").val(Number($('#BoardWidth').val()));
            $(".assemblytitleSel").addClass("show");
            //ifassemblyboxQuotePcba = true;
            $(".ifQuotePcba").slideDown(500);
            $(".assemblyboxQuotePcba .pcba-con").slideDown(500);
            Pcb.onChange("BoardType", Tools.UrlToJsonParams($("#smtorderForm").serialize()));
            ifQuotePcba = true;
        }
        Pcb.clearPrice();
    });

    //是否PCBA计价
    $(".boxQuotePcba>.titleSel").click(function () {
        if ($(".boxQuotePcba").hasClass("show")) {
            $(".boxQuotePcba").removeClass("show");
            ifQuotePcba = false;
            $(".listTable.pcba .n").remove();
            $(".ifQuotePcba").slideUp(500);
            $(".boxQuotePcba .pcba-con").slideUp(500);
        } else {
            $(".boxQuotePcba").addClass("show");
            ifQuotePcba = true;
            $(".ifQuotePcba").slideDown(500);
            $(".boxQuotePcba .pcba-con").slideDown(500);
        }
        Pcb.clearPrice();
    });
    $(".pcb-card-title").on('click', function () {
        var $dom = $(this).parents('.pcb-card').find('.pcb-card-body');
        if ($dom.is(':visible')) {
            $(this).parents('.pcb-card').removeClass('pcb-card-show')
        }
        else {
            $(this).parents('.pcb-card').addClass('pcb-card-show')
        }
        $dom.slideToggle(300);
    });

    //免费券
    $(".totalCost .cs").on('click', ' label', function () {
        var isCC = $("#isCoupon").prop("checked");
        // $("#isCoupon").prop("checked",!isCC);
        if (isCC) Pcb.newSumPrice(false);
        else Pcb.newSumPrice(true);
        // var csSpan = $(".boxQuoteRightInfo .totalCost .cs span");
        // var pc =  csSpan.attr('data-pc');
        // if($("#isCoupon").prop("checked")) csSpan.html('$0.00')
        // else csSpan.html(pc)
        // console.log($("#isCoupon").prop("checked"))
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
        if ($(this).attr('name') == 'ProductNum') {
            var pcbNum = Number($('#Num').val());
            var BoardType = getCkVal('BoardType');
            if (BoardType != 'pcs') {
                pcbNum = pcbNum * Number($("[name=pinban_x]").val()) * Number($("[name=pinban_y]").val());
            }
            if (Number($(this).val()) > pcbNum) {
                altNotice('The SMT QTY should less than single PCB QTY');
                $(this).val(pcbNum);
            }
        }
        Pcb.clearPrice();
    });
    //板层+*
    //$(".selListBL").each(function () {
    //    if($(this).attr('selbl')>=6){$(this).addClass('red')}
    //})
    //加购
    $(".bnAddCarts").click(function () {
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
        //是否有上传文件
        if ($("#pcbQuoteUpFile").length) {
            formDB.PcbFileName = $("#pcbQuoteUpFile").text();
            formDB.PcbFilePath = $("#pcbQuoteUpFile").attr('href');
            formDB.PcbFileId = $("#pcbQuoteUpFile").attr('data-PcbFileId');
        }

        //加购参数拼接
        var TestReport_arry = [];
        $("[name='TestReport']:checked").each(function (index) { TestReport_arry[index] = $(this).val(); });
        var selPcbDB = pcbQuoteDB[selPcbs.attr('data-index')];
        var selPcbCDI = selPcbDB.CalcDelvieryItems[selPcbs.attr('data-CDItems')];
        //加购特殊工艺
        var SpecialTechnique = {}
        $(".tsgy1 input").each(function () {
            if ($(this).val() == 1) {
                var name = $(this).attr('name');
                SpecialTechnique[name] = $(this).val();
            }
        })
        SpecialTechnique["GongBoundaryTolerance"] = $('input[name=GongBoundaryTolerance]:checked').val();
        SpecialTechnique["WhitePaperService"] = $('input[name=WhitePaperService]:checked').val();

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
            "coretypecode": selPcbDB.CoreType.CoreTypeCodes_,
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
            "fr4tg": selPcbDB.CoreType.CoreTg,
            "PcbProType": selPcbDB.CoreType.ProType,
            "fr4type": selPcbDB.FR4Type,
            "BoardBrand": selPcbDB.CoreType.CoreType_,
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
            "ishighquality": selPcbs.QualityTag,
            "isjiaji": selPcbCDI.IsJiaji === 1,
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
            // "FreeCouponId":selPcbCDI.CanUseFreeId,
            //特殊工艺
            SpecialTechnique: SpecialTechnique
        }
        if (userQuoteTargetPrice) jsonData.TargetPrice = userQuoteTargetPrice;
        if (userQuotePcbExpectedDeliveryDays) jsonData.ExpectedDeliveryDays = userQuotePcbExpectedDeliveryDays;

        if ($("#isCoupon").prop("checked")) jsonData.FreeCouponId = selPcbCDI.CanUseFreeId;
        if (jsonData.isjiaji) jsonData.StepTag = selPcbCDI.StepTag;

        jsonData.BusinessType = selPcbCDI.BusinessType;
        jsonData.SkuCode = selPcbCDI.SkuCode;

        var proCategory = $("[name=proCategory]:checked").val();
        var SurfaceFinish = $("[name=SurfaceFinish]:checked").val();
        if (proCategory == "fr4Item") {
            //电镀金
            if (SurfaceFinish == 'hardgold' || SurfaceFinish == 'haslwithfreeandhardgold') {
                jsonData.ImGoldThinckness = $("#ImGoldThinckness").val();
            }
            //镍钯金
            else if (SurfaceFinish == 'eletrolyticnickelgod') {
                jsonData.ImGoldThinckness = $("#ImGoldThinckness").val();
                jsonData.PalladiumThickness = $("#PalladiumThickness").val();
                jsonData.NickelThickness = $("#NickelThickness").val();
            }
        }

        jsonData = Object.assign(formDB, jsonData)
        var params = [{
            ProType: 2,
            jsonData: JSON.stringify(jsonData)
        }]
        if (ifQuotePcba) {
            if ($(".listTable.pcba .n.on").length > 0) {
                Pcb.getSubmitFormData(true);
                params.push({
                    ProType: 5,
                    jsonData: JSON.stringify(Pcb.getQuotePcbaInfo('fcid'))
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
                var proType = 2;
                if (data.success) {
                    for (var i in data.attr) {
                        if (data.attr[i].ProType == proType) goCartInfo = data.attr[i];
                        if (data.attr[i].ProType == 5) proType = 5;
                    }
                    var layerAW = isMobile ? '350px' : '400px';
                    layer.open({
                        type: 1,
                        shade: 0.3,
                        closeBtn: 1,
                        shadeClose: true,
                        area: layerAW,
                        content: $('.goToCar') //捕获的元素
                    });
                    $(".goCartOrder").click(function () {
                        window.location.href = '/cart?protype=' + proType + '&upfileid=' + goCartInfo.CartId;
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
        LP.dataPointJP({ label: 'Add to Cart', type: 'click', value: 'bnAddCart' });
    });
    //滚动时计价按钮的事件
    // $(document).scroll(function () {
    //     if(!ifQuote){
    //         var wHeight = $(window).height();
    //         var dHeight = $(document).scrollTop();
    //         var specilHeight = $(".specil_progress").offset().top + 170;
    //         if (specilHeight - wHeight < dHeight) {
    //             $(".price_btn2").show();
    //             $(".price_btn1").hide();
    //         } else {
    //             $(".price_btn2").hide();
    //             $(".price_btn1").show();
    //         }
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
        clearXiaoBanAi();
        AssemblyPanelDimensions();
    })

    //设置引导页一天一次cookie

    //if (!$.cookie('guide_cookie')) {
    //    //引导页展示
    //    $(".guide_box").show();
    //    $("body,html").css("overflow-y", "hidden");
    //    $.cookie('guide_cookie', '1', { expires: 60 });
    //} else {
    //    $("body,html").css("overflow-y", "auto");
    //}
    ////切换计价按钮第一次进入直接显示
    //if (!$.cookie('firstT')) {
    //    $('.new-rightsidebarlist-tip').show();
    //    $('.triangle-tip').show();
    //    $.cookie('firstT', '1');
    //} else {
    //    $('.new-rightsidebarlist-tip').hide();
    //    $('.triangle-tip').hide();
    //}
    //$('.new-rightsidebarlist').hover(function () {
    //    $('.new-rightsidebarlist-tip').show();
    //    $('.triangle-tip').show();
    //}, function () {
    //    $('.new-rightsidebarlist-tip').hide();
    //    $('.triangle-tip').hide();
    //});
    ////引导页内容操作
    //$(".next_step").click(function () {
    //    var parentName = $(this).parents(".step").attr("id");
    //    $(this).parents("#" + parentName).hide();
    //    $(this).parents("#" + parentName).next().show();
    //});
    //$(".skip,.finsh_guide").click(function () {
    //    $(".guide_box").hide();
    //    $("body,html").css("overflow-y", "auto");
    //})
    //$(".look_more").click(function () {
    //    $(".step").hide();
    //    $(".step").eq(0).show();
    //})

    //$(".guide_link").click(function () {
    //    $(".guide_box").show();
    //    $("body,html").css("overflow-y", "hidden");
    //})
    //选项说明提示

    $('[data-toggle="tooltip"]').tooltip();
    //$(".wen_tip").hover(function () {
    //    $(this).next(".tool_tip").show();
    //}, function () {
    //    $(".tool_tip").hide();
    //})

    //详细参数hover显示
    $('.hover_detail_title').hover(function () {
        if (Pcb.ParmValid()) {
            $(this).next().show();
            Pcb.commonParamSerialize();
            if ($(".DeliveryType").text() > 3) {
                $(".pcb-delivery-days i").removeClass("yellow red").addClass("bg-a38459");
                $(".pcb-delivery-days em").text("D");
            } else {
                //$(".pcb-delivery-days em").text("H");
                //$(".DeliveryType").text($(".DeliveryType").text() * 24);
                //if ($(".DeliveryType").text() == "0") {
                //    $(".pcb-delivery-days i").removeClass("bg-a38459 yellow").addClass("red");
                //    $(".DeliveryType").text(12);
                //} else if ($(".DeliveryType").text() == "1") {
                //    $(".pcb-delivery-days i").removeClass("bg-a38459 yellow").addClass("red");
                //} else if ($(".DeliveryType").text() == "2") {
                //    $(".pcb-delivery-days i").removeClass("bg-a38459 red").addClass("yellow");
                //} else {
                //    $(".pcb-delivery-days i").removeClass("yellow red").addClass("bg-a38459");
                //}
                //var formarr = $("#fm").serializeArray();
                //var templayer = "";
                //for (var i = 0; i < formarr.length; i++) {
                //    var item = formarr[i];
                //    var classname = ".hover_detail .Fee-" + item.name;
                //    if (!$(".pcbonline-options [name=" + item.name + "]:checked").parents(".option").is(":hidden")) {
                //        var val = $(".pcbonline-options [name=" + item.name + "]:checked").parent().text().trim();
                //        if (val == undefined || val == null || val == "") {
                //            val = $(".pcbonline-options [name=" + item.name + "]").val();
                //        }
                //        if (item.name == "BoardLayers") {
                //            templayer = val;
                //        }
                //        if (item.name == "InnerCopperThickness" && templayer <= 2) {
                //            val = "-";
                //        }
                //        $(classname).show();
                //        $(classname).find("em").text(val);
                //    } else {
                //        $(classname).hide();
                //        //  $(classname).parent('tr').hide();
                //    }
                //}
                $(".hover_detail .Fee-Area em").text($(".pcbDetail .area_val").text() + "㎡");
                //特殊工艺参数显示问题
                //$(".info_ts_title li").each(function (i, dom) {
                //    var tsName = $(dom).find("input").attr("name");
                //    if (!$(dom).find("input").prop("checked") || $(dom).is(":hidden")) {
                //        $(".hover_detail .Fee-" + tsName).hide();
                //        //    $(".pcbDetail .Fee-" + tsName).parent('tr').hide();
                //        //$(".pcbDetail [data-for=" + tsName + "]").hide();
                //        //$(".pcbDetail [data-for=" + tsName + "]").find("em").text("");
                //        $(".hover_detail .Fee-" + tsName).find("input").val("");
                //    } else {
                //        $(".hover_detail .Fee-" + tsName).show();
                //        //       $(".pcbDetail .Fee-" + tsName).parent('tr').show();
                //        $(".hover_detail [data-for=" + tsName + "]").show();
                //        $(".hover_detail .Fee-" + tsName).find("em").text("Yes");
                //        $(".hover_detail .Fee-" + tsName).find("input").val(1);
                //    }
                //})
            }
            Pcb.setTestReport()
        }
    }, function () {
        //if ($.contains($(".hover_detail_content")[0], e.target) || $(".hover_detail_content")[0] == e.target) {
        //    $(this).next().show();
        //} else {
        $(this).next().hide();
        //}
    });

    $('.hover_detail_content').hover(function () {
        $(this).show();
    }, function () {
        $(this).hide();
    })

    //示例图片
    ExampleDiagram();
    Pcb.Init();
    setTimeout(function () {
        CollapseOption.Init();//初始化
    }, 0);



    !function () {
        var url = window.location.href;
        var newUrl = url.split("?");
        newUrl = newUrl[newUrl.length - 1];
        //if (newUrl.indexOf("aluminumItem") > 0) {
        //    Pcb.Checked("proCategory", "aluminumItem");
        //} else if (newUrl.indexOf("cem1Item") > 0) {
        //    Pcb.Checked("proCategory", "cem1Item");
        //}
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

            // Pcb.Checked("BoardLayers", getUrlParam('hidLayers'));
            $('input[name=BoardLayers][value=' + getUrlParam('hidLayers') + ']').trigger("click");
            if (getUrlParam('hidLayers') > 2) {
                $(".inner-layer-thickness,.impedance_option").slideDown(300);
            }
        }
        if (url.indexOf("proCategory") > 0) {
            layer.closeAll();
            Pcb.Checked("proCategory", getUrlParam('proCategory'));
            if (getUrlParam('proCategory') == 'aluminumItem') {
                Pcb.proCategory('proCategory');
            }
        }
        if (url.indexOf("BoardThickness") > 0) {
            layer.closeAll();
            Pcb.Checked("BoardThickness", getUrlParam('BoardThickness'));
        }
        Pcb.proCategory();
        Pcb.onetierFn();// //控制所有一层板材最小孔径不可选0.2mm
        Pcb.ViasCategory(); //新增铝基板控制最小线宽孔径电镀前工艺
        var BoardHeight = $('#BoardHeight').val();
        var BoardWidth = $('#BoardWidth').val();
        var Num = $('#Num').val();
        if (BoardHeight && BoardWidth && Num) {
            var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
            $(".common_area").show();
            $(".common_area span").text(area);
            // Pcb.InitCountry();
            // if (!Pcb.selSpCost()) { return false }
            Pcb.areaEvent();
            Pcb.calcPrice();
        } else {
            //$(".common_area").hide();
            $(".common_area span").text(0);
            return false;
        }
        Pcb.to211126('countNumer');
    }()
    //var BoardHeight = $('#BoardHeight').val();
    //var BoardWidth = $('#BoardWidth').val();
    //var Num = $('#Num').val();
    //if (BoardHeight && BoardWidth && Num) {
    //    Pcb.calcPrice();
    //}

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
        // Pcb.screen();
        Pcb.calcPrice(true);
    })

    //选择供应商
    //$(".xgpp_cont").on("click", ".apply_item", function () {
    //    var jq = $(this).parents("tr").find(".table-DeliveryDays").text();
    //    var totalMoney = $(this).parents("tr").find(".table-OrderMoney").text();
    //    $(".price-delivery-list .DeliveryType").text(jq);
    //    $(".price-delivery-list .Fee-Area").text($(".info_new_box .pcbDetail .area_val").text() + "㎡");
    //    $(".price-delivery-list .Fee-HeightWidth").text();
    //    $(".border_layer_info .Fee-Num em").text($(".output_price .Fee-Num em").text())
    //    $(".total-money span").text(totalMoney);
    //    $(".total-money span").attr("data-money", totalMoney);
    //    var fr4type = $(this).parent("td").find("[name='AddCart-FR4Type']").val();
    //    var fr4tg = $(this).parent("td").find("[name='AddCart-FR4Tg']").val();
    //    var boardbrand = $(this).parent("td").find("[name='AddCart-BoardBrand']").val();
    //    var pcbProType = $(this).attr("data-pcbprotype");
    //    $("#Fee-PcbProType").val(pcbProType);
    //    $("#AddCart-FR4Type").val(fr4type);
    //    $("#AddCart-FR4Tg").val(fr4tg);
    //    $("#AddCart-BoardBrand").val(boardbrand);
    //    var dataCode = $(this).attr("data-code");
    //    Pcb.selectApply(dataCode);
    //    //Pcb.CanUseFreeCoupon();
    //})
    //仿select
    $(".divselect-box").hover(function () {
        $(this).find("ul").show();
    }, function () {
        $(this).find("ul").hide();
    });
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
        Pcb.clearPrice();
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
        Pcb.to211126();
        Pcb.to211206();
        // Pcb.toTypeCopper('proCategory');
    })
    //
    $(".info_basic_tsgy .option:visible").each(function (m) {
        if (m % 4 == 3) {
            $(this).addClass("noBorder");
        }
    })
    //拼版信息示例
    $(".imposition-information-example").hover(function () {
        // $(".imposition-informationExample").show();

    }, function () {
        // $(".imposition-informationExample").hide();
    });
    //免费打样券
    $(".order-free-box").unbind("click").click(function (event) {
        if ($(this).find("input").prop("checked")) {
            $(".total-money span").text("$0.00");
            $(this).find("input").val(1);
            $(this).addClass("active");
            checkFree()
        } else {
            $(this).find("input").val(0);
            $(this).removeClass("active");
            $(".shipPrice").each(function (index, dom) {
                $(dom).text("$" + $(dom).attr("freeshipprice"))
            })
            $(".radioIcon").each(function (index, dom) {
                if ($(dom).hasClass("radioActive")) {
                    $("#spShipMoeny").text('$' + $(dom).parent("li").attr("data-shipprice"))
                }
            })
            $(".total-money span").text($(".total-money span").attr("data-money"));

        }
        sumPrice();
    })



    $(".add-cart").click(function () {
        if (!Pcb.selSpCost()) { return false }
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
    ////返回上一步
    //$(".go_back").click(function () {
    //    $(".apply_cont").hide();
    //    $(".output_price").show();
    //    $(".online_hd li").removeClass("current");
    //    $(".online_hd li").eq(1).addClass("current");
    //})
    //$(".para_info_hover").hover(function () {
    //    $(".para_info_cont").show();
    //}, function () {
    //    $(".para_info_cont").hide();
    //})
    //$(document).ready(function () {
    //    $(window).scroll(function () {
    //        var a = $(".footer_index").offset().top;
    //        if (a >= $(window).scrollTop() && a < ($(window).scrollTop() + $(window).height())) {
    //            $(".price_btn2").hide();
    //            $(".price_btn1").css("opacity", "1");
    //            $(".price_btn4").hide();
    //            $(".price_btn3").css("opacity", "1");
    //        } else {
    //            $(".price_btn2").show();
    //            $(".price_btn1").css("opacity", "0");
    //            $(".price_btn4").show();
    //            $(".price_btn3").css("opacity", "0");
    //        }
    //    });
    //});
    //$(".other_option").on("click", "dd", function () {
    //    var n = $(this).index();
    //    var otherOptionName = $(this).find("input").attr("name");
    //    $(".other_option dd").removeClass("active");
    //    $(this).addClass("active");
    //    $(".select_item_box ul").hide();
    //    $(".select_item_box ul").eq(n).show();
    //    return false;
    //})

    $(".other_option").on("click", "dd", function () {
        var n = $(this).index();
        var obj_parent = $(this).parent().attr('data-class');
        if (obj_parent == 'dl2') {
            n = 6 + n;
        }
        var otherOptionName = $(this).find("input").attr("name");
        $(".other_option dd").removeClass("active");
        $(this).addClass("active");
        $(".select_item_box ul").hide();
        $(".select_item_box ul").eq(n).show();
        var dl_this = $(this).parents('dl');
        var select_item_box = $('.other_option .select_item_box');
        dl_this.css('border-bottom', '1px solid #f90');
        dl_this.siblings('dl').css("border-bottom", 'none');
        //var dlArr =
        dl_this.after(select_item_box.prop("outerHTML"));
        select_item_box.remove();
        return false;
    })


    //原材料筛选其他材料更多切换
    $('.togglebtn').click(function () {
        var status = $(this).attr('data-status');
        if (status == 'on') {
            $(this).attr('data-status', 'off');
            $(this).html('Unfold' + '<em class="arr_bottom"></em>');
            $('.other_option dl .active').parents('dl').siblings('dl').addClass('undis');
        } else {
            $(this).attr('data-status', 'on');
            $(this).html('Fold' + '<em class="arr_top"></em>');
            // $('.other_option dl').eq('1').removeClass('undis');
            $('.other_option dl .active').parents('dl').siblings('dl').removeClass('undis');
        }
    })
    //$(".para_detail_title").hover(function () {
    //    $(".pcbDetail").show();
    //}, function () {
    //    $(".pcbDetail").hide();
    //})
    //
    $(".state_pro").hover(function () {
        $(".product_intro").show();
    }, function () {
        $(".product_intro").hide();
    })

    Pcb.BoardTypeTips();
    Pcb.QutoliEv("[name=CopperThickness][value='0.4']", 2, [], true);//铝基板
    Pcb.to211126('countNumer');
    Pcb.to211206('countNumer');
    Pcb.to231221('countNumer');
    Pcb.toOICThickness();
    let the_country = $.cookie('countryid');
    if (the_country) {
        $("select[name=selShipCountry]").find("option[value=" + the_country + "]").attr("selected", true);
    }
})
var pcbQuoteDB = [];
var pcbaQuoteDB = [];
var userQuoteTargetPrice = ''; //期望目标价
var userQuotePcbExpectedDeliveryDays = ''; //期望目标交期天数
var CollapseOption = {
    config: {
        height: 30,
        heightOffset: 5,//默认高度误差
    },
    Init: function () {
        $('.max-option .collapse-tigger').on('click', function () {
            var $option = $(this).parent('.max-option');
            $option.toggleClass('uncollapse');

            CollapseOption.resize($option);
            CollapseOption.updateView();
        });
        //CollapseOption.updateView();
    },
    resize: function (scope) {
        if (!scope) scope = $(document);
        scope.find('.collapse-tigger').each(function (i, el) {
            var height = CollapseOption.config.height;
            var $option = $(el).parent('.max-option');
            if ($option.hasClass('uncollapse')) {
                height = $option.find('.option-choose').height()
                $(this).children('em').addClass('arrow_top');
            }
            else {
                $(this).children('em').removeClass('arrow_top');
            }
            $option.height(Math.max(height, CollapseOption.config.height));
        });
    },
    /** 更新视图 */
    updateView: function (scope) {
        if (!scope) scope = $(document);
        var maxHeight = CollapseOption.config.height + CollapseOption.config.heightOffset;
        scope.find('.max-option .collapse-tigger').each(function (i, el) {
            var $option = $(el).parent('.max-option');
            var actualHeight = $option.find('.option-choose').height();
            var isShow = true;
            var isEnable = true;

            //console.log(actualHeight)
            if (actualHeight <= maxHeight) {
                isShow = false;
            }
            if (isShow) {
                $(el).show();
            }
            else {
                $(el).hide();
            }
            if (isEnable) {
                $(el).removeClass('collapse-tigger-disabled');
            }
            else {
                $(el).addClass('collapse-tigger-disabled');
            }
        })
    },
};

var Pcb = {
    Init: function () {
        isMobile = $('body').hasClass('isMobile');
        $('input[name=pinban_x],input[name=pinban_y]').on('change', function () {
            Pcb.setDefaultValue(Pcb.getFormData(), $(this).prop('name'), Pcb.DefaultValueRule);
        });
        var layerIndex = -1;
        $('#btnPanelInfo').hover(function () {
            layerIndex = Pcb.PcbImpositionInformationExample();
        }, function () {
            if (layerIndex > 0) {
                layer.close(layerIndex);
            }
        });
        //Add to Cart确认信息
        // Pcb.sureInfo();
        //特殊工艺
        Pcb.tsProcess(Pcb.SpecialProcessRule);
        //点击事件
        Pcb.OptionsItemClick();
        //数量
        Pcb.numEvent();
        //有铅喷锡隐藏
        //Pcb.QutoliEv("[name='SurfaceFinish'][value='haslwithlead']", 1);
        //白色高反隐藏
        //Pcb.QutoliEv("[name='SolderColor'][value='highantiwhiteoil']", 1);
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
            Pcb.pinbanVaildate($("[name=BoardType]:checked").val())
            //var BoardType = $('[name = BoardType]').val();
            //if (BoardType == 'jpset') {
            //    var jpsetVal = $(this).val();
            //    console.log(jpsetVal);
            //    $(this).val(jpsetVal);
            //}
            Pcb.areaEvent();
            Pcb.BoardTypeData();
            Pcb.ImpositionInformationExample();
            var proCategory = $("[name=proCategory]:checked").val();
            if (proCategory != 'rogersItem' && proCategory != 'copper') Pcb.setItemsSelectDefault("BoardThickness", "1.6");
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
            Pcb.to211126('countNumer');
            Pcb.to211206('countNumer');
            Pcb.to231221('countNumer');
            Pcb.toOICThickness();
        });
        //默认绿油白字
        Pcb.defaultColor();

        Pcb.basicProRule();
        setTimeout(function () {
            Pcb.to231221("proCategory");//触发规则
            isRequst = true;
            Pcb.onetierFn();// //控制所有一层板材最小孔径不可选0.2mm
        });


        $(".nipdauPlatingBtn").on("click", function () {
            if (GetCheckedVal("nipdauPlatingInput") == undefined) {
                layer.msg(getLanguage('petCPGT'));
                return false
            }
            var nipdauPlatingInput = GetCheckedVal("nipdauPlatingInput").split(",")
            //金厚：ImGoldThinckness
            //钯厚: PalladiumThickness
            //镍厚: NickelThickness
            $("#NickelThickness").val(nipdauPlatingInput[0])
            $("#PalladiumThickness").val(nipdauPlatingInput[1])
            $("#ImGoldThinckness").val(nipdauPlatingInput[2])

            $("#AddCart-ImGoldThinckness").val(nipdauPlatingInput[2])
            $("#AddCart-PalladiumThickness").val(nipdauPlatingInput[1])
            $("#AddCart-NickelThickness").val(nipdauPlatingInput[0])

            layer.closeAll()
        })


        //选中后传参分别是
        //金厚：ImGoldThinckness
        //钯厚: PalladiumThickness
        //镍厚: NickelThickness
        $(".hardgoldPlatingBtn").on("click", function () {
            if (GetCheckedVal("hardgoldPlatingInput") == undefined) {
                layer.msg(getLanguage('petCPGT'));
                return false
            }
            if (GetCheckedVal("hardgoldPlatingInput") != 'user') {
                var hardgoldPlatingInput = GetCheckedVal("hardgoldPlatingInput")
                //传值
                $("#ImGoldThinckness").val(hardgoldPlatingInput)
                $("#Fee-ImGoldThinckness").val(hardgoldPlatingInput)
            } else {
                if ($(".txthardgoldPlatingInput").val() == "" || $(".txthardgoldPlatingInput").val() == "") {
                    layer.msg(getLanguage('petCPGT'));
                    return false
                }
                $("#ImGoldThinckness").val($(".txthardgoldPlatingInput").val())
                $("#AddCart-ImGoldThinckness").val($(".txthardgoldPlatingInput").val())
            }
            layer.closeAll()
        })
    },
    updateSinglePiecesQuantity: function (data) {
        var theNum = 0;
        try {
            theNum = data.pinban_x * data.pinban_y * data.Num;
        }
        catch {

        }
        $('#singlePiecesQuantity>span').html(theNum);
        AssemblyProductNum(theNum, true);
        if (theNum > 0) {
            $('#singlePiecesQuantity').parent().show();//没有值时隐藏
        }
        else {
            $('#singlePiecesQuantity').parent().hide();
        }
    },
    /** 默认值配置 */
    DefaultValueRule: {
        /** 通用默认值 无论何时都会触发， 支持两种方式，1：直接配置对象 2：配置一个返回对象的函数，入参为表单data */
        _: {

        },
        /** 规则配置 匹配当前操作项name时触发，同名默认值覆盖通用配置  */
        proCategory: function (data) {
            var result = {};
            switch (data.proCategory) {
                case 'fr4Item':
                    {
                        $.extend(result, Pcb.DefaultValueRule.CopperThickness(data),
                            Pcb.DefaultValueRule.BoardThickness(data));//触发对于规则
                        let boardLayers = parseFloat(data.BoardLayers);
                        if (boardLayers != 2 && isRequst) {
                            result['BoardLayers'] = 2;
                            setTimeout(function () {
                                $('input[name=BoardLayers][value=2]').parent().trigger('click')
                            })
                        }
                        result['SurfaceFinish'] = 'haslwithfree';
                        //$.extend(data, result);
                    }
                    break;
                case 'copper':
                    result['BoardThickness'] = 1.5;
                    break;
            }
            return result;
        },

        Num: function (data) {
            Pcb.updateSinglePiecesQuantity(data);
            AssemblyProductNum(data.Num);
            Pcb.Checked('IsAIPanel', '');
            resetAiPanle(Tools.UrlToJsonParams($("#smtorderForm").serialize()), "Num");
            //Pcb.onChange('IsAIPanel', '');
            return {};
        },
        pinban_x: function (data) {
            Pcb.updateSinglePiecesQuantity(data);
            return {};
        },
        pinban_y: function (data) {
            Pcb.updateSinglePiecesQuantity(data);
            return {};
        },
        t_pinban_y: function (data) {
            //Pcb.PcbCalcArea();
            return {
                pinban_y: data.t_pinban_y
            };
        },
        t_pinban_x: function (data) {
            //Pcb.PcbCalcArea();
            return {
                pinban_x: data.t_pinban_x
            };
        },
        PatchElementType: function () {
            Pcb.clearPrice();
            return {};
        },
        BoardLayers: function (data) {
            var result = {};
            let boardLayers = parseFloat(data.BoardLayers);
            if (data.proCategory == 'fr4Item' && boardLayers == 1) {
                result['SolderMask'] = 'top';
            }
            else {
                result['SolderMask'] = 'none';
            }
            if (window.pcbnumSelect) {
                var numSelect = window.pcbnumSelect
                numSelect.reRenderMsg();
                if (data.Num) {
                    numSelect.setValue(data.Num);
                }
            }
            return result
        },
        IsAIPanel: function () {
            var result = {};
            var data = Tools.UrlToJsonParams($("#smtorderForm").serialize());
            if (data.IsAIPanel == 'true') {
                //智能分配
                var type = Pcb.PcbisXiaoBanType(data);
                if (type == 1) {
                    result['t_pinban_y'] = data.PcbSizeY <= 50 ? Pcb.calcAbsTarget(data.PcbSizeY, 100) : 1;
                    result['t_pinban_x'] = data.PcbSizeX <= 50 ? Pcb.calcAbsTarget(data.PcbSizeX, 100) : 1;

                } else if (type == 2) {
                    result['t_pinban_y'] = data.PcbSizeY <= 150 ? Pcb.calcAbsTarget(data.PcbSizeY, 300) : 1;
                    result['t_pinban_x'] = data.PcbSizeX <= 150 ? Pcb.calcAbsTarget(data.PcbSizeX, 200) : 1;
                }
                result['t_pinban_x'] = result['t_pinban_x']
                result['t_pinban_y'] = result['t_pinban_y']
            }
            return result;
        },
        CopperThickness: function (data) {//铜厚
            var result = {}
            if (data.proCategory == 'fr4Item') {
                let val = parseFloat(data.CopperThickness);
                if ([3, 4].indexOf(val) > -1) {
                    result['LineWeight'] = 10;
                }
                else if ([5, 6].indexOf(val) > -1) {
                    result['LineWeight'] = 20;
                }
                else {
                    result['LineWeight'] = 6;
                }
            }
            return result;
        },
        InnerCopperThickness: function (data) {//内铜厚
            var result = {}
            if (data.proCategory == 'fr4Item') {
                let val = parseFloat(data.InnerCopperThickness);
                if ([3, 4].indexOf(val) > -1) {
                    result['LineWeight'] = 10;
                }
                else {
                    result['LineWeight'] = 6;
                }
            }
            return result;
        },
        BoardThickness: function (data) {//板厚
            var result = {}
            if (data.proCategory == 'fr4Item') {
                let val = parseFloat(data.BoardThickness);
                if ([2.5, 3.0, 3.2].indexOf(val) > -1) {
                    result['Vias'] = 0.4;
                }
                else if ([3.4, 3.6, 3.8, 4].indexOf(val) > -1) {
                    result['Vias'] = 0.5;
                }
                else {
                    result['Vias'] = 0.3;
                }
            }
            return result;
        },
        ProductNum: function (data) {
            return {};
        },
        BoardType: function (data) {
            if (data.BoardType == undefined && data.AssemblyBoardType == undefined) {
                return {};
            }
            var result = {}
            if (data.BoardType == 'pcs') {
                $('#labelQuantity').text('Quantity');
                $('#labelDimensions').text('Dimensions');
                $('#singlePiecesQuantity').hide();
                //$('.xiaoban-ai').css("display","block");
            } else {
                if (data.BoardType != undefined) {
                    if (data.BoardType == 'set') {
                        $('#divDifferentDesign').show();
                        $('#labelDimensions').text('Panel Dimensions');
                    }
                    else {
                        $('#divDifferentDesign').hide();
                    }
                    $('#labelQuantity').text('Panel Quantity');
                    Pcb.updateSinglePiecesQuantity(data);
                    //theNum
                    $('#singlePiecesQuantity').show();
                    //$('.xiaoban-ai').css("display", "none");
                }
            }
            if (data.AssemblyBoardType != undefined) {
                if (data.AssemblyBoardType == "pcs") {
                    $('#labelPanelDimensions .single-dimensions').show();
                    $('#labelPanelDimensions .mutilple-dimensions').hide();
                    $('#AssemblyPanelFormatDiv').hide();
                } else {
                    $('#labelPanelDimensions .single-dimensions').hide();
                    $('#labelPanelDimensions .mutilple-dimensions').show();
                    result['IsAIPanel'] = '';
                    $('#AssemblyPanelFormatDiv').show();
                }
            }
            //if (data.BoardType == 'set') {
            //    $('#labelDimensions').text('Panel Dimensions');
            //} else {
            //    $('#labelDimensions').text('Dimensions');
            //}
            AssemblyPanelDimensions();
            Pcb.HideTips('Num', false);
            return result;
        }
    },
    /** 在所有规则执行之前执行 */
    beforeDefaultValueRule: {
        _: {

        },
        BoardType: function (data) {
            var result = {}
            if (data.BoardType == 'pcs') {
            } else {
                if (data.BoardType == 'set') {
                    if (data.VCut == 'none') {
                        Pcb.QutoliEv('VCut', Pcb.QutoliEvType.hide, ['none']);
                        result['VCut'] = 'vcut';
                    }
                }
            }
            Pcb.HideTips('Num', true);
            return result;
        }
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
            SurfaceFinish: "haslwithfree",
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
                // if (item.name == "TestReport") {
                // 	if (val == "1") {
                // 		val ="Reliability Report"
                // 	} else if (val == "0") {
                // 		val="None"
                //     }
                //
                // }
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
                    //$(".pcbDetail [data-for=" + tsName + "]").hide();
                    //$(".pcbDetail [data-for=" + tsName + "]").find("em").text("");
                    $(".hover_detail .Fee-" + tsName).find("input").val("");
                } else {
                    $(".hover_detail .Fee-" + tsName).show();
                    $(".hover_detail [data-for=" + tsName + "]").show();
                    $(".hover_detail .Fee-" + tsName).find("em").text("Yes");
                    $(".hover_detail .Fee-" + tsName).find("input").val(1);
                }
            })
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
        $("." + commonData + " .pcbDetail li").each(function (j, elem) {
            var conventionalName = $(elem).find("input").attr("name");
            var conventionalValue = $(elem).find("input").attr("value");
            for (var key in conventional) {
                var name = "Fee-" + key;
                if (conventionalName == name) {
                    if (conventionalValue != undefined && conventionalValue !== conventional[key]) {
                        $(elem).find("em").addClass("cl-f00");
                    }
                }
            }
        })
    },
    //加购车确认信息
    sureInfo: function () {
        //点击Add to Cart
        $(".xgpp_cont").on("click", ".cart_item", function () {
            //判断是否登录
            //var userId = $("#HidUserId").val();
            //if (userId == 0) {
            //    showloginlayer("btnAddCart");
            //    return;
            //}
            var userId = $("#userId").val();
            if (userId == 0) {
                // showloginlayer("btnAddCart");
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
            //  $("#fm1").find(".Fee-Num").text(common_aera);
            //var rq = $(this).parents("tr").find("[name='AddCart-DeliveryDate']").val();
            //var rqfh = datas(rq);
            //$(".DeliveryDate").text(rqfh);
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

            //var shipPrice = $('#spShipMoeny').text();
            //if (shipPrice != '0.00') {
            //    shipPrice = shipPrice.split("$");
            //    shipPrice = shipPrice[1];
            //}
            //var sumPrice = parseFloat(shipPrice) + parseFloat(totalMoney[1]);  //产品费加运费
            //sumPrice = sumPrice.toFixed(2);
            //$('.sumPrice span').html("$" + sumPrice);  //总价价格
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

            let WVTest = $("[name='WVTest']:checked").val();
            $(".Fee-WVTest em").text(WVTest);
            $("[name='Fee-WVTest']").val(WVTest);

            // console.log(TestReport_arry)
            $("#Fee-PcbProType").val(pcbProType);
            $("#AddCart-FR4Type").val(fr4type);
            $("#AddCart-FR4Tg").val(fr4tg);
            $("#Fee-CoreTypeCode").val(CoreTypeCode);
            $("#AddCart-BoardBrand").val(boardbrand);
            $("#Fee-IsHighQuality").val(IsHighQuality);
            Pcb.commonParamSerialize("addCartDetail");
            var stepTag = $('.totalpricezone').attr('data-tag');
            Pcb.freeCoupon(fr4type, fr4tg, boardbrand, pcbProType, stepTag, CoreTypeCode);


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
            $('.selShip').attr('data-weight', totalWeight);
            $(".remarks textarea").val("");
            $(".remarks .customize-input").val("");
            if ($(".DeliveryType").text() > 3) {
                $(".pcb-delivery-days i").removeClass("yellow red").addClass("bg-a38459");
                $(".pcb-delivery-days em").text("D");
            } else {
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
            //获取所有的费用
            //var tableJdbCostBoard = $(this).parent("td").find("[name='AddCart-JdbCostBoard']").val();//板材费
            //var tableJdbCostCostruction = $(this).parent("td").find("[name='AddCart-JdbCostCostruction']").val();//工程费
            //var tableJdbCostFilm = $(this).parent("td").find("[name='AddCart-JdbCostFilm']").val();//菲林费
            //var tableJdbCostMetallize = $(this).parent("td").find("[name='AddCart-JdbCostMetallize']").val();//喷镀费
            //var tableJdbCostColor = $(this).parent("td").find("[name='AddCart-JdbCostColor']").val();//颜色费
            //var tableJdbCostPinBan = $(this).parent("td").find("[name='AddCart-JdbCostPinBan']").val();//拼版费
            //var tableJdbCostJiaJi = $(this).parent("td").find("[name='AddCart-JdbCostJiaJi']").val();//工艺费
            //var tableJdbCostShap = $(this).parent("td").find("[name='AddCart-JdbCostShap']").val();//成型费
            //var tableJdbCostOther = $(this).parent("td").find("[name='AddCart-JdbCostOther']").val();//其他费
            //var tableJdbCostTest = $(this).parent("td").find("[name='AddCart-JdbCostTest']").val();//测试费
            //var tableoriginalJdbTestMoney = $(this).parent("td").find("[name='AddCart-originalJdbTestMoney']").val();//原测试费
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

            //if ($("data-price-item='AddCart-JdbCostOther'").text() < 1) {
            //    var oldBoard = $("[data-price-item='AddCart-JdbCostBoard']").text();
            //    var other = $(dom).text();
            //    var newBoard = ((oldBoard - 0) + (other - 0)).toFixed(2);
            //    $("[data-price-item='AddCart-JdbCostBoard']").text(newBoard);
            //    $("[data-price-item='AddCart-JdbCostOther']").parents("li").hide();
            //}
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
        var html1 = "";//装工艺名的类型
        var html2 = "";//装每一项工艺的具体值
        var html3 = "";
        var html4 = "";//装ul
        var dlhtml = "";  //如果超过7个的话第二行显示
        var changeTableThead = "";
        for (var i = 0; i < scrList.length; i++) {
            var seleList = scrList[i].List;
            if (i == 0) {
                for (var j = 0; j < seleList.length; j++) {
                    html3 += '<li onclick="fnSelectd(this)"><label class="item rel">' + seleList[j] + '</label></li>'
                }
                html3 += '<input class="undis hide_input" name="' + scrList[i].Name + '" value="">'
            } else {
                if (i == 4) {
                    html1 += '<dd class="name active">' + scrList[i].EnglishName + '<em class="arr_bottom"></em><input class="undis" name="' + scrList[i].Name + '" type="radio"></dd>';
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
                        if (i > 6) {
                            dlhtml += '<dd class="name">' + scrList[i].EnglishName + '<i class="wen_tip pointer ml5" data-html="true" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="' + explain + '"></i><em class="arr_bottom"></em><input class="undis" name="' + scrList[i].Name + '"></dd>';
                        } else {
                            html1 += '<dd class="name">' + scrList[i].EnglishName + '<i class="wen_tip pointer ml5" data-html="true" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="' + explain + '"></i><em class="arr_bottom"></em><input class="undis" name="' + scrList[i].Name + '"></dd>';
                        }
                        html2 = "";
                        for (var j = 0; j < seleList.length; j++) {
                            if (seleList[j] !== null) {
                                html2 += '<li onclick="fnSelectd(this)"><label class="item rel">' + seleList[j] + '</label></li>'
                            }
                        }
                        html4 += '<ul class="clearfix option-choose undis">' + html2 + '<input class="undis hide_input" name="' + scrList[i].Name + '"  value=""></ul>'

                    } else {
                        if (i > 6) {
                            dlhtml += '<dd class="name">' + scrList[i].EnglishName + '<em class="arr_bottom"></em><input class="undis" name="' + scrList[i].Name + '"></dd>';
                        } else {
                            html1 += '<dd class="name">' + scrList[i].EnglishName + '<em class="arr_bottom"></em><input class="undis" name="' + scrList[i].Name + '"></dd>';
                        }
                        html2 = "";
                        for (var j = 0; j < seleList.length; j++) {
                            if (seleList[j] !== null) {
                                html2 += '<li onclick="fnSelectd(this)"><label class="item rel">' + seleList[j] + '</label></li>'
                            }
                        }
                        html4 += '<ul class="clearfix option-choose undis">' + html2 + '<input class="undis hide_input" name="' + scrList[i].Name + '"  value=""></ul>'
                    }

                }

                //for (var j = 0; j < seleList.length; j++) {
                //    html2 += '<li><label class="item rel"><input class="undis" name="' + scrList[i].Name + '" type="radio" value="' + seleList + '">' + seleList[j] + '</label></li>'
                //}
            }
            changeTableThead += '<th data_name="' + scrList[i].Name + '"><div class="th_item bold">' + scrList[i].EnglishName + '</div></th>';
            //    html2 = "";
            //    for (var j = 0; j < seleList.length; j++) {
            //        html2 += '<div class="select-item nowrap" onclick="fnSelectd(this)">' + seleList[j] + '</div>'
            //    }
            //    var explain = scrList[i].Explain;

            //    if (explain != "" && explain != null && explain != 'undefined') {
            //        html1 += '<li class="parameter-item "><div class="parameter-content"><div class="name rel">' + scrList[i].EnglishName + '<i class="wen_tip pointer ml5" data-html="true" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="' + explain + '"></i></div><div class="parameter-search"><input class="search_inp" type="text"><img src="/content/img/onlineNew/search-icon.png"  class="search-icon" onclick="screeningParameters(this)"></div><div class="select-box">' + html2 + '</div></div><div class="clear-btn hide" style="cursor:pointer;" onclick="clearChoosen(this)">清除</div><input class="undis hide_input" name="' + scrList[i].Name + '" count="0" value="" isself="1"></li>'
            //        changeTableThead += '<th data_name="' + scrList[i].Name + '"><div class="th_item">' + scrList[i].EnglishName + '</div></th>';
            //    } else {
            //        html1 += '<li class="parameter-item "><div class="parameter-content"><div class="name">' + scrList[i].EnglishName + '</div><div class="parameter-search"><input class="search_inp" type="text"><img src="/content/img/onlineNew/search-icon.png"  class="search-icon" onclick="screeningParameters(this)"></div><div class="select-box">' + html2 + '</div></div><div class="clear-btn hide" style="cursor:pointer;" onclick="clearChoosen(this)">清除</div><input class="undis hide_input" name="' + scrList[i].Name + '" count="0" value="" isself="1"></li>'
            //        changeTableThead += '<th data_name="' + scrList[i].Name + '"><div class="th_item">' + scrList[i].EnglishName + '</div></th>';
            //    }
            //}
            $(".plate_no").html(html3);
            $(".other_option .dl1").html(html1);
            if (scrList.length > 7) {
                $('.togglebtn').removeClass('undis');
                $(".other_option .dl2").html(dlhtml);
            } else {
                $('.togglebtn').addClass('undis');
            }
            $(".select_item_box").html(html4);
            //$(".parameter-container").html(html1);
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
    onChange: function (name, data, disableCalcPrice) {
        if (name == "BoardType") {
            var val = getCkVal("AssemblyBoardType");
            $("[name=AssemblyBoardType]").parents(".item").removeClass("notpcbdesigntype");
            if (val == "pcs") {
                $("[name=AssemblyBoardType][value=pcs]").parents(".item").addClass("notpcbdesigntype");
            } else {
                $("[name=AssemblyBoardType][value=set]").parents(".item").addClass("notpcbdesigntype");
            }
        }
        if (name != "BoardLayers") {
            Pcb.setDefaultValue(data, name, Pcb.DefaultValueRule);
        }
        if (Number($('#BoardHeight').val()) > 0 || Number($('#BoardWidth').val()) > 0) {
            resetAiPanle(data, name);
        } else {
            clearXiaoBanAi();
            Pcb.tiggerShow('xiaoban-ai', '');
        }
        if (name === 'ProductNum' && data.ProductNum) {
            onExpectedPrice(data.ProductNum);
        }
    },

    //数量
    numEvent: function () {

    },
    onNumChange: function () {
        var num = $('#Num').val()
        Pcb.clearPrice();
        $("#hidParmChanged").val("yes");
        Pcb.BoardTypeData();
        Pcb.areaEvent();
        Pcb.proCategory('BNumber');
        Pcb.setDefaultValue(Pcb.getFormData(), 'Num', Pcb.DefaultValueRule)
        //Pcb.newHeat();
        Pcb.onetierFn();// //控制所有一层板材最小孔径不可选0.2mm
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
        Pcb.clearPrice();
        $(".para_select").addClass("canPrice");
        Pcb.Ruixing();
        Pcb.Newrule();

        Pcb.to211126('countNumer');
        Pcb.to211206('countNumer');
        Pcb.to231221('countNumer');
        Pcb.toTypeCopper('countNumer');
        LP.dataPointJP({ label: 'countNumer', type: 'click', value: num });
        AssemblyProductNum(num);
        Pcb.toOICThickness();
    },
    Newrule: function (data) {
        var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
        var ImageTranster = $("[name=ImageTranster]:checked").val();
        var proCategory = $("[name=proCategory]:checked").val();
        var BoardLayers = $("[name='BoardLayers']:checked").val();
        var FlyingProbe = $("[name=FlyingProbe]:checked").val();
        var BoardType = $("[name=BoardType]:checked").val();
        //如果是曝光工艺并且 面积大于30并且 不是铝基板
        if (area > 30 && proCategory != "aluminumItem" && BoardLayers == "1") {
            if (data == "FlyingProbe") {
                //如果是工程测试
                if (FlyingProbe == "teststand") {
                    Pcb.QutoliEv("[name='ImageTranster'][value='screenprinting']", 3);
                    Pcb.Checked("ImageTranster", "screenprinting");
                    //如果是飞针 默认是曝光
                } else if (FlyingProbe == "full") {
                    Pcb.QutoliEv("[name='ImageTranster'][value='exposure']", 3);
                    Pcb.Checked("ImageTranster", "exposure");
                }
            } else {
                //选定是曝光工艺  飞针
                if (ImageTranster == "exposure") {
                    Pcb.QutoliEv("[name='FlyingProbe'][value='full']", 3);
                    Pcb.Checked("FlyingProbe", "full");
                    Pcb.Checked("FormingType", "mechanical");


                } else {
                    //丝网印刷   测试架   模具
                    // Pcb.QutoliEv("[name='FlyingProbe'][value='teststand']", 3);
                    // Pcb.Checked("FlyingProbe", "teststand");
                    Pcb.Checked("FormingType", "module");
                }
            }

        }
        ////2021-11-26
        var NumPCS = $("#Num").val();
        if (NumPCS < 30 && proCategory != 'copper') {
            Pcb.QutoliEv("[name='SurfaceFinish'][value='haslwithfree']", 3);
            if (name != 'SurfaceFinish') selectVal("SurfaceFinish", "haslwithfree");
            // console.log(NumPCS+'==<30');
        } else if (NumPCS >= 30 && proCategory != 'copper') {
            if (proCategory == 'cem1Item') {
                // Pcb.QutoliEv("[name='SurfaceFinish'][value='osp']", 3);
                // console.log(111);
                if (name != 'SurfaceFinish') {
                    selectVal("SurfaceFinish", "osp");
                }
                // console.log(NumPCS+'==>30');
            } else {
                // Pcb.QutoliEv("[name='SurfaceFinish'][value='haslwithlead']", 3);
                if (name != 'SurfaceFinish') {
                    // console.log(BoardLayers,$("[name='BoardThickness']:checked").val(),area)
                    if (BoardLayers == 1 && $("[name='BoardThickness']:checked").val() == '0.6' && area > 5) {

                    } else {
                        selectVal("SurfaceFinish", "haslwithfree");
                    }
                }
            }
        }
        show_imgoldthincknesszone()
        /////
        if (area > 30 && BoardType != "pcs" && proCategory != "aluminumItem") {
            //选定是曝光工艺  飞针
            if (ImageTranster == "exposure") {
                // Pcb.QutoliEv("[name='FlyingProbe'][value='full']", 3);
                // Pcb.Checked("FlyingProbe", "full");
                Pcb.Checked("FormingType", "mechanical");


            } else {
                //丝网印刷   测试架   模具
                // Pcb.QutoliEv("[name='FlyingProbe'][value='teststand']", 3);
                // Pcb.Checked("FlyingProbe", "teststand");
                Pcb.Checked("FormingType", "module");
            }
        }
    },
    //获取选中的国家
    InitCountry: function () {
        var the_country = $("select[name=selShipCountry]").find(':selected').val();
        // console.log(the_country)
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

        //ShipCountryChange();
    },
    //免费打样券
    freeCoupon: function (fr4type, fr4tg, boardbrand, pcbProType, stepTag, CoreTypeCode) {
        var parm = {};
        parm = Pcb.transferPara(fr4type, fr4tg, boardbrand, pcbProType, stepTag, CoreTypeCode);
        var SmtOrderNo = $("#SmtOrderNo").val();
        //parm += "&Fee-SmtOrderNo=" + SmtOrderNo;
        parm["Fee-SmtOrderNo"] = SmtOrderNo;
        parm["act"] = "CheckCanUseFreeCoupon";
        //console.log(parm);
        $.ajax({
            url: 'https://www.allpcb.com/ashx/PcbOnline.ashx',
            dataType: 'json',
            type: 'post',
            data: parm,
            async: false,
            beforeSend: function () {
            },
            success: function (data) {
                if (data.success) {
                    if (data.attr > 0) {
                        //    $(".order-free-box").trigger("click");
                        $(".order-free-box").show();
                        $(".order-free-box .free-input").prop("checked");
                        $(".order-free-box").addClass("active");
                        $(".order-free-box").find("input").val(1);
                        $(".total-money span").text("$0.00");
                        sumPrice();
                    } else {
                        $(".order-free-box").hide();
                        $(".order-free-box").find("input").val(0);
                        $(".order-free-box").removeClass("active");
                        $('.order-free-box .free-input').prop("checked", false);
                        $(".total-money span").text($(".total-money span").attr("data-money"));
                    }
                }
            }
        });
        return false;
    },
    //选择供应商
    selectApply: function (dataCode) {
        $('html,body').animate({ scrollTop: 97 }, 800);
        var html = $(".output_price .info_new_box").html();
        var fr4type = $("#AddCart-FR4Type").val();
        var fr4tg = $("#AddCart-FR4Tg").val();
        var boardbrand = $("#AddCart-BoardBrand").val();
        var pcbProType = $("#Fee-PcbProType").val();
        $(".online_hd li").removeClass("current");
        $(".online_hd li").eq(2).addClass("current");
        $(".output_price").hide();
        $(".apply_cont").show();
        $(".para_info_cont").html(html);
        var fr4typeNew = "";
        if (fr4type == "fr4") {
            fr4typeNew = "FR-4生益";
        } else if (fr4type == "fr4jt") {
            fr4typeNew = "FR-4建滔";
        } else if (fr4type == "gj") {
            fr4typeNew = "FR-4国纪";
        } else if (fr4type == "cem1") {
            fr4typeNew = "CEM-1建滔黄芯";
        } else if (fr4type == "gzaluminum") {
            fr4typeNew = "广州铝基板";
        } else if (fr4type == "aluminum") {
            fr4typeNew = "国纪铝基板";
        } else if (fr4type == "ny") {
            fr4typeNew = "FR-4南亚";
        } else if (fr4type == "fr4pyab1") {
            fr4typeNew = "FR-4普源";
        } else if (fr4type == "fr4hzh150") {
            fr4typeNew = "FR-4华正";
        }
        //增加板材类型
        var liHtml = '<li class="Fee-proCategory"><span>Product Type</span><em>' + fr4typeNew + '</em></li>'
        $(".para_info_cont ul").eq(0).append(liHtml);
        $.ajax({
            url: 'https://www.allpcb.com/ashx/PcbOnline.ashx?act=GetSupplierList&SupplierCodes=' + dataCode + "&t=" + new Date(),
            dataType: 'json',
            type: 'post',
            beforeSend: function () {
            },
            success: function (data) {
                //  console.log(data)
                if (data.success) {
                    var applyInfo = data.attr;
                    var html = "";

                    for (var i = 0; i < applyInfo.length; i++) {

                        html += '<li class="clearfix"><a href="/pcb/supplierdetail?code=' + applyInfo[i].FactoryCode_ + '" class="pull-left" target="_blank"><div class="apply_title clearfix"><h2 class="pull-left f16 cl-333">' + applyInfo[i].Model_ + ' ECMS ' + applyInfo[i].FactoryCode_ + '</h2><div class="clearfix pull-left undis"><i class="apply_icon ico_iso"></i><i class="apply_icon ico_ul"></i><i class="apply_icon ico_sgs"></i></div><div class="pull-left undis"><span class="apply_tag">推荐</span><span class="apply_tag">优质供应商</span></div></div><div class="show_instre cl-999 mt10">' + applyInfo[i].Range_ + '</div><div class="hover_show undis"><div class="score_box clearfix undis"><span class="cl-999 pull-left">综合评分</span><div class="score-list rel ml5 L_score_list pull-left" title="客户评分：5.0 分"><i style="width:100.00%;"></i></div><span class="pull-left cl-999">5.0</span></div><div class="hover_show_txt mt20 cl-333">' + applyInfo[i].Synopsis2_ + ' </div><dl class="clearfix mt10"><dd class="workshop_icon"><i class="apply_icon"></i>' + applyInfo[i].Footprint_ + '㎡厂房</dd><dd class="staff_icon"><i class="apply_icon"></i>' + applyInfo[i].TotalSu_ + '名员工</dd><dd class="estab_icon"><i class="apply_icon"></i>' + applyInfo[i].RegYear_ + '成立</dd><dd class="position_icon"><i class="apply_icon"></i>' + applyInfo[i].RegAddress_ + '</dd></dl></div></a><div class="cart_item_btn"><span class="cart_item" data-FactoryCode_="' + applyInfo[i].FactoryCode_ + '"><i class="ico-cart"></i>Add Cart</span></div></li>'
                    }
                    $(".apply_company_right .apply_company_list").html(html);
                    //查看供应商
                    $(".apply_company_right li").hover(function () {
                        $(".apply_company_right li").removeClass("active");
                        $(this).addClass("active");
                        if ($(this).find(".hover_show_txt").text().indexOf("null") > -1) {
                            $(this).find(".hover_show_txt").hide();
                        }
                    }, function () {
                        $(".apply_company_right li").removeClass("active");
                    })
                    $(".apply_company_right ul li").each(function (j, elem) {
                        $(elem).find("dd").each(function (h, dom) {
                            if ($(dom).text().indexOf("null") > -1) {
                                $(dom).hide();
                            }
                        })
                        if ($(elem).find(".show_instre").text().indexOf("null") > -1) {
                            $(elem).find(".show_instre").hide();
                        }
                    })
                    if ($(".apply_company_right ul li").length < 6) {
                        $(".load_more").hide();
                    }
                }
            }
        });
        var parm = {};
        var stepTag = $('.totalpricezone').attr('data-tag');
        parm = Pcb.transferPara(fr4type, fr4tg, boardbrand, pcbProType, stepTag, CoreTypeCode);
        parm["act"] = "CheckCanUseSpeedCoupon";
        $.ajax({
            url: 'https://www.allpcb.com/ashx/PcbOnline.ashx',
            dataType: 'json',
            type: 'post',
            data: parm,
            beforeSend: function () {
            },
            success: function (data) {
                if (data.success) {
                    if (data.attr == 1) {
                        $(".order-free-ticket").show()
                    } else {
                        $(".order-free-ticket").hide()
                    }
                }
            }
        });
        return false;
    },
    //出货报告层数处理
    TestReportFn: function (area, BoardLayers) {
        var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
        var proCategory = $("[name=proCategory]:checked").val();
        var BoardType = $("[name=BoardType]:checked").val();
        var BoardLayers = $("[name=BoardLayers]:checked").val();
        // var TestReport = $("[name=TestReport]:checked").val();
        var productType = $("[name=productType]:checked").val();
        var pcsnum = $("[name=Num]").val();

        if (BoardType == 'set' || BoardType == 'jpset') {
            var px = $("[name=pinban_x]").val();
            var py = $("[name=pinban_y]").val();
            pcsnum = pcsnum * (px * py);
        } else {
            pcsnum = $("[name=Num]").val();
        }
        // console.log(pcsnum)

        //2023-03-02 09
        //只默认两种报告：品质保证书、电性能测试报告 由客户选择 不在默认；
        Pcb.QutoliEv('[name=TestReport][value=WQ],[name=TestReport][value=EPTR]', 4);
        // if(pcsnum>=20){
        //     Pcb.QutoliEv('[name=TestReport]',5);
        //     if((proCategory==='fr4Item'||proCategory==='aluminumItem') && BoardLayers == 1){
        //         Pcb.QutoliEv('[name=TestReport][value=EPTR],[name=TestReport][value=FPIR]',4);
        //     }else{
        //         // Pcb.QutoliEv('[name=TestReport][value=EPTR],[name=TestReport][value=WQ],[name=TestReport][value=FPIR],[name=TestReport][value=MSR],[name=TestReport][value=CTTR],[name=TestReport][value=WTR],[name=TestReport][value=TSTR]',4);
        //     }
        // }else{
        //     // Pcb.QutoliEv('[name=TestReport][value=WQ],[name=TestReport][value=FPIR],[name=TestReport][value=MSR],[name=TestReport][value=CTTR],[name=TestReport][value=WTR],[name=TestReport][value=TSTR],[name=TestReport][value=ICTR]',5);
        // }
        Pcb.setTestReport()
        // console.log($("[name=TestReport]:checked").length);
        if (Pcb.ParmValid()) {
            if (proCategory == "fr4Item") {
                $(".producTestReport").slideDown(300);
                // if (pcsnum > 30 && productType == "1") {
                // Pcb.Checked("TestReport", '1')
                // } else {
                // 	if (area <= 50) {
                // Pcb.QutoliEv("[name='TestReport']", 3);
                // Pcb.Checked("TestReport", "0");
                // } else {
                // Pcb.QutoliEv("[name='TestReport'][value='0']", 2);
                // Pcb.QutoliEv("[name='TestReport'][value='1']", 3);
                // Pcb.Checked("TestReport", "1");
                // 	}
                // }

                // if (TestReport == "1") {
                // 	if (area <= 50) {
                // 		if (area <= 5) {
                // 			$(".TestTextReport").text("*Contains FQC, metallographic section, weldability and electrical survey report. Needs additional fee and extra one day.")
                // 		} else {
                // 			$(".TestTextReport").text("*Contains FQC（FREE）, metallographic section, weldability and electrical survey report. Needs additional fee and extra one day.")
                // 		}
                // 	} else {
                // 		$(".TestTextReport").text("*Contains FQC, metallographic section, weldability and electrical survey report. Free of Charge, needs extra one day.")
                // 	}
                // } else {
                // 	$(".TestTextReport").text("")
                // }

            } else {
                // $(".producTestReport").slideUp(300);
                // Pcb.Checked("TestReport", "0");
            }
        }

    },
    setTestReport() {
        let TestReport_arry_tit = [];
        let TestReport_arry_key = [];
        $("[name='TestReport']:checked").each(function (index) {
            TestReport_arry_tit[index] = $(this).attr('data-tit');
            TestReport_arry_key[index] = $(this).val();
        });
        // console.log($("[name='TestReport']:checked").length,TestReport_arry_tit,TestReport_arry_key)
        $(".Fee-TestReport em").text(TestReport_arry_tit);
        $("[name='Fee-TestReport']").val(TestReport_arry_key);
    },
    //控制所有一层板材最小孔径不可选0.2mm
    onetierFn: function () {
        var BoardLayers = $("[name=BoardLayers]:checked").val(); //板子层数
        var Vias = $("[name=Vias]:checked").val(); //板子层数
        if (BoardLayers == "1") {
            if (Vias == "0.2") {
                Pcb.Checked("Vias", "0.8");
            }
            Pcb.QutoliEv("[name='Vias'][value='0.2']", 2);
        } else {
            Pcb.QutoliEv("[name='Vias'][value='0.2']", 3);
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

            // 切换板材类型 内铜隐藏
            if (name == 'proCategory' && $(this).find("input").attr('value') != $("[name=proCategory]:checked").val()) {
                $(".inner-layer-thickness,.impedance_option").slideUp(300);
            }

            //单独拿出来的Test Report  是静态不是循环生成
            if (name == "TestReport") {
                var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
                // var TestReport = $("[name=TestReport]:checked").val();
                if (Pcb.ParmValid()) {
                    let value = $(this).find("input").attr("value");
                    // if(value=='TSTR' || value=='WTR'){
                    //     if($("[name=TestReport][value=TSTR]:checked").length||$("[name=TestReport][value=WTR]:checked").length){
                    //         Pcb.QutoliEv("[name=TestReport][value=TSTR],[name=TestReport][value=WTR]",5);
                    //     }else{
                    //         Pcb.Checked('TestReport','TSTR',false);
                    //         Pcb.Checked('TestReport','WTR',false);
                    //     }
                    // }else{
                    if ($(this).hasClass('choose')) {
                        $(this).removeClass('choose');
                        $(this).find('.jp-ico').remove();
                        $("[name='" + name + "'][value='" + value + "']").prop("checked", false);
                    } else {
                        $(this).addClass("choose");
                        $("[name='" + name + "'][value='" + value + "']").before("<i class='jp-ico subscript-ico'></i>");
                        $("[name='" + name + "'][value='" + value + "']").prop("checked", true);
                    }
                    // }
                }
                Pcb.setTestReport()
            } else {
                Pcb.Checked($(this).find("input").attr("name"), $(this).find("input").val());//选择值
            }
            // 默认值设置(旧规则之前)
            Pcb.setDefaultValue(Pcb.getFormData(), name, Pcb.beforeDefaultValueRule);
            LP.dataPointJP({ label: name, type: 'click', value: $(this).find("input").val() });
            // console.log(name);
            //板子层数
            if (name == "BoardLayers") {
                Pcb.BoardLayersSort();
                Pcb.basicProRule();
                //Pcb.ProcessRule();
                Pcb.SpecialProcessRule();
                Pcb.commonArea();
                Pcb.Newrule();
                //出货报告层数处理

                var BoardLayers = $("[name=BoardLayers]:checked").val(); //板子层数
                if (BoardLayers == "4" || BoardLayers == "6") {
                    Pcb.Checked("InnerCopperThickness", "1");
                } else {
                    Pcb.Checked("InnerCopperThickness", "1");
                }
                var Vias = $("[name=Vias]:checked").val(); //板子层数
                if (BoardLayers == "1") {
                    if (Vias == "0.2") {
                        Pcb.Checked("Vias", "0.8");
                    }
                    Pcb.QutoliEv("[name='Vias'][value='0.2']", 2);
                } else {
                    Pcb.QutoliEv("[name='Vias'][value='0.2']", 3);
                }
                Pcb.TestReportFn()
                Pcb.onetierFn();// //控制所有一层板材最小孔径不可选0.2mm

                impedance_optionFn();//控制单面板不显示阻抗
            }
            if (name == "productType") {
                Pcb.TestReportFn();
                Pcb.Checked("Vias", "0.8");
            }

            //有锣槽的时候显示槽间距
            if (name == "BoardType" || name == "VCut" || name == "processeEdge_x" || name == "processeEdge_y") {
                var BoardType = $("[name=BoardType]:checked").val();
                var VCut = $("[name=VCut]:checked").val();
                $(".luocao-state").hide();
                if (name == "BoardType") {
                    if (BoardType == "pcs") {
                        $("#unit").text("pcs");
                        $(".table-BoardType").text("pcs");
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
                        //if (VCut == "none") {
                        //    Pcb.Checked("VCut", "vcut");
                        //}
                    } else if (BoardType == "jpset") {
                        $("#unit").text("sets");
                        $("[for=set]").show();
                        $("[for2=jpset]").show();
                        $("[name=BoardType][value=set]").parents("label").find(".arr_bottom").removeClass("arrow_top");
                        $("[name=BoardType][value=jpset]").parents("label").find(".arr_bottom").addClass("arrow_top");
                        //if (VCut == "none") {
                        //    Pcb.Checked("VCut", "vcut");
                        //}
                    }
                    AssemblyPCBDesignType();
                    Pcb.BoardTypeTips();
                }
                Pcb.luocao();
                Pcb.BoardTypeData();
                Pcb.ImpositionInformationExample();
                Pcb.leadNum();

                Pcb.pinbanVaildate()
                //Pcb.areaEvent();
                Pcb.TestReportFn();
            }
            if (name == "processeEdge_x") {
                Pcb.BoardTypeData()
                Pcb.ImpositionInformationExample();
                //Pcb.areaEvent();
            }
            //if (name == "BoardType") {
            //    Pcb.commonArea();
            //    //var BoardType = $('.BoardType').
            //    Pcb.BoardTypeData();
            // }
            //产品类别点击
            if (name == "proCategory") {
                Pcb.proCategory(name);
                Pcb.basicProRule();
                //Pcb.ProcessRule();
                Pcb.SpecialProcessRule();
                Pcb.areaEvent();
                Pcb.Newrule();
                Pcb.TestReportFn();
                Pcb.onetierFn();// //控制所有一层板材最小孔径不可选0.2mm
                Pcb.ViasCategory();

                impedance_optionFn();
            }
            if (name == "proCategory" || name == "BoardLayers" || name == "BoardThickness" || name == "CopperThickness") {
                Pcb.Ruixing();
            }
            if (name == 'CopperThickness') {
                Pcb.toTypeCopper(name);//铜基板
            }
            //表面处理
            if (name == "SurfaceFinish") {
                var SurfaceFinish = $("[name=SurfaceFinish]:checked").val();
                if (SurfaceFinish == 'hardgold' || SurfaceFinish == 'haslwithfreeandhardgold') {
                    Pcb.setRadioSelectDefault('hardgoldPlatingInput', 3);
                    if ($("#ImGoldThinckness").val() == '') $("#ImGoldThinckness").val('3');
                    layer.open({
                        skin: 'beizhuModel',
                        type: 1,
                        shade: 0.3,
                        title: getLanguage('psGPT'),
                        closeBtn: 1,
                        shadeClose: true,
                        hideOnClose: true,
                        id: 'dialog_hardgoldPlating',
                        area: ['600px', '440px'], //宽高
                        content: $('#hardgoldPlating') //捕获的元素
                    });
                } else if (SurfaceFinish == 'eletrolyticnickelgod') {
                    $("#nipdauPlating li").eq(0).find('input:radio').prop("checked", true);
                    layer.open({
                        skin: 'beizhuModel',
                        type: 1,
                        shade: 0.3,
                        title: getLanguage('psPGTPTNT'),
                        closeBtn: 1,
                        shadeClose: true,
                        id: 'dialog_nipdauPlating',
                        hideOnClose: true,
                        area: ['600px', '440px'], //宽高
                        content: $('#nipdauPlating') //捕获的元素
                    });
                }
            }
            show_imgoldthincknesszone()
            //测试方式
            if (name == "FlyingProbe") {
                var FlyingProbe = $("[name=FlyingProbe]:checked").val();
                if (FlyingProbe == "teststand") {
                    $(".test-tips").show();
                } else {
                    $(".test-tips").hide();
                }
                Pcb.Newrule(name)
            }
            //最小孔径和线宽线距
            if (name == "Vias" || name == "LineWeight") {
                Pcb.commonArea();
            }
            //阻焊工艺
            var proCategory = $("[name=proCategory]:checked").val();
            if (name == "ImageTranster" && proCategory != 'aluminumItem') {
                var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
                var ImageTranster = $("[name=ImageTranster]:checked").val();
                if (ImageTranster == "exposure") {
                    //Pcb.Checked("Invoice", "1");
                    //Pcb.Checked("WithstandVoltage", "2500");
                } else {
                    Pcb.newHeat();
                }
                Pcb.Newrule();
                /*Pcb.Checked("FormingType", "module");*/
            }
            //选择模具成型只能选丝网印刷
            //if (name == "FormingType") {
            //    var FormingType = $("[name=FormingType]:checked").val();
            //    if (FormingType == "module") {
            //        Pcb.QutoliEv("[name='ImageTranster'][value='exposure']", 2);
            //        Pcb.Checked("ImageTranster", "screenprinting");
            //    }
            //}
            if (name == "Invoice") {
                var Invoice = $("[name=Invoice]:checked").val();
                if (Invoice == 5) {
                    Pcb.Checked("WithstandVoltage", "1500");
                    show_HVIT();
                }
                //if (Invoice !== "5") {
                //	Pcb.Checked("ImageTranster", "exposure");
                //	Pcb.Checked("WithstandVoltage", "2500");
                //} else {
                //	Pcb.newHeat();
                //	Pcb.Checked("WithstandVoltage", "1500");
                //}
            }
            if (name == "WithstandVoltage") {
                var WithstandVoltage = $("[name=WithstandVoltage]:checked").val();
                if (WithstandVoltage != "1500") {
                    if (proCategory == 'aluminumItem' || proCategory == 'copper') {

                    } else {
                        Pcb.Checked("Invoice", "1");
                    }
                    Pcb.Checked("ImageTranster", "exposure");
                    if (proCategory != 'copper') {
                        Pcb.QutoliEv("[name='WVTest']", 3);
                    }
                } else {
                    show_HVIT();
                    //Pcb.newHeat();
                    //Pcb.Checked("Invoice", "5");
                }
            }
            function show_HVIT() {
                Pcb.QutoliEv("[name='ImageTranster'][value='exposure'],[name='WVTest']", 2);
                Pcb.Checked("WVTest", "none");
            }

            //默认绿油白字，白油黑字
            //默认绿油白字，白油黑字
            if (name == "SolderColor") {

                var proCate = $("[name=proCategory]:checked").val();
                var solderColor = $("[name='SolderColor']:checked").val();

                if (proCate == "fr4Item" || proCate == "cem1Item") {
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
                else if (proCate == "rogersItem") {

                    if (solderColor == 'black' || solderColor == 'matteblack') {
                        Pcb.QutoliEv("[name='FontColor'][value='green'],[name='FontColor'][value='black'],[name='FontColor'][value='blue'],[name='FontColor'][value='matteblack'],[name='FontColor'][value='mattegreen']", 2);
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
                    } else {
                        Pcb.QutoliEv("[name=SolderColor]", 3);
                        Pcb.QutoliEv("[name=SolderColor][value=yellow],[name=SolderColor][value=matteblack],[name=SolderColor][value=mattegreen]", 2);
                        Pcb.QutoliEv("[name=FontColor]", 2);
                        Pcb.QutoliEv("[name=FontColor][value=white],[name=FontColor][value=black],[name=FontColor][value=none]", 3);
                        Pcb.Checked("FontColor", "white");

                    }
                }
                else {
                    Pcb.QutoliEv("[name='FontColor']", 3);
                    if (solderColor == 'black' || solderColor == 'matteblack') {
                        Pcb.QutoliEv("[name='FontColor'][value='green'],[name='FontColor'][value='black'],[name='FontColor'][value='blue'],[name='FontColor'][value='matteblack'],[name='FontColor'][value='mattegreen']", 2);
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
                    }
                }

                // Pcb.SS_Color(); //阻焊字符颜色提示
            }
            if (name == 'FontColor') {
                // Pcb.SS_Color(); //阻焊字符颜色提示
            }
            if ($(".info_basic").height() > $(".info_comm").height()) {
                $(".info_comm").height($(".info_basic").height())
            }
            //阻抗
            if (name == "ImpedanceSize") {
                var ImpedanceSize = $("[name=ImpedanceSize]:checked").val();
                if (ImpedanceSize == "1") {
                    $(".impedance_report").show();
                } else {
                    $(".impedance_report").hide();
                    Pcb.Checked("ImpedanceReport", "0")
                }
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
            //      if (BoardType == 'jpset') {
            //          var jpsetnum = ( $("[name=Num]").val()) * ($("[name=pinban_x]").val()) * ($("[name=pinban_y]").val());
            //      } else {
            //          var jpsetnum = $("[name=Num]").val();
            //}

            var jpsetnum = $("[name=Num]").val();
            var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), jpsetnum, GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());

            //if (typeof area == number || typeof area == string) {
            //	if (area=="")
            //	debugger
            //         }
            if (area == "NaN") {
                area = 0;
            }
            $(".common_area span").text(area);

            //Allow Substitutes 允许替代品
            if (name == "AcceptSameBom") {
                if ($("[name=AcceptSameBom]:checked").val() == "1") {
                    $('.' + "accept-same-bom-show").slideDown();
                } else {
                    $('.' + "accept-same-bom-show").slideUp();
                }
            }
            if (name == "IsAIPanel" || (name == "BoardType")) {
                Pcb.PcbCalcArea();
            }
            if (name == "WriteNote") {
                if ($("[name=WriteNote]:checked").val() == "1") {
                    $('[name=txtNote]').addClass("undis");
                    $('[name=txtNote]').val("");
                } else {
                    $('[name=txtNote]').removeClass("undis");
                }
            }
            if (name == "PurchaseGoodsTypeR") {
                $('#PurchaseGoodsType').val(getCkVal("PurchaseGoodsTypeR"));
            }
            Pcb.to211126(name);//2021-11-26规则
            Pcb.to211206(name);//2021-12-06 铝基板新规
            Pcb.toOICThickness(name);//20230406 内外铜
            Pcb.to231221(name);//2023-12-21 新规则
            Pcb.onChange(name, Tools.UrlToJsonParams($("#smtorderForm").serialize()));
            return false;
        })
        //特殊工艺点击
        //$(".info_ts_box .item").click(function () {
        //    var name = $(this).find("input").attr("name");
        //    Pcb.Checked($(this).find("input").attr("name"), $(this).find("input").val());
        //    $(this).addClass("ant-btn-clicked"), setTimeout(function () {
        //        $(".pcbOnline_left .item").removeClass("ant-btn-clicked")
        //    }, 300);
        //})
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
        //$("[name=BoardType]").click(function (e) {
        //    var BoardType = $("[name=BoardType]:checked").val();
        //   if (BoardType == "set") {
        //        $("[for=set]").show();
        //        $("[for2=jpset]").hide();
        //    } else if (BoardType == "jpset") {
        //        $("[for=set]").show();
        //        $("[for2=jpset]").show();
        //    }
        //    Pcb.BoardTypeTips();
        //})
    },
    //电镀前工艺规则
    //ProcessRule: function () {
    //    var proCategory = $("[name=proCategory]:checked").val();
    //    var BoardLayers = $("[name=BoardLayers]:checked").val();
    //    Pcb.QutoliEv("[name='BeforePlating'][value='conductivefilm']", 2);
    //    if (proCategory == "fr4Item" && BoardLayers == "2") {
    //        //$("#dianduqiangongyi").show();
    //        Pcb.QutoliEv("[name='BeforePlating'][value='']")
    //    } else {
    //        $("#dianduqiangongyi").hide();
    //    }
    //},
    //2021/8/13更改铝基板最小孔径    2021/11/19控制路基板层数不现实0.4 0.7
    ViasCategory: function () {



        var Vias = $("[name=Vias]:checked").val();
        var proCategory = $("[name=proCategory]:checked").val();
        //新增更改铝基板最小孔径
        if (proCategory != "aluminumItem") {
            Pcb.QutoliEv("BoardThickness", 1, ['0.5', '0.7'], true);
        } else {
            //Pcb.QutoliEv("BoardThickness", 3, ['0.5'], true);
        }
        if (proCategory == "aluminumItem") {
            Pcb.QutoliEv("[name='Vias']", 1);
            Pcb.QutoliEv("[name='Vias'][value='1'],[name='Vias'][value='1.2'],[name='Vias'][value='1.5']", 0);
            Pcb.QutoliEv("[name='Vias'][value='1'],[name='Vias'][value='1.2'],[name='Vias'][value='1.5']", 3);
            Pcb.Checked("Vias", "1");
        }
        else if (proCategory != 'copper') {
            Pcb.QutoliEv("[name='Vias']", 0);
            Pcb.QutoliEv("[name='Vias'][value='1'],[name='Vias'][value='1.2'],[name='Vias'][value='1.5']", 1);

        }
        //2021/8/13  控制最小线宽线距
        var LineWeight = $("[name='LineWeight']:checked").val();
        if (proCategory == "aluminumItem") {
            //2021/8/13  铝基板限制最小线宽/线距
            if (LineWeight != "5" && LineWeight != "10" && LineWeight != "20") {
                Pcb.QutoliEv("[name='LineWeight']", 1);
                Pcb.QutoliEv("[name='LineWeight']", 2);
                Pcb.QutoliEv("[name='LineWeight'][value='5'],[name='LineWeight'][value='10'],[name='LineWeight'][value='20']", 3);
                Pcb.QutoliEv("[name='LineWeight'][value='5'],[name='LineWeight'][value='10'],[name='LineWeight'][value='20']", 0);
                Pcb.Checked("LineWeight", "5");
            } else {
                Pcb.QutoliEv("[name='LineWeight']", 1);
                Pcb.QutoliEv("[name='LineWeight'][value='5'],[name='LineWeight'][value='10'],[name='LineWeight'][value='20']", 0);
                Pcb.Checked("LineWeight", LineWeight);
            }
        } else if (proCategory == 'copper') {
            Pcb.ifCK_tf('LineWeight', '4');
        }
        else {
            if (LineWeight != "" || LineWeight != undefined || LineWeight != unll) {
                Pcb.QutoliEv("[name='LineWeight']", 0);
                Pcb.Checked("LineWeight", "6");
            }
        }
        //2021/8/13 控制电镀前工艺隐藏
        if (proCategory == "aluminumItem" || proCategory == "copper") {
            $("#dianduqiangongyi").hide();
            $(".ManualService").hide();
        } else {
            $("#dianduqiangongyi").show();
            $(".ManualService").show();

        }


        if (proCategory == "aluminumItem") {
            Pcb.QutoliEv("[name='WithstandVoltage'][value='4000']", 1);
        }

    },
    //基本信息规则
    basicProRule: function () {
        var proCategory = $("[name='proCategory']:checked").val();
        var BoardLayers = $("[name='BoardLayers']:checked").val();
        var BoardThickness = $("[name='BoardThickness']:checked").val();
        var CopperThickness = $("[name='CopperThickness']:checked").val();
        var InnerCopperThickness = $("[name='InnerCopperThickness']:checked").val();
        Pcb.QutoliEv("[name='CopperThickness'][value='1.5']", 1);
        Pcb.QutoliEv("[name='ImageTranster'][value='exposure']", 3);
        //debugger
        //  Pcb.Checked("ImageTranster", "exposure");
        //if (proCategory == "fr4Item") {
        //    if (BoardLayers == 1) {
        //        $(".border_color").slideDown(300);
        //        Pcb.Checked("SolderMask", "top");

        //    } else {
        //        $(".border_color").slideUp(300);
        //        Pcb.Checked("SolderMask", "none");
        //    }
        //} else {
        //    $(".border_color").slideUp(300);
        //    Pcb.Checked("SolderMask", "none");
        //}
        if (proCategory == "fr4Item" && BoardLayers >= 8) {
            Pcb.QutoliEv("[name=FlyingProbe][value='lowresistancetest']", 0);
            Pcb.QutoliEv("[name=FlyingProbe][value='full'],[name=FlyingProbe][value='aoi']", 1);
            Pcb.QutoliEv("[name=FlyingProbe][value='teststand']", 3);
            Pcb.setItemsSelectDefault('FlyingProbe', 'lowresistancetest', getCkVal('FlyingProbe'));
        } else {
            Pcb.QutoliEv("[name=FlyingProbe][value='full']", 0);
            if (proCategory != "aluminumItem") {
                Pcb.QutoliEv("[name=FlyingProbe][value='lowresistancetest']", Pcb.QutoliEvType.hide);
            }
        }

        if (proCategory == "fr4Item") {
            Pcb.Checked("Invoice", 1);
            if (BoardThickness == "0.4" || BoardThickness == "0.6") {
                Pcb.QutoliEv("[name='SurfaceFinish']", 2);
                Pcb.QutoliEv("[name='SurfaceFinish'][value='none'],[name='SurfaceFinish'][value='immersiongold'],[name='SurfaceFinish'][value='osp']", 3);
                selectVal("SurfaceFinish", "osp");
            } else {
                Pcb.QutoliEv("[name='SurfaceFinish']", 3);
            }
            Pcb.QutoliEv("[name='BoardThickness']", 2, [], true);
            if (BoardLayers == "1") {
                Pcb.QutoliEv("[name='CopperThickness']", 3, [], true);
                Pcb.QutoliEv("[name='CopperThickness'][value='2'],[name='CopperThickness'][value='3'],[name='CopperThickness'][value='0.5']", 2, [], true);
            } else if (BoardLayers == "2") {
                Pcb.QutoliEv("BoardThickness", 3, ['0.4', '0.6', '0.8', '1', '1.2', '1.6', '2', '2.4', '2.5', '3', '3.2', '3.4', '3.6', '3.8', '4'], true);
                Pcb.QutoliEv("[name='CopperThickness']", 3, [], true);
                Pcb.QutoliEv("[name='CopperThickness'][value='0.5'],[name='CopperThickness'][value='0.75']", 2, [], true);
                Pcb.QutoliEv("[name='CopperThickness'][value='1.5']", 0);
            } else if (BoardLayers >= 4) {
                if (BoardLayers == "4") {
                    Pcb.QutoliEv("BoardThickness", 3, ['0.4', '0.6', '0.8', '1', '1.2', '1.6', '2', '2.4', '2.5', '3', '3.2'], true);
                    Pcb.Checked("CopperThickness", "1");
                } else if (BoardLayers == "6") {
                    Pcb.QutoliEv("BoardThickness", 3, ['1', '1.2', '1.6', '2'], true);
                } else if (BoardLayers >= 8) {
                    if (BoardLayers <= 10) {
                        Pcb.QutoliEv("BoardThickness", 3, ['1.2', '1.6', '2', '2.5'], true);
                    } else if (BoardLayers == 12) {
                        Pcb.QutoliEv("BoardThickness", 3, ['1.6', '2', '2.5'], true);
                    } else if (BoardLayers == 14) {
                        Pcb.QutoliEv("BoardThickness", 3, ['1.6', '2', '2.5', '3'], true);
                    } else if (BoardLayers >= 16 && BoardLayers <= 20) {
                        Pcb.QutoliEv("BoardThickness", 3, ['2', '2.5', '3', '3.2'], true);
                        Pcb.setItemsSelectDefault('BoardThickness', '2', BoardThickness);
                    } else if (BoardLayers >= 22 && BoardLayers <= 32) {
                        Pcb.QutoliEv("BoardThickness", 3, ['2.5', '3', '3.2'], true);
                        Pcb.setItemsSelectDefault('BoardThickness', '2.5', BoardThickness);
                    }
                } else {
                    Pcb.setItemsSelectDefault('BoardThickness', '1.6', BoardThickness);
                }
                if (BoardLayers < 8 && BoardLayers != 4) Pcb.QutoliEv("BoardThickness", 2, ['2.5'], true);

                Pcb.QutoliEv("[name='CopperThickness']", 3, [], true);
                Pcb.QutoliEv("[name='CopperThickness'][value='0.5'],[name='CopperThickness'][value='0.75']", 2, [], true);
                Pcb.QutoliEv("[name='InnerCopperThickness']", 3, [], true);
                Pcb.QutoliEv("[name='InnerCopperThickness'][value='0.75']", 2, [], true);

            }
            selectVal("CopperThickness", "1");
        }
        else if (proCategory == "cem1Item") {
            Pcb.Checked("Invoice", 1);
            Pcb.QutoliEv("[name='BoardThickness']", 3, [], true);
            Pcb.QutoliEv("BoardThickness", 2, ['0.4', '0.6', '2', '2.4', '3', '0.8'], true);
            Pcb.QutoliEv("[name='CopperThickness']", 3, [], true);
            Pcb.QutoliEv("CopperThickness", 2, ['2', '3', '0.5', '0.75'], true);
            selectVal("CopperThickness", "1");
        }
        else if (proCategory == "aluminumItem") {
            Pcb.QutoliEv("[name='BoardThickness']", 3, [], true);
            Pcb.QutoliEv("BoardThickness", 2, ['0.4', '2.4'], true);//
            Pcb.QutoliEv("[name='CopperThickness']", 0);
            // Pcb.QutoliEv("[name='CopperThickness'][value='3']", 2);
            selectVal("CopperThickness", "1");
        }
        else if (proCategory == "fr1Item" || proCategory == "22fItem" || proCategory == "cem3Item" || proCategory == "94hbItem") {

            Pcb.QutoliEv("[name='CopperThickness']", 2, [], true);
            Pcb.QutoliEv("[name='BoardThickness']", 3, [], true);

            if (proCategory == "fr1Item") {//fr-1情况下只有1.6可选
                Pcb.QutoliEv("BoardThickness", 2, ['0.4', '0.6', '0.8', '1', '1.2', '2', '2.4', '3'], true);
            } else if (proCategory == "94hbItem") {
                Pcb.QutoliEv("BoardThickness", 2, ['0.4', '0.6', '0.8', '2', '2.4', '3'], true);
            } else if (proCategory = '22fItem') {
                Pcb.QutoliEv("BoardThickness", 2, ['0.4', '0.6', '0.8', '1', '1.2', '2', '2.4', '3'], true);
            }
            var ImageTranster = $("[name='ImageTranster']:checked").val();
            if (ImageTranster == "exposure") {
                if (proCategory == "94hbItem") {
                    Pcb.QutoliEv("[name='CopperThickness'][value='0.75'],[name='CopperThickness'][value='0.5']", 3, [], true);
                    Pcb.Checked("CopperThickness", "0.75");
                } else {
                    Pcb.QutoliEv("[name='CopperThickness'][value='0.75']", 3, [], true);
                    Pcb.Checked("CopperThickness", "0.75");
                }
            } else {
                if (proCategory == "fr1Item") {
                    Pcb.QutoliEv("[name='CopperThickness'][value='0.75']", 3, [], true);
                } else {
                    if (proCategory == "94hbItem") {
                        Pcb.QutoliEv("[name='CopperThickness'][value='0.5'],[name='CopperThickness'][value='0.75']", 3, [], true);
                        Pcb.Checked("CopperThickness", "0.5");
                    } else if (proCategory == "22fItem") {
                        Pcb.QutoliEv("[name='CopperThickness']", 2, [], true);
                        Pcb.QutoliEv("[name='CopperThickness'][value='0.75']", 3, [], true);
                        Pcb.Checked("CopperThickness", "0.75");

                    } else {
                        Pcb.QutoliEv("[name='CopperThickness'][value='0.5'],[name='CopperThickness'][value='0.75'],[name='CopperThickness'][value='1']", 3, [], true);
                    }
                }
                selectVal("CopperThickness", "1");
            }
            //选择模具成型只能选丝网印刷
            //var FormingType = $("[name=FormingType]:checked").val();
            //if (FormingType == "module") {
            //    Pcb.QutoliEv("[name='ImageTranster'][value='exposure']", 2);
            //    Pcb.Checked("ImageTranster", "screenprinting");
            //} else {
            //    Pcb.QutoliEv("[name='ImageTranster'][value='exposure']", 3);
            //    Pcb.Checked("ImageTranster", "exposure");
            //}
        }
        selectVal("BoardThickness", "1.6");
        selectVal("InnerCopperThickness", "1");
        Pcb.QutoliEv('[name=CopperThickness][value="1.5"]', 1);
        if (proCategory == "aluminumItem") Pcb.ifCK_tf("BoardThickness", '1.6');
    },
    //特殊工艺规则
    SpecialProcessRule: function () {
        var proCategory = $("[name='proCategory']:checked").val();
        var BoardLayers = $("[name='BoardLayers']:checked").val();
        var BoardThickness = $("[name='BoardThickness']:checked").val();
        var CopperThickness = $("[name='CopperThickness']:checked").val();
        var InnerCopperThickness = $("[name='InnerCopperThickness']:checked").val();
        $(".specil_progress .tsgy2 li").show();

        //2022-03-04 12:05:43
        // console.log(proCategory);
        if (proCategory == "fr4Item" && ((BoardLayers <= 2 && (BoardThickness >= 0.8 && BoardThickness <= 2.4)) || ((BoardLayers >= 4 && BoardLayers <= 6) && (BoardThickness >= 0.8 && BoardThickness <= 2)))) {
            Pcb.QutoliEv('[name=CarbonOil_],[name=BlueGlue_]', 3);
        } else {
            Pcb.QutoliEv('[name=CarbonOil_],[name=BlueGlue_]', 2);
        }

        if (BoardLayers >= 4) {
            Pcb.QutoliEv("[name='IsBlindVias']", 3);
        } else {
            $("[name='IsBlindVias']").val('0');
            Pcb.QutoliEv("[name='IsBlindVias']", 2);
        }

        if (proCategory == "fr4Item") {
            $(".soldermask").show();
            if (BoardLayers == "1") {
                $(".info_ts_ts").hide();
                $(".tsgy1 li").hide();
                Pcb.QutoliEv("[name='StepHole_'],[name=CarbonOil_],[name=BlueGlue_],[name=SerialNumber_]", 0);
                Pcb.Checked("BeforePlating", "copperdeposition");
            } else if (BoardLayers == "2") {
                $(".tsgy1 li").hide();
                $(".info_ts_ts").show();
                $("#dianduqiangongyi").show();
                Pcb.QutoliEv("[name='Goldfinger'],[name='MetalEdging'],[name='CarbonOil_'],[name='HoleThickness_'],[name='BlueGlue_'],[name='StepHole_'],[name='Pressfit_'],[name='CTI_'],[name='SerialNumber_']", 0);
                Pcb.QutoliEv("[name='BeforePlating'][value='conductivefilm']", 2);
            } else if (BoardLayers >= 4) {
                $(".tsgy1 li").hide();
                $(".info_ts_ts").show();
                $(".info_ts_ts li").show();
                Pcb.QutoliEv("[name='Goldfinger'],[name='MetalEdging'],[name='CarbonOil_'],[name='HoleThickness_'],[name='BlueGlue_'],[name='StepHole_'],[name='Pressfit_'],[name=IsBlindVias],[name=HDI],[name=SpecifiesLamination],[name=SerialNumber_]", 0);
                Pcb.QutoliEv("[name='Goldfinger'],[name='MetalEdging'],[name='CarbonOil_'],[name='HoleThickness_'],[name='BlueGlue_'],[name='StepHole_'],[name='Pressfit_'],[name=IsBlindVias],[name=HDI],[name=SpecifiesLamination],[name=SerialNumber_]", 3);
                Pcb.QutoliEv("[name='BeforePlating'][value='conductivefilm']", 2);
                Pcb.Checked("BeforePlating", "copperdeposition");
            }
        } else if (proCategory == "cem1Item") {
            $(".soldermask").show();
            $(".info_ts_ts").hide();
            $(".tsgy1 li").hide();
            Pcb.QutoliEv("[name='CarbonOil_'],[name='BlueGlue_']", 0);
            Pcb.QutoliEv("[name='CarbonOil_'],[name='BlueGlue_']", 3);
            Pcb.Checked("BeforePlating", "copperdeposition");
        } else if (proCategory == "rogersItem") {
            $(".tsgy1 li").hide();
            Pcb.QutoliEv("[name='Goldfinger'],[name='MetalEdging'],[name='CarbonOil_'],[name='HoleThickness_'],[name='BlueGlue_'],[name='StepHole_'],[name='Pressfit_'],[name=IsBlindVias],[name=HDI],[name=SpecifiesLamination],[name='CTI_'],[name=IsBlindVias],[name=HDI],[name=SpecifiesLamination],[name=SerialNumber_]", 0);
            Pcb.QutoliEv("[name='Goldfinger'],[name='MetalEdging'],[name='CarbonOil_'],[name='HoleThickness_'],[name='BlueGlue_'],[name='StepHole_'],[name='Pressfit_'],[name=IsBlindVias],[name=HDI],[name=SpecifiesLamination],[name='CTI_'],[name=IsBlindVias],[name=HDI],[name=SpecifiesLamination],[name=SerialNumber_]", 3);
        } else if (proCategory == "aluminumItem") {
            $(".info_ts_ts").hide();
            $(".tsgy1 li").hide();
            Pcb.QutoliEv("[name='StepHole_'],[name=Pressfit_],[name=SerialNumber_]", 0);
            Pcb.QutoliEv("[name='StepHole_'],[name=Pressfit_],[name=SerialNumber_]", 3);
            $(".soldermask").hide();
            Pcb.Checked("BeforePlating", "copperdeposition");
        } else if (proCategory == "22fItem" || proCategory == "cem3Item" || proCategory == "94hbItem" || proCategory == "fr1Item") {
            $(".specil_progress .option-choose li").hide();
        } else if (proCategory == "copper") {
            $(".tsgy1 li").hide();
            Pcb.QutoliEv("[name='StepHole_']", 0);
            Pcb.QutoliEv("[name='StepHole_']", 3);
        }
        if (BoardLayers == "1") {
            if (proCategory == "aluminumItem") {
                Pcb.QutoliEv("[name='vacuumpack'],[name='0']", 1);
            } else {
                Pcb.QutoliEv("[name='vacuumpack'],[name='0']", 0);
            }
        } else {
            Pcb.QutoliEv("[name='vacuumpack'],[name='0']", 1);
        }
        $(".info_ts_title li").each(function (i, dom) {
            if ($(dom).is(":hidden")) {
                $(dom).find(".jp-ico").remove();
                $(dom).find("label").removeClass("choose");
                $(dom).find("input").prop("checked", false);
                $(dom).find("input").val(0)
            }
        })
    },
    //铝基板数量>30pcs的时候
    aluminumArea: function () {
        var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
        var boardType = $("[name=BoardType]:checked").val();
        var num = $("[name=Num]").val();
        var proCate = $("[name=proCategory]:checked").val();
        //Pcb.QutoliEv("[name='BoardThickness']", 0)
        if (proCate == "aluminumItem") {
            var pcsnum = num;
            if (boardType == 'set') {
                var px = $("[name=pinban_x]").val();
                var py = $("[name=pinban_y]").val();
                pcsnum = pcsnum * (px * py);
            } else {
                pcsnum = $("[name=Num]").val();
            }
            Pcb.QutoliEv("[name='CopperThickness'][value='0.5'],[name='CopperThickness'][value='0.75'],[name='CopperThickness'][value='2']", 3, [], true);
            Pcb.QutoliEv("[name='FormingType'][value='vcutseparate']", 3);

            if (area > 30) {

                //板子厚度0.8到2.0
                Pcb.QutoliEv("BoardThickness", 3, ['0.8'], true);
                selectVal("BoardThickness", "1.6")
                //外层铜厚都可选
                //Pcb.QutoliEv("[name='CopperThickness']", 3, [], true);
                Pcb.Checked("CopperThickness", "1");
                //国纪铝基板、广州铝基板都可选，默认广州
                Pcb.QutoliEv("[name='FR4Type'][value='aluminum'],[name='FR4Type'][value='gzaluminum']", 3);
                Pcb.Checked("FR4Type", "gzaluminum");

                //如何板厚1-2，导热系数1，铜厚1,，耐压值3000v和4000v可选
                //if ((boardThickness == "1" || boardThickness == "1.2" || boardThickness == "1.6" || boardThickness == "2") && invoice == "1" && copperThickness == "1") {
                //    Pcb.QutoliEv("[name=WithstandVoltage]", 3);
                //} else {
                //    Pcb.QutoliEv("[name='WithstandVoltage'][value='3500'],[name='WithstandVoltage'][value='4000']", 2);
                //    Pcb.Checked("WithstandVoltage", "2500")
                //}
                Pcb.QutoliEv("[name='FormingType'][value='laser'],[name='FormingType'][value='module']", 3);
                Pcb.QutoliEv("[name='SurfaceFinish']", 3);
                selectVal("SurfaceFinish", "osp");
            } else {
                //板子厚度0.8到2.0
                Pcb.QutoliEv("BoardThickness", 2, ['0.4', '0.6', '2.4'], true);
                Pcb.QutoliEv("BoardThickness", 3, ['0.8'], true);
                selectVal("BoardThickness", "1.6")
                //Pcb.Checked("BoardThickness", "1.6");

                //外层铜厚只可选1oz
                //Pcb.QutoliEv("[name='CopperThickness']", 2);
                Pcb.QutoliEv("[name='CopperThickness'][value='0.5'],[name='CopperThickness'][value='0.75'],[name='CopperThickness'][value='1']", 3, [], true);
                Pcb.Checked("CopperThickness", "1");
                //只可选国际铝基板
                Pcb.QutoliEv("[name='FR4Type'][value='gzaluminum']", 2);
                Pcb.QutoliEv("[name='FR4Type'][value='aluminum']", 3);
                Pcb.Checked("FR4Type", "aluminum");
                Pcb.QutoliEv("[name='FormingType'][value='mould'],[name='FormingType'][value='laser']", 2);
                Pcb.Checked("FormingType", "mechanical");
                //$("[name=SurfaceFinish][value=haslwithlead]").parents("li").hide();
                //Pcb.Checked("SurfaceFinish", "haslwithfree");
                Pcb.QutoliEv("[name='SurfaceFinish']", 3);

                //不可选
                Pcb.QutoliEv("[name='ImageTranster'][value='screenprinting']", 2);
            }
            if (area > 5) {
                // Pcb.QutoliEv("[name='BoardThickness'][value='0.8']", 3);
                selectVal("BoardThickness", "1.6")
                //外层铜厚都可选
                //Pcb.QutoliEv("[name='CopperThickness']", 3, [], true);
                ////面积大于5可选丝网印刷
                //$(".wireWelding").show();
            }
            Pcb.QutoliEv("BoardThickness", 2, ['0.4', '2.4'], true);

            if (area > 30) {
                Pcb.Checked("FormingType", "module");
                Pcb.QutoliEv("[name='SurfaceFinish'][value='immersiongold']", 3);

            } else {
                Pcb.Checked("FormingType", "mechanical");
            }

            if (area > 5) {

                Pcb.QutoliEv("[name='CopperThickness'][value='2']", 3, [], true);
                selectVal("SurfaceFinish", "osp");
            } else {
                selectVal("SurfaceFinish", "haslwithfree");
            }
            Pcb.QutoliEv("[name='CopperThickness'][value='3']", 2, [], true);
            $(".NewBoard li").each(function (i, dom) {
                var thikVal = $(dom).find("[name='BoardThickness']").val();
                if (thikVal.length > 4) {
                    Pcb.QutoliEv("[name='BoardThickness'][value='" + thikVal + "']", 1);
                }
            })
            Pcb.QutoliEv("[name='FormingType'][value='module']", 3);
        } else if (proCate != 'copper') {
            //Pcb.QutoliEv("[name='SurfaceFinish']", 3);

            if ((proCate == "cem1Item" || proCate == "22fItem") && area > 5) {
                selectVal("SurfaceFinish", "osp");
            } else {
                Pcb.QutoliEv("[name='SurfaceFinish'][value='rosin']", 2);
                Pcb.QutoliEv("[name='SurfaceFinish'][value='eletrolyticnickel']", 2);
                selectVal("SurfaceFinish", "haslwithfree");
                //Pcb.Checked("SurfaceFinish", "osp");



            }
            Pcb.QutoliEv("[name='FormingType'][value='vcutseparate']", 2);
            var Vias = $("[name='Vias']:checked").val();
            var BoardLayers = $("[name='BoardLayers']:checked").val();
            //所有单面板（非铝基板）20㎡以上，孔径0.8 且丝网印刷时开放【模具成型】
            var ImageTranster = $("[name=ImageTranster]:checked").val();
            if (BoardLayers == 1 && area > 20 && Vias == 0.8 && ImageTranster == "screenprinting") {
                Pcb.QutoliEv("[name='FormingType'][value='module']", 3);
                Pcb.Checked("FormingType", "module");
            } else {
                Pcb.QutoliEv("[name='FormingType'][value='module']", 2);
                Pcb.Checked("FormingType", "mechanical");
            }
            var proCategory = $("[name='proCategory']:checked").val();
            //所有单面板20㎡以上才能选丝网
            if (BoardLayers == 1 && area > 30) {
                //$(".wireWelding").show();
            } else if (area > 30 && (proCate == "fr1Item")) {
                //$(".wireWelding").show();
            } else if (area > 5 && (proCate == "22fItem" || proCate == "cem1Item")) {
                //$(".wireWelding").show();
            } else {
                //$(".wireWelding").hide();
                Pcb.Checked("ImageTranster", "exposure")
            }
            var ImageTranster = $("[name=ImageTranster]:checked").val();
            Pcb.AreaRule2(area, proCategory);
        }

        if ($("[name=SurfaceFinish][value=immersiongold]").parents(".item").hasClass("not-selectable") && $("[name=SurfaceFinish][value=eletrolyticnickel]").parents(".item").hasClass("not-selectable")) {
            $(".imgoldthincknesszone").slideUp();
        }
        $(".otherBoard").show();

    },

    //新增判断软度:
    newHeat: function () {
        var proCategory = $("[name=proCategory]:checked").val();
        if (proCategory == "aluminumItem") {
            var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
            //2023-02-22 16:04:49铝基板丝网不展示不可选
            Pcb.QutoliEv("[name='ImageTranster'][value='screenprinting']", 1);
            Pcb.Checked("ImageTranster", "exposure");
            if (area > 30) {
                //如果面积大于30默认选定为0.7
                Pcb.QutoliEv("[name='Invoice'][value='5']", 3);
                //Pcb.Checked("Invoice", "1");
                //默认选定板材耐压值为1500
                Pcb.QutoliEv("[name='WithstandVoltage'][value='1500']", 3);
                //Pcb.Checked("WithstandVoltage", "2500");

                //默认为丝网和模具成型
                // Pcb.QutoliEv("[name='ImageTranster'][value='screenprinting']", 3);
                // Pcb.Checked("ImageTranster", "screenprinting");


                //Pcb.Checked("BoardThickness", "0.8");
                //选中外层铜厚0.5oz
                Pcb.QutoliEv("[name='CopperThickness'][value='0.5']", 3, [], true);
                //Pcb.Checked("CopperThickness", "0.5");
                Pcb.Checked("FlyingProbe", "aoi");

            } else {
                Pcb.QutoliEv("[name='WithstandVoltage'][value='1500']", 2);
                Pcb.QutoliEv("[name='WithstandVoltage'][value='1500']", 0);
                Pcb.Checked("WithstandVoltage", "2500");


                Pcb.QutoliEv("[name='Invoice'][value='5']", 2);
                Pcb.QutoliEv("[name='Invoice'][value='5']", 0);
                Pcb.Checked("Invoice", "1");

                Pcb.QutoliEv("[name='ImageTranster '][value='exposure']", 3);
                Pcb.Checked("ImageTranster", "exposure");
                //Pcb.QutoliEv("[name='ImageTranster'][value='screenprinting']", 2);
                //if (area > 5) {
                //    Pcb.Checked("BoardThickness", "0.8");
                //    //选中外层铜厚0.5oz
                //    Pcb.QutoliEv("[name='CopperThickness'][value='0.5']", 3);
                //    Pcb.Checked("CopperThickness", "0.5");
                //} else {
                //    Pcb.Checked("BoardThickness", "1.6");
                //    //选中外层铜厚0.5oz
                //    Pcb.QutoliEv("[name='CopperThickness'][value='0.5']", 3);
                //    Pcb.Checked("CopperThickness", "1");
                //}
            }

        }
        else Pcb.QutoliEv("[name='ImageTranster'][value='screenprinting']", 0);

    },
    BoardLayersSort: function () {
        var proCategory = $("[name=proCategory]:checked").val();
        var BoardLayers = $("[name=BoardLayers]:checked").val(); //板子层数
        $(".layersort").empty();

        if (BoardLayers > 2) {
            $(".singTip").hide();
            //内层铜箔厚度显示
            $(".inner-layer-thickness,.impedance_option").slideDown(300);
            return false;
            for (var i = 1; i <= BoardLayers; i = i + 1) {
                var l = i;
                if (l == 0) l = 1;
                var html = '<span><em>L' + l + '</em><input class="form-control b-bradius0 h30 ml5 mr5"  name="layersort" type="text"  value=""></span>';
                $(".layersort").append(html);
            }
            //$(".layersortzone").slideDown(300);

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
            $(".inner-layer-thickness,.impedance_option").slideUp(300);
            Pcb.Checked("InnerCopperThickness", "1");
            $(".blindHole").hide();
            if (BoardLayers > 1) {
                $(".singTip").hide();
            } else {
                $(".singTip").show();
            }
        }
        $(".otherBoard").show();
        if (BoardLayers > 1 && proCategory != 'copper') {
            Pcb.QutoliEv("[name='FormingType'][value='vcutseparate'],[name='FormingType'][value='module']", 2);
            Pcb.Checked("FormingType", "mechanical");
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
        var l = $("[name=BoardHeight]").val();
        var w = $("[name=BoardWidth]").val();
        if (boardType == "pcs" || boardType == "set") {
            if ((l < 5 && l != "") || (w < 5 && w != "")) {
                layer.msg(getLanguage('quoteNumMin'), { time: 3000 });
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
    //2021-11-26 FR-4/CEM-1单面板规则
    to211126: function (name) {
        //阻焊覆盖展示过孔塞油，限制条件：只有0.4mm及以下孔径，可选赛油，其他孔径不可选
        if ($("[name=Vias]:checked").val() <= 0.4) {
            // Pcb.QutoliEv("[name=SolderCover][value='plugoil']", 3);
        } else {
            if (name == 'Vias') Pcb.Checked('SolderCover', 'openwindow');
            // Pcb.QutoliEv("[name=SolderCover][value='plugoil']", 2);
        }

        // console.log('d-to1126');
        //类别
        var proCategory = $("[name=proCategory]:checked").val();
        //铜箔厚度
        var CopperThickness = $("[name='CopperThickness']:checked").val();
        //板子厚度
        var BoardThickness = $("[name='BoardThickness']:checked").val();
        //板子层数
        var BoardLayers = $("[name='BoardLayers']:checked").val();

        var NumPCS = $("#Num").val();
        var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());

        if (name == 'proCategory') {
            $(".imgoldthincknesszone").hide();
        }
        if (proCategory == 'fr4Item' || proCategory == 'cem1Item') {
            if (name == 'countNumer') {
                Pcb.QutoliEv("[name='BoardThickness'][value='0.5'],[name='BoardThickness'][value='0.7']", 1);
            }
            if (BoardLayers == 1) {
                //单面板：0.8mm，1.0mm，1.2mm，1.6mm，2.0mm
                //单面板 - 禁用 沉金
                if (proCategory == 'cem1Item') {
                    Pcb.QutoliEv("[name='SurfaceFinish'][value='immersiongold'],[name='SurfaceFinish'][value='none']", 1);
                } else {
                    Pcb.QutoliEv("[name='SurfaceFinish'][value='immersiongold'],[name='SurfaceFinish'][value='none']", 0);
                }
                if ((name == 'proCategory' || name == 'countNumer') && proCategory == 'cem1Item') {
                    Pcb.QutoliEv("[name='SurfaceFinish'][value='osp']", 3);
                    selectVal('SurfaceFinish', 'haslwithfree');
                }
                // Pcb.QutoliEv("[name='SurfaceFinish'][value='none']", 1);

                if (name == 'BoardLayers' || name == 'proCategory' || name == 'countNumer') {
                    letBoardThickness = getCkVal('BoardThickness');
                    Pcb.QutoliEv("[name='BoardThickness']", 2, [], true);
                    Pcb.QutoliEv("BoardThickness", 3, ['0.8', '1', '1.2', '1.6', '2'], true);
                    if (proCategory == 'cem1Item') {
                        Pcb.QutoliEv("[name='BoardThickness'][value='0.8'],[name='BoardThickness'][value='2']", 2, [], true);
                    }
                    // Pcb.Checked("BoardThickness", "1.6");
                    selectVal("BoardThickness", '1.6', letBoardThickness)
                }

                // Pcb.QutoliEv("[name='CopperThickness']", 2);
                // Pcb.QutoliEv("[name='CopperThickness'][value='1']", 3);
                // // if(name!='CopperThickness') Pcb.Checked("CopperThickness", "1");
                // Pcb.setItemsSelectDefault("CopperThickness",CopperThickness,1);

                if (area < 5) {
                    if (NumPCS >= 30 && proCategory == 'cem1Item') Pcb.QutoliEv("[name='SurfaceFinish'][value='osp']", 3);
                    // else if (proCategory == 'fr4Item') Pcb.QutoliEv("[name='SurfaceFinish'][value='osp']", 2);
                    // console.log(area+'==SF 禁用')
                } else {
                    Pcb.QutoliEv("[name='SurfaceFinish'][value='osp']", 3);
                    if (proCategory == 'fr4Item') {
                        Pcb.QutoliEv("[name='BoardThickness'][value='0.6']", 3, [], true);
                    }
                    // console.log(area+'==SF 启用')
                    if (BoardThickness == '0.6') {
                        Pcb.QutoliEv("[name='SurfaceFinish'][value='haslwithlead'],[name='SurfaceFinish'][value='haslwithfree']", 2);
                        if (name == 'BoardThickness') {
                            selectVal('SurfaceFinish', 'osp');
                        }
                    } else {
                        Pcb.QutoliEv("[name='SurfaceFinish'][value='haslwithlead'],[name='SurfaceFinish'][value='haslwithfree']", 3);
                    }
                }
                if (proCategory == 'fr4Item' && area > 5) {
                    Pcb.QutoliEv('[name=SurfaceFinish][value="none"],[name=SurfaceFinish][value="osp"]', 3);
                }
                else if (proCategory == 'fr4Item') {
                    Pcb.QutoliEv('[name=SurfaceFinish][value="none"]', 2);//,[name=SurfaceFinish][value="osp"]
                    selectVal('SurfaceFinish', 'haslwithfree');
                }
                if (proCategory == 'fr4Item' && area > 30) {
                    Pcb.QutoliEv("[name='FormingType']", 3);
                }
            } else {
                Pcb.QutoliEv("[name='ImageTranster'][value='screenprinting']", 3);
                Pcb.QutoliEv("[name='SurfaceFinish'][value='immersiongold']", 0);
                Pcb.QutoliEv("[name='SurfaceFinish'][value='none']", 0);
            }
            $(".wireWelding").show();
            if (area < 30) {
                Pcb.QutoliEv("[name='ImageTranster'][value='screenprinting']", 2);
                Pcb.Checked('ImageTranster', 'exposure');
            } else {
                Pcb.QutoliEv("[name='ImageTranster'][value='exposure'],[name='ImageTranster'][value='screenprinting']", 3);
            }
        }

        // if(proCategory=='fr4Item'||proCategory=='cem1Item'||proCategory=='rogersItem'){
        if (proCategory == 'aluminumItem' || proCategory == 'copper') {
            Pcb.QutoliEv("[name='FlyingProbe']", 0);
            Pcb.QutoliEv("[name='FlyingProbe']", 3);
            if (name == 'proCategory') {
                Pcb.Checked("FlyingProbe", "aoi");
            }
        } else {
            if (BoardLayers == '1') {
                //$(".BoardLayersOneInfo").show();
                Pcb.QutoliEv("[name='FlyingProbe'][value='full']", 1);
                Pcb.QutoliEv("[name='FlyingProbe'][value='aoi']", 0);
                // if (name == 'proCategory' || name == 'countNumer' || name == 'BoardLayers') {
                if (area >= 5) {
                    if (proCategory == 'cem1Item' || proCategory == 'aluminumItem') {
                        Pcb.QutoliEv("[name='FlyingProbe'][value='aoi']", 1);
                        Pcb.QutoliEv("[name='FlyingProbe'][value='full']", 0);
                        Pcb.QutoliEv("[name='FlyingProbe'][value='full']", 2);
                    } else {
                        Pcb.QutoliEv("[name='FlyingProbe'][value='aoi']", 2);
                    }
                    Pcb.Checked("FlyingProbe", "teststand");
                } else {
                    if (proCategory == 'cem1Item' || proCategory == 'aluminumItem') {
                        Pcb.QutoliEv("[name='FlyingProbe'][value='aoi']", 1);
                        Pcb.QutoliEv("[name='FlyingProbe'][value='teststand']", 2);
                        Pcb.Checked("FlyingProbe", "full");
                    } else {
                        Pcb.QutoliEv("[name='FlyingProbe'][value='teststand']", 2);
                        Pcb.Checked("FlyingProbe", "aoi");
                    }
                }
                // }
            }
            else if (BoardLayers > 1) {

                //BoardThickness默认值
                if (BoardThickness === undefined) {
                    Pcb.setItemsSelectDefault('BoardThickness', '1.6');
                    BoardThickness = getCkVal('BoardThickness');
                }
                //

                //$(".BoardLayersOneInfo").hide();
                Pcb.QutoliEv("[name='FlyingProbe'][value='aoi']", 1);
                if (BoardLayers < 8) Pcb.QutoliEv("[name='FlyingProbe'][value='full']", 0);
                //2023-03-06  ≤20㎡，默认飞针测试，可选测试架；＞20㎡，默认测试架，只能选测试架
                if (name != 'FlyingProbe' && (name == 'countNumer' || name == 'BoardLayers')) {
                    if (area > 20) {
                        Pcb.QutoliEv("[name='FlyingProbe'][value='full']", 2);
                        Pcb.Checked("FlyingProbe", "teststand");
                    } else {
                        Pcb.QutoliEv("[name='FlyingProbe'][value='teststand']", 3);
                        if (BoardLayers < 8) Pcb.Checked("FlyingProbe", "full");
                    }
                }
            }
        }
        if (proCategory == 'fr4Item' && BoardLayers == '1') {
            Pcb.QutoliEv("[name='ImageTranster'][value='screenprinting']", 2);
            Pcb.Checked('ImageTranster', 'exposure');
        }
        else if (proCategory == 'fr4Item' && BoardLayers > 1) {
            if ((name == 'BoardThickness' || name == 'FlyingProbe') && BoardLayers == '2' && BoardThickness == '0.4') {
                Pcb.QutoliEv("[name='SurfaceFinish'][value='haslwithlead'],[name='SurfaceFinish'][value='haslwithfree']", 2);
                selectVal("SurfaceFinish", "osp");
            } else if (name == 'BoardThickness' && BoardThickness != '0.4') {
                Pcb.QutoliEv("[name='SurfaceFinish'][value='haslwithlead'],[name='SurfaceFinish'][value='haslwithfree']", 3);
                selectVal("SurfaceFinish", "haslwithfree");
            }
        }

        //PCB等其他新规
        if ((proCategory == 'fr4Item' && BoardLayers == 1) || proCategory == 'cem1Item' || proCategory == 'aluminumItem' || proCategory == 'copper') {
            Pcb.Checked('HalfHole', '0');
            $(".halfHole").hide();
        } else if (BoardLayers > 1) {
            $(".halfHole").show();
        }

        //new 3/4OZ
        if (BoardLayers != 2 && proCategory != 'copper') {
            if (name == 'BoardLayers') {
                Pcb.setItemsSelectDefault('BoardThickness', '1.6');
                BoardThickness = getCkVal('BoardThickness');
            }
            Pcb.QutoliEv("BoardThickness", 2, ['3.4', '3.5', '3.6', '3.8', '4'], true);
            // Pcb.QutoliEv("[name=CopperThickness][value='5'],[name=CopperThickness][value='6']", 2);
        }
        if (proCategory == 'fr4Item') Pcb.QutoliEv('[name=CopperThickness][value=3]', 0);
        if (proCategory == 'fr4Item' && (BoardThickness >= 0.8 && BoardThickness <= 2) && (BoardLayers == 4 || BoardLayers == 6)) {
            Pcb.QutoliEv('[name=CopperThickness][value=3],[name=CopperThickness][value=4],[name=InnerCopperThickness][value=3],[name=InnerCopperThickness][value=4]', 3, [], true);
        } else {
            if (proCategory == 'aluminumItem') {
                Pcb.QutoliEv('[name=InnerCopperThickness][value=3]', 2, [], true);
                Pcb.QutoliEv('[name=CopperThickness][value=3],[name=CopperThickness][value=4]', 3, [], true);
            } else {
                ////2022-09-19 FR-4 双面板 3~6OZ
                if (proCategory == 'fr4Item' && BoardLayers == 2) {
                    if (BoardThickness >= 0.8) {
                        Pcb.QutoliEv('[name=CopperThickness][value=3],[name=CopperThickness][value=4],[name=CopperThickness][value=5],[name=CopperThickness][value=6]', 3);
                    }
                    else Pcb.QutoliEv('[name=CopperThickness][value=3],[name=CopperThickness][value=4],[name=CopperThickness][value=5],[name=CopperThickness][value=6]', 2);
                    Pcb.QutoliEv("BoardThickness", 3, ['3.4', '3.5', '3.6', '3.8', '4'], true);
                } else {

                    Pcb.QutoliEv('[name=CopperThickness][value=3],[name=CopperThickness][value=4],[name=CopperThickness][value=5],[name=CopperThickness][value=6],[name=InnerCopperThickness][value=3],[name=InnerCopperThickness][value=4]', 2, [], true);
                }
            }
            if (name == 'BoardLayers' || name == 'BoardThickness') {
                if (BoardThickness >= 3.4) {
                    Pcb.QutoliEv('CopperThickness', 2, ['1', '2'], true);
                    Pcb.Checked('CopperThickness', '3');
                } else {
                    Pcb.QutoliEv('CopperThickness', 3, ['1', '2'], true);
                    Pcb.Checked('CopperThickness', 1);
                }
                Pcb.setItemsSelectDefault('InnerCopperThickness', '0.5');
            }
        }
        if (CopperThickness > 2) {
            Pcb.QutoliEv('[name=InnerCopperThickness][value="0.5"]', 2, [], true);
            if (name == 'CopperThickness') Pcb.setItemsSelectDefault('InnerCopperThickness', '1');
        } else {
            Pcb.QutoliEv('[name=InnerCopperThickness][value="0.5"]', 3, [], true);
        }
        //树脂塞孔 Resin Plug-hole
        let visa = GetCheckedVal('Vias');
        //(BoardThickness >= 2 && BoardThickness <= 2) && (BoardLayers == 4 || BoardLayers == 6) && (visa <= 0.6 && visa != 0)
        if (proCategory == 'fr4Item' && BoardLayers >= 2) {
            Pcb.QutoliEv('[name=SolderCover][value=resinplughole],[name=SolderCover][value=plugoil]', 3);
        } else {
            Pcb.QutoliEv('[name=SolderCover][value=resinplughole],[name=SolderCover][value=plugoil]', 2);
            Pcb.ifCK_tf('SolderCover', 'converoil');
        }

        //喇叭孔/台阶孔 Countersink Hole/Step Hole
        if (proCategory == 'fr4Item' && BoardLayers <= 2 && BoardThickness >= 1 && BoardThickness <= 2.4) {
            Pcb.QutoliEv('[name=StepHole_]', 3);
        } else {
            Pcb.QutoliEv('[name=StepHole_]', 2);
        }
        Pcb.SpecialProcessRule();
        Pcb.fnSurfaceFinish();
    },
    //2021-12-06 铝基板新规
    to211206: function (name) {
        //类别
        var proCategory = $("[name=proCategory]:checked").val();
        if (proCategory !== 'copper') Pcb.QutoliEv("[name='BoardThickness'][value='1.5']", 1);
        //铜箔厚度
        var CopperThickness = $("[name='CopperThickness']:checked").val();
        var BoardLayers = $("[name='BoardLayers']:checked").val();
        //板子厚度
        var BoardThickness = $("[name='BoardThickness']:checked").val();
        //总面积
        var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
        //20211130 铝基板规则
        Pcb.QutoliEv('[name=Invoice][value="2"]', 1); //隐藏 1.5W 导热
        if (proCategory == 'aluminumItem' && area > 30 && (name == "CopperThickness" || name == "BoardThickness")) {
            if ($("[name=CopperThickness]:checked").val() == '0.5' && BoardThickness == '1.2') {
                Pcb.QutoliEv('[name=SurfaceFinish]', 2);
                // Pcb.QutoliEv('[name=SurfaceFinish][value="haslwithlead"],[name=SurfaceFinish][value="haslwithfree"],[name=SurfaceFinish][value="immersiongold"]',2);
                Pcb.QutoliEv('[name=SurfaceFinish][value="osp"]', 3);
                selectVal('SurfaceFinish', 'osp');
                Pcb.Checked("Invoice", "5");
                Pcb.Checked("WithstandVoltage", "1500");
            } else {
                Pcb.QutoliEv('[name=SurfaceFinish]', 3);
                selectVal('SurfaceFinish', 'haslwithfree');
            }
        }
        if (proCategory == 'aluminumItem') {
            if (name == 'proCategory' || name == 'BoardThickness' || name == 'countNumer') {
                Pcb.Checked('Vias', '1.5');
                Pcb.Checked('FormingType', 'mechanical');

                Pcb.Checked('CopperThickness', '1');
                CopperThickness = '1'
            }
            $("[name=productType]").parentsUntil('.option.pull-left').parentsUntil('.clearfix').hide();
            Pcb.QutoliEv('[name="CopperThickness"][value="0.4"],[name=SurfaceFinish][value="none"],[name=SurfaceFinish][value="immersiongold"]', 0);
            Pcb.QutoliEv('[name="CopperThickness"][value="0.4"],[name=SurfaceFinish][value="none"],[name=SurfaceFinish][value="osp"]', 3);
            Pcb.QutoliEv("Invoice", 2, ['2']);
            Pcb.QutoliEv("WithstandVoltage", 2, ['3500']);
            Pcb.QutoliEv("BoardThickness", 2, ['0.5', '0.6', '3'], true);
            Pcb.QutoliEv("BoardThickness", 1, ['0.4', '0.5', '0.6', '2.4', '3', '3.4', '3.5', '3.6', '3.8', '4'], true);
            Pcb.QutoliEv("[name=WithstandVoltage][value=3500]", 1);//,[name=CopperThickness][value=3]
            if (BoardLayers == 2) {
                Pcb.QutoliEv("[name='BoardThickness'][value='0.8'],[name='BoardThickness'][value='3.2'],[name='CopperThickness']", 2, [], true);
                Pcb.Checked("CopperThickness", 1);
            }
            // Pcb.QutoliEv("[name=CopperThickness][value=3]", 3);
            if (area > 30 && BoardLayers == 1) {
                Pcb.QutoliEv('[name=FormingType][value="module"]', 3);
            } else {
                if (area >= 5) {
                    Pcb.QutoliEv('[name=FormingType][value="module"]', 3);
                } else {
                    Pcb.QutoliEv('[name=FormingType][value="module"]', 2);
                    Pcb.Checked('FormingType', 'mechanical');
                }
                Pcb.QutoliEv('[name=CopperThickness][value="0.4"]', 2);
            }
            if ((name == 'BoardThickness' && BoardThickness == '0.7') || (name == 'CopperThickness' && CopperThickness == "0.4")) {
                if (BoardThickness == '0.7') {
                    Pcb.QutoliEv("[name=CopperThickness][value='0.5'],[name=CopperThickness][value='0.75'],[name=CopperThickness][value='1'],[name=CopperThickness][value='2']", 2, [], true);
                }
                Pcb.QutoliEv("[name=Invoice][value=1],[name=Invoice][value=3],[name=WithstandVoltage][value=2500],[name=SurfaceFinish][value='haslwithlead'],[name=SurfaceFinish][value='none'],[name=SurfaceFinish][value='haslwithfree'],[name=SurfaceFinish][value='immersiongold']", 2);
                Pcb.Checked("CopperThickness", '0.4');
                CopperThickness = '0.4';
                Pcb.Checked("Invoice", '5');
                Pcb.Checked("WithstandVoltage", '1500');
                selectVal("SurfaceFinish", 'osp');
                Pcb.Checked("WVTest", 'none');
            }
            else if (name == 'BoardThickness' && BoardThickness != '0.7') {
                Pcb.QutoliEv("[name=CopperThickness][value='0.75']", 3, [], true);
                if (BoardThickness == '1.6') {
                    Pcb.QutoliEv("[name=Invoice][value=5],[name=WithstandVoltage][value=1500]", 2);
                    Pcb.Checked("Invoice", '1');
                    Pcb.Checked("WithstandVoltage", '2500');
                }
                if (BoardThickness == '2') {
                    Pcb.QutoliEv("[name=WithstandVoltage][value=1500]", 2);
                }
            }
            else if (CopperThickness != "0.4") {
                Pcb.QutoliEv("[name=Invoice][value=1],[name=Invoice][value=3],[name=WithstandVoltage][value=2500],[name=Invoice][value=5],[name=SurfaceFinish][value='haslwithlead'],[name=SurfaceFinish][value='haslwithfree'],[name=SurfaceFinish][value='immersiongold'],[name=WVTest][value='sampling'],[name=WVTest][value='full']", 3);
                Pcb.QutoliEv("[name=Invoice][value=5],[name=WithstandVoltage][value=1500]", 2);
                if (name == 'CopperThickness') {
                    Pcb.Checked("Invoice", '1');
                    Pcb.setItemsSelectDefault("WithstandVoltage", '2500');
                    selectVal("SurfaceFinish", 'haslwithfree');
                }
            }
            if (name == 'FlyingProbe' && CopperThickness == '0.4') {
                Pcb.QutoliEv("[name=SurfaceFinish]", 2);
                selectVal("SurfaceFinish", 'osp');
            }
            if (BoardThickness != '0.7') {
                if (BoardThickness == '2') {
                    Pcb.QutoliEv('[name=Invoice][value="5"],[name=Invoice][value="1500"]', 2);
                    Pcb.QutoliEv("[name=CopperThickness][value='0.4'],[name=CopperThickness][value='0.5']", 2, [], true);
                    Pcb.QutoliEv("[name=CopperThickness][value='1'],[name=CopperThickness][value='2'],[name=Invoice][value='3']", 3, [], true);
                    if (name == 'BoardThickness' && BoardThickness == '2') {
                        Pcb.Checked('Invoice', '1');
                        Pcb.Checked('Vias', '1.5');
                        // Pcb.QutoliEv('[name=Invoice][value="3"]',2);
                        CopperThickness = 1;
                        Pcb.Checked('WithstandVoltage', '2500');
                        Pcb.Checked('CopperThickness', '1');
                    }
                    // if(CopperThickness==1){
                    //     Pcb.QutoliEv('[name=Invoice][value="3"]',2);
                    // }else{
                    //     Pcb.QutoliEv('[name=Invoice][value="3"]',3);
                    // }
                } else if (name == 'BoardThickness' && BoardThickness != '2') {
                    // Pcb.QutoliEv("[name=Invoice][value='3']",2);
                    Pcb.QutoliEv("[name=CopperThickness][value='0.5'],[name=CopperThickness][value='1'],[name=CopperThickness][value='2'],[name=Invoice][value='3']", 3, [], true);
                }
            }
            if (area > 30) { // && BoardThickness!=2
                //Pcb.QutoliEv('BoardThickness', 3, ["0.7"], true);
                if (BoardThickness >= 0.7 && BoardThickness <= 1.2) {
                    Pcb.QutoliEv('CopperThickness', 3, ["0.4"], true);
                } else {
                    Pcb.QutoliEv('CopperThickness', 2, ["0.4"], true);
                }
            }
            else {
                Pcb.QutoliEv('BoardThickness', 2, ["0.7"], true);
                Pcb.QutoliEv('CopperThickness', 2, ["0.4"], true);
            }
            if (CopperThickness == '0.4') {
                Pcb.QutoliEv("[name=SurfaceFinish]", 2);
                selectVal("SurfaceFinish", 'osp');
                Pcb.QutoliEv('[name=Invoice][value="3"]', 2);
            } else {
                Pcb.QutoliEv('[name=Invoice][value="3"]', 3);
            }
            if (CopperThickness != '0.4') {
                Pcb.QutoliEv('[name=WVTest]', 3);
            }
            if (CopperThickness >= 3) {
                Pcb.QutoliEv("[name=Invoice][value=1],[name=Invoice][value=3]", 2);
                this.ifCK_tf('Invoice', 9)
            } else {
                Pcb.QutoliEv("[name=Invoice][value=1],[name=Invoice][value=3]", 3);
                this.ifCK_tf('Invoice', 1)
            }
            if (CopperThickness == 2) {
                Pcb.QutoliEv("[name=Invoice][value=1]", 2);
                this.ifCK_tf('Invoice', 3)
            }
            if (getCkVal('Invoice') >= 4) {
                Pcb.QutoliEv("[name=WithstandVoltage][value=2500]", 2)
                Pcb.QutoliEv("[name=WithstandVoltage][value=3000]", 3)
                Pcb.QutoliEv("[name=WVTest]", 2)
                Pcb.QutoliEv("[name=WVTest][value=full3000]", 3)
                Pcb.Checked('WVTest', 'full3000');
                this.ifCK_tf('WithstandVoltage', '3000')
            } else {
                Pcb.QutoliEv("[name=WithstandVoltage][value=2500]", 3)
                //2023-04-11 铝基板铜厚0.5,0.75支持3000V
                // if (CopperThickness=='0.5'||CopperThickness=='0.75'){
                if (BoardLayers == 1 && CopperThickness >= 0.5 && CopperThickness <= 2 && BoardThickness >= 0.8 && BoardThickness <= 2) {
                    Pcb.QutoliEv("[name=WithstandVoltage][value='3000']", 3);
                } else {
                    Pcb.QutoliEv("[name=WithstandVoltage][value=3000]", 2)
                }
                Pcb.QutoliEv("[name=WVTest]", 3)
                Pcb.QutoliEv("[name=WVTest][value=full3000]", 2)
                this.ifCK_tf('WVTest', 'none')
            }
            if (getCkVal('WithstandVoltage') == 3000) {
                Pcb.QutoliEv('[name=ImageTranster][value=screenprinting]', 2);
                Pcb.ifCK_tf('ImageTranster', 'exposure')
            } else {
                Pcb.QutoliEv('[name=ImageTranster][value=screenprinting]', 3);
            }
            this.ifCK_tf('WithstandVoltage', '2500')

            if (name == 'countNumer' && CopperThickness != '0.4') {
                Pcb.Checked('Invoice', '1');
                Pcb.Checked('WithstandVoltage', '2500');
            }
            if ((BoardThickness != '0.7' || BoardThickness != '2') && CopperThickness == '0.75') {
                Pcb.QutoliEv('[name=Invoice][value="3"]', 2);
            }
            //20220505 铝基板 板厚-铜厚-导热 规则
            if (BoardThickness < 1.2) {
                Pcb.QutoliEv('[name=Invoice]', 3);
                Pcb.QutoliEv('[name=CopperThickness][value=2]', 2);
                Pcb.QutoliEv('[name=Invoice][value=5]', 2);
                if (BoardThickness >= 1 && CopperThickness == '1') {
                    Pcb.QutoliEv('[name=Invoice][value=3]', 3);
                    // if(BoardThickness=='1') Pcb.QutoliEv('[name=Invoice][value=3]',2);
                } else {
                    Pcb.QutoliEv('[name=Invoice][value=3]', 2);
                }
                if (BoardThickness == '0.8') {
                    Pcb.QutoliEv('[name=CopperThickness][value="0.75"]', 2);
                }
                this.ifCK_tf('Invoice', '1')
            }
            else if (BoardThickness == '2' || BoardThickness == '1.6') {
                this.ifCK_tf('CopperThickness', '1')
                if (BoardThickness == '2') Pcb.QutoliEv('[name=CopperThickness][value="0.75"]', 2);
                // if(BoardThickness == '1.6' && CopperThickness == '2'){
                //         Pcb.QutoliEv('[name=Invoice][value=3]',2);
                //         this.ifCK_tf('Invoice','1')
                // }
                // if(BoardThickness=='2' && CopperThickness==1){
                //     Pcb.QutoliEv('[name=Invoice][value=3]',2);
                //     this.ifCK_tf('Invoice','3')
                // }else if(CopperThickness=='2'){
                //     Pcb.QutoliEv('[name=Invoice][value=1]',2);
                //     this.ifCK_tf('Invoice','3')
                // }
                else if (CopperThickness == '0.5') {
                    Pcb.QutoliEv('[name=Invoice][value=3]', 2);
                }
            }
        }
        else {
            $("[name=productType]").parentsUntil('.option.pull-left').parentsUntil('.clearfix').show();
            Pcb.QutoliEv('[name="CopperThickness"][value="0.4"]', 1);
        }
        //2021-12-22 10:22:30
        // 板厚在【0.8mm】到【1.2mm】时【0.5Oz】并且是【30平以上】时【0.7W】、【DC1500V】 选项可选
        // 当选择0.7W时强制默认DC1500V，同时表面处理只能选择OSP
        // 选择DC1500V时强制默认0.7W，同时表面处理只能选择OSP
        if (BoardThickness > 0.7 && BoardThickness <= 1.2 && CopperThickness == '0.5' && area > 30) {
            Pcb.QutoliEv("[name=Invoice][value='5'],[name=WithstandVoltage][value='1500']", 3);
            Pcb.QutoliEv("[name=ImageTranster]", 3);
            var Invoice = $("[name=Invoice]:checked").val();
            var ImageTranster = $("[name=ImageTranster]:checked").val();
            var WithstandVoltage = $("[name=WithstandVoltage]:checked").val();
            // if((name=='Invoice' && Invoice==5)||(name=='WithstandVoltage' && WithstandVoltage==1500)){
            if (Invoice == 5 || name == 'WithstandVoltage' && WithstandVoltage == '1500') {
                Pcb.QutoliEv('[name=SurfaceFinish]', 2);
                selectVal('SurfaceFinish', 'osp');
                Pcb.Checked('Invoice', '5');
                Pcb.Checked('WithstandVoltage', '1500');
                if (name != 'ImageTranster') {
                    Pcb.Checked('ImageTranster', 'screenprinting');
                }
            } else if (name == 'Invoice' && Invoice == 1) {
                Pcb.Checked('WithstandVoltage', '2500');
            } else {
                Pcb.QutoliEv('[name=SurfaceFinish]', 3);
            }
        }
        //新品博宇铝基板
        if (CopperThickness >= 1 && BoardLayers == 1) {
            Pcb.QutoliEv("[name=Invoice][value=4],[name=Invoice][value=9],[name=Invoice][value=6],[name=Invoice][value=8]", 3);
        } else {
            Pcb.QutoliEv("[name=Invoice][value=4],[name=Invoice][value=9],[name=Invoice][value=6],[name=Invoice][value=8]", 2);
        }
    },
    /** 获取form值 */
    getFormData: function () {
        var jsondata = {}
        var formdata = new FormData($('#fm').get(0));
        formdata.forEach((value, key) => {
            if (!jsondata[key]) {
                jsondata[key] = formdata.getAll(key).length > 1 ? formdata.getAll(key) : formdata.get(key);
            }
        });
        return jsondata;
    },
    to231221: function (name) {
        var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
        var data = Pcb.getFormData();
        // 默认值设置
        Pcb.setDefaultValue(data, name, Pcb.DefaultValueRule);
        if (name == "proCategory") {
            CollapseOption.resize();
        }
        var proCategory = data.proCategory;
        if (area > 150 && proCategory == "aluminumItem") {
            Pcb.QutoliEv("[name='FormingType'][value='mechanical']", 2)
            Pcb.Checked("FormingType", "module");
        }
        if (['fr4Item', 'cem1Item'].indexOf(data.proCategory) > -1 && data.BoardLayers == '1') {
            $(".BoardLayersOneInfo").show();
        }
        else {
            $(".BoardLayersOneInfo").hide();
        }
        if (proCategory == "fr4Item" && data.BoardLayers == '1') {
            $(".border_color").slideDown(300);
        } else {
            $(".border_color").slideUp(300);
        }

        switch (proCategory) {
            case 'fr4Item': {
                //LineWeight 中：删掉”8/8mil“，”10/10mil“和”20/20mil； 20240115 Min Spacing添加10/10mil,20/20mil,
                //Vias 0.3mm之后的全部删掉
                //CopperThickness 中0.5oz、0.75oz、7oz、8oz，删掉，
                //InnerCopperThickness“中，0.75oz删掉；

                Pcb.QutoliEv('LineWeight', 1, [8]);
                var showViasVals = ['0.4', '0.5'];
                var ViasVals = $('[name=Vias]').filter(function (item) {
                    if (showViasVals.indexOf(this.value) > -1) {//Min hole size添加0.4mm和0.5mm
                        return false;
                    }
                    return parseFloat(this.value) > 0.3;
                });
                Pcb.QutoliEv(ViasVals, Pcb.QutoliEvType.hide);
                Pcb.QutoliEv('Vias', Pcb.QutoliEvType.enable, showViasVals, true);
                Pcb.QutoliEv('CopperThickness', Pcb.QutoliEvType.hide, ['0.5', '0.75', '7', '8']);
                Pcb.QutoliEv('InnerCopperThickness', Pcb.QutoliEvType.hide, ['0.75']);
            } break;
            case 'aluminumItem': {//铝基板
                Pcb.Checked("LineWeight", "10");
                var vals = []
                $(".NewBoard li").each(function (i, dom) {
                    var thikVal = $(dom).find("[name='BoardThickness']").val();
                    if (thikVal.length > 4) {
                        vals.push(thikVal)
                    }
                })
                if (vals.length > 0) {
                    Pcb.QutoliEv('BoardThickness', Pcb.QutoliEvType.hide, vals);
                }
                Pcb.QutoliEv('FlyingProbe', Pcb.QutoliEvType.hide, ['lowresistancetest']);
            } break;
            case 'copper': {
                Pcb.QutoliEv('FlyingProbe', Pcb.QutoliEvType.hide, ['lowresistancetest']);
            } break;

        }

        Pcb.QutoliEv($('[name=BoardThickness].not-selectable:visible'), Pcb.QutoliEvType.hide);
        Pcb.QutoliEv($('[name=CopperThickness].not-selectable:visible'), Pcb.QutoliEvType.hide);
        Pcb.QutoliEv($('[name=InnerCopperThickness].not-selectable:visible'), Pcb.QutoliEvType.hide);

        CollapseOption.updateView();
    },
    //根据指定url参数跳转，第一次加载页面使用url参数值 20240710
    RequstFist: function () {
        //debugger;
        //hidLength = 100 & hidWidth=150 & num=5 & txtSelNum=& hidLayers=4 & BoardThickness=1.6 &proCategory=aluminumItem
        if (!isRequst) {
            var proCategory = Pcb.getUrlParam('proCategory') ?? "fr4Item";
            if (proCategory && proCategory != null) {
                Pcb.Checked("proCategory", proCategory);
                $('input[name=proCategory][value=' + proCategory + ']').parent().trigger('click')
            }
            var hidLayers = Pcb.getUrlParam('hidLayers');
            if (hidLayers && hidLayers != null) {
                Pcb.Checked("BoardLayers", hidLayers);
                $('input[name=BoardLayers][value=' + hidLayers + ']').parent().trigger('click')
            }
            var BoardThickness = Pcb.getUrlParam('BoardThickness');
            if (BoardThickness && BoardThickness != null) {
                Pcb.Checked("BoardThickness", BoardThickness);
                $('input[name=BoardLayers][value="' + hidLayers + '"]').parent().trigger('click')
            }
            var BoardHeight = Pcb.getUrlParam('hidLength');
            if (BoardHeight && BoardHeight != null) {
                $('#BoardHeight').val(BoardHeight);
            }
            var BoardWidth = Pcb.getUrlParam('hidWidth');
            if (BoardWidth && BoardWidth != null) {
                $('#BoardWidth').val(BoardWidth);
            }
            var num = Pcb.getUrlParam('num');
            if (num && num != null) {
                $('#num').val(num);
            }
        }
    },
    getUrlParam: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            //return unescape(r[2]);
            return r[2];
        }
        return null;
    },
    //铜基板
    toTypeCopper: function (name) {
        var proCategory = $("[name='proCategory']:checked").val();
        if (proCategory != 'copper') return false;
        var BoardThickness = $("[name='BoardThickness']:checked").val();
        var BoardLayers = $("[name='BoardLayers']:checked").val();
        var CopperThickness = $("[name='CopperThickness']:checked").val();
        var NumPCS = $("#Num").val();
        var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
        if (name == 'proCategory') {//默认值/状态
            var $hideDoms = $('[name]').filter(function () {
                let name = $(this).prop('name')
                return ['BoardLayers', 'BoardThickness', 'SolderColor', 'FontColor', 'CopperThickness', 'LineWeight', 'Vias', 'Invoice', 'WithstandVoltage'].indexOf(name) >= 0;
            });
            Pcb.QutoliEv($hideDoms, 1);
            Pcb.QutoliEv('SurfaceFinish', 2, ['none', 'haslwithlead', 'haslwithfree', 'immersiongold']);
            Pcb.QutoliEv('WVTest', 2, ['full3000']);
            Pcb.QutoliEv('BoardLayers', 0, ['1', '2']);
            Pcb.QutoliEv('FontColor', 0, ['white', 'black', 'none']);
            Pcb.QutoliEv('Invoice', 0, ['380']);
            Pcb.QutoliEv('WithstandVoltage', 0, ['2500']);
            Pcb.QutoliEv('ImageTranster', 0, ['screenprinting']);

            Pcb.QutoliEv('BoardThickness', 3, ['1', '1.2', '1.5', '2'], true);
            Pcb.QutoliEv('SolderColor', 3, ['warmwhite', 'black', 'matteblack'], true);
            Pcb.QutoliEv('CopperThickness', 3, ['1', '2'], true);
            Pcb.QutoliEv('LineWeight', 3, ['4', '5', '10', '20'], true);
            Pcb.QutoliEv('Vias', 3, ['1.2', '1.5'], true);

            Pcb.QutoliEv('WVTest', 3, ['none', 'sampling', 'full']);
            Pcb.QutoliEv('WithstandVoltage', 3, ['2500']);
            Pcb.QutoliEv("[name='FormingType']", 3);

            $(".aluminumOption").show();
            $("[name='WVTest'][value='none'],[name='WithstandVoltage']").parents('.aluminumOption').hide();
            Pcb.Checked("BoardLayers", 1);
            Pcb.clickItem("SolderColor", 'warmwhite');
            Pcb.clickItem("WVTest", 'none');
            Pcb.Checked("CopperThickness", '1');
            Pcb.Checked("Vias", '1.2');
            $(".soldermask,.wireWelding").hide();
        }
        if (name == 'countNumer') {
            Pcb.QutoliEv("[name='Invoice']", 1);
        }
        // $('.boxSpecialTechniques').hide();
        Pcb.ifCK_tf("BoardThickness", "1");
        Pcb.QutoliEv("[name='SurfaceFinish']", 1);
        Pcb.QutoliEv("[name='SurfaceFinish'][value='osp']", 0);
        Pcb.clickItem("SurfaceFinish", 'osp');
        Pcb.Checked("ImageTranster", 'exposure');
        Pcb.clickItem("Invoice", '380', true);
        Pcb.clickItem("WithstandVoltage", '2500');
        if (name == 'CopperThickness' && CopperThickness == '2') {
            Pcb.QutoliEv("[name='LineWeight'][value='4']", 2);
            Pcb.ifCK_tf("LineWeight", 5);
        } else {
            Pcb.QutoliEv("[name='LineWeight'][value='4']", 3);
            Pcb.ifCK_tf("LineWeight", 4);
        }
    },
    //内铜外铜相关
    toOICThickness: function (name) {
        var proCategory = $("[name='proCategory']:checked").val();
        var BoardLayers = $("[name='BoardLayers']:checked").val();
        var BoardThickness = $("[name='BoardThickness']:checked").val();
        var CopperThickness = $("[name='CopperThickness']:checked").val();
        var InnerCopperThickness = $("[name='InnerCopperThickness']:checked").val();
        if (proCategory === 'fr4Item') {
            Pcb.QutoliEv("CopperThickness", 0, ['3', '4', '5', '6'], true);
            if (BoardLayers == 1) {
                Pcb.QutoliEv("[name=CopperThickness]", 2, [], true);
                if (BoardThickness <= 1.6 || BoardThickness == 2) {
                    Pcb.QutoliEv("CopperThickness", 3, ['1'], true);
                } else if (BoardThickness == 1.8 || BoardThickness >= 3) {
                    Pcb.QutoliEv("CopperThickness", 3, ['1', '2', '3'], true);
                }

            } else {
                if (BoardThickness >= 1) {
                    Pcb.QutoliEv("CopperThickness", 3, ['3', '4'], true);
                    if (BoardLayers == 4 && BoardThickness >= 1.2) {
                        Pcb.QutoliEv("CopperThickness", 3, ['5', '6'], true);
                        if (BoardLayers == 4 && BoardThickness >= 2.4) {
                            Pcb.QutoliEv("CopperThickness", 2, ['3', '4', '5', '6', '7', '8'], true);
                            Pcb.QutoliEv("InnerCopperThickness", 2, ['0.5'], true);
                        } else {
                            Pcb.QutoliEv("CopperThickness", 3, ['3', '4', '5', '6'], true);
                            Pcb.QutoliEv("InnerCopperThickness", 3, ['0.5'], true);
                        }
                    } else {
                        if (BoardLayers == 2) {
                            Pcb.QutoliEv("CopperThickness", 3, ['5', '6'], true);
                        } else {
                            Pcb.QutoliEv("CopperThickness", 2, ['5', '6'], true);
                        }
                        Pcb.QutoliEv("CopperThickness", 2, ['7', '8'], true);
                    }

                }
                else {
                    Pcb.QutoliEv("CopperThickness", 2, ['3', '4', '5', '6', '7', '8'], true);
                }
                if (BoardLayers >= 8) {
                    Pcb.QutoliEv("CopperThickness", 2, ['3', '4'], true);
                    if (BoardLayers >= 12) {
                        Pcb.QutoliEv("InnerCopperThickness", 2, ['2'], true);
                    }
                }
            }
        } else {
            Pcb.QutoliEv("CopperThickness", 2, ['5', '6', '7', '8'], true);
        }
        Pcb.setItemsSelectDefault('InnerCopperThickness', 1, InnerCopperThickness);
        Pcb.setItemsSelectDefault('CopperThickness', 1, CopperThickness);
    },
    //单层板选择阻焊字符颜色提示框 2021-11-29 15:02:18
    SS_Color: function () {
        var BoardLayers = $("[name='BoardLayers']:checked").val();
        var proCate = $("[name=proCategory]:checked").val();
        var solderColor = $("[name='SolderColor']:checked").val();
        var FontColor = $("[name='FontColor']:checked").val();
        // console.log(FontColor);
        if (proCate == 'fr4Item' || proCate == 'cem1Item') {
            if (BoardLayers == 1) {
                if (solderColor != 'green' || FontColor != 'white') {
                    let sf = $("[name='SurfaceFinish']:checked").val();
                    let pc = proCate;
                    switch (sf) {
                        case 'haslwithlead': sf = 'HASL(with lead)'; break;
                        case 'haslwithfree': sf = 'HASL(lead free)'; break;
                        case 'immersiongold': sf = 'Immersion Gold'; break;
                        case 'osp': sf = 'OSP'; break;
                    }
                    switch (pc) {
                        case 'fr4Item': pc = 'FR-4'; break;
                        case 'cem1Item': pc = 'CEM-1'; break;
                    }
                    $("body").append(`
                        <div class="boxNote1">
                            <div class="box">
                                <i class="boxClose"></i>
                                <div class="t">Note</div>
                                <div class="n">
                                    <span>There are very few people choose below combined specifications.</span>
                                    <p>${pc}, ${$("[name='BoardLayers']:checked").val()} layer, ${$("[name='BoardThickness']:checked").val()} thickness, <em>${solderColor}</em> soldermask/<em>${FontColor}</em> silkscreen, ${sf}, 1 oz copper.</p>
                                    <span>Thus, ALLPCB will change raw material, it takes longer and cost more in actual fabrication process. Changing ${solderColor}/${FontColor} to green/white is recommended as it has a shorter turnaround time and no extra charge.</span>
                                </div>
                                <div class="bn"><em>Change ${solderColor}/${FontColor} to green/white</em><span class="bnsa sk ResColor"><span>OK</span></span><span class="bnsa sk tm cl"><span>No Thanks</span></span></div>
                            </div>
                        </div>
                    `);
                    setTimeout(function () { $(".boxNote1").addClass("on"); }, 300);
                    $(".boxNote1 .ResColor").click(function () {
                        Pcb.Checked("SolderColor", "green");
                        Pcb.Checked("FontColor", "white");
                        hiddenBoxNote1();
                    });
                    $(".boxNote1 .boxClose,.boxNote1 .cl").click(function () { hiddenBoxNote1(); });
                    function hiddenBoxNote1() { $(".boxNote1").removeClass("on"); setTimeout(function () { $(".boxNote1").remove(); }, 300); }
                }
            }
        }
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
            var vCut = $("[name=VCut]:checked").val();
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
                $(".common_area span").text(parseFloat(area / 1000000).toFixed(4));
            }

        }
    },

    //pcb ai拼版信息示例
    PcbImpositionInformationExample: function () {
        var areaData = Pcb.PcbCalcArea();

        return layer.tips($('#templatePinbanBox').html(), '#btnPanelInfo', {
            tips: [3, '#fff'],
            time: 0,
            area: ['425px', '200px'],
            success: function (layero) {
                var $dom = $(layero);
                $dom.css('padding', '0px')
                var l = areaData.area.y;
                var w = areaData.area.x;
                var px = areaData.pinBan.y;//下面计算用反了
                var py = areaData.pinBan.x;
                var c = l * px; var k = w * py;
                if (l > 0 && w > 0 && px > 0 && py > 0) {
                    var panelWidth = w * py;
                    var panelHeight = l * px;
                    var panellistLength = $dom.find(".panel-list").length;
                    if (panellistLength > 0) {
                        $dom.find(".panel-list").remove();
                    }

                    var exampleCreatePanel = ("<ul class='panel-list' style='margin:0;'>");
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
                    $dom.find(".example-createpanel").html(exampleCreatePanel);

                    if (panelWidth > panelHeight) {
                        var Proportion = parseFloat(100 / panelWidth).toFixed(2);
                        var itemWidth = 100 / py;
                        var itemHeight = panelHeight * Proportion / px;
                    } else {
                        var Proportion = parseFloat(100 / panelHeight).toFixed(2);
                        var itemHeight = 100 / px;
                        var itemWidth = panelWidth * Proportion / py;
                    }

                    $dom.find(".imposition-informationExample .proportion").text(Proportion);
                    $dom.find(".panel-list .item").css({ "width": itemWidth, "height": itemHeight });

                    $dom.find(".imposition-informationExample .edgerailwidth-left").hide();
                    $dom.find(".imposition-informationExample .edgerailwidth-right").hide();
                    $dom.find(".imposition-informationExample .edgerailwidth-top").hide();
                    $dom.find(".imposition-informationExample .edgerailwidth-bottom").hide();

                    var panelyWidth = $dom.find(".imposition-informationExample .example-createpanel").width();
                    var panelyHeight = $dom.find(".imposition-informationExample .example-createpanel").height();
                    var edgerailHeight = panelyHeight;

                    var gongWidth = 0;

                    if (areaData.gonyiArea.y > 0) {
                        gongWidth = areaData.gonyiArea.y
                        c += gongWidth * 2;
                        gongWidth = 5;
                        panelyHeight = $dom.find(".imposition-informationExample .example-createpanel").height() + (gongWidth * 2);
                        $dom.find(".imposition-informationExample .edgerailwidth-top").show();
                        $dom.find(".imposition-informationExample .edgerailwidth-bottom").show();
                    }
                    else if (areaData.gonyiArea.x > 0) {
                        gongWidth = areaData.gonyiArea.x
                        k += gongWidth * 2;
                        gongWidth = 5;
                        panelyWidth = $dom.find(".imposition-informationExample .example-createpanel").width() + (gongWidth * 2);
                        $dom.find(".imposition-informationExample .edgerailwidth-left").show();
                        $dom.find(".imposition-informationExample .edgerailwidth-right").show();
                    }


                    $dom.find(".imposition-informationExample .edgerailwidth-left").css({ "width": gongWidth, "height": edgerailHeight });
                    $dom.find(".imposition-informationExample .edgerailwidth-right").css({ "width": gongWidth, "height": edgerailHeight });
                    $dom.find(".imposition-informationExample .edgerailwidth-top").css({ "width": panelyWidth, "height": gongWidth });
                    $dom.find(".imposition-informationExample .edgerailwidth-bottom").css({ "width": panelyWidth, "height": gongWidth });
                    $dom.find(".imposition-informationExample .panel-x").css("width", panelyWidth);
                    $dom.find(".imposition-informationExample .panel-y").css({ "right": "auto", "left": $dom.find(".imposition-informationExample .example-createpanel").width() + 20, "top": "60px" });
                    $dom.find(".imposition-informationExample .panel-y .number").css("height", panelyHeight);
                    $dom.find(".imposition-informationExample .panel-width").text(parseFloat(k).toFixed(2));
                    $dom.find(".imposition-informationExample .panel-height").text(parseFloat(c).toFixed(2));
                    if (getCkVal("BoardType") == "jpset") {
                        //$("[name=PcbSizeY]").val(parseFloat(c).toFixed(2));
                        //$("[name=PcbSizeX]").val(parseFloat(k).toFixed(2));
                        $("[name='PcbSizeY']").val(Number($(".panel-width").html()));
                        $("[name='PcbSizeX']").val(Number($(".panel-height").html()));
                    }
                }
            }
        });
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

            if (GetCheckedVal("processeEdge_x") != "none" && parseFloat($("[name=processeEdge_y]").val()) < 3) {
                $("[name=processeEdge_y]").val(3);
            }
            var processeEdge_y = $("[name=processeEdge_y]").val();
            if (GetCheckedVal("processeEdge_x") == "none") {
                c = l * px;
                k = w * py;
                panelyHeight = $(".imposition-informationExample .example-createpanel").height();
                $(".imposition-informationExample .edgerailwidth-left").hide();
                $(".imposition-informationExample .edgerailwidth-right").hide();
                $(".imposition-informationExample .edgerailwidth-top").hide();
                $(".imposition-informationExample .edgerailwidth-bottom").hide();
            }
            if (GetCheckedVal("processeEdge_x") == "updown") {
                c += processeEdge_y * 2;
                processeEdge_y = 5;
                panelyHeight = $(".imposition-informationExample .example-createpanel").height() + (processeEdge_y * 2);
                edgerailHeight = panelyHeight - (processeEdge_y * 2);
                $(".imposition-informationExample .edgerailwidth-left").hide();
                $(".imposition-informationExample .edgerailwidth-right").hide();
                $(".imposition-informationExample .edgerailwidth-top").show();
                $(".imposition-informationExample .edgerailwidth-bottom").show();
            }
            if (GetCheckedVal("processeEdge_x") == "leftright") {
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
            if (GetCheckedVal("processeEdge_x") == "both") {
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
            $(".imposition-informationExample .panel-y").css({ "right": "auto", "left": $(".imposition-informationExample .example-createpanel").width() + 10 });
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
            if (getCkVal("BoardType") == "jpset") {
                //$("[name=PcbSizeY]").val(parseFloat(c).toFixed(2));
                //$("[name=PcbSizeX]").val(parseFloat(k).toFixed(2));
                $("[name='PcbSizeY']").val(Number($(".panel-width").html()));
                $("[name='PcbSizeX']").val(Number($(".panel-height").html()));
            }
        }
    },
    //排序
    paixu: function (Dom, OrderBy, Type) {
        $(".order-box .iconfont").removeClass("active");
        $(Dom).addClass("active");
        var obj = JSON.stringify(valuateResult.List);
        //var name = obj.replace(/\[|]/g, '');

        $.ajax({
            url: '/pcb/pcbonlinesort',
            dataType: 'json',
            type: 'post',
            data: {
                Data: obj,
                OrderBy: OrderBy,
                Type: Type
            },
            beforeSend: function () {
                $(".loader").show();
                $(".loader p").hide();
            },
            success: function (data) {
                if (data.success) {
                    var info = data.attr.List;
                    var type = $('.xgpp .sel-active').attr('type');
                    Pcb.paraRend(info, "PcbOrder", "FR4Type", "Num", "DeliveryDays", "FR4Tg");
                    $(".loader").hide();
                }
            }
        })
    },
    //鸿瑞兴 脚本
    Ruixing: function () {
        var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
        //产品类别
        var proCategory = $("[name=proCategory]:checked").val();
        //铜箔厚度
        var CopperThickness = $("[name='CopperThickness']:checked").val();
        //板子厚度
        var BoardThickness = parseInt($("[name='BoardThickness']:checked").val());
        //板子层数
        var BoardLayers = $("[name='BoardLayers']:checked").val();

        if (proCategory == "fr4Item" && CopperThickness == "1" && (BoardThickness >= 1.0 && BoardThickness <= 1.6) && BoardLayers == "2" && area > 50) {
            //Pcb.QutoliEv("[name='BeforePlating']", 2);
            Pcb.QutoliEv("[name='BeforePlating'][value='conductivefilm']", 3);
            //Pcb.Checked("BeforePlating", "conductivefilm");

        } else {
            Pcb.QutoliEv("[name='BeforePlating']", 2);
            Pcb.QutoliEv("[name='BeforePlating'][value='copperdeposition']", 3);
            Pcb.Checked("BeforePlating", "copperdeposition");
        }
    },
    //高频版的测试方式更改和 焊盘表面处理默认选项  铜箔厚度指可选1oz
    rogersFn: function () {
        var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
        var proCategory = $("[name=proCategory]:checked").val();
        if (proCategory == "rogersItem") {

            Pcb.QutoliEv("[name='SurfaceFinish']", 3);

            //选中为沉金 2u
            selectVal("SurfaceFinish", "immersiongold");
            Pcb.Checked("ImGoldThinckness", "2");
            //10平一下飞针  10凭上测试架
            if (area <= 10) {
                Pcb.Checked("FlyingProbe", "full");
            } else if (area > 10) {
                Pcb.Checked("FlyingProbe", "teststand");
            }
            Pcb.Checked("CopperThickness", "1");
            Pcb.QutoliEv("[name='CopperThickness']", 2, [], true);
            Pcb.QutoliEv("[name='CopperThickness'][value='1']", 3, [], true);
            Pcb.Checked("CopperThickness", "1");
            Pcb.Checked("LineWeight", "5");
            Pcb.Checked("Vias", "0.4");
        } else {
            Pcb.Checked("ImGoldThinckness", "1");
        }
    },
    //产品类别事件
    proCategory: function (key) {
        var proCategory = $("[name=proCategory]:checked").val();
        Pcb.QutoliEv("[name='BeforePlating'][value='conductivefilm']", 2);
        Pcb.QutoliEv("[name='FormingType'][value='laser']", 1)
        Pcb.QutoliEv("[name='SurfaceFinish']", 0)
        Pcb.QutoliEv("[name='Invoice']", 0)
        Pcb.QutoliEv("[name='Invoice'][value='380']", 1)
        $('.boxSpecialTechniques').show();
        if ((proCategory == 'fr4Item' || proCategory == 'cem1Item') && key != 'BNumber') {
            Pcb.Checked("Vias", "0.3");
        }
        if (proCategory == "rogersItem") {
            Pcb.QutoliEv("[name=BoardLayers]", 1);
            Pcb.QutoliEv("[name=BoardLayers][value='2']", 0);
            Pcb.Checked("BoardLayers", "2");//只能选择2层板
            $('.aluminumOption').hide();
            Pcb.Checked("Invoice", "1");
            Pcb.QutoliEv("[name=BoardThickness]", 1);
            $(".NewBoard li").each(function (i, dom) {
                var thikVal = $(dom).find("[name='BoardThickness']").val();
                if (thikVal.length > 4) {
                    Pcb.QutoliEv("[name='BoardThickness'][value='" + thikVal + "']", 3, [], true);
                }
            })
            Pcb.Checked("BoardThickness", "0.508");//默认选中0.508
            Pcb.QutoliEv("[name=SolderColor]", 3);
            Pcb.QutoliEv("[name=SolderColor][value=yellow],[name=SolderColor][value=matteblack],[name=SolderColor][value=mattegreen]", 2);
            Pcb.QutoliEv("[name=FontColor]", 2);
            Pcb.QutoliEv("[name=FontColor][value=white],[name=FontColor][value=black],[name=FontColor][value=none]", 3);
            Pcb.Checked("SolderColor", "green");
            Pcb.Checked("FontColor", "white");
            $(".min_lineWeight li").each(function (i, dom) {
                var lineVal = $(dom).find("[name=LineWeight]").val();
                if (lineVal < 5) {
                    Pcb.QutoliEv("[name=LineWeight][value='" + lineVal + "']", 2)
                }
            })
            $(".min_prosize li").each(function (i, dom) {
                var ViasVal = $(dom).find("[name=Vias]").val();
                if (ViasVal < 0.3) {
                    Pcb.QutoliEv("[name=Vias][value='" + ViasVal + "']", 2)
                }
            })
            //判断面积大小 以此来选择选中的是飞针还是测试架
            Pcb.Checked("LineWeight", "6");
            Pcb.Checked("Vias", "0.3");
            $("#dianduqiangongyi").hide();
            Pcb.Checked("BeforePlating", "copperdeposition");
            Pcb.rogersFn()
        }
        else {
            if (proCategory == 'copper') {
                Pcb.toTypeCopper(key);//铜基板
                return false;
            }
            Pcb.QutoliEv("[name='BoardThickness'][value='1.5']", 1);
            Pcb.QutoliEv("[name=SolderColor]", 3);
            // Pcb.QutoliEv("[name=FontColor]", 3);
            Pcb.QutoliEv("[name=LineWeight]", 3);
            Pcb.QutoliEv("[name=Vias]", 3);
            $("#dianduqiangongyi").show();
            if (proCategory == "cem1Item" || proCategory == "aluminumItem") {
                //2023-03-02铝基板双面
                if (key == 'proCategory') {
                    // var BoardLayers = getCkVal('BoardLayers');
                    Pcb.QutoliEv("[name='BoardLayers']", 1);
                    if (proCategory === 'aluminumItem') {
                        Pcb.QutoliEv("[name='BoardLayers'][value=1],[name='BoardLayers'][value=2]", 0);
                        Pcb.Checked('BoardLayers', 1);
                        // if (BoardLayers>=1 && BoardLayers <=2) Pcb.Checked('BoardLayers',BoardLayers);
                        // else Pcb.Checked('BoardLayers',1);
                    } else {
                        Pcb.Checked("BoardLayers", "1");
                    }
                }
                if (proCategory == "aluminumItem" && key != 'BNumber') {
                    //阻焊颜色和字符颜色默认白黑
                    // Pcb.QutoliEv("[name='SolderColor']", 1);
                    Pcb.QutoliEv("[name='SolderColor'][value='warmwhite'],[name='SolderColor'][value='whitesfr6ks']", 0);
                    Pcb.Checked("SolderColor", "white");
                    // Pcb.QutoliEv("[name='FontColor']", 1);
                    // Pcb.QutoliEv("[name='FontColor'][value='black'],[name='FontColor'][value='white'],[name='FontColor'][value='none']", 0);
                    Pcb.QutoliEv("[name='FontColor'][value='blue']", 1);
                    Pcb.Checked("FontColor", "black");
                    $(".aluminumOption").show();
                }
                else {
                    if (key != 'BNumber') {
                        Pcb.QutoliEv("[name='SolderColor']", 0);
                        Pcb.QutoliEv("[name='SolderColor'][value='warmwhite'],[name='SolderColor'][value='whitesfr6ks']", 1);
                        Pcb.QutoliEv("[name='FontColor']", 0);
                        $(".aluminumOption").hide();
                        Pcb.Checked("SolderColor", "green");
                        Pcb.Checked("FontColor", "white");
                    }
                    Pcb.Checked("WithstandVoltage", "2500");
                    Pcb.Checked("FormingType", "mechanical");
                    Pcb.QutoliEv("[name='SurfaceFinish']", 3);
                    Pcb.QutoliEv("[name='SurfaceFinish'][value='rosin'],[name='SurfaceFinish'][value='eletrolyticnickel']", 2);
                }
                //$(".impedance_option").hide();
                $(".impedance_report").hide();
                Pcb.Checked("ImpedanceSize", "0");
                Pcb.Checked("ImpedanceReport", "0");
                //$(".wireWelding").show();
                Pcb.Checked("ImageTranster", "exposure");
            }
            else {
                Pcb.QutoliEv("[name='BoardLayers']", 0);
                selectVal("BoardLayers", "2");
                if (key != 'BNumber') {
                    Pcb.QutoliEv("[name='SolderColor']", 0);
                    Pcb.QutoliEv("[name='SolderColor'][value='warmwhite'],[name='SolderColor'][value='whitesfr6ks']", 1);
                    Pcb.QutoliEv("[name='FontColor']", 0);
                    $(".aluminumOption").hide();
                    //$(".impedance_option").show();
                    Pcb.Checked("SolderColor", "green");
                    Pcb.Checked("FontColor", "white");
                }
                Pcb.Checked("WithstandVoltage", "2500");
                Pcb.Checked("FormingType", "mechanical");
                //$(".wireWelding").hide();
                Pcb.Checked("ImageTranster", "exposure");
                if (proCategory == "fr1Item" || proCategory == "22fItem" || proCategory == "cem3Item" || proCategory == "94hbItem") {
                    Pcb.QutoliEv("[name='BoardLayers']", 1);
                    Pcb.Checked("BoardLayers", "1");
                    //$(".wireWelding").show();
                    //$(".otherBoard").show();
                    Pcb.QutoliEv("[name='SurfaceFinish']", 2);
                    Pcb.QutoliEv("[name='SurfaceFinish'][value='haslwithlead'],[name='SurfaceFinish'][value='haslwithfree'],[name='SurfaceFinish'][value='osp']", 3);
                    selectVal("SurfaceFinish", "haslwithfree");
                    Pcb.QutoliEv("[name='FormingType'][value='vcutseparate']", 2);
                    Pcb.QutoliEv("[name='CopperThickness']", 2, [], true);
                    Pcb.Checked("CopperThickness", "0.75");
                }

            }
            $(".NewBoard li").each(function (i, dom) {
                var thikVal = $(dom).find("[name='BoardThickness']").val();
                if (thikVal.length > 4) {
                    Pcb.QutoliEv("[name='BoardThickness'][value='" + thikVal + "']", 1);
                }
            })
            Pcb.setItemsSelectDefault("BoardThickness", "1.6");
        }

        //var SolderColor = $("[name=SolderColor]:checked").val();
        //if ($('[name=SolderColor][value=' + SolderColor + ']').parents("li").is(":hidden")) {
        //    Pcb.Checked("SolderColor", "green");
        //    Pcb.Checked("FontColor", "white");
        //}
        //Pcb.BoardLayersSort();
        /*var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());*/
        // Pcb.AreaRule2(area, proCategory);
    },
    //12.19新规则
    AreaRule2: function (area, proCategory) {
        //选择22F大类时，订单面积超过30平方米时
        if (area > 30) {
            if (proCategory == "22fItem") {
                Pcb.QutoliEv("[name='CopperThickness'][value='0.75'],[name='CopperThickness'][value='1'],[name='CopperThickness'][value='2']", 3, [], true);
                Pcb.QutoliEv("[name='BoardThickness']", 2, [], true);
                Pcb.QutoliEv("BoardThickness", 3, ['1.6'], true);
                Pcb.Checked("BoardThickness", "1.6");
                Pcb.Checked("CopperThickness", "0.75");
                Pcb.QutoliEv("[name='FormingType']", 2);
                Pcb.QutoliEv("[name='FormingType'][value='module']", 3);
                Pcb.Checked("FormingType", "module");
                Pcb.Checked("Vias", "0.8");
                Pcb.Checked("LineWeight", "10");
                Pcb.QutoliEv("[name='ImageTranster']", 2);
                Pcb.QutoliEv("[name='ImageTranster'][value='screenprinting']", 3);
                Pcb.Checked("ImageTranster", "screenprinting");
                Pcb.QutoliEv("[name='CopperThickness'][value='0.4']", 1);
                selectVal("SurfaceFinish", "osp");
            } else if (proCategory == "cem1Item") {
                Pcb.QutoliEv("[name='CopperThickness']", 2, [], true);
                Pcb.QutoliEv("[name='CopperThickness'][value='1']", 3, [], true);
                //Pcb.QutoliEv("[name='BoardThickness']", 2);
                //Pcb.QutoliEv("[name='BoardThickness'][value='1.6']", 3);
                //Pcb.Checked("BoardThickness", "1.6");
                Pcb.QutoliEv("[name='BoardThickness']", 2, [], true);
                Pcb.QutoliEv("BoardThickness", 3, ['1', '1.2', '1.6'], true);
                //Pcb.Checked("BoardThickness", "1.6");
                Pcb.Checked("CopperThickness", "1");
                // Pcb.QutoliEv("[name='FormingType']", 2);
                Pcb.QutoliEv("[name='FormingType'][value='module']", 3);
                Pcb.Checked("FormingType", "module");
                Pcb.Checked("Vias", "0.8");
                Pcb.Checked("LineWeight", "10");
                // Pcb.QutoliEv("[name='ImageTranster']", 2);
                Pcb.QutoliEv("[name='ImageTranster'][value='screenprinting']", 3);
                Pcb.Checked("ImageTranster", "screenprinting");
                Pcb.QutoliEv("[name='CopperThickness'][value='0.4']", 0);
                selectVal("SurfaceFinish", "osp");
            } else if (proCategory == "94hbItem") {
                Pcb.QutoliEv("[name='CopperThickness'][value='0.4']", 1);
                Pcb.QutoliEv("[name='CopperThickness']", 2, [], true);
                Pcb.QutoliEv("[name='CopperThickness'][value='0.4']", 3, [], true);
                Pcb.QutoliEv("[name='BoardThickness']", 2, [], true);
                Pcb.QutoliEv("BoardThickness", 3, ['1', '1.2', '1.6'], true);
                Pcb.Checked("BoardThickness", "1");
                Pcb.Checked("CopperThickness", "0.4");
                Pcb.QutoliEv("[name='FormingType']", 2);
                Pcb.QutoliEv("[name='FormingType'][value='module']", 3);
                Pcb.Checked("FormingType", "module");
                Pcb.Checked("Vias", "0.8");
                Pcb.Checked("LineWeight", "10");
                Pcb.QutoliEv("[name='ImageTranster']", 2);
                Pcb.QutoliEv("[name='ImageTranster'][value='screenprinting']", 3);
                Pcb.Checked("ImageTranster", "screenprinting");
                selectVal("SurfaceFinish", "osp");
            } else {
                Pcb.QutoliEv("[name='CopperThickness'][value='0.4']", 1);
                if (proCategory == 'fr4Item') {
                    // Pcb.Checked("CopperThickness", "1");
                    Pcb.ifCK_tf('CopperThickness', '1');
                }
            }
        } else {
            Pcb.QutoliEv("[name='CopperThickness'][value='0.4']", 1);
            if (proCategory == 'fr4Item') {
                // Pcb.Checked("CopperThickness", "1");
                Pcb.ifCK_tf('CopperThickness', '1');
            }
        }
    },
    //表面处理规则
    fnSurfaceFinish: function () {
        var proCategory = $("[name=proCategory]:checked").val();
        var SurfaceFinish = $("[name=SurfaceFinish]:checked").val();
        var BoardLayers = $("[name=BoardLayers]:checked").val();
        if (proCategory === 'fr4Item') {
            // if (BoardLayers == 1){
            //     Pcb.QutoliEv("[name=ImGoldThinckness]", 1);
            //     Pcb.QutoliEv("ImGoldThinckness", 0, ['1', '2']);
            //     Pcb.QutoliEv('SurfaceFinish',1,['immersionsilver','hardgold','immersiontin','eletrolyticnickelgod','immersiongoldandosp','haslwithfreeandimmersiongold','haslwithfreeandhardgold']);
            // }else{
            Pcb.QutoliEv('[name=ImGoldThinckness]', 0);
            Pcb.QutoliEv('SurfaceFinish', 0, ['immersionsilver', 'hardgold', 'immersiontin', 'eletrolyticnickelgod', 'immersiongoldandosp', 'haslwithfreeandimmersiongold', 'haslwithfreeandhardgold']);
            // }
            //BoardLayers!=1 &&
            if (SurfaceFinish == "immersiongold" || SurfaceFinish == "immersiongoldandosp" || SurfaceFinish == 'haslwithfreeandimmersiongold') {
                Pcb.QutoliEv("[name=ImGoldThinckness]", 0);
                Pcb.QutoliEv("ImGoldThinckness", 1, ['0.5', '1.5', '6', '7', '8']);
            }
        } else {
            Pcb.QutoliEv('[name=ImGoldThinckness]', 1);
            Pcb.QutoliEv("ImGoldThinckness", 0, ['1', '2']);
            Pcb.QutoliEv('SurfaceFinish', 1, ['immersionsilver', 'hardgold', 'immersiontin', 'eletrolyticnickelgod', 'immersiongoldandosp', 'haslwithfreeandimmersiongold', 'haslwithfreeandhardgold']);
        }
        Pcb.setItemsSelectDefault("ImGoldThinckness", "1");
        Pcb.setItemsSelectDefault("SurfaceFinish", "haslwithfree");
        show_imgoldthincknesszone();
        // console.log(proCategory,SurfaceFinish)
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
    /**
     * 隐藏验证信息
     * @param {any} name
     * @param {any} val
     */
    HideTips: (function () {
        var dict = {}
        return function (name, val) {
            if (arguments.length > 1) {
                dict[name] = !!val;
            }
            else {
                if (dict.hasOwnProperty(name)) {
                    return dict[name];
                }
                return false;
            }
        };
    })(),
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
            if (!Pcb.HideTips('Num')) {
                $('html,body').animate({ scrollTop: 97 }, 800);
                $("#Num").addClass("active"), setTimeout(function () {
                    $("#Num").removeClass("active");
                }, 3000);
                $(".size_tips_num").show(), setTimeout(function () {
                    $(".size_tips_num").hide();
                }, 3000);
            }
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
            if (!ProductNum.val()) { setInputBT(ProductNum); ProductNum.focus(); return false; }
            if ($('.xiaoban-ai').css('display') != "none" && getCkVal("IsAIPanel") === undefined) {
                var dom = $("[name=IsAIPanel]").parent();
                Pcb.errorForce(dom, true);
                return false;
            }
            //if (!PointNum.val()) { setInputBT(PointNum); PointNum.focus(); return false; }
            //if (!DIPPointNum.val()) { setInputBT(DIPPointNum); DIPPointNum.focus(); return false; }
            //if (!PatchElementType.val()) { setInputBT(PatchElementType); PatchElementType.focus(); return false; }
            // if(!MoreThan16PinNum.val()){setInputBT(MoreThan16PinNum); MoreThan16PinNum.focus(); return false;}

        }


        //var boardLayer = $("[name=BoardLayers]:checked").val();
        //var _layrerTrue = true;
        //if (boardLayer > 2) {
        //    $("[name=layersort]").each(function (i, dom) {
        //        var va = $(dom).val();
        //        if (va == "") {
        //            _layrerTrue = false;
        //            layer.msg('请输入层序', { time: 2000 });
        //            return false;
        //        }
        //    });
        //    return _layrerTrue;
        //}
        return flag;
    },
    errorForce: function (dom, isOptionsChoose) {
        dom.addClass('active');
        dom.get(0).focus();
        var tipsDom = isOptionsChoose ? dom.parents('.option-choose').siblings('.size_tips') : dom.siblings('.size_tips');
        tipsDom.show();
        setTimeout(function () {
            dom.removeClass('active');
            tipsDom.hide();
        }, 2000);
    },
    //计算价格
    calcPrice: function (type) {
        if (Pcb.ParmValid()) {
            var SurfaceFinish = $("[name=SurfaceFinish]:checked").val();
            // if (true == checkShipCost && !Pcb.selSpCost()) {
            //     return false;
            // }
            var isGetQPM = type == 'getQPM' ? true : false;//数量价格阶梯
            $.cookie('calcShipId', $(".selShip li.on input").val(), { path: '/' });
            $(".zz_load").hide();
            if (!isRequst) {
                Pcb.RequstFist();
            }
            var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
            var formarr = $("#fm").serializeArray();
            var templayer = "";
            var proCategory = $("[name=proCategory]:checked").val();
            for (var i = 0; i < formarr.length; i++) {
                var item = formarr[i];
                // if (item.name == "SolderMask") {}
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
                //特殊工艺参数显示问题
                $(".info_ts_title li").each(function (i, dom) {
                    var tsName = $(dom).find("input").attr("name");
                    if (!$(dom).find("input").prop("checked") || $(dom).is(":hidden")) {
                        $(".pcbDetail .Fee-" + tsName).hide();
                        //    $(".pcbDetail .Fee-" + tsName).parent('tr').hide();
                        //$(".pcbDetail [data-for=" + tsName + "]").hide();
                        //$(".pcbDetail [data-for=" + tsName + "]").find("em").text("");
                        $(".pcbDetail .Fee-" + tsName).find("input").val("");
                    } else {
                        $(".pcbDetail .Fee-" + tsName).show();
                        //       $(".pcbDetail .Fee-" + tsName).parent('tr').show();
                        $(".pcbDetail [data-for=" + tsName + "]").show();
                        $(".pcbDetail .Fee-" + tsName).find("em").text("Yes");
                        $(".pcbDetail .Fee-" + tsName).find("input").val(1);
                    }
                })
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
            //单独做阻焊边框颜色判断
            var parm = $("#fm").serialize();
            parm += "&PinBanType=" + $("[name=pinban_x]").val() + "x" + $("[name=pinban_y]").val();
            parm += "&ProcessEdges=" + $("[name=processeEdge_x]:checked").val() + ":" + $("[name=processeEdge_y]").val();
            let TestReport_arry = [];
            $("[name='TestReport']:checked").each(function (index) { TestReport_arry[index] = $(this).val(); });
            // console.log(TestReport_arry)
            parm += "&NeedReportList=" + TestReport_arry;
            var SmtOrderNo = $("#SmtOrderNo").val();
            parm += "&SmtOrderNo=" + SmtOrderNo;

            if (proCategory == "fr4Item") {
                //电镀金
                if (SurfaceFinish == 'hardgold' || SurfaceFinish == 'haslwithfreeandhardgold') {
                    parm = parm.replace('ImGoldThinckness=', "oldImGoldThinckness=")
                    parm += "&ImGoldThinckness=" + $("#ImGoldThinckness").val();
                }
                //镍钯金
                else if (SurfaceFinish == 'eletrolyticnickelgod') {
                    parm = parm.replace('ImGoldThinckness=', "oldImGoldThinckness=")
                    parm += "&ImGoldThinckness=" + $("#ImGoldThinckness").val();
                    parm += "&PalladiumThickness=" + $("#PalladiumThickness").val();
                    parm += "&NickelThickness=" + $("#NickelThickness").val();
                }
            }

            // parm += "&WVTest=" + $("[name='WVTest']:checked").val();

            // 铝基板 OPS < 70mm
            let ops_vc_BT = $("[name=BoardType]:checked").val();
            if (proCategory == 'aluminumItem' && SurfaceFinish == 'osp') {
                let vcALT = false;
                let osp_vc_H = $("[name=BoardHeight]").val();
                let osp_vc_W = $("[name=BoardWidth]").val();
                let osp_vc_px = $("[name=pinban_x]").val();
                let osp_vc_py = $("[name=pinban_y]").val();
                if (ops_vc_BT == 'pcs' && (osp_vc_H < 70 || osp_vc_W < 70)) vcALT = true;
                else if (ops_vc_BT == 'set' && ((osp_vc_H * osp_vc_py) < 70 || (osp_vc_W * osp_vc_px) < 70)) vcALT = true;
                else if (ops_vc_BT == 'jpset') {
                    let pe_x = $("[name=processeEdge_x]:checked").val();
                    let pe_y = $("[name=processeEdge_y]").val();
                    if (pe_x == 'both') {
                        if ((osp_vc_H * osp_vc_py) + pe_y < 70 || (osp_vc_W * osp_vc_px) + pe_y < 70) vcALT = true;
                    } else if (osp_vc_H * osp_vc_py < 70 || osp_vc_W * osp_vc_px < 70) vcALT = true;
                    // &&((osp_vc_H*osp_vc_py)<70||(osp_vc_W*osp_vc_px)<70)
                }
                if (vcALT) {
                    layer.msg('OSP treatment is not accepted for boards with length or width less than 70mm ,please panelize the board or change to HASL lead free .', {
                        skin: 'layui-layer-hui',
                        time: 2000
                    });
                    return false;
                }
            }

            var act = 'CalcPcbPrice';
            if (isGetQPM) {
                act = 'CalcPcbMiniPrice';
                var pcbQDBInfo = pcbQuoteDB[$(".listTable.pcb ul.on").attr('data-index')];
                var rqts = Pcb.resQuantitys($("#Num").val());
                parm += '&Nums=' + Pcb.resQuantitys($("#Num").val());
                parm += '&FR4Tg=' + pcbQDBInfo.FR4Tg;
                parm += '&FR4Type=' + pcbQDBInfo.FR4Type;
                parm += '&CoreTypeCode=' + pcbQDBInfo.PcbOrder.CoreTypeCode;
                Pcb.showPcbOutputPriceQPM(rqts);
            }
            $.ajax({
                url: 'https://www.allpcb.com/ashx/PcbOnline.ashx?act=' + act + '&' + parm + "&t=" + new Date(),
                dataType: 'json',
                type: 'post',
                beforeSend: function () {
                    if (!isGetQPM) $(".loader").show();
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

                            Pcb.newPcbOutputPrice(data.attr.List, isGetQPM);
                            return false;
                            // BuildShipHtml(data.attr.CalcShipList,null,1);
                            $(".online_hd li").removeClass("current")
                            $(".online_hd li").eq(1).addClass("current")
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
                            // $(".choose-result span").text(sel_count);
                        }
                        else {
                            // layer.msg(getLanguage('quoteNoDataToS'));
                            altNotice(getLanguage('quoteNoDataToS'), 'Yes', '/salesteam.html', 1, '', '', 'No', 'style="width:477px"', 'w', 'textLeft')
                            $(".zz_load").show();
                            $(".output_price").hide();
                            $(".para_select").addClass("canPrice");
                            $(".sidebar_hover_cont").show();
                            return false;
                        }
                    }
                    else {
                        layer.msg(getLanguage('psCTService'));
                        $(".zz_load").show();
                        $(".sidebar_hover_cont").show();
                        return false;
                    }
                }, error: function () {
                    $(".zz_load").show();
                    $(".sidebar_hover_cont").show();
                    return false;
                }
            });
            LP.dataPointJP({ label: 'Quote Now', type: 'click', value: 'calc_btn' });
        }

    },
    //所有超过20㎡的计价，点击计价自动跳出弹框让客户填目标价、目标交期；
    showArea20Input() {
        userQuoteTargetPrice = '';
        userQuotePcbExpectedDeliveryDays = '';
        $("body").append(`
        <div class="boxAltNote" id="boxUserQQP">
            <div class="box">
                <div class="t noicon">Message<i class="boxClose"></i></div>
                <div class="n textLeft">
                    <p class="note">For large square meters of PCB orders, please fill in your target price and expected delivery time. ALLPCB will try to make a better offer for you.</p>
                    <ul>
                        <li><span>Your target price: </span><input type="number" name="userQuoteTargetPrice" onkeyup="validationSizeNumber2(this, 2)"></li>
                        <li><span>Your expected delivery time: </span><input type="number" name="userQuotePcbExpectedDeliveryDays" onkeyup="value=value.replace(/^(0+)|[^\\d]+/g,'')"></li>
                    </ul>
                </div>
                <div class="bn">
                    <span class="bnsa sk ok"><span>Submit</span></span>
                    <span class="bnsa sk close"><span>${getLanguage('cancel')}</span></span>
                </div>
            </div>
        </div>`);
        $("#boxUserQQP .bnsa.ok").click(function () {
            userQuoteTargetPrice = $("input[name=userQuoteTargetPrice]").val();
            userQuotePcbExpectedDeliveryDays = $("input[name=userQuotePcbExpectedDeliveryDays]").val();
            hidaltNotice('boxUserQQP');
        })
        readyBoxAltNote('boxUserQQP');
    },
    //显示阶梯数量计价弹窗
    showPcbOutputPriceQPM(data) {
        data = data.split(",");
        var listHtml = '';
        for (var i in data) {
            var ts = data[i];
            var liHtml = `
                <li class="ck"><i></i></li>
                <li>${ts}</li>
                <li class="c"></li>
                <li></li>
                <li class="c"><div class="boxloading fx"></div></li>
            `;
            listHtml += '<ul class="list n" data-Quality="' + ts + '">' + liHtml + '</ul>';
        }
        $("body").append(`
        <div class="boxAltNote" id="boxQPMInfo">
            <div class="box">
                <div class="t noicon">${getLanguage('txtQPMatrix')}<i class="boxClose"></i></div>
                <div class="n">
                    <p class="note">${getLanguage('txtQPMS')}</p>
                    <ul class="list t">
                        <li></li>
                        <li>Quantity</li>
                        <li>Build Time</li>
                        <li>Price/pcs</li>
                        <li>Total Cost</li>
                    </ul>
                    ${listHtml}
                </div>
                <div class="bn">
                    <span class="bnsa sk bnSetQuantity"><span>${getLanguage('txtCgQty')}</span></span>
                    <span class="bnsa sk close"><span>${getLanguage('cancel')}</span></span>
                </div>
            </div>
        </div>`);
        $("#boxQPMInfo .bnSetQuantity").click(function () {
            if (!$(this).hasClass('ok')) return false;
            if ($("#boxQPMInfo .n.on").length <= 0) { altNotice(getLanguage('psSelOPR')); return false; }
            var selNum = $("#boxQPMInfo .n.on").attr('data-quality');
            $("#txtSelNum").val(selNum)
            SetInputNum(false);
            hidaltNotice('boxQPMInfo');
            Pcb.calcPrice();
        })
        $("#boxQPMInfo .list.n").click(function () {
            $(this).addClass("on").siblings().removeClass("on");
        });
        readyBoxAltNote('boxQPMInfo');
    },
    //阶梯数量计价结果
    PcbOutputPriceQPM(data) {
        for (var i in data) {
            var ts = data[i];
            var pcsNum = (ts.TotalMoney / ts.Quality).toFixed(2);
            var tsli = "#boxQPMInfo .list.n:nth-child(" + (Number(i) + 3) + ") li:nth-child";
            $(tsli + "(2)").html(ts.Quality);
            $(tsli + "(3)").html(`${resDDays(ts.DeliveryDays)}`);
            $(tsli + "(4)").html(`${pcsNum}/pcs`);
            $(tsli + "(5)").html(`$${ts.TotalMoney}`);
        }
        $("#boxQPMInfo,#boxQPMInfo .bnSetQuantity").addClass("ok");
    },
    //计价结果
    newPcbOutputPrice: function (data, isGetQPM = false) {
        if (data.length == 0) {
            altNotice(getLanguage('quoteNoDataToS'), 'Yes', 'https://mhdsaifullah.github.io/DonElectronics/', 1, '', '', 'No', 'style="width:477px"', 'w', 'textLeft')
            return false;
        }
        //是否阶梯数量计价
        if (isGetQPM) { Pcb.PcbOutputPriceQPM(data); return false; }
        if ($(".bnGetQPM").length) { $(".bnGetQPM").show(); }
        else {
            $(".boxQuoteRightInfo>.t:first-of-type").append(`<span class="bnGetQPM">${getLanguage('txtQPMatrix')}</span>`);
            $(".bnGetQPM").click(function () {
                if ($(".listTable.pcb .n.on").length <= 0) { altNotice(getLanguage('psSelOPR')); return false; }
                else Pcb.calcPrice('getQPM');
            });
        }

        ifQuote = true;
        $(".listTable .n").remove();
        $(".price_btn").hide();
        $(".ifQuote").show();
        $(".boxQuoteRightInfo .calc_btn").hide();
        $("#selShipS").show();

        if (isMobile) {
            $('body').addClass('ov showBK');
            $(".min-top-nav i.back").text('PCB Quote');
        }
        var userId = $("#userId").val();
        var BoardType = $(".BoardType").val();
        var theNum = 0;
        var NumPCS = $("[name=Num]").val();
        if (BoardType == 'pcs') theNum = NumPCS;
        else theNum = $('[name=pinban_x]').val() * $('[name=pinban_y]').val() * NumPCS;
        var odmoPF0 = userId == 0 && theNum <= 20;
        // var pf0t = odmoPF0?`<a class="tag" href="/account/login?returnurl=${window.location.href}" target="_blank">${getLanguage('quoteLogTGC')}</a>`:'';
        var html = '';
        pcbQuoteDB = [];
        var ifOCMoney = false;
        var goOCMoney = true;
        var OCMoneyOff = 0;
        var otherWeight;
        var ckFlag = 0;
        for (let i in data) {
            var ts = data[i];
            var ct = ts.CoreType;
            var od = ts.PcbOrder;
            var tsFirstPcbOrder = ts.CalcDelvieryItems[0].PcbOrder;
            pcbQuoteDB.push(ts);
            var pf0 = '';//tsFirstPcbOrder.CanUseFreeId>0?`<span class="tag fp">${getLanguage('quoteAFFP')}</span>`:'';
            var isUserFirstOrder = '';
            if (od.IsTejia == 1 && od.OrderMoney == 1) {
                isUserFirstOrder = ' isEFO';
                pf0 = '';//`<span class="tagFO">${getLanguage('eEFOrder')}</span>`
            }
            // var fcid = ts.CanUseFreeId>0?1:0;
            var pcsNum = (tsFirstPcbOrder.OrgOrderMoney / od.PcsNum).toFixed(2);
            if (tsFirstPcbOrder.OrderMoney != null && tsFirstPcbOrder.OrderMoney < tsFirstPcbOrder.OrgOrderMoney) {
                pcsNum = (tsFirstPcbOrder.OrderMoney / od.PcsNum).toFixed(2);
            }
            var ddSuper = tsFirstPcbOrder.DeliveryDays <= 1 ? '<i class="wen_tip pointer"></i>' : '';
            var deliveryDays = resDDays(tsFirstPcbOrder.DeliveryDays);// > 3 ?ts.DeliveryDays+' days':(ts.DeliveryDays*24)+' hours';
            otherWeight = od.TotalWeight;
            //默认无加急
            var htmlBDTime = `<li class="cy"><span>${deliveryDays}${ddSuper}</span></li>`;
            //折扣信息显示
            if (goOCMoney) {
                if (tsFirstPcbOrder.OrgOrderMoney > tsFirstPcbOrder.OrderMoney && (tsFirstPcbOrder.DisCount > 0 && tsFirstPcbOrder.DisCount < 1)) {
                    OCMoneyOff = ((1 - tsFirstPcbOrder.DisCount) * 100).toFixed(0);
                    ifOCMoney = true;
                } else {
                    ifOCMoney = false;
                    goOCMoney = false;
                }
            }
            //是否有其他加急
            if (ts.CalcDelvieryItems.length > 1) {
                var cdsHtml = '';
                for (var cdi in ts.CalcDelvieryItems) {
                    var items = ts.CalcDelvieryItems[cdi];
                    var itemsPcbOrder = items.PcbOrder;
                    cdsHtml += `<span index="${i}" items="${cdi}" ifjj="${itemsPcbOrder.IsJiaji}" money="${itemsPcbOrder.OrderMoney}" orgMoney="${itemsPcbOrder.OrgOrderMoney}">${resDDays(itemsPcbOrder.DeliveryDays)}${itemsPcbOrder.DeliveryDays == 1 ? '<i class="wen_tip pointer"></i>' : ''}</span>`;
                }
                htmlBDTime = `<li class="cy moreBDS"><span class="days">${deliveryDays}</span>
                                <div>${cdsHtml}</div>
                            </li>`;
            }
            //ul.n.Attr：data-fr4tg="${ct.CoreTg}" data-brand="${ct.CoreType_}" data-fr4type="${ts.FR4Type}" data-PcbProType="${ct.ProType}" data-totalMoney="${ts.TotalMoney}" data-weight="${otherWeight}" data-coretypecode="${ct.CoreTypeCodes_}" data-FCID="${ts.CanUseFreeId}" data-QualityTag="${ts.QualityTag}"
            //默认已选
            var tsOn = '';
            if (typeof selPcbOrderInfo.CoreTypeCode != 'undefined' && ckFlag == 0) {
                if (ts.FR4Tg == selPcbOrderInfo.FR4Tg && ts.FR4Type == selPcbOrderInfo.FR4Type && od.CoreTypeCode == selPcbOrderInfo.CoreTypeCode) {
                    tsOn = ' on';
                    ckFlag = 1;
                }
            }
            var isFree1 = tsFirstPcbOrder.CanUseFreeId == -1 || tsFirstPcbOrder.CanUseFreeId > 0;
            var crUrlText = ct.EnCoreType.replace(/\//g, '<br>');
            var ctUrlHtml = ct.Captions_ == null || ct.Captions_ == '-' ? `<span>${crUrlText}</span>` : `<a target="_blank" href="${ct.Captions_}">${crUrlText}</a>`;
            html += `
            <ul class="n${tsOn}${isUserFirstOrder}" data-index="${i}" data-CDItems="0" data-totalMoney="${isFree1 ? 1 : tsFirstPcbOrder.OrderMoney}" data-om="${tsFirstPcbOrder.OrgOrderMoney}" data-FCID="${tsFirstPcbOrder.CanUseFreeId}" data-CA="${ts.CounpAmount}">
                <li class="ck"><i></i></li>
                <li class="laminate ${ct.ULCertification === 1 ? 'ul' : ''}">${ctUrlHtml}</li>
                <li><span>${((ts.FR4Type == 'aluminum' || ts.FR4Type == 'redcopper') ? '/' : ct.TgType)}</span></li>
                ${htmlBDTime}
                <li><span class="pcsNum">${pcsNum}/pc</span></li>
                <li class="cost odmn"><span class="totalMoney">$${isFree1 ? 1 : tsFirstPcbOrder.OrderMoney}${pf0}</span></li>
            </ul>
            `;
        }

        var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
        $(".boxQuoteRightInfo .noteFPIS").remove();
        $(".boxQuoteRightInfo .noteAPEFED").remove();
        var textOTIP = area > 5 ? 'TIP: Final price can be negotiated.' : getLanguage('fpistor');
        $(".ifQuotePcba").after(`<span class="noteFPIS">${textOTIP}</span>`);
        if (area > 20) Pcb.showArea20Input();

        $(".listTable.pcb").append(html);
        if (ifOCMoney) {
            //$(".listTable.pcb").after(`<div class="noteAPEFED" >${getLanguage('eAPEFED', OCMoneyOff)}</div>`);
        }
        if ($(".listTable.pcb>ul.n.on").length <= 0) {
            $(".listTable.pcb>ul.n[data-index=0] .ck").click();
        }
        $(".listTable.pcb ul.n").hover(function () {
            $(this).addClass("hover").siblings().removeClass('hover');
            if (window.location.host == 'ww2.allpcb.com' || window.location.host.indexOf('115.236') >= 0) {
                Pcb.showPcbMarketPrice($(this), $(this).index());
            }
        }, function () {
            $(".boxMarketPrice").remove();
        })
        $(".moreBDS div span").click(function () {
            var PMN = $(this).parents('ul.n');
            if ($(this).attr('ifjj') == 1 || $(this).attr('ifjj') == 'true') PMN.addClass('cr')
            else PMN.removeClass('cr')
            var money = $(this).attr('money');
            var orgMoney = $(this).attr('orgmoney');
            var pcsNum = (orgMoney / od.PcsNum).toFixed(2);
            PMN.attr('data-index', $(this).attr('index'))
            PMN.attr('data-CDItems', $(this).attr('items'))
            PMN.attr('data-om', orgMoney)
            PMN.attr('data-totalMoney', money)
            PMN.find('.pcsNum').text(`${(orgMoney / od.PcsNum).toFixed(2)}/pc`);
            PMN.find('.totalMoney').text(`$${orgMoney}`);
            PMN.find('.days').text($(this).text());
            Pcb.newSumPrice();
        });
        $(".boxQuoteRightInfo .listTable .n>li.cy .wen_tip").hover(function () {
            var e = $(this);
            var left = e.offset().left + 'px';
            var top = (e.offset().top + 22) + 'px';
            $("body").append(`
                <div class="boxAlt24Detail" style="left:${left}; top:${top}">
                ${getLanguage('quote24Dtl')}
                </div>
            `)
        }, function () {
            $(".boxAlt24Detail").remove();
        });
        if (odmoPF0) $(".listTable.pcb ul.n:nth-child(2)").addClass("hover");
        $(".boxQuoteRightInfo .totalCost dl dd.ss").attr('data-weight', otherWeight);
        Pcb.getShippingCost(cookieCountryId, otherWeight);
        if (ifQuotePcba) {
            var pcbaParams = Pcb.getQuotePcbaInfo('quote');
            $.getJSON("/ashx/smt.ashx?act=GetDelieveryPrice&t=" + new Date().getTime(), pcbaParams, function (data) {
                var list = data.attr;
                if (list != undefined && list != null && list.length > 0) {
                    var html = '';
                    pcbaQuoteDB = [];
                    // var pcbaNUM = $("[for-group='pcba'] [name='ProductNum']").val();
                    for (var i = 0; i < list.length; i++) {
                        var item = list[i];
                        pcbaQuoteDB.push(item);
                        var pf0 = item.CanUseFreeId > 0 ? `<span class="tag fp">${getLanguage('quoteAFFP')}</span>` : '';
                        if (i > 3) continue;
                        html += `
                                <ul class="n " data-totalmoney="${item.DiscountPrice}" data-pcs="${item.ProductNum}" data-FCID="${item.CanUseFreeId}">
                                    <li class="ck"><i></i></li>
                                    <li>${item.DeliveryDaysStr}<a class="item-tips ml5 rel" style="z-index:1;" href="https://www.allpcb.com/news/6-1-start-a-pcb-assembly-new-chapter_79.html" target="_blank">
                                            <span class="wen_tip optiontip-ico" item-tips="${getLanguage('quotePcbaDTA')}" id="tipsundefined">
                                                <i class="tipscon" tipshtml="true" style="width: 400px; overflow-wrap: break-word; word-break: normal; display: none;">${getLanguage('quotePcbaDTA')}</i>
                                            </span>
                                    </a></li>
                                    <li>$${(item.DiscountPrice / item.ProductNum).toFixed(2)}/pc</li>
                                    <li class="cy">${item.ProductNum}pcs</li>
                                    <li class="cost odmn">$${item.DiscountPrice}${pf0}</li>
                                </ul>`;
                    }
                    $(".listTable.pcba").append(html);
                    //默认选中第一个
                    $(".listTable.pcba .n .ck")[0].click();
                }
            });
        }
        //计算价格
        Pcb.newSumPrice();
    },
    showPcbMarketPrice: function (e, index) {
        var detail = pcbQuoteDB[index - 1].CalcDelvieryItems[e.attr('data-cditems')].StepPriceDetail;
        e.append(`
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
        // $(".boxMarketPrice").css({'display':'block','width':e.outerWidth()+'px','top':(e.offset().top+e.outerHeight())+'px','left':e.offset().left+'px'})
        // $(".boxMarketPrice").css({'display':'block','width':'100%','top':'100%','left':'0'})
    },
    //清除计价结果
    clearPrice: function () {
        $(".listTable .n").remove();
        $(".bnGetQPM").hide();
        $(".totalCost dd").text('--');
        ifQuote = false;
        $("#selShipS").hide();
        $(".ifQuote").hide();
        $(".price_btn").show();
        $(".boxQuoteRightInfo .calc_btn").show();
        $(".boxQuoteRightInfo .noteAPEFED").remove();
        $(".boxQuoteRightInfo .noteFPIS").remove();
        $(".boxQuoteRightInfo .tOM").remove();
    },
    //获取快递公司列表
    getShippingCost: function (cid, weight) {
        $.getJSON("https://www.allpcb.com/ashx/common.ashx?act=CalcShipList", { cid: cid, otherweight: weight }, function (data) {
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
    //指定区域订单总价超过范围隐藏该物流
    //clearSFCDShipByPrice(total) {
    //    var total = Number($(".listTable .n.on").attr('data-totalmoney'));
    //    var isExistSFCD = $('#selShipS').find("option[value=16]");
    //    total = total + Number(isExistSFCD.data("shipprice"));
    //    var cid = Number($("#shippingCost").attr('dataId'));
    //    var price150 = [66, 49, 98, 59, 11, 18, 48, 51, 92, 152, 180, 89, 122, 167, 183, 184,123];
    //    var priceno150 = [12, 68, 33, 144, 231];
    //    var cc = [];
    //    cc = cc.concat(priceno150).concat(price150);
    //    if (isExistSFCD.length==1) {
    //        if (cc.includes(cid) && ((cid == 12 && total > 600) || (cid == 68 && total > 135) || (cid == 33 && total > 15) || (cid == 144 && total > 50) || (price150.includes(cid) && total > 150) || (cid == 231 && total > 800) )) {
    //            isExistSFCD.hide();
    //            $("#selShipS")[0].selectedIndex = 0;
    //            Pcb.selShipping($('#selShipS'));
    //        } else {
    //                isExistSFCD.show();
    //        }
    //    }
    //},
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
        if (aShipNo) {
            $("#selShipS option").each(function (index) {
                if (aShipNo == $(this).val()) {
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
		//price = price + 15; // Shipping Price
        var shipPic = Pic ? `<i class="expresslogo" style="background-image: url('/img/images/country/${Pic}')"></i>` : '';
        $(".boxSelSC .info .detail").html(`${shipPic} Shipping info: <b>${days || '*'} days   Wt: ${parseFloat(weight).toFixed(2)} kg</b>Shipping cost: <b class="w">$${price}</b>`)
        $(".boxQuoteRightInfo .totalCost .ss").html(`$${price}`);
    },
    //计算总价
    newSumPrice: function (ckFree = true) {
        var total = 0;
        var totalOrdM = 0;
        var pcbCost = 0;
        var smtCost = 0;
        var shipprice = 0;
        var fcHtml = '';
        var counpAT = 0;
        var PCBOrdOM = 0; //PCB原价
        var PCBOrdCM = 0; //PCB现价
        var isTejia = false;
        var disCount = 1; //折扣%
        var isFree1 = false;
        $(".listTable .n.on").each(function () {
            var fcid = $(this).attr('data-fcid');
            var tsCounpAT = Number($(this).attr('data-ca'));
            counpAT = tsCounpAT >= 0 ? counpAT + tsCounpAT : counpAT;
            // if(fcid>0){
            //     if (free) return true;
            //     fcHtml = '<label><img src="/img/img/justfit/free-order.png" alt=""><input type="checkbox" id="isCoupon"/><i></i></label>';
            // }
            //原价
            var tsOM = $(this).attr('data-om');
            //现价
            var tsCM = $(this).attr('data-totalmoney');
            if ($(this).parent().hasClass('pcb')) {
                var proInfo = pcbQuoteDB[$(this).index() - 1].CalcDelvieryItems[$(this).attr('data-cditems')].PcbOrder;
                disCount = proInfo.DisCount;
                PCBOrdCM = PCBOrdCM + Number(tsCM);
                PCBOrdOM = PCBOrdOM + Number(tsOM || tsCM);
                pcbCost = pcbCost + parseFloat(tsCM);
                isTejia = proInfo.IsTejia;
                if (fcid == -1 || fcid > 0 && pcbCost == 1) {
                    isFree1 = true;
                    var ckHtml = ckFree ? 'checked="checked"' : '';
                    fcHtml = `<label><img src="/img/img/pcbonline/1_TicketApplied.png" alt=""><input type="checkbox" ${ckHtml} id="isCoupon"/><i></i></label>`;
                } else {
                    $(".boxQuoteRightInfo .totalCost .cs label").remove();
                }
            } else if ($(this).parent().hasClass('pcba')) {
                smtCost = smtCost + Number(tsCM);
            }
            // pcbCost = pcbCost + parseFloat(tsCM);
            // totalOrdM = pcbCost;
        })
        // console.log('PCB：'+PCBOrdCM,PCBOrdOM,'SMT：'+smtCost)
        shipprice = parseFloat($("#selShipS option:selected").attr('data-shipprice')) || 0;
        totalOrdM = pcbCost + smtCost;
        // total = shipprice + pcbCost + smtCost;
        //折扣金额
        $(".boxQuoteRightInfo .totalCost dl .tOM").remove();
        if (isTejia == 0 && PCBOrdOM > PCBOrdCM && (disCount > 0 && disCount < 1)) {// && (GetCheckedVal('BoardLayers')==='2'||GetCheckedVal('BoardLayers')==='4'||GetCheckedVal('BoardLayers')==='6')
            var dcOff = ((1 - disCount) * 100).toFixed(0);
            dcOff = (dcOff + '% Off').replace('.00', '');
            pcbCost = PCBOrdOM;
            //去掉折扣价
            //$(".boxQuoteRightInfo .totalCost dl .cs").addClass('del').after(`<dt class="tOM pcbCostTit">${getLanguage('ePCBCostNow', dcOff)}</dt><dd class="tOM pcbCost">$${PCBOrdCM.toFixed(2)}</dd>`);
        } else {
            $(".boxQuoteRightInfo .totalCost dl .cs").removeClass('del')
        }
        //end - 折扣金额
        //PCB金额显示
        if (isFree1) pcbCost = 1;
        else pcbCost = pcbCost == 0 ? '1.00' : +pcbCost.toFixed(2);
        // console.log(isFree1,free)
		//PCBOrdCM = PCBOrdCM + 5; //PCB Cost Test
		//shipprice = shipprice + 15; //Shipping Cost Test
        $(".boxQuoteRightInfo .totalCost .cs").html(`${fcHtml + ' <span data-pc="$' + PCBOrdCM + '">$' + PCBOrdCM + '</span>'}`);
        if ($("#isCoupon").prop("checked")) {
            $(".boxQuoteRightInfo .totalCost .cs span").html('$' + (isFree1 ? pcbCost : PCBOrdOM)).addClass('del');
            total = shipprice + pcbCost + smtCost;
        }
        else {
            if (!isFree1) total = shipprice + PCBOrdCM + smtCost;
            else total = shipprice + PCBOrdOM + smtCost;
        }
        // if(fcHtml=='') $(".boxQuoteRightInfo .totalCost .cs").html(`<span data-pc="${pcbCost}">${pcbCost}</span>`);
        // else $(".boxQuoteRightInfo .totalCost .cs").html(fcHtml);
        // else $(".boxQuoteRightInfo .totalCost .cs").html(`${fcHtml+' <span data-pc="'+pcbCost+'">'+pcbCost+'</span>'}`);
        //SMT金额显示
        if (smtCost > 0) {
            var smtCostHtml = `<dt class="tOM smtCostTit">${getLanguage('eSMTCost')}</dt><dd class="tOM smtCost">$${smtCost.toFixed(2)}</dd>`;
            if ($(".boxQuoteRightInfo .totalCost dl .tOM.pcbCost").length > 0) {
                $(".boxQuoteRightInfo .totalCost dl .tOM.pcbCost").after(smtCostHtml);
            } else {
                $(".boxQuoteRightInfo .totalCost dl .cs").after(smtCostHtml);
            }
        }
        total = total.toFixed(2)
        $(".boxQuoteRightInfo .totalCost .ts").html(`$${total}`);
        //减券后订单金额
        $(".boxQuoteRightInfo .totalCost dl .tPAD").remove();
        if (counpAT > 0 && (pcbCost > 1 || smtCost > 1)) {
            var totalCA = totalOrdM - counpAT;
            totalCA = ((totalCA < 0 ? 0 : totalCA) + shipprice).toFixed(2);
            $(".boxQuoteRightInfo .totalCost dl").append(`<dt class="tPAD">${getLanguage('ePriceAD')}</dt><dd class="ls tPAD">$${totalCA}</dd>`);
        }
    },
    //获取PCBA计价参数
    getQuotePcbaInfo: function (key) {
        var formPcba = Pcb.getSubmitFormData(false);
        if (formPcba.IsBurn == "1") {
            formPcba.IsBurn = "true";
        }
        if (formPcba.IsPcbaSubShipment == "1") {
            formPcba.IsPcbaSubShipment = "true";
        }
        if (formPcba.IsFuncTest == "1") {
            formPcba.IsFuncTest = "true";
        }
        formPcba.MoreThan16PinNum = formPcba.MoreThan16PinNum == '' ? null : formPcba.MoreThan16PinNum;
        var isCC = $("#isCoupon").prop("checked");
        var proNum = 0;
        if (key != 'quote') proNum = $('.listTable.pcba .n.on').attr('data-pcs');
        var pcbaParams = {
            //"PcbSizeY": $("[name=Fee-BoardHeight]").val(),
            //"PcbSizeX": $("[name=Fee-BoardWidth]").val(),
            "ProductNum": Number(proNum) != 0 ? proNum : formPcba.ProductNum,
            "PcbaPackageType": "2",
            //"FirstSure": "0",
            // "PcbOrderNo": "",
            "ProductPCBType": "1",
            //"XrayTestNum": "",
            //"IsBurn": "false",
            //"IsPcbaSubShipment": "false",
            "IsPurchaseGoods": formPcba.PurchaseGoodsType,
            //"IsFuncTest": "false",
            //"IsBrushThreeLacquer": "0",
            //"PadLineKathy": "0",
            "BoardType": formPcba.AssemblyBoardType,
            "pinban_x": formPcba.AssemblyBoardType == "pcs" && formPcba.IsAIPanel == "true" ? formPcba.t_pinban_x : formPcba.Assemblypinban_x,
            "pinban_y": formPcba.AssemblyBoardType == "pcs" && formPcba.IsAIPanel == "true" ? formPcba.t_pinban_y : formPcba.Assemblypinban_y,
            /* "PurchaseGoodsType": "1"*/
        }
        if (key === 'fcid' && isCC) {
            pcbaParams.FreeCouponId = parseFloat($(".listTable.pcba .n.on").attr('data-FCID'));
        }
        return Object.assign(formPcba, pcbaParams)
    },
    getSubmitFormData: function (isSubmit) {
        var data = Tools.UrlToJsonParams($("#smtorderForm").serialize());
        //默认值设置
        if (isSubmit) {//如果是提交，直接修改form，否则只是修改获取值
            if (!data.PatchElementType) {
                Pcb.Checked('PatchElementType', 5);
            }
            if (!data.PointNum) {
                Pcb.Checked('PointNum', 10);
            }
            if (!data.DIPPointNum) {
                Pcb.Checked('DIPPointNum', 0);
            }
            if (!data.ExpectedPrice) {
                Pcb.Checked('ExpectedPrice', 0);
            }
        } else {
            //默认值设置
            if (!data.PatchElementType) {
                data.PatchElementType = 5;
            }
            if (!data.PointNum) {
                data.PointNum = 10;
            }
            if (!data.DIPPointNum) {
                data.DIPPointNum = 0;
            }
        }

        //异常值修正
        if (data.IsAIPanel && Pcb.PcbisXiaoBanType(data) == 0) {
            Pcb.Checked('IsAIPanel', '');
        }
        if ((data.BoardType == 'pcs' || data.AssemblyBoardType == "pcs") && data.IsAIPanel != 'true') {
            if (data.pinban_x != 1) {
                Pcb.Checked('pinban_x', 1);
                data.pinban_x = 1;
            }
            if (data.pinban_y != 1) {
                Pcb.Checked('pinban_y', 1);
                data.pinban_y = 1;
            }
        }
        if (data.SmtRemark.length > 0) {
            data.SmtRemark = document.querySelector("[name='SmtRemark']").value;
        }
        return data;
    },
    //表格数据渲染   LevelTag  0 标品 1 优品 2 精品 3 普品
    paraRend: function (info, PcbOrder, FR4Type, Num, DeliveryDays, FR4Tg) {
        var userId = $("#userId").val();
        //'<br/>' + info[i].PcbOrderOld.OrderMoney +
        var fixedTableHtml = "";
        var changeTableHtml = "";
        $("#fixed-table tbody").html("");
        $("#change-table tbody").html("");
        var priceArr = [
            {
                TotalMoney: '50',
                DeliveryType: '24小时',
                isqian: 0,
                priceDetail: {
                    OrderMoney: '20',
                    JdbCostMetallize: '10',
                    otherMoney: '10',
                },
                FreeCouponId: '-1',
                "StepPriceDetail": {
                    "JdbCostBoard": 147,
                    "JdbCostCostruction": 50,
                    "JdbCostFilm": 0,
                    "JdbCostMetallize": 1.5,
                    "JdbCostOther": 0.5,
                    "JdbCostTest": 0,
                    "HoleMoney": 0,
                    "JdbCostPinBan": 0,
                    "JdbCostJiaJi": 0,
                    "JdbCostColor": 0,
                    "JdbCostShap": 0,
                    "RoutLengthMoney": 0
                },
                StepTag: 0,
            },
            {
                TotalMoney: '30',
                isqian: 0,
                DeliveryType: '56小时',
                priceDetail: {
                    OrderMoney: '20',
                    JdbCostMetallize: '10',
                    otherMoney: '10',
                },
                FreeCouponId: 0,
                "StepPriceDetail": {
                    "JdbCostBoard": 147,
                    "JdbCostCostruction": 50,
                    "JdbCostFilm": 0,
                    "JdbCostMetallize": 1.5,
                    "JdbCostOther": 0.5,
                    "JdbCostTest": 0,
                    "HoleMoney": 0,
                    "JdbCostPinBan": 0,
                    "JdbCostJiaJi": 0,
                    "JdbCostColor": 0,
                    "JdbCostShap": 0,
                    "RoutLengthMoney": 0
                },
                StepTag: 1,

            },
            {
                TotalMoney: '24',
                DeliveryType: '72小时', isqian: 0,
                priceDetail: {
                    OrderMoney: '20',
                    JdbCostMetallize: '10',
                    otherMoney: '10',
                },
                FreeCouponId: 0,
                "StepPriceDetail": {
                    "JdbCostBoard": 147,
                    "JdbCostCostruction": 50,
                    "JdbCostFilm": 0,
                    "JdbCostMetallize": 1.5,
                    "JdbCostOther": 0.5,
                    "JdbCostTest": 0,
                    "HoleMoney": 0,
                    "JdbCostPinBan": 0,
                    "JdbCostJiaJi": 0,
                    "JdbCostColor": 0,
                    "JdbCostShap": 0,
                    "RoutLengthMoney": 0
                },
                StepTag: 1,
            },
            {
                TotalMoney: '20',
                DeliveryType: '76小时',
                isqian: 1,
                priceDetail: {
                    OrderMoney: '20',
                    JdbCostMetallize: '10',
                    otherMoney: '10',
                }, StepTag: 4,
                FreeCouponId: -1,
                "StepPriceDetail": {
                    "JdbCostBoard": 147,
                    "JdbCostCostruction": 50,
                    "JdbCostFilm": 0,
                    "JdbCostMetallize": 1.5,
                    "JdbCostOther": 0.5,
                    "JdbCostTest": 0,
                    "HoleMoney": 0,
                    "JdbCostPinBan": 0,
                    "JdbCostJiaJi": 0,
                    "JdbCostColor": 0,
                    "JdbCostShap": 0,
                    "RoutLengthMoney": 0
                },
            },
        ]
        var proCategory = $("[name=proCategory]:checked").val();
        var NumPCS = $("[name=Num]").val();
        var NumSETS = $(".jpsettipsbox span").html();
        var BoardType = $(".BoardType").val();
        var theNum = 0;

        if (BoardType == 'pcs') {
            theNum = NumPCS;
        } else {
            theNum = $('[name=pinban_x]').val() * $('[name=pinban_y]').val() * NumPCS;
        }
        if (info.length > 0) {
            $(".choose-result span").text(info.length);
            for (var i = 0; i < info.length; i++) {
                var tableName = info[i].PcbOrder;
                var coreType = info[i].CoreType;
                //   var totalWeight = tableName.TotalWeight;
                //   console.log(totalWeight);
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
                    // if (proCategory == "fr4Item") {
                    //     if (priceArr[k].DeliveryDays >= 10) {
                    //         stepDeliveryDays = (priceArr[k].DeliveryDays - 3) + "-" + priceArr[k].DeliveryDays;
                    //     } else {
                    //         stepDeliveryDays = priceArr[k].DeliveryDays
                    //     }
                    //     if (info[i].DeliveryDays >= 10) {
                    //         trDeliveryDays = (info[i].DeliveryDays - 3) + "-" + info[i].DeliveryDays
                    //     } else {
                    //         trDeliveryDays = info[i].DeliveryDays;
                    //     }
                    // } else {
                    stepDeliveryDays = priceArr[k].DeliveryDays
                    trDeliveryDays = info[i].DeliveryDays;
                    // }
                    //if (tableName.ShowEntConfrim > 0) {
                    //    //IsRecommend=2,立即下单的内容
                    //}
                    //     console.log(tableName.FreeCouponId);


                    //标识有铅无铅  HASL with Free 无铅   HASL with Lead 有铅
                    var havePlumbum = priceArr[k].SuchSurfaceType == "1" ? 'HASL with Lead' : (priceArr[k].SuchSurfaceType == "2" ? 'HASL Lead Free' : $("[name=SurfaceFinish]:checked").parent().text());
                    //判断是否免费打样
                    ////   console.log(priceArr[k].CanUseFreeId);
                    // if (priceArr[k].CanUseFreeId == '-1' || priceArr[k].CanUseFreeId > 0) {
                    //     priceStr += '<div class="OrderMoneybox rel"><div class="isQian inline-block mr10">HASL lead free</div><div class="span-OrderMoney inline-block" style="">$' + priceArr[k].TotalMoney + '</div><div class="inline-block cl-red" style="margin-left:5px;display:none">free</div>' +
                    //         '<div class="market-price undis">' +
                    //         '<ul class="clearfix">' +
                    //         ' <li><span class="market-price-title">板材费</span><span class="free-urgent-box dis"><span>￥</span>' +
                    //         '<span class="fixed2 market-price-item" data-price-item="AddCart-JdbCostBoard">' + priceDetail.JdbCostBoard + '</span></span></li>' +
                    //         '<li><span class="market-price-title">工程费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostCostruction">' + priceDetail.JdbCostCostruction + '</span></span></li><li><span class="market-price-title">菲林费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostFilm">' + priceDetail.JdbCostFilm + '</span></span></li><li><span class="market-price-title">喷镀费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostMetallize">' + priceDetail.JdbCostMetallize + '</span></span></li><li><span class="market-price-title">颜色费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostColor">' + priceDetail.JdbCostColor + '</span></span></li><li><span class="market-price-title">拼版费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostPinBan">' + priceDetail.JdbCostPinBan + '</span></span></li><li><span class="market-price-title">工艺费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostJiaJi">' + priceDetail.JdbCostJiaJi + '</span></span></li><li><span class="market-price-title">成型费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostShap">' + priceDetail.JdbCostShap + '</span></span></li><li><span class="market-price-title">其他费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostOther">' + priceDetail.JdbCostOther + '</span></span></li><li><span class="market-price-title">测试费</span><div class="clearfix market-price-box" style="vertical-align:bottom;"><span><span class="ceshi_m">￥</span><span class="fixed2 market-price-item" data-price-item="AddCart-JdbCostTest">' + priceDetail.JdbCostTest + '</span></span></div></li></ul></div></div>';
                    //     addcartStr += '<div class="cartbox" style="margin-top:12px;" data-plumbum="' + priceArr[k].SuchSurfaceType + '" data-tag="' + priceArr[k].StepTag + '" data-index="' + k + '"><span class="cart_item Newcart_item"  data-totalWeight="' + tableName.TotalWeight + '" data-code="' + supllyCode + '" data-pcbprotype="' + tableName.PcbProType + '">Order Now</span></div>';
                    //     pcsnumStr += "<div class='pcsnumbox'><span class='cl-red'> 0.00</span>/pcs</div>";
                    // } else {
                    let discountHtml = '';
                    let pf0 = userId == 0 && theNum <= 20 ? '<a class="tag" href="/activity/free-pcb-prototype-2021.html" target="_blank">as low as $0</a>' : '';
                    let ttm = userId == 0 ? 'l2' : 'l3';

                    if (tableName.DisCount < 1) {
                        discountHtml = '<span style="text-align: center; display:inline-block; line-height: 16px; color:#fff; background:#f90; display: inline-block; font-size: 12px; padding:0 .3em; display:block; margin-top:.3em;">' + parseFloat(((1 - tableName.DisCount) * 100).toFixed(2)) + '% off</span>';
                    }

                    let SCMoney = $(".selShip li.on").attr('data-shipprice') || 0;

                    var totalmoney = priceArr[k].TotalMoney + parseInt(SCMoney);
                    // console.log(priceArr[k].TotalMoney,info[i].TotalAmount,info[i].CounpAmount);
                    // console.log(totalmoney);
                    priceStr += '<div class="OrderMoneybox rel"><div class="isQian inline-block mr10">' + havePlumbum + '</div><div class="odmn inline-block" TotalMoney="' + priceArr[k].TotalMoney + '" cp="' + info[i].CounpAmount + '">' + pf0 + '<em class="um">$' + totalmoney + '</em><span class="span-OrderMoney">$' + priceArr[k].TotalMoney + '</span>' + discountHtml + '</div>' +
                        '<div class="TotalAmount"><span>$' + (totalmoney - info[i].CounpAmount) + '</span><div class="' + ttm + '"><dl><dt>PCB Cost</dt><dd>$' + priceArr[k].TotalMoney + '</dd></dl><dl><dt>Shipping Cost</dt><dd class="sc">$' +
                        // '<div class="TotalAmount"><em class="um">$'+info[i].TotalAmount+'</em><span>$' + (info[i].TotalAmount-info[i].CounpAmount) +'</span><div class="'+ttm+'"><dl><dt>PCB Cost</dt><dd>$' + priceArr[k].TotalMoney+'</dd></dl><dl><dt>Shipping Cost</dt><dd class="sc">$'+
                        // Math.ceil(info[i].TotalAmount-priceArr[k].TotalMoney)+'</dd></dl><dl><dt>Coupons</dt><dd class="cp">-$' + info[i].CounpAmount+'</dd></dl></div></div><div class="market-price undis">' +
                        SCMoney + '</dd></dl><dl><dt>Coupons</dt><dd class="cp">-$' + info[i].CounpAmount + '</dd></dl></div></div><div class="market-price undis">' +
                        '<ul class="clearfix">' +
                        ' <li><span class="market-price-title">板材费</span><span class="free-urgent-box dis"><span>￥</span>' +
                        '<span class="fixed2 market-price-item" data-price-item="AddCart-JdbCostBoard">' + priceDetail.JdbCostBoard + '</span></span></li>' +
                        '<li><span class="market-price-title">工程费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostCostruction">' + priceDetail.JdbCostCostruction + '</span></span></li><li><span class="market-price-title">菲林费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostFilm">' + priceDetail.JdbCostFilm + '</span></span></li><li><span class="market-price-title">喷镀费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostMetallize">' + priceDetail.JdbCostMetallize + '</span></span></li><li><span class="market-price-title">颜色费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostColor">' + priceDetail.JdbCostColor + '</span></span></li><li><span class="market-price-title">拼版费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostPinBan">' + priceDetail.JdbCostPinBan + '</span></span></li><li><span class="market-price-title">工艺费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostJiaJi">' + priceDetail.JdbCostJiaJi + '</span></span></li><li><span class="market-price-title">成型费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostShap">' + priceDetail.JdbCostShap + '</span></span></li><li><span class="market-price-title">其他费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostOther">' + priceDetail.JdbCostOther + '</span></span></li><li><span class="market-price-title">测试费</span><div class="clearfix market-price-box" style="vertical-align:bottom;"><span><span class="ceshi_m">￥</span><span class="fixed2 market-price-item" data-price-item="AddCart-JdbCostTest">' + priceDetail.JdbCostTest + '</span></span></div></li></ul></div></div>';
                    addcartStr += '<div class="cartbox" style="margin-top:12px;" data-plumbum="' + priceArr[k].SuchSurfaceType + '" data-tag="' + priceArr[k].StepTag + '" data-index="' + k + '"><span class="cart_item"  data-totalWeight="' + tableName.TotalWeight + '" data-code="' + supllyCode + '" data-pcbprotype="' + tableName.PcbProType + '"><i class="ico-cart"></i>Add Cart</span></div>';
                    //单片价格
                    pcsnumStr += "<div class='pcsnumbox'>" + (priceArr[k].TotalMoney / tableName.PcsNum).toFixed(2) + "/pcs</div>";

                    // }

                    //加急
                    if (priceArr[k].StepType == "1") {
                        jqStr += '<div class="jqbox cl-f90" data-DeliveryDays="' + stepDeliveryDays + '">' + stepDeliveryDays + 'D <input name="AddCart-DeliveryDate" type="hidden" value="' + priceArr[k].DeliveryDate + '" /><img src="/img/img/onlineNew/fast.png" class="delivery_img" ></div>';

                    } else if (priceArr[k].StepType == "2") {
                        jqStr += '<div class="jqbox cl-f90" data-DeliveryDays="' + stepDeliveryDays + '">' + stepDeliveryDays + 'D <input name="AddCart-DeliveryDate" type="hidden" value="' + priceArr[k].DeliveryDate + '" /><img src="/img/img/onlineNew/rapidly.png" class="delivery_img" ></div>';

                    } else {
                        jqStr += '<div class="jqbox cl-f90" data-DeliveryDays="' + stepDeliveryDays + '">' + stepDeliveryDays + 'D <input name="AddCart-DeliveryDate" type="hidden" value="' + priceArr[k].DeliveryDate + '" /><img src="/img/img/onlineNew/normal.png" class="delivery_img" ></div>';
                    }
                }
                var brandType = "";
                //if (info[i].QualityTag == 0) {
                //    brandType = `<td class="table-brandType" title="Reliability Testing(10 Items)、Certification Standards(3 Items)、X-out Board in Panel≤5%、Exposure Imaging Precision≥6mil±20%、Profile Precision±8mil、Ordinary Inks"><div class="ellipsis_3 inline-block" style="width:150px">Reliability Testing(10 Items)、Certification Standards(3 Items)、X-out Board in Panel≤5%、Exposure Imaging Precision≥6mil±20%、Profile Precision±8mil、Ordinary Inks</div></td>`;
                //} else if (info[i].QualityTag == 1) {
                //    brandType = `<td class="table-brandType" title="Reliability Testing(15 Items)、Certification Standards(4 Items)、X-out Board in Panel≤2%、Exposure Imaging Precision≥5mil±20%、Profile Precision±7mil、Famous Brand Inks"><div class="ellipsis_3 inline-block" style="width:150px">Reliability Testing(15 Items)、Certification Standards(4 Items)、X-out Board in Panel≤2%、Exposure Imaging Precision≥5mil±20%、Profile Precision±7mil、Famous Brand Inks</div></td>`;
                //} else if (info[i].QualityTag == 2) {

                //    brandType = `<td class="table-brandType" title="Reliability Testing(20 Items)、Certification Standards(6 Items)、No X-out Board in Panel、Exposure Imaging Precision≥4mil±20%、Profile Precision±6mil、Famous Brand Inks for Printing"><div class="ellipsis_3 inline-block" style="width:150px"> Reliability Testing(20 Items)、Certification Standards(6 Items)、No X-out Board in Panel、Exposure Imaging Precision≥4mil±20%、Profile Precision±6mil、Famous Brand Inks for Printing</div></td>`;
                //}
                //<td class="table-OrderMoney cl-f90 f16" data-OrgOrderMoney="' + OrgOrderMoney + '">$' + tableName.OrderMoney.toFixed(2) + '</td>
                //<td class="table-brandType">' + info[i].CoreType.CoreType_ + '</td>
                var ulImg = '';
                if (info[i].CoreType.ULCertification == 0) {
                    ulImg = '';
                } else {
                    ulImg = '<img class="ml5" src="/img/img/onlineNew/ul.png" style="min-height: 20px;min-width:20px">';
                }
                if (info[i].CoreType.Captions_ != null && info[i].CoreType.Captions_ != "") { //是否有无地址
                    Captions_Text = '<a href=' + info[i].CoreType.Captions_ + ' target="_blank" title="PCB Specification File"><img src="/img/img/onlineNew/pdf.png"><span class="ml10">' + coreType.EnCoreType + '</span>' + ulImg + '</a>'
                } else {
                    Captions_Text = '<span style="display:inline-block;margin-left:6px">' + coreType.EnCoreType + '</span>' + ulImg;
                }
                //2021/5/31非阻燃板材品牌和型号操作

                // console.log("priceArr", priceArr);
                fixedTableHtml += '<tr class="xgpp-table-cont sel-active' + (userId == 0 ? ' hv' : '') + (i == 0 ? ' on' : '') + '" IsHidden="' + info[i].IsHidden + '" data-type="' + info[i].QualityTag + '">' +
                    '<td class="table-FR4Type" style="max-width:220px">' + Captions_Text + '</td>' +
                    '<td class="table-OrderMoney f14 rel" style="width:280px" data-OrgOrderMoney="' + OrgOrderMoney + '">' + priceStr + '<div class="market-price undis"><ul class="clearfix"><li><span class="market-price-title">板材费</span><span class="free-urgent-box dis"><span>￥</span><span class="fixed2 market-price-item" data-price-item="AddCart-JdbCostBoard">' + tableName.JdbCostBoard + '</span></span></li><li><span class="market-price-title">工程费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostCostruction">' + tableName.JdbCostCostruction + '</span></span></li><li><span class="market-price-title">菲林费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostFilm">' + tableName.JdbCostFilm + '</span></span></li><li><span class="market-price-title">喷镀费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostMetallize">' + tableName.JdbCostMetallize + '</span></span></li><li><span class="market-price-title">颜色费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostColor">' + tableName.JdbCostColor + '</span></span></li><li><span class="market-price-title">拼版费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostPinBan">' + tableName.JdbCostPinBan + '</span></span></li><li><span class="market-price-title">工艺费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostJiaJi">' + tableName.JdbCostJiaJi + '</span></span></li><li><span class="market-price-title">成型费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostShap">' + tableName.JdbCostShap + '</span></span></li><li><span class="market-price-title">其他费</span><span class="market-price-box dis"><span>￥</span><span class="fixed2  market-price-item" data-price-item="AddCart-JdbCostOther">' + tableName.JdbCostOther + '</span></span></li><li><span class="market-price-title">测试费</span><div class="clearfix market-price-box" style="vertical-align:bottom;"><span><span class="ceshi_m">￥</span><span class="fixed2 market-price-item" data-price-item="AddCart-JdbCostTest">' + tableName.JdbCostTest + '</span></span></div></li></ul></div>' +
                    // '<td style="color:#f90;font-weight:bold;">' + 'TotalPrice' + '</td>' +
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
            if ($("#fixed-table .xgpp-table-cont").length > 0) {
                $("#pcbquote .bk").css({ top: '64px', height: $("#pcbquote .coordination-table .xgpp-table-cont.on").height() + 'px' });
            } else {
                $(".coordination-table .bk").hide();
            }

            $("#change-table .xgpp-table-cont,#fixed-table .xgpp-table-cont").hover(function () {
                $("#fixed-table .xgpp-table-cont").removeClass('on');
                let index = $(this).index() + 1;
                $("#fixed-table .xgpp-table-cont:nth-child(" + index + ")").addClass('on');
                $("#pcbquote .bk").css({ top: $(this).offset().top - $('.coordination-table').offset().top + 'px', height: $(this).height() + 'px' });
            });

            var proCategory = $("[name=proCategory]:checked").val();
            if (proCategory !== "rogersItem") {

                $(".change-table [data_name='DielectricConstant']").hide();
                $(".change-table [data_name='DissipationFactor']").hide();
                $(".change-table [data_name='VolumeResistance']").hide();

            }
            //价格明细
            $(".table-OrderMoney .market-price li").each(function (o, dom) {
                if ($(dom).find(".market-price-item").text() == 0) {
                    $(dom).hide();
                }
            })

            $(".table-OrderMoney .OrderMoneybox").hover(function () {
                // $(this).find(".market-price").show();
                // $(this).find(".market-price").width($(this).find(".market-price li").eq(0).width() * $(this).find(".market-price li:visible").length);
                // $(this).find(".market-price").css("top", $(this).height() / 2 + 15);
                totalMoney = $(this).find(".span-OrderMoney").text();
                totalMoney = totalMoney.split("￥");
                //  Pcb.boardDeteil($(this), totalMoney);
                // $(this).find(".market-price").width($(this).find(".market-price li").eq(0).width() * $(this).find(".market-price li:visible").length);
                $(this).find(".market-price").css("top", $(this).height() / 2 + 30)
            }, function () {
                //  $(".table-OrderMoney .market-price").hide();
            })
            if (window.location.host == 'ww2.allpcb.com' || window.location.host.indexOf('115.236') >= 0) {
                $(".OrderMoneybox").hover(function () {
                    $(this).children(".market-price").removeClass('undis');
                }, function () {
                    $(this).children(".market-price").addClass('undis');
                })
            }
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
        selP2(type);
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
        parm["Fee-Fr4Tg"] = fr4tg;
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
        //var num = $("[name=Fee-Num]").val();
        //var h = $("[name=Fee-BoardHeight]").val();
        //var w = $("[name=Fee-BoardWidth]").val();
        //var boardLayer = $("[name=Fee-BoardLayers]").val();
        //if (num == null || num == 0 || h == null || h == 0 || w == null || w == 0 || boardLayer == null || boardLayer == 0 || boardLayer == undefined) { layer.msg('请先输入高度、宽度、数量和层数，计算价格后，再Add to Cart！', { time: 3000, area: ['460px', '50px'] }); return false; }
        if (!Pcb.ParmValid()) {
            return false;
        }
        var parm = {};
        parm = Pcb.transferPara(fr4type, fr4tg, boardbrand, pcbProType, stepTag, CoreTypeCode)
        //parm += reportShow();
        var isFlag = true;
        var note = "";
        if ($("[name=Note]").val() != "")
            note = "[Other]:" + $("[name=Note]").val().replace("|", "");
        //var boardLayer = $("[name=BoardLayers]:checked").val();
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
        if (isFlag) {
            // parm += "&Fee-Note=" + escape(note);
            //var userId = $("#HidUserId").val();
            //if (userId == 0) {
            //    showloginlayer("btnAddCart");
            //    return;
            //}
            //  var free = $('input[name="Free"]:checked').val();
            parm["Fee-Note"] = escape(note)
            var free = $('.order-free-box input[name="Free"]').val();

            //parm += "&Fee-Free=" + free;
            parm["Fee-Free"] = free;
            //if (free != undefined && free && free != null)
            //    parm += "&Fee-Free=" + $('input[name="Free"]:checked').val();

            $(".cart_item").attr("disabled", "disabled");
            var SmtOrderNo = $("#SmtOrderNo").val();
            //parm += "&Fee-SmtOrderNo=" + SmtOrderNo;
            parm["Fee-SmtOrderNo"] = SmtOrderNo;
            parm["act"] = "Add";
            $.ajax({
                url: 'https://www.allpcb.com/ashx/PcbOnline.ashx',
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

            //RegisterFlyer(ev,function () {
            //    $.ajax({
            //        url: '/ashx/PcbOnline.ashx?act=Add&' + parm + "&t=" + new Date(),
            //        dataType: 'json',
            //        type: 'post',
            //        beforeSend: function () {
            //            //加载层-默认风格
            //            layer.load();
            //        },
            //        success: function (data) {
            //            if (data.success) {

            //                setTimeout(AddCartSetTimeout, 500);
            //                //SidebarCarListLoad();
            //                setTimeout(function () {
            //                    //layer.tips('您有一个新订单Add to Cart<br>点击购物车上传文件', '#endTocar', { time: 8000 });
            //                    //$(".layui-layer-content").addClass("shake-tips");
            //                    layer.open({
            //                        type: 1,
            //                        shade: 0.3,
            //                        closeBtn: 1,
            //                        shadeClose: true,
            //                        area: '470px',
            //                        content: $('.order-cart-box') //捕获的元素
            //                    });
            //                    //$(".sidebar-tab-car .num").addClass("bounceOutN"), setTimeout(function () {
            //                    //    $(".sidebar-tab-car .num").removeClass("bounceOutN");
            //                    //}, 5000);
            //                    //Pcb.CalcPrice();
            //                    $(".cart_item").removeAttr("disabled", "disabled");
            //                }, 500);

            //                layer.closeAll();
            //            } else {
            //                $(".cart_item").removeAttr("disabled", "disabled");
            //                //Pcb.CalcPrice();
            //                layer.closeAll();
            //            }
            //        }
            //    });
            //});
        }
    },
    //跟面积有关的事件
    areaEvent: function () {
        Pcb.commonArea();
        Pcb.aluminumArea();
        Pcb.newHeat();
        Pcb.TestReportFn();
        Pcb.leadNum();
    },
    leadNum: function () {//有铅无铅关于数量的关系
        var px = $("[name=pinban_x]").val();
        var py = $("[name=pinban_y]").val();


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
    commonArea: function () {
        var area = Pcb.CalcArea($("[name=BoardHeight]").val(), $("[name=BoardWidth]").val(), $("[name=Num]").val(), GetCheckedVal("BoardType"), $("[name=pinban_x]").val(), $("[name=pinban_y]").val(), $("[name=processeEdge_x]:checked").val(), $("[name=processeEdge_y]").val());
        var proCategory = $("[name='proCategory']:checked").val();
        var BoardLayers = $("[name='BoardLayers']:checked").val();
        //
        //双面板大于20平可选导电膜
        if (BoardLayers == 2 && area > 30) {
            Pcb.QutoliEv("[name='BeforePlating'][value='conductivefilm']", 3)
        } else {
            Pcb.QutoliEv("[name='BeforePlating'][value='conductivefilm']", 2)
            Pcb.Checked("BeforePlating", "copperdeposition");
        }
        //如果新加四种单面板，面积》50才可选丝网印刷，否则只能选择曝光
        var LineWeight = $("[name='LineWeight']:checked").val();
        var Vias = $("[name='Vias']:checked").val();
        if (proCategory == "fr1Item" || proCategory == "22fItem" || proCategory == "cem3Item" || proCategory == "94hbItem") {
            if (area > 50 && LineWeight == 10) {
                Pcb.QutoliEv("[name='ImageTranster'][value='screenprinting']", 3)
            } else {
                Pcb.QutoliEv("[name='ImageTranster'][value='screenprinting']", 2)
                Pcb.Checked("ImageTranster", "exposure");
            }
            if (area > 300 && LineWeight == 10 && Vias == 0.8) {
                Pcb.QutoliEv("[name='FormingType'][value='module']", 3)
            } else {
                Pcb.QutoliEv("[name='FormingType'][value='module']", 2)
                Pcb.Checked("FormingType", "mechanical");
            }
        }


        Pcb.TestReportFn()

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

    //pcb计算面积
    getPinBan: function (data) {
        if (!data) {
            data = Tools.UrlToJsonParams($("#smtorderForm").serialize());
        }
        var result = {
            x: 1,
            y: 1,
        };
        if (data.AssemblyBoardType == 'pcs') {//单板
            if (data.IsAIPanel == 'true') {//接受智能拼版
                result.x = isNaN(data.t_pinban_x) ? 0 : parseInt(data.t_pinban_x);
                result.y = isNaN(data.t_pinban_y) ? 0 : parseInt(data.t_pinban_y);
            }
        }
        else {
            result.x = isNaN(data.pinban_x) ? 0 : parseInt(data.pinban_x);
            result.y = isNaN(data.pinban_y) ? 0 : parseInt(data.pinban_y);
        }
        return result;

    },
    //显示
    tiggerShow: function (className, isShow) {
        if (isShow) {
            $('.' + className).slideDown();
        }
        else {
            $('.' + className).slideUp();
        }
    },
    //ai拼版
    calcAbsTarget: function (val, target) {
        var v1 = Math.floor(target / val);
        var v2 = v1 + 1;
        var m1 = Math.abs(target - v1 * val);
        var m2 = Math.abs(target - v2 * val);
        if (m1 < m2) {
            return v1;
        }
        return v2;
    },
    PcbisXiaoBanType: function (data) {
        if (!data) {
            data = Tools.UrlToJsonParams($("#smtorderForm").serialize());
        }

        //为空时不认为是小板
        if (data.AssemblyBoardType != 'pcs' || data.PcbSizeY == '' || data.PcbSizeX == '' || isNaN(data.PcbSizeY) || isNaN(data.PcbSizeX)) {
            return 0;
        }
        if (data.PcbSizeY <= 50 || data.PcbSizeX <= 50) {
            return 1;//智能拼板类型1
        }
        if (data.AssemblyBoardType == "pcs") {
            if ((data.PcbSizeY <= 150 || data.PcbSizeX <= 150) && $("#Num").val() >= 100 && data.ProductNum >= 100) {
                return 2;//智能拼板类型2
            }
        } else {
            if ((data.PcbSizeY <= 150 || data.PcbSizeX <= 150) && data.ProductNum >= 100) {
                return 2;//智能拼板类型2
            }
        }
        return 0;
    },
    PcbCalcArea: function () {
        var data = Tools.UrlToJsonParams($("#smtorderForm").serialize());
        var area = {
            x: parseInt(data.PcbSizeX) || 0,
            y: parseInt(data.PcbSizeY) || 0
        };
        var gonyiArea = {
            x: 0,
            y: 0,
        };
        var pinBan = {
            x: 0,
            y: 0,
        };

        if (data.AssemblyBoardType == 'pcs' && data.IsAIPanel == 'true') {//单板时且自动拼版时
            let pinban = Pcb.getPinBan(data);
            pinBan.x = pinban.x || 0;
            pinBan.y = pinban.y || 0;

        }

        //最终面积
        var finalArea = {
            x: area.x * pinBan.x,
            y: area.y * pinBan.y,
        };
        // 长边加工艺边(影响短一点的边的长度)
        if (finalArea.x > finalArea.y) {
            gonyiArea.y = 5;
            finalArea.y += (gonyiArea.y * 2);
        }
        else {
            gonyiArea.x = 5;
            finalArea.x += (gonyiArea.x * 2);
        }
        //设置显示
        $('#actualPanelDimension').html(`${finalArea.y}*${finalArea.x}mm`);
        return {
            area: area,
            finalArea: finalArea,
            gonyiArea: gonyiArea,
            pinBan: pinBan,
        };
    },


    //隐藏示例图
    HideSuggestImpositionInformation: function () {
        $("#informationpinban").css({ "z-index": "-999", "opacity": "0" });
        $(".suggest-masklayer").hide();
        return false;
    },
    pinbanVaildate: function () {
        var data = Pcb.getFormData();
        var h = Number(data.BoardHeight)
        var w = Number(data.BoardWidth)
        var neww = Number(data.pinban_x)
        var newy = Number(data.pinban_y)
        var edgex = data.processeEdge_x;
        var edgey = Number(data.processeEdge_y);

        var BoardType = data.BoardType;
        var VCut = data.VCut;
        //2021/8/4特殊提示
        if (BoardType == "set" || BoardType == "jpset") {
            var isNotCheckVut = false;
            if (BoardType == "jpset") {

                var width = newy * w;
                var height = neww * h;
                switch (edgex) {
                    case 'updown': {
                        height += edgey * 2;
                        break;
                    }
                    case 'leftright': {
                        width += edgey * 2;
                        break;
                    }
                    case 'both': {
                        width += edgey * 2;
                        height += edgey * 2;
                        break;
                    }
                }

                isNotCheckVut = width < 75 || height < 75;

            } else {
                isNotCheckVut = w < 75 || h < 75;

            }
            var hideList = [];
            if (BoardType == 'set') {
                if (isNotCheckVut) {
                    if (VCut == "vcut" || VCut == "vcutluocao") {
                        setTimeout(function () {
                            Pcb.Checked("VCut", "luocao");
                        });
                    }
                    hideList.push('vcut')
                    hideList.push('vcutluocao')
                }
                hideList.push('none')
            } else {
                if (isNotCheckVut) {
                    if (VCut == "vcut") {
                        setTimeout(function () {
                            layer.msg("V-Scoring is not available when the panel size is smaller than 75*75mm");
                            Pcb.Checked("VCut", 'none');
                        });
                    }
                }
            }

            Pcb.QutoliEv($(`[name='VCut']`), Pcb.QutoliEvType.enable)
            $(`[name='VCut']`).parent().off('mouseover mouseout');

            if (hideList.length > 0) {
                let varArr = hideList;
                let $dom = $(`[name = 'VCut']`).filter(function (index) {
                    let val = $(this).val();
                    for (let i = 0; i < varArr.length; i++) {
                        if (val == varArr[i]) {
                            return true;
                        }
                    }
                    return false;
                });
                Pcb.QutoliEv('VCut', Pcb.QutoliEvType.disable, hideList)
                $dom.parent().on('mouseover mouseout', function (event) {

                    if (event.type == "mouseover") {
                        layer.tips('V-Scoring is not available when the panel size is smaller than 75*75mm', this, {
                            tips: [1, '#000']
                        });

                    }
                    else if (event.type == "mouseout") {
                        //鼠标离开
                        layer.closeAll('tips')
                    }


                });
            }
        }
    },
    //特殊工艺复选框
    tsProcess: function (callback) {
        $.ajax({
            url: 'https://www.allpcb.com/ashx/PcbOnline.ashx?act=GetPcbQuoteConfig',
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

                            if (tsList[i].IsNeed == 1) {
                                if (desc != "" && desc != null) {
                                    if (pic != "" && pic != null) {
                                        tsHtml1 += '<li class="rel"><label class="item rel"><input class="undis" type="checkbox" name="' + tsList[i].TypeName_ + '" value="0"><span>' + tsList[i].EnCaption + '<span class="wen_tip pointer ml5" data-html="true" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="' + desc + '<br/><img src=\'' + pic + '\'/>"></span></span></label></li>';
                                    } else {
                                        tsHtml1 += '<li class="rel"><label class="item rel"><input class="undis" type="checkbox" name="' + tsList[i].TypeName_ + '" value="0"><span>' + tsList[i].EnCaption + '<span class="wen_tip pointer ml5" data-html="true" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="' + desc + '"></span></span></label></li>';
                                    }

                                } else {
                                    tsHtml1 += '<li><label class="item"><input class="undis" type="checkbox" name="' + tsList[i].TypeName_ + '" value="0"><span>' + tsList[i].EnCaption + '</label></li>';
                                }
                            } else if (tsList[i].IsNeed == 2) {
                                if (desc != "" && desc != null) {
                                    if (tsList[i].OptionPic != "" && tsList[i].OptionPic != null) {
                                        tsHtml2 += '<li class="rel"><label class="item rel"><input class="undis" type="checkbox" name="' + tsList[i].TypeName_ + '" value="0"><span>' + tsList[i].EnCaption + '<span class="wen_tip pointer ml5" data-html="true" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="' + desc + '<br/><img src=\'' + pic + '\'/>"></span></span></label></li>';
                                    } else {
                                        tsHtml2 += '<li class="rel"><label class="item rel"><input class="undis" type="checkbox" name="' + tsList[i].TypeName_ + '" value="0"><span>' + tsList[i].EnCaption + '<span class="wen_tip pointer ml5" data-html="true" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="' + desc + '"></span></span></label></li>';
                                    }

                                } else {
                                    tsHtml2 += '<li><label class="item rel"><input class="undis" type="checkbox" name="' + tsList[i].TypeName_ + '" value="0"><span>' + tsList[i].EnCaption + '</span></label></li>';
                                }
                            }

                            tsParaHtml += '<li class="Fee-' + tsList[i].TypeName_ + '"><span>' + tsList[i].EnCaption + '</span><em></em><input type="hidden" name="Fee-' + tsList[i].TypeName_ + '" /></li>';
                        }
                    }
                    $(".tsgy1").append(tsHtml1);
                    $(".tsgy1").append(tsHtml2);
                    $(".ts_process_para").append(tsParaHtml);
                    $('[data-toggle="tooltip"]').tooltip();

                    if (callback && typeof callback === 'function') {
                        callback()
                    }
                }
            }
        })

        //特殊工艺复选框

        //$(".info_ts").on("click", "li label", function () {
        //	if($(this).hasClass("current")){
        //	    $(this).removeClass("current");
        //	    $(this).find("input").prop("checked", false);
        //	    $(this).find("input").val("0");
        //	}else{
        //	    $(this).addClass("current");
        //	    $(this).find("input").prop("checked", true);
        //	    $(this).find("input").val("1");
        //	}
        //	return false;
        //})
    },
    /**
     * 选中样式处理
     * @param {any} name
     * @param {any} value
     * @param {any} selfx 是否移除其他选择，默认true
     */
    Checked: function (name, value, selfx = true) {
        if (selfx) {
            $("[name='" + name + "']").parents("li").siblings().find(".item").removeClass("choose").find("i").remove();
            $("[name='" + name + "']").parents("li").siblings().find("input").prop("checked", false);
            if (value == null) {
                return;
            }
        }
        $("[name='" + name + "'][value='" + value + "']").parents(".item").addClass("choose");
        $("[name='" + name + "'][value='" + value + "']").parents(".item").removeClass("not-selectable");
        if (name != "t_pinban_x" && name != "t_pinban_y") {
            $("[name='" + name + "'][value='" + value + "']").before("<i class='jp-ico subscript-ico'></i>");
        }
        $("[name='" + name + "'][value='" + value + "']").prop("checked", true);
        $("[name='" + name + "'][value='" + value + "']").parents("li").show();
        if (name == "SolderColor" || name == "FontColor") {
            var colorhtml = $("[name='" + name + "'][value='" + value + "']").parents("label").eq(0).clone(true);
            $("[name='" + name + "'][value='" + value + "']").parents(".divselect-box").find("cite").html(colorhtml);
        } else {
            $("[name='" + name + "'][value='" + value + "']").parents(".divselect-box").find("cite a,cite .item").text($("[name='" + name + "'][value='" + value + "']").parents(".item").eq(0).text());
        }

        if (name == "t_pinban_y" || name == "t_pinban_x" || name == "ExpectedPrice" || name == "DIPPointNum" || name == "PointNum" || name == "PatchElementType") {
            $("[name='" + name + "']").val(value);
        }
    },
    QutoliEvType: {
        /** 显示 */ show: 0,
        /** 隐藏 */ hide: 1,
        /** 禁用 */ disable: 2,
        /** 启用 */ enable: 3,
        /** 强制选中，不可取消 */ forceChoose: 4,
        /** 取消强制选中 */ unforceChoose: 5,
    },
    ///计价页的li显示隐藏:0显示,1隐藏，2去除点击事件，3添加点击事件，4选中并不可复选，5清空并可复选。
    QutoliEv: function (dom, type, varArr = [], autoShow = false) {
        var $dom = null;
        if (varArr && varArr.length > 0) {
            $dom = $(`[name = '${dom}']`).filter(function (index) {
                let val = $(this).val();
                for (let i = 0; i < varArr.length; i++) {
                    if (val == varArr[i]) {
                        return true;
                    }
                }
                return false;
            });
        } else if (dom instanceof jQuery) {
            $dom = dom;
        }
        else {
            $dom = $(dom);
        }
        // console.log(dom,type)
        if (type == 0) {
            $dom.parents("li").show();
            if (autoShow) {
                $dom.parents("li").find(".item").removeClass("not-selectable");
            }
        } else if (type == 1) {
            $dom.parents("li").hide();
            $dom.parents("li").find(".item").removeClass("choose").find(".subscript-ico").remove();
            if (autoShow) {
                $dom.parents("li").find(".item").addClass("not-selectable");
            }
        } else if (type == 2) {//不可点击
            //  $("[name='radFontColor'][value='Green']")
            $dom.parents("li").find(".item").addClass("not-selectable").removeAttr("click");
            $dom.parents("li").find(".item").removeClass("choose").find("i").remove();
            $dom.removeAttr('checked');
            $dom.addClass('not-selectable')
            if (autoShow) {
                $dom.parents("li").hide();
            }
        } else if (type == 3) {//添加点击事件
            $dom.parents("li").find(".item").attr("click", Pcb.OptionsItemClick()).removeClass("not-selectable");
            $dom.removeClass('not-selectable')
            if (autoShow) {
                $dom.parents("li").show();
            }
        } else if (type == 4) {//选中不可复选
            $dom.parents("li").find("i").remove();
            $dom.parents("label").removeClass("item").addClass("choose").addClass("item_ck");
            $dom.before("<i class='jp-ico subscript-ico'></i>");
            $dom.prop("checked", true).prop("disabled", true);
        } else if (type == 5) {//取消不可复选
            $dom.parents("li").find("i").remove();
            $dom.parents("label").addClass("item").removeClass("choose").removeClass("item_ck");
            $dom.removeAttr("checked").removeAttr("disabled");
        }
    },

    getRule: function (name, data, rules) {
        var rule = rules[name];
        if (rule === null || rule === undefined) {
            return {};
        }
        if (typeof (rule) === 'function') {
            return rule.call(this, data);
        }
        return rule;
    },
    /**
     *  设置默认值
     * @param {any} data  form表单数据
     * @param {any} currnetActiveName 当前操作项名称
     */
    setDefaultValue: function (data, currnetActiveName, rules) {

        var ruleDict = $.extend({}, Pcb.getRule('_', data, rules), Pcb.getRule(currnetActiveName, data, rules));

        for (let key in ruleDict) {
            let val = ruleDict[key];
            if ($.isArray(val)) {//多选赋值
                Pcb.Checked(key, null);
                for (let i = 0; i < val.length; i++) {
                    Pcb.Checked(key, val[i], false);
                }
            }
            else {
                Pcb.Checked(key, val);
            }
        }
        $.extend(data, ruleDict);
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
    //激活可选选项(name,val)
    ifCK_tf: function (e, k) {
        var tsChoose = $("[name=" + e + "]").parent().hasClass('choose');
        if (getCkVal(e) == null || !tsChoose) Pcb.Checked(e, k);
    },
    //当前值可选不动,否则选新值。nVal新值\oVal旧值。
    setItemsSelectDefault: function (e, nVal, oVal) {
        var tsVal = $("[name=" + e + "]:checked").val();
        // console.log(e,tsVal,nVal,oVal)
        tsVal = tsVal ? tsVal : oVal;
        if (!tsVal) { Pcb.Checked(e, nVal); }
        var tsInput = $("[name=" + e + "][value='" + tsVal + "']");
        var tsLabel = tsInput.parent();
        var tsLi = tsLabel.parent();
        if (!tsLabel.hasClass('not-selectable') && tsLi.css('display') != 'none') {
            Pcb.Checked(e, tsVal);
        } else if (tsLabel.hasClass('not-selectable') || tsLi.css('display') == 'none') {
            Pcb.Checked(e, nVal);
        }
    },
    setRadioSelectDefault: function (e, nVal, oVal) {
        var tsVal = $("[name=" + e + "]:checked").val();
        if (!tsVal) {
            $("[name=" + e + "][value='" + nVal + "']").prop("checked", 'checked')
        }
    },
    //模拟点击选中事件
    clickItem: function (e, k, isck = false) {
        var proCategory = $("[name='proCategory']:checked").val();
        var tsInput = $("[name=" + e + "][value='" + k + "']");
        var tsLabel = tsInput.parent();
        var tsLi = tsLabel.parent();
        if (e === 'Vias') {
            if (proCategory === 'aluminumItem' || proCategory === 'copper') {
                if (k >= 1.5) {
                    $("[name=" + e + "][value='1.5']").parent().click(); return;
                }
            } else if (k >= 0.8) {
                $("[name=" + e + "][value='0.8']").parent().click(); return;
            }
        }
        if ((tsLabel.hasClass('not-selectable') || tsLi.css('display') == 'none') && !isck) {
            console.log('不可选' + e + '：' + k); return;
        }
        tsInput.parent().click();
    },
    //返回更多PCS数量
    resQuantitys: function (num) {
        num = Number(num);
        var nums = [5, 10, 15, 20, 25, 30, 50, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 9000, 10000];
        if (num > 7500) return (num + 1000) + ',' + (num + 2000) + ',' + (num + 3000);
        for (var i in nums) {
            if (num < nums[i]) {
                var index = parseInt(i);
                return num + ',' + nums[index] + ',' + nums[index + 1] + ',' + nums[index + 2];
            }
        }
    }
}
var quoteDFM_BizNo = '';
//PCB计价页文件上传
function fnQuoteUploadFiles(f) {
    var maxSize = 10;
    var fileType = f.accept;
    var getFile = f.files[0];
    var fileName = getFile.name.replace(/(.*\/)*([^.]+).*/ig, "$2");
    var fileInfo = { name: getFile.name, note: fileName, file: getFile, types: fileType, size: getFile.size, maxSize: maxSize, module: 'quoteFile', ifmd5: 1, barID: 'pcbUpFileBarID', rateID: 'pcbUpFileRateID', isR50: 1, statistics: 0 }
    showQuoteUpFileState('load');
    // $(".boxPcbUpFile").append('<div class="boxloading fx bw c"><span></span></div>');
    LP.getUpFileTK(fileInfo).then(upFile => {
        fnAnalysisPcbUpFile({ FileName: getFile.name, FilePath: upFile.fileurl, FileSize: getFile.size, FileMD5: upFile.fileMD5 });
    }).catch(err => {
        showQuoteUpFileState(true);
        alt2021(err.msg, 'e');
    }).finally(() => {
        f.value = null;
        // $(".boxPcbUpFile>.boxloading").remove();
    });
}
//展示pcb文件解析上传状态
function showQuoteUpFileState(show) {
    $(".boxPcbUpFile").removeClass('undis');
    $(".boxPcbUpFile .bnsa.bnUp span").text('Upload other files');
    if (show === true) {
        $(".boxPcbUpFile .upLoadStates").text('Uploading your files...');
        $(".boxPcbUpFile .s1").removeClass('undis');
        $(".boxPcbUpFile .s2").addClass('undis');
        $(".boxPcbUpFile .s11").removeClass('undis');
        $(".boxPcbUpFile .sErr").addClass('undis');
        $(".boxPcbUpFile .sSuc").addClass('undis');
    } else if (show === 'load') {
        $(".boxPcbUpFile .upLoadStates").text('Uploading your files...');
        $(".boxPcbUpFile .s1").addClass('undis');
        $(".boxPcbUpFile .s2").removeClass('undis');
    } else if (show === 'hide') {
        $(".boxPcbUpFile").addClass('undis');
    } else if (show === 'sErr') {
        $(".boxPcbUpFile .s1").removeClass('undis');
        $(".boxPcbUpFile .s2").addClass('undis');
        $(".boxPcbUpFile .s11").addClass('undis');
        $(".boxPcbUpFile .sErr").removeClass('undis');
        $(".boxPcbUpFile .sSuc").addClass('undis');
    } else if (show === 'sSuc') {
        $(".boxPcbUpFile .s1").removeClass('undis');
        $(".boxPcbUpFile .sSuc").removeClass('undis');
        $(".boxPcbUpFile .s2").addClass('undis');
        $(".boxPcbUpFile .s11").addClass('undis');
        $(".boxPcbUpFile .sErr").addClass('undis');
    }
    $(".boxPcbUpFile #pcbUpFileRateID").text('0%');
    $(".boxPcbUpFile #pcbUpFileBarID").css('width', '0%');
    clearInterval(dfmAnalysisRate_Interval);
    clearInterval(dfmGetAnalysisInfo_Interval);
}
//PCB计价DFM解析结果查询
var dfmGetAnalysisInfo_Interval;
var dfmAnalysisRate_Interval;
function fnAnalysisPcbUpFile(params) {
    // console.log(params)
    $(".boxPcbUpFile .upLoadStates").text('Processing your files...');
    var rate = 51;
    var maxRate = 98;
    dfmAnalysisRate_Interval = setInterval(function () {
        $(".boxPcbUpFile #pcbUpFileRateID").text(rate + '%');
        $(".boxPcbUpFile #pcbUpFileBarID").css('width', rate + '%');
        if (rate >= maxRate) clearInterval(dfmAnalysisRate_Interval);
        rate++;
    }, 2000)
    var resData;
    $.ajax({
        url: '/pcb/analysis', data: params, dataType: 'json', type: 'post', async: false, success: function (res) {
            if (res.success) {
                quoteDFM_BizNo = res.data.BizNo;
                resData = res.data;
                // $.cookie('pcbUpFiles',JSON.stringify(resData), {path: '/'});
            }
        }, error: function (e) {
            showQuoteUpFileState(true);
            alt2021(getLanguage('subFAL'))
        }
    });
    clearInterval(dfmGetAnalysisInfo_Interval);
    var getAPUFNum = 20; //默认请求次数
    dfmGetAnalysisInfo_Interval = setInterval(function () {
        getAPUFNum--;
        $.ajax({
            url: '/pcb/analysis?bizNo=' + resData.BizNo, data: {}, dataType: 'json', type: 'get', async: false, success: function (res) {
                // console.log(res);
                if (quoteDFM_BizNo == resData.BizNo && res.success) {
                    if (res.data.BoardWidth > 0 && res.data.BoardHeight > 0) {
                        alt2021('Analysis Successful');
                        $(".isUpFile").removeClass('undis');
                        // $(".boxPcbUpFile .bnsa.bnUp span").text('Upload other files');
                        $(".boxPcbQuoteUpFileInfo").html('').append(`<a target="_blank" id="pcbQuoteUpFile" data-PcbFileId="${resData.Id}" href="${params.FilePath}">${params.FileName}</a><span class="del">Delete</span>`);
                        $(".boxPcbQuoteUpFileInfo .del").click(function () {
                            $(".isUpFile").addClass('undis');
                            $(".boxPcbQuoteUpFileInfo").html('');
                            showQuoteUpFileState(true);
                            // $.cookie('pcbUpFiles',null,{path: '/'});
                        });
                        // $.cookie('pcbUpFiles',JSON.stringify(resData), {path: '/'});
                        setQuoteInfo(res.data);
                    }
                    else {
                        alt2021('Analysis Failed');
                        showQuoteUpFileState('sErr');
                        return;
                    }
                    showQuoteUpFileState('sSuc');
                }
            }, error: function (e) {
                if (quoteDFM_BizNo != '') {
                    showQuoteUpFileState('sErr');
                    alt2021(getLanguage('subFAL'))
                }
            }
        });
        if (getAPUFNum <= 0) {
            alt2021(getLanguage('subFAL'));
            showQuoteUpFileState('sErr');
        };
    }, 10000);
    //停止解析
    $(".boxPcbUpFile .stop").click(function () { stopAnalysis(); });
    function stopAnalysis() {
        quoteDFM_BizNo = '';
        showQuoteUpFileState(true);
    }
}
// setQuoteInfo({"BoardWidth": 8.2,"BoardHeight": 8.7,"BoardLayers": 2,"PinBanX": 1,"PinBanY": 1,"VCut": null,"Vias": null,"LineWeight": "10"});
//赋值计价参数
function setQuoteInfo(arr) {
    var BoardLayers = arr.BoardLayers;
    if (arr.BoardLayers) {
        var isShow = $("[name='BoardLayers'][value='" + BoardLayers + "']").parents('li').css('display');
        if (isShow === 'none') {
            altNotice('The file you uploaded is an ' + BoardLayers + '-layer board, and the Material Type you selected does not support this layer number. The Material Type has been changed to FR-4.', null, null, 0, null, '', 'Close', 'style="width:410px"', 'w', 'textLeft');
            Pcb.clickItem('proCategory', 'fr4Item');
        }
    }
    if (arr.PinBanX > 1 || arr.PinBanY > 1) {
        Pcb.clickItem('BoardType', 'set');
    } else {
        Pcb.clickItem('BoardType', 'pcs');
    }
    for (let i in arr) {
        if (arr[i]) {
            var val = arr[i];
            if (i === 'PinBanX') {
                $("input[name=pinban_x]").val(val);
            } else if (i === 'PinBanY') {
                $("input[name=pinban_y]").val(val);
            } else if (i === 'BoardWidth') {
                $("input[name=BoardWidth]").val(val);
            } else if (i === 'BoardHeight') {
                $("input[name=BoardHeight]").val(val);
            } else {
                Pcb.clickItem(i, val);
            }
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
function selectVal(name, val, isVal) {
    var data = $("[name=" + name + "]:checked").val();
    if (data == undefined || data == null || $("[name='" + name + "'][value='" + data + "']").parents(".item").hasClass("not-selectable")) {
        if (isVal && !$("[name='" + name + "'][value='" + isVal + "']").parents(".item").hasClass("not-selectable")) {
            Pcb.Checked(name, isVal)
        } else Pcb.Checked(name, val)
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
//只能输入两位小数
function validationSizeNumber2(e, num) {
    var regu = /^[0-9]+\.?[0-9]*$/;
    if (e.value != "") {
        if (!regu.test(e.value)) {
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
}
//数量提交时
function SetInputNum(tsInput = true) {
    Pcb.onNumChange();
}
//数量隐藏
function CloseSelectNumDiv() {
    $('#boardnumber').hide();
    $("#Num").css({ border: "" });
}

//function reportShow() {
//    if ($(".select-report").is(":visible")) {
//        return "&NeedReportList=1,1,1,1,1";
//    } else {
//        return "&NeedReportList=0,0,0,0,0";
//    }
//}

//成功添加购物车后待动画完成后跳转
function AddCartSetTimeout() {
    var userId = $("#HidUserId").val();

    if (userId == 0) {
        window.location.href = "/Account/LogOff?returnurl=/pcbonlinenew.html";
        return;
    }
    else {
        //window.location.reload();
    }
}
//参数列表选中效果
function fnSelectd(obj) {
    if (!Pcb.checkPara()) {
        return false;
    }
    //参数数量
    //var count = $(obj).parents('.parameter-item ').find(".hide_input").attr("count");
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
        //count = parseInt(count) - 1;
        //if (count == 0) {
        //    $(obj).parents('.parameter-item ').find(".clear-btn").addClass("hide");
        //}
        //$(obj).parents('.parameter-item ').find(".hide_input").attr("count", count);
        bj = 1;//标记为曾选中(参数编号已存在于编号集合)
    } else {
        $(obj).find(".item").addClass('choose');  //加选中的效果
        var selected_val = $(obj).find(".item").text();  //取得选中的值
        //此为选中
        //count = parseInt(count) + 1;
        //if (count > 0) {
        //    $(obj).parents('.parameter-item ').find(".clear-btn").removeClass("hide");
        //}
        //$(obj).parents('.parameter-item ').find(".hide_input").attr("count", count);
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
//清除单个参数的选中
function clearChoosen(obj) {
    $(obj).parents(".parameter-item").find(".hide_input").attr("count", "0");
    $(obj).parents('.parameter-item').find('.select-item').each(function () {
        var e = $(this);
        if (e.hasClass("select-active")) {
            e.removeClass("select-active");
            //analysisPara(e.attr("para"));
        }
    })
    $(obj).addClass("hide");
    $(obj).parents(".parameter-item").find(".hide_input").val("");
    searchProCount();
}
//清除所有参数
function clearAllPara() {
    //所有的清除按钮隐藏
    $(".clear-btn").each(function () {
        var e = $(this);
        if (!e.hasClass("hide")) {
            e.addClass("hide");
        }
        e.parents(".parameter-item").find(".hide_input").val("");
        e.parents(".parameter-item").find(".hide_input").attr("count", "0");
    });
    //所有的参数选择置空
    $(".select-item").each(function () {
        var e = $(this);
        if (e.hasClass("select-active")) {
            e.removeClass("select-active");
        }
    });
    //清除选择的分类
    //if ($("#classList").length > 0) {
    //    $(".category-item").each(function () {
    //        $(this).removeClass("category_active");
    //    });
    //    $(".del_btn").each(function () {
    //        $(this).css("display", "none");
    //    });
    //    $("input[name=classidNew]").attr("value", "0");
    //}
    //清除参数的筛选
    $(".search_inp").val("");
    $(".select-box").find("li").each(function () {
        $(this).removeClass("hide");
    });
    searchProCount();
    goAndSearch();
}
//回调查询产品数量
function searchProCount() {
    var formarr = $("#selectForm").serializeArray();
    var formObj = {};
    var obj = JSON.stringify(valuateResult.List);
    for (var i = 0; i < formarr.length; i++) {
        formObj[formarr[i]["name"]] = formarr[i]["value"];
    }
    var searchObj = JSON.stringify(formObj);
    $.ajax({
        url: '/pcb/PcbOnlineSelect',
        dataType: 'json',
        type: 'post',
        data: {
            Data: obj,
            Search: searchObj
        },
        beforeSend: function () {
            //$(".loader").show();
        },
        success: function (data) {
            if (data.success) {

                var info = data.attr.List;
                var count = data.attr.Count;
                $(".choose-result").show();
                var sel_count = 0;
                $(".sel_result").each((index, item) => {
                    sel_count += parseInt($(item).text());
                })
                // $(".choose-result span").text(sel_count);
                Pcb.paraRend(info, "PcbOrder", "FR4Type", "Num", "DeliveryDays", "FR4Tg");
                //$(".loader").hide();
                //if (count <= 0) {
                //    $(".apply_btn").addClass("not-allowed");
                //} else {
                //    $(".apply_btn").removeClass("not-allowed");
                //}
                $("[data-type='0'] .sel_result").text($("#fixed-table [data-type='0']:visible").length)
                $("[data-type='1'] .sel_result").text($("#fixed-table [data-type='1']:visible").length)

            } else {
                $(".loader").hide();
                layer.msg(data.message);
            }
        }
    })

}
//应用筛选事件
function goAndSearch() {
    var formarr = $("#selectForm").serializeArray();
    var formObj = {};
    var obj = JSON.stringify(valuateResult.List);
    for (var i = 0; i < formarr.length; i++) {
        formObj[formarr[i]["name"]] = formarr[i]["value"];
    }
    var searchObj = JSON.stringify(formObj);
    $.ajax({
        url: '/pcb/PcbOnlineSelect',
        dataType: 'json',
        type: 'post',
        data: {
            Data: obj,
            Search: searchObj
        },
        beforeSend: function () {
            $(".loader").show();
            $(".loader p").hide();
        },
        success: function (data) {
            if (data.success) {
                var info = data.attr.List;
                Pcb.paraRend(info, "PcbOrder", "FR4Type", "Num", "DeliveryDays", "FR4Tg");
                var dataType = $(".sel-active").attr("data-type");
                $(".xgpp .xgpp-table-cont").each(function (i, dom) {
                    var trdataType = $(dom).attr("data-type");
                    var isHide = $(dom).attr("ishidden");
                    if (dataType == "-1") {
                        if (isHide == "1") {
                            $(dom).hide();
                        } else {
                            $(dom).show();
                        }
                    } else {
                        // $(".xgpp-table-cont").hide();
                        if (trdataType == dataType) {
                            if (isHide == "1") {
                                $(dom).hide();
                            } else {
                                $(dom).show();
                            }
                        } else {
                            $(dom).hide();
                        }
                    }
                })
                var sel_count = 0;
                $(".sel_result").each((index, item) => {
                    sel_count += parseInt($(item).text());
                })

                // $(".choose-result span").text(sel_count);
                $(".loader").hide();
                numRResults()
            }
        }
    })
}
//JS筛选方法(参数筛选)
function screeningParameters(sender) {
    //var para = $(sender).prev($(".search_inp")).text();
    var para = $(sender).prev($(".search_inp")).val();
    $(sender).parents(".parameter-content").find(".select-box .select-item").each(function (i, dom) {
        if (para == "") {
            //清除隐藏的选项
            $(this).removeClass("hide");
        }
        else {
            var xx = $(dom).text();
            xx = xx.toLowerCase();
            para = para.toLowerCase();
            if (xx.indexOf(para) == -1) {
                $(this).addClass("hide");
            }
            else {
                if ($(this).hasClass("hide")) {
                    $(this).removeClass("hide");
                }
            }
        }
        //将激活状态改为未激活
        if ($(this).hasClass("select-active")) {
            $(this).removeClass("select-active");
        }
    });
    //清除之前的选择
    var clear = $(sender).parents(".parameter-item").find(".clear-btn");
    $(sender).parents(".parameter-item").find(".hide_input").val("");
    //消除按钮隐藏
    if (!clear.hasClass("hide")) {
        clear.addClass("hide");
    }
    //查询所得数据显示框隐藏
    //$(".choose-result").each(function () {
    //    if (!$(this).hasClass("hide")) {
    //        $(this).addClass("hide");
    //    }
    //});

}


//选择类型显示  LevelTag  0 标品 1 优品 2 精品 3 普品
function selP(type, obj) {
    $(obj).addClass('sel-active').siblings().removeClass('sel-active');
    selP2(type);
    $(".sel-title [data-type='" + type + "'] .sel_result").text($("#fixed-table [data-type='" + type + "']:visible").length);
    var sel_count = 0;
    $(".sel_result").each((index, item) => {
        sel_count += parseInt($(item).text());
    })

    // $(".choose-result span").text(sel_count);
}
function selP2(type) {
    //2022-02-10 16:41 标品优品不区分
    // $(".xgpp-table-cont").each(function (i, dom) {
    //     var obj_type = $(dom).attr('data-type');
    //     var isHide = $(dom).attr("ishidden");
    //     if (type == '-1') {
    //         if (isHide == "1") {
    //             $(dom).hide();
    //         } else {
    //             $(dom).show();
    //         }
    //     } else {
    //         if (obj_type == type) {
    //             if (isHide == "1") {
    //                 $(dom).hide();
    //             } else {
    //                 $(dom).show();
    //             }
    //         } else {
    //             $(dom).hide();
    //         }
    //     }
    // })
    if ($('.xgpp-table-cont:visible').length == 0) {
        $(".table-no-content").show();
    } else {
        $(".table-no-content").hide();
    }
    var sel_count = 0;
    $(".sel_result").each((index, item) => {
        sel_count += parseInt($(item).text());
    })
    // $(".choose-result span").text(sel_count);

    //相关匹配
    $(".t_right").width($(".xgpp").width() - $(".t_left").width() - 1)
    //fnInitChange($(".coordination-table"));
    $('.fl-scrolls').scroll(function (e) {
        $('.search-table-wrapper').scrollLeft($(this).scrollLeft());
    });
    changeScroll();
    fnFixed();
}

function datas(rq) {
    var rq1 = rq.slice(6, -2)
    var oDate = new Date(parseInt(rq1 - 1000 * 60 * 60 * 24)),
        year = oDate.getFullYear(),
        oMonth = oDate.getMonth() + 1,
        oDay = oDate.getDate(),
        oTime = year + '-' + getzf(oMonth) + '-' + getzf(oDay);//最后拼接时间
    return oTime
}
function getzf(num) {
    if (parseInt(num) < 10) {
        num = '0' + num;
    }
    return num;
}




//添加到购物车提交事件
function CartFormSubmit(jumpUrl) {
    //fbq('track', 'AddToCart');
    if (jumpUrl == 'login') {
        Pcb.calcPrice(true);
        refreshLogin();
        return false;
    }


    var isFlag = true;
    //提交购物车之前，先验证参数是否合法
    //var optype = QC.GetOpType();
    //if (optype == 2 || optype == 3 || optype == 4) {
    //    var num = $("[name=hidNum]").val();
    //    var h = $("#hidLength").val();
    //    var w = $("#hidWidth").val();
    //    var boardLayer = $("[name=hidLayers]:checked").val();
    //    if (num == null || num == 0 || h == null || h == 0 || w == null || w == 0 || boardLayer == null || boardLayer == 0 || boardLayer == undefined) { layer.msg('Please put quantity, height, width, layers to calculate the price.', { time: 3000, area: ['450px', '50px'] }); return false; }
    //    if (!Pcb.ParmValid()) {
    //        return false;
    //    }
    //    var userId = $("#userId").val();
    //    if ($("#hidErrMessage").val() != "") {
    //        layer.alert($("#hidErrMessage").val());
    //        return false;
    //    }
    //}
    //if (parseInt($("[name=selShipCountry]").val()) <= 0) {
    //    layer.msg("please choose country");
    //    return false;
    //}
    //if (parseInt($("[name=selShip]").val()) <= 0) {
    //    layer.msg("please choose ship type");
    //    return false;
    //}
    //if (optype == 4 || optype == 5) {
    //    if (!Smt.ParmValid()) {
    //        layer.msg("pls fill in required specification ");
    //        return false;
    //    }
    //}

    //if (optype == 5) {
    //    var smtPoint = parseInt($('input[name=PointNum]').val());
    //    var dipPoint = parseInt($('input[name=DIPPointNum]').val());
    //    var patchelementtype = parseInt($('input[name=PatchElementType]').val());

    //    if (smtPoint + dipPoint < patchelementtype) {
    //        layer.msg("The qty of parts kind should be less than the total qty of SMD and DIP solder joints");
    //        return false;
    //    }
    //}
    if (isFlag) {
        function loginSuccess() {
            // 继续提交
            CartFormSubmit('login')
        }
        checkLogin(function (data, mbid) {
            if (mbid == 0) {
                if (isMobile) { window.location.href = '/account/login?returnurl=/online_pcb_quote_new.html'; return false }
                layer.open({
                    title: 'Log in or sign up to add to cart',
                    type: 2,
                    area: ['500px', '500px'],
                    content: ['/account/loginwin?jumpUrl=/online_pcb_quote_new.html', 'no'],
                    success: function (layero, index) {
                        window.afterLoginSuccess = function () {
                            //检查登录
                            checkLogin(function (data, mbid) {
                                if (mbid > 0) {
                                    layer.close(index);
                                    loginSuccess()
                                }
                            })
                        };
                    },
                    end: function () {
                        window.afterLoginSuccess = undefined;
                    }
                });
                return;
            }
            else {
                loginSuccess()
            }
        });
    }

}
/**
 * 检查登录
 * @param {any} onSuccess
 */
function checkLogin(onSuccess) {
    $("#btnAddCart").attr("disabled", "disabled");
    $.ajax({
        url: 'https://www.allpcb.com/ashx/common.ashx?act=IsLogin',
        type: 'get',
        dataType: 'json',
        beforeSend: function () {
            //加载层-默认风格
            layer.load();
        },
        success: function (data) {
            layer.closeAll('loading');
            var mbid = parseInt(data.attr);
            $("#userId").val(mbid);
            //  var mail = $.trim($("#txtMail").val());
            $("#btnAddCart").removeAttr("disabled", "disabled");
            onSuccess(data, mbid);
        }
    });
}

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
        $.getJSON("https://www.allpcb.com/ashx/common.ashx?act=CalcShipList", { cid: cid, otherweight: otherWeight }, function (data) {
            BuildShipHtml(data.attr, optype, k);
        });
    } else {
        //  Pcb.calcPrice();
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

    //if ($(".selShipCountry").val != "") {
    //    $(".selShip").find("option[value='1']").attr("selected", true);
    //}
    CalShip('ckct');
}

function checkFree() {
    // if ($('#Num').val() == "5") {
    //     if ($(".order-free-box").find("input").prop("checked")) {
    //         $("#spShipMoeny").text("$0")
    //         $(".sumPrice span").text("$0")
    //         $(".total-money span").text("$0")
    //         $(".shipPrice").each(function (index, dom) { $(dom).text("$0") })
    //     }
    // }
}
///计算价格：总费用，板子费用
function CalcPrices() {
    var pcbOrderMoney = 0;//pcb销售价
    var smtOrderMoney = 0;//smt销售价
    var stencilOrderMoney = 0;//smt销售价
    var shipMoney = 0;//运费
    var benefitMoney = 0;//优惠
    var TotalOrdermoney = 0;//最终的钱
    //计算pcb的销售价
    var weight = $(".express_weight").attr("data-weight");
    var op = QC.GetOpType();
    if (op == 1 || op == 2) {
        //钢网
        var stenccilfactory = $(".totalpricezone [for-group='stencil']").find(".DiscountPrice");
        if (stenccilfactory.length > 0) {
            var stencilOrderMoney = $(stenccilfactory).text();
            if (stencilOrderMoney == 0 || stencilOrderMoney == "" || stencilOrderMoney == "undefined") {
                $(stenccilfactory).text("0");
            }
            stencilOrderMoney = $(stenccilfactory).text();
        }
    }
    if (op == 3 || op == 4 || op == 2) {
        //板子
        var chkpcbfacory = $(".totalpricezone [for-group='pcb']").find(".DiscountPrice");
        if (chkpcbfacory.length > 0) {
            var pcbOrderMoney = chkpcbfacory.text();
            if (pcbOrderMoney == 0 || pcbOrderMoney == "" || pcbOrderMoney == "undefinded") {
                chkpcbfacory.text("0");
            }
            pcbOrderMoney = (chkpcbfacory.text());

            var org_price = parseFloat($("#hid_org_price").val());
            var pcb_price = parseFloat(pcbOrderMoney);
            if (org_price < pcb_price) {
                org_price = pcb_price;
            }
            $("[for-group='pcb'] .original-price s").text(org_price.toFixed(2));
            //if (parseFloat(pcbOrderMoney) == 5) {
            //    $("[for-group='pcb'] .original-price s").text("10.00");
            //} else {
            //    var originalPrice1 = Math.ceil(pcbOrderMoney / 0.8);
            //    $("[for-group='pcb'] .original-price s").text(originalPrice1.toFixed(2));
            //}

        }
    }
    if (op == 4 || op == 5) {
        //贴片
        var chksmtfacory = $(".totalpricezone [for-group='pcba']").find(".DiscountPrice");
        if (chksmtfacory.length > 0) {
            var smtOrderMoney = $(chksmtfacory).text();
            if (smtOrderMoney == 0 || smtOrderMoney == "" || smtOrderMoney == "undefinded") {
                $(chksmtfacory).text("0");
            }
            smtOrderMoney = $(chksmtfacory).text();
        }
    }
    shipMoney = $("#hidShipMoney").val().replace("$", "").replace(",", "");
    if (!shipMoney) shipMoney = 0;
    //如果是美国或加拿大免首重
    var cid = $("select[name=selShipCountry]").val();
    var shipType = $(".selShip").val();
    if (shipType == 1 || shipType == 3 || shipType == 5) {
        $(".shipmoenyzone").show();
        $(".totalmoenyzone").show();
        var newprice = shipMoney - 0;
        if (newprice > 0) {
            /*$("#spShipMoeny").html("<i style='text-decoration: line-through;color: red;'>$" + (parseFloat(shipMoney) + 25) + "</i>&nbsp;$" + newprice);*/
            $("#spShipMoeny").html("$" + toDecimal2(newprice));
            shipMoney = newprice;
        } else {
            shipMoney = 0;
            $("#spShipMoeny").html("<i style='color: #02b23d;'>-</i>");
        }
        if (weight > 2 && shipType == 3) {
            shipmoney = 0;
            $("#spShipMoeny").html("<i style='color: #02b23d;'>HK Post only supports transportation within 2kg</i>");
        }
    }
    TotalOrdermoney = parseFloat(pcbOrderMoney) + parseFloat(smtOrderMoney) + parseFloat(benefitMoney) + parseFloat(shipMoney) + parseFloat(stencilOrderMoney);
    $(".FinalOrderMoney").html(toDecimal2(TotalOrdermoney));
    //当计价结果不等于5美金的时候显示
    //if ($('.FinalOrderMoney').eq(1).text() == "0.00")
    //    $(".newcustomers").show();
    //else
    //    $(".newcustomers").hide();
}
function impedance_optionFn() {
    //限制单面板不不显示阻抗
    var proCategory = $("[name=proCategory]:checked").val();
    var BoardLayers = $("[name=BoardLayers]:checked").val();
    if ((proCategory == "fr4Item" || proCategory == "rogersItem") && BoardLayers != "1") {
        //$(".impedance_option").show();
        Pcb.Checked("ImpedanceSize", "0");
    } else {
        $(".impedance_option").hide();
        Pcb.Checked("ImpedanceSize", "0");
        $(".impedance_report").hide();
    }
}
//获取checked值
function getCkVal(e) {
    return $("[name=" + e + "]:checked").val();
}
function show_imgoldthincknesszone() {
    var SurfaceFinish = $("[name=SurfaceFinish]:checked").val();
    if (SurfaceFinish == "immersiongold" || SurfaceFinish == "immersiongoldandosp" || SurfaceFinish == "haslwithfreeandimmersiongold") {
        $(".imgoldthincknesszone").show();
    } else {
        $(".imgoldthincknesszone").hide();
    }
}
//显示计价结果数量
function numRResults() {
    let numRR = 0
    $("#fixed-table .xgpp-table-cont").each(function (i) {
        if ($(this).attr('ishidden') === '0') {
            numRR++;
        }
    })
    $(".choose-result span").text(numRR);
}

function setInputBT(e) {
    e.css({ backgroundColor: '#ffe2e2' });
    setTimeout(function () {
        e.css({ backgroundColor: '#fff' });
    }, 2000)
}
function resDDays(day) {
    if (day > 0) day = day > 3 ? day + ' days' : (day * 24) + ' hours';
    else day = '';
    return day;
}

//监听PCB Assembly Quantity发生变化
function oninputAssemblyProductNum(val) {
    if (val >= Number($('#Num').val()) && getCkVal("BoardType") == "pcs") {
        if (val > Number($('#Num').val())) {
            altNotice('The PCB assembly QTY should be equal to or less than the PCB QTY.', "", "", 1, "", 0, "OK");
        }
        $("[name='ProductNum']").val(Number($('#Num').val()));
    } else if (val >= Number($('#singlePiecesQuantity>span').html()) && getCkVal("BoardType") != "pcs") {
        if (Number($('#singlePiecesQuantity>span').html()) == 0) {
            $("[name='ProductNum']").val(Number($('#Num').val()));
        } else {
            if (val > Number($('#singlePiecesQuantity>span').html())) {
                altNotice('The PCB assembly QTY should be equal to or less than the PCB QTY.', "", "", 1, "", 0, "OK");
            }
            $("[name='ProductNum']").val(Number($('#singlePiecesQuantity>span').html()));
        }
        onExpectedPrice($("[name='ProductNum']").val());
    } else {
        if (val > 0 && getCkVal("BoardType") == "pcs") {
            $("[name='ProductNum']").val(val);
        }
    }
    if (getCkVal("BoardType") == "pcs") {
        onExpectedPrice($("[name='ProductNum']").val());
        resetAiPanle(Tools.UrlToJsonParams($("#smtorderForm").serialize()), "ProductNum");
    }
    Pcb.clearPrice();
    //Pcb.PcbCalcArea();
    clearXiaoBanAi();
}
//当bordtype不是pcs绑定小板值
function updateProductNumByBordType() {

}
//Panel Quantity选中后给组装内ProductNum赋值
function AssemblyProductNum(val, bol) {
    if (getCkVal("BoardType") != "pcs") {
        $("[name='ProductNum']").val(Number($('#singlePiecesQuantity>span').html()));
    }
    else if (val > 0) {
        $("[name='ProductNum']").val(val);
    }
    oninputAssemblyProductNum(val)
}
//根据Board Type动态给PCB Design Type赋值
function AssemblyPCBDesignType() {
    var boardType = getCkVal('BoardType');
    //var part = document.getElementById("AssemblyPanelFormatDiv");
    if (boardType == "pcs") {
        Pcb.Checked("AssemblyBoardType", "pcs");
        $("[name='AssemblyBoardType'][value='pcs']").parents(".item").removeClass("not-selectable");
        $("[name='AssemblyBoardType'][value='pcs']").parents(".item").addClass("not-selectable");
        //document.getElementById("labelPanelDimensions").innerHTML = "PCB Dimension";
        //part.style.display = "none";
        $('#AssemblyPanelFormatDiv').hide();

        //$('#assemblyForm > div').css('height','390px');
        ClickPCBDesignTypePanelFormatToAssembly(boardType);
        return;
    }
    if (boardType == "set" || boardType == "jpset") {
        Pcb.Checked("AssemblyBoardType", "set");
        $("[name='AssemblyBoardType'][value='set']").parents(".item").removeClass("not-selectable");
        $("[name='AssemblyBoardType'][value='set']").parents(".item").addClass("not-selectable");
        //document.getElementById("labelPanelDimensions").innerHTML = "PCB Panel Dimension";
        //part.style.display = "block";
        $('#AssemblyPanelFormatDiv').show();
        ClickPCBDesignTypePanelFormatToAssembly(boardType);
        return;
    }
}
//根据Board Type为setjpset给Assembly的Panel Format赋值
function ClickPCBDesignTypePanelFormatToAssembly(val) {
    if (val == "jpset") {
        //document.getElementById("AssemblyPinbanx").value = Number($(".panel-width").html())
        //document.getElementById("AssemblyPinbany").value = Number($(".panel-height").html())
        document.getElementById("AssemblyPinbanx").value = document.getElementsByName("pinban_x")[0].value;
        document.getElementById("AssemblyPinbany").value = document.getElementsByName("pinban_y")[0].value;
    }
    else {
        document.getElementById("AssemblyPinbanx").value = document.getElementsByName("pinban_x")[0].value;
        document.getElementById("AssemblyPinbany").value = document.getElementsByName("pinban_y")[0].value;
    }

}
function AssemblyPCBDesignTypePanelFormatx(val) {
    document.getElementById("AssemblyPinbanx").value = val;
}
function AssemblyPCBDesignTypePanelFormaty(val) {
    document.getElementById("AssemblyPinbany").value = val;
}

function OnPinban_xInput(val) {
    AssemblyPCBDesignTypePanelFormatx(val);
}
function OnPinban_yInput(val) {
    AssemblyPCBDesignTypePanelFormaty(val);
}
//根据Panel Dimensions动态给Dimensions赋值
function AssemblyPanelDimensions() {
    if (getCkVal("BoardType") != "jpset") {
        document.getElementById("AssemblyBoardHeight").value = document.getElementById("BoardHeight").value;
        document.getElementById("AssemblyBoardWidth").value = document.getElementById("BoardWidth").value;
    }
    if (Number($('#AssemblyBoardHeight').val()) > 0 && Number($('#AssemblyBoardWidth').val()) > 0 && getCkVal('BoardType') == "pcs") {
        //Pcb.tiggerShow('xiaoban-ai', true);
        var isXiaoBan = Pcb.PcbisXiaoBanType(Tools.UrlToJsonParams($("#smtorderForm").serialize()));
        Pcb.tiggerShow('xiaoban-ai', isXiaoBan > 0);
        //$(".xiaoban-ai").css("display", "block")
    } else {
        //$(".xiaoban-ai").css("display", "none")
        Pcb.tiggerShow('xiaoban-ai', '');
    }
}
function clearXiaoBanAi() {
    Pcb.Checked('IsAIPanel', '');
    Pcb.tiggerShow('ai-panel', false);
}
//监听 Dimensions\Panel Dimensions input输入框BoardHeight
function PcbBoardHeightInput(value) {
    if (value.length > 4)
        value = value.slice(0, 5);
    clearXiaoBanAi();
    AssemblyPanelDimensions();
    return value;
}
//监听 Dimensions\Panel Dimensions input输入框 BoardWidth
function PcbBoardWidthInput(value) {
    if (value.length > 4)
        value = value.slice(0, 5);
    clearXiaoBanAi();
    AssemblyPanelDimensions();
    return value;
}
//function PcbCountNumerInput(value) {
//    console.log(1111)
//    AssemblyProductNum(value);
//    return value;
//}
function onExpectedPrice(num) {
    $(".boxExpectedPrice .closeEP").off('click');
    $(".boxExpectedPrice .closeEP").on('click', function () {
        $(".boxExpectedPrice input[name=ExpectedPrice]").val('');
        $(".boxExpectedPrice").slideUp();
    });
    if (num >= 200) $(".boxExpectedPrice").slideDown();
    else {
        $(".boxExpectedPrice input[name=ExpectedPrice]").val('');
        $(".boxExpectedPrice").slideUp();
    }
}
function resetAiPanle(data, name) {
    if (['PcbSizeX', 'PcbSizeY', 't_pinban_x', 't_pinban_y', 'pinban_x', 'pinban_y', 'BoardType', 'IsAIPanel', 'Num'].indexOf(name) > -1) {
        if (name == "BoardType") {
            AssemblyProductNum(Number($('#Num').val()));
            if (GetCheckedVal("BoardType") == "set") {
                $("[name='PcbSizeY']").val(Number($('#BoardHeight').val()));
                $("[name='PcbSizeX']").val(Number($('#BoardWidth').val()));
            } else if (GetCheckedVal("BoardType") == "jpset") {
                $("[name='PcbSizeY']").val(Number($(".panel-width").html()));
                $("[name='PcbSizeX']").val(Number($(".panel-height").html()));
            }
        }
        Pcb.PcbCalcArea();
    }
    if (['PcbSizeX', 'PcbSizeY', 'BoardType', 'ProductNum', 'IsAIPanel', 'Num'].indexOf(name) > -1) {
        var isXiaoBan = Pcb.PcbisXiaoBanType(data);
        if (isXiaoBan == 0 || !getCkVal("IsAIPanel")) {
            data.IsAIPanel = '';
            Pcb.tiggerShow('xiaoban-ai', isXiaoBan > 0);
            Pcb.Checked('IsAIPanel', '');
        } else {
            Pcb.tiggerShow('xiaoban-ai', isXiaoBan > 0);
        }
        Pcb.tiggerShow('ai-panel', data.IsAIPanel == 'true');
    }
    Pcb.clearPrice();
}