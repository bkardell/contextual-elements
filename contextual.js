(function(document) {
    var actionableTemplate = "$::contextual-actionable-template-frag.html$",
        css = "$::contextual.css$",
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
            if (activeTip) {
                activeTip.classList.remove("tooltip-active");
                activeTip = null;
            }
            if (sib && evt.target.matches(".tooltip-help-btn")) {
                activeTip = sib;
                activeTip.classList.add("tooltip-active");
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
