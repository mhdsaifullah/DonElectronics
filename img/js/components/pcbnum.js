layui.define(['layer', 'laytpl'], function (exports) {
    // do something
    layui.link('DonElectronics/img/css/components/pcbnum.css');
    var laytpl = layui.laytpl;
    var layer = layui.layer;
    function getNums() {
        let result = [5, 10, 15, 20, 25, 30, 50, 75, 100, 125, 150, 200];
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
    }

    function getTemplate(data) {
        return laytpl(`
        <ul>
        {{#  layui.each(d.nums, function(index, item){ }}
        <li><label><input type="radio" name="{{d.name}}" value="{{item}}">{{item}}</label></li>
{{#  }); }}
        </ul>
        <div class="boardnumberbtn">
            Other Quantity：
            <input  min="10"  type="text" name="txtSelNum"  id="{{d.input.id||''}}" class="txt-input txtSelNum" >
            <a class="ml5 set-input-num"><input type="button" value="Submit" ></a>
            <a class="ml5 close-cancel"><input type="button" value="Cancel" ></a>
            <br>
            <span class="f12 cl-f90 pcbnum-msg">({{d.msg}}.)</span>
        </div>
        `).render(data);
    }

    function submitInput() {
        var num = Number(this.$dom.find('input.txtSelNum').val());
        var $dom = this.$dom;
        var options = this.opt;
        var multipleNum = options.multipleNum();

        //当工厂选择“ALLPCB”时，数量自定义框不做任何限制
        var factorySelected = $("#FactorySelect option:selected");
        var selectedTxt = factorySelected.text();
        var selectedVal = factorySelected.val();
        if (selectedTxt.toUpperCase() != 'ALLPCB' || selectedVal!='9') {
            if (options.nums.indexOf(num) < 0) {
                if (num <= 0 || num % multipleNum != 0) {
                    layer.msg(options.msg, {
                        skin: 'layui-layer-hui'
                    });
                    return false;
                }
            }
        }    
        $dom.find(`li input[name=${options.name}]:checked`).prop("checked", false)
        $dom.find(`li input[name=${options.name}][value=${num}]`).prop("checked", true)
        options.on.apply(this, ['setValue', num]);
        $(this.opt.for).val(num)

        CloseSelectNumDiv.apply(this);
    }

    function CloseSelectNumDiv() {
        var $dom = this.$dom;
        $dom.hide();
        $(this.opt.for).css({ border: "" });
        this.opt.on.apply(this, ['hide']);
    }
    //base
    function PcbNum(opt, $dom) {
        this.opt = opt;
        this.$dom = $dom;
        this.$for = $(this.opt.for);
        var that = this;
        /** 初始化 */
        this.init = function () {
            //$dom.hide();
            $dom.html(getTemplate(opt));
            //事件绑定
            $dom.find('input.txtSelNum').on('input', function () {
                this.value = this.value.replace(/[^\d]/g, '');
                opt.on.apply(that, ['input', this.value]);
            });
            //提交
            $dom.find('.set-input-num').on('click', function () {
                opt.on.apply(that, ['SubmitInputNum']);
            });
            //取消
            $dom.find('.close-cancel').on('click', function () {
                opt.on.apply(that, ['Cancel']);
            });
            let isHide = true;
            function show() {
                isHide = false;
                $dom.show();
                that.opt.on.apply(that, ['show']);
                that.$for.css({ borderBottom: "1px solid #eee" });
            }
            function hide() {
                isHide = true;
                setTimeout(function () {
                    if (isHide) {
                        CloseSelectNumDiv.apply(that);
                    }
                }, 200)
            }

            $dom.hover(show, hide);
            that.$for.hover(show, hide);
            that.$for.on('click', show);

            $dom.find(":radio[name='" + opt.name + "']").on('click', function () {
                let val = $(this).val();
                $dom.hide();
                opt.on.apply(that, ['setValue', val]);
                that.$for.val(val);
            });
        }

        /** 重新渲染msg */
        this.reRenderMsg = function (msg) {
            if (msg) {
                opt.msg = msg;
            }
            else {
                var t = getLanguage('qty20240130');
                if (opt.msg.startsWith(t)) {
                    opt.msg = t + opt.multipleNum();
                }
            }
            $dom.find('.pcbnum-msg').html(opt.msg)
        };
        this.setValue = function (val) {
            var num = Number(val);
            var options = this.opt;
            $dom.find(`li input[name=${options.name}]:checked`).prop("checked", false);
            var nums = options.nums;
            var baseNum = options.multipleNum();
            if (nums.indexOf(num) < 0) {
                if (num % baseNum != 0) {
                    //当工厂选择“ALLPCB”时，数量自定义框不做任何限制
                    var factorySelected = $("#FactorySelect option:selected");
                    var selectedTxt = factorySelected.text();
                    var selectedVal = factorySelected.val();
                    if (selectedTxt.toUpperCase() != 'ALLPCB' || selectedVal != '9')
                    {
                        if (num > baseNum) {
                            num = Math.ceil(num / baseNum) * baseNum;
                        }
                        else {
                            //找列表最接近的大一号的值
                            nums.some(function (value, index) {
                                if (value >= num) {//比这个值大或者最后一项跳出
                                    num = value;
                                    return true;
                                }
                                return false;
                            });
                        }

                    }
                    
                }
                else {
                    $dom.find('input.txtSelNum').val(num);
                }
            }
            $dom.find(`li input[name=${options.name}][value=${num}]`).prop("checked", true)
            opt.on.apply(that, ['setValue', num]);
            that.$for.val(num);
        }
    }


    function getMultipleNum() {
        var BoardLayers = 2;
        if ($('#hidLayers').length > 0) {
            BoardLayers = $('#hidLayers').val();
        }
        else if (typeof (Pcb) != 'undefined' && Pcb.getFormData) {
            BoardLayers = Pcb.getFormData().BoardLayers;
        }
        else {
            BoardLayers = $('[name=BoardLayers]').val();
        }
        if (!isNaN(BoardLayers) && Number(BoardLayers) >= 6) {
            return 10;
        }
        return 100;
    }

    // 输出 demo 模块
    exports('pcbnum', {
        render: function (options) {
            let opt = $.extend({
                el: '#divSelNum',//div
                for: '#num',//关联的input
                nums: getNums(),
                name: 'countNumer',
                input: {
                    id: 'txtSelNum'
                },
                multipleNum: getMultipleNum,
                msg: null,
                on: function (eventName, data) {
                    //SubmitInputNum、Cancel、setValue、input
                    switch (eventName) {
                        case 'SubmitInputNum': this.opt.onSubmitInput.apply(this, [data]); break;
                        case 'Cancel': this.opt.onClose.apply(this, []); break;
                        case 'setValue': typeof (this.opt.onSetValue) == 'function' && this.opt.onSetValue.apply(this, [data]); break;
                        case 'show': typeof (this.opt.onShow) == 'function' && this.opt.onShow.apply(this); break;
                        case 'hide': typeof (this.opt.onHide) == 'function' && this.opt.onHide.apply(this); break;
                    }
                },
                onSubmitInput: submitInput,
                onClose: CloseSelectNumDiv,
                onSetValue: null,
                onShow: null,
                onHide: null,
            }, options);
            if (!opt.msg) {
                opt.msg = getLanguage('qty20240130') + opt.multipleNum();
            }

            var $dom = $(opt.el);

            let result = new PcbNum(opt, $dom);
            result.init();

            return result;
        },

        getMultipleNum: getMultipleNum

    });
});
//layui.extend({
//    PcbNum: '{/}/img/js/components/pcbnum' // 开头特定符 {/} 即代表采用单独路径
//});
