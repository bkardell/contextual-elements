(function(document) {
    var actionableTemplate = "<!-- replaced element --><button  class=\"tooltip-btn\"  aria-describedby=\"{{id}}\">{{button}}</button><!-- generated element --><button   tabindex=\"-1\"   class=\"tooltip-help-btn\"   aria-hidden=\"true\">?</button><!-- the position of the arrow is grafted in during creation/managed by code--><div  id=\"{{replaced}}-description\"  class=\"tooltip-help-message\">  <div class=\"tooltip-arrow\"></div>  <div class=\"tooltip-help-message-content\">{{replaced text}}</div></div>",
        css = "contextual-actionable > *:not(.contextual-shade) {   display: none;}.tooltip-container {  position: relative;  display: inline-block;}.tooltip-btn {  color: #333;  font-size: 13px;  font-weight: normal;  line-height: 17px;  padding: 9px 15px;  margin: 0 15px 0 0;  cursor: pointer;  display: inline-block;  box-shadow: 0 1px 1px 0 rgba(255,255,255,0.7) inset;  background-image: -webkit-linear-gradient(top, #fff 0, #ededed 100%);  background-image: linear-gradient(to bottom, #fff 0, #ededed 100%);  background-repeat: repeat-x;  background-color: #ededed;  border: 1px solid #9b9b9b;  -webkit-border-radius: 2px;  -moz-border-radius: 2px;  -ms-border-radius: 2px;  -o-border-radius: 2px;  border-radius: 2px;  text-shadow: 1px 1px 1px #fff;}.tooltip-help-btn {  background-color: #006795;  height: 16px;  width: 16px;  color: #fff;  padding: 0;  line-height: 18px;  display: inline-block;  text-align: center;  font-size: 12px;  font-weight: normal;  font-family: Roboto,arial,sans-serif;  border: 0;  -webkit-border-radius: 8px;  -moz-border-radius: 8px;  -ms-border-radius: 8px;  -o-border-radius: 8px;  border-radius: 8px;}.tooltip-help-message {  display: none;}.tooltip-btn:hover ~ .tooltip-help-message,.tooltip-btn:focus ~ .tooltip-help-message,.tooltip-help-btn:hover + .tooltip-help-message,.tooltip-help-btn + .tooltip-help-message.tooltip-active {   display: block;}/* Tooltip */.tooltip-help-message {  position: absolute;  /* top: 0; */  left: 0;  z-index: 1060;  display: none;  /*max-width: 276px;*/  width: 108%;  padding: 1px;  font-family: Arial, sans-serif;  font-size: 14px;  font-weight: normal;  line-height: 1.42857143;  text-align: left;  white-space: normal;  background-color: #fff;  -webkit-background-clip: padding-box;          background-clip: padding-box;  border: 1px solid #ccc;  border: 1px solid rgba(0, 0, 0, .2);  border-radius: 6px;  -webkit-box-shadow: 0 5px 10px rgba(0, 0, 0, .2);          box-shadow: 0 5px 10px rgba(0, 0, 0, .2);}.tooltip-help-message.top {  margin-top: -10px;}.tooltip-help-message.right {  margin-left: 10px;}.tooltip-help-message.bottom {  margin-top: 10px;}.tooltip-help-message.left {  margin-left: -10px;}.tooltip-help-message-content {  padding: 9px 14px;}.tooltip-help-message > .tooltip-arrow,.tooltip-help-message > .tooltip-arrow:after {  position: absolute;  display: block;  width: 0;  height: 0;  border-color: transparent;  border-style: solid;}.tooltip-help-message > .tooltip-arrow {  border-width: 11px;}.tooltip-help-message > .tooltip-arrow:after {  content: \"\";  border-width: 10px;}.tooltip-help-message.top > .tooltip-arrow {  bottom: -11px;  left: 50%;  margin-left: -11px;  border-top-color: #999;  border-top-color: rgba(0, 0, 0, .25);  border-bottom-width: 0;}.tooltip-help-message.top > .tooltip-arrow:after {  bottom: 1px;  margin-left: -10px;  content: \" \";  border-top-color: #fff;  border-bottom-width: 0;}.tooltip-help-message.right > .tooltip-arrow {  top: 50%;  left: -11px;  margin-top: -11px;  border-right-color: #999;  border-right-color: rgba(0, 0, 0, .25);  border-left-width: 0;}.tooltip-help-message.right > .tooltip-arrow:after {  bottom: -10px;  left: 1px;  content: \" \";  border-right-color: #fff;  border-left-width: 0;}.tooltip-help-message.bottom > .tooltip-arrow {  top: -11px;  right: 10px;  margin-left: -11px;  border-top-width: 0;  border-bottom-color: #999;  border-bottom-color: rgba(0, 0, 0, .25);}.tooltip-help-message.bottom > .tooltip-arrow:after {  top: 1px;  margin-left: -10px;  content: \" \";  border-top-width: 0;  border-bottom-color: #fff;}.tooltip-help-message.left > .tooltip-arrow {  top: 50%;  right: -11px;  margin-top: -11px;  border-right-width: 0;  border-left-color: #999;  border-left-color: rgba(0, 0, 0, .25);}.tooltip-help-message.left > .tooltip-arrow:after {  right: 1px;  bottom: -10px;  content: \" \";  border-right-width: 0;  border-left-color: #fff;}",
        lastUid = 0,
        nextUid = function() {
            return "-ce-" + (++lastUid);
        },
        find = function (scope, query) {
            return scope.querySelector("#" + scope.id + query);
        },
        sheet = document.createElement("style"),
        activeTip,
        handler = function (evt) {
            var sib = evt.target.nextElementSibling;
            if (sib && evt.target.matches(".tooltip-help-btn")) {
                if (evt.type === "focus") {
                    sib.classList.add("tooltip-active");
                } else if (evt.type === "blur") {
                    sib.classList.remove("tooltip-active");
                }
            }
        },
        touchHandler = function (evt) {
            var target = evt.targetTouches[0],
            sib = target.nextElementSibling;
            if (sib && evt.target.matches(".tooltip-help-btn")) {
                activeTip = sib;
                activeTip.classList.add("tooltip-active");
            } else {
                if (activeTip) {
                    activeTip.classList.remove("tooltip-active");
                    activeTip = null;
                }
            }
        },
        renderContextualActionable = function (ctx, shade) {
            var messageId, messageEl;
            ctx.authorButton = find(ctx, " >  button,a,input[type=button]").cloneNode(true);
            ctx.authorMessage = find(ctx, " > contextual-message").cloneNode(true);
            ctx._mutationObserver.disconnect();
            if (ctx.authorButton && ctx.authorMessage) {
                messageId = ctx.authorMessage.id || nextUid();
                ctx.authorButton.setAttribute("aria-describedby", messageId);
                ctx.authorButton.classList.add("tooltip-btn");
                shade.innerHTML = actionableTemplate;
                shade.replaceChild(ctx.authorButton, shade.firstElementChild);
                messageEl = shade.querySelector(".tooltip-help-message");
                messageEl.id = messageId;
                messageEl.classList.add(ctx.getAttribute("data-placement") || "bottom");
                shade.querySelector(".tooltip-help-message-content").innerHTML = ctx.authorMessage.innerHTML;
            } else {
                console.error("The firstElementChild of contextual-actionable must be a link or button and it must contain a contextual-message");
            }
            ctx._mutationObserver.observe(ctx, observerConfig);
        },
        observerConfig = { childList: true, subtree: true, characterData: true };

    document.addEventListener("DOMContentLoaded", function () {
        document.body.addEventListener("focus", handler, true);
        document.body.addEventListener("blur", handler, true);
        document.body.addEventListener("touchstart", touchHandler, true);
    }, false);

    sheet.innerHTML = css;
    document.head.appendChild(sheet);
    document.registerElement(
        "contextual-actionable", {
            prototype: Object.create(
                HTMLElement.prototype, {
                    createdCallback: {
                        value: function() {
                            var shade, self=this;
                            this.id = this.id || nextUid();
                            shade = find(this, " > .contextual-shade");
                            if (!shade){
                                shade = document.createElement("div");
                                this.insertBefore(shade, this.firstElementChild);
                                shade.classList.add("contextual-shade");
                            } else {
                                shade.innerHTML = "";
                            }
                            shade.classList.add("tooltip-container");
                            if (!this._mutationObserver) {
                                this._mutationObserver = new MutationObserver(function () {
                                    renderContextualActionable(self, shade);
                                });
                            }
                            renderContextualActionable(this, shade);
                        }
                    }
                })
            });

}(document));
