(function(exports) {

//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion

//#region solid-js/web
var require_web = __commonJS({ "solid-js/web"(exports, module) {
	module.exports = shelter.solidWeb;
} });

//#endregion
//#region plugins/meow/index.tsx
var import_web = __toESM(require_web(), 1);
var import_web$1 = __toESM(require_web(), 1);
var import_web$2 = __toESM(require_web(), 1);
var import_web$3 = __toESM(require_web(), 1);
var import_web$4 = __toESM(require_web(), 1);
var import_web$5 = __toESM(require_web(), 1);
var import_web$6 = __toESM(require_web(), 1);
var import_web$7 = __toESM(require_web(), 1);
var import_web$8 = __toESM(require_web(), 1);
const _tmpl$ = /*#__PURE__*/ (0, import_web.template)(`<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 576 512" id="meow-icon" fill="#cba6f7"><path d="M320 192h17.1c22.1 38.3 63.5 64 110.9 64c11 0 21.8-1.4 32-4v228c0 17.7-14.3 32-32 32s-32-14.3-32-32V339.2L280 448h56c17.7 0 32 14.3 32 32s-14.3 32-32 32H192c-53 0-96-43-96-96V192.5c0-16.1-12-29.8-28-31.8l-7.9-1c-17.5-2.2-30-18.2-27.8-35.7S50.5 94 68 96.2l7.9 1c48 6 84.1 46.8 84.1 95.3v85.3c34.4-51.7 93.2-85.8 160-85.8m160 26.5c-10 3.5-20.8 5.5-32 5.5c-28.4 0-54-12.4-71.6-32c-3.7-4.1-7-8.5-9.9-13.2C357.3 164 352 146.6 352 128V10.7C352 4.8 356.7.1 362.6 0h.2c3.3 0 6.4 1.6 8.4 4.2v.1l12.8 17l27.2 36.3L416 64h64l4.8-6.4L512 21.3l12.8-17v-.1c2-2.6 5.1-4.2 8.4-4.2h.2c5.9.1 10.6 4.8 10.6 10.7V128c0 17.3-4.6 33.6-12.6 47.6c-11.3 19.8-29.6 35.2-51.4 42.9M432 128a16 16 0 1 0-32 0a16 16 0 1 0 32 0m48 16a16 16 0 1 0 0-32a16 16 0 1 0 0 32"></path></svg>`, 4), _tmpl$2 = /*#__PURE__*/ (0, import_web.template)(`<div id="meow-icon"></div>`, 2);
const { flux: { dispatcher, stores: { UserStore, PermissionStore, ChannelStore, SelectedChannelStore } }, plugin: { store }, observeDom, util: { getFiber }, ui: { injectCss, Button, TextArea, ButtonLooks, tooltip }, solid: { createSignal } } = shelter;
let css = `
.meowContainer {
    display: flex;
    align-items: center;
    justify-content: center; 

    cursor: pointer;

    /* We have to apply to the SVG because Discord hits us with a !important */
    svg path {
        fill: var(--interactive-normal) !important;
    }

    &.notShowing svg path {
        fill: var(--status-danger) !important;
    }
}

.meowContainer svg {
  height: 100%;
  width: 100%;
}

#meow-icon{
    display: flex;
    align-items: center;
}`;
let injectedCss = false;
if (!injectedCss) {
	injectedCss = true;
	injectCss(css);
}
const appendTextToMessagebar = (text) => {
	const elem = document.querySelector("[class*=\"slateContainer\"]");
	const fiber = getFiber(elem);
	const editor = fiber.child.pendingProps.editor;
	editor.insertText(text);
};
const { getChannel } = ChannelStore;
const { getChannelId } = SelectedChannelStore;
const getCurrentChannel = () => getChannel(getChannelId());
let activeChannel = getChannelId();
const meowSvg = (0, import_web$8.getNextElement)(_tmpl$);
async function meow() {
	if (!shelter.flux.stores.PermissionStore.can(2048n, getCurrentChannel())) return;
else {
		appendTextToMessagebar("meow");
		return;
	}
}
const unobserve = observeDom("[class^=\"channelTextArea\"] [class^=\"buttons\"]", (node) => {
	if (document.querySelector("#meow-icon")) return;
	const meowIcon = (() => {
		const _el$2 = (0, import_web$8.getNextElement)(_tmpl$2);
		(0, import_web$6.use)(tooltip, _el$2, () => "meow :3");
		(0, import_web$7.addEventListener)(_el$2, "click", meow(), true);
		(0, import_web$5.insert)(_el$2, meowSvg);
		(0, import_web$3.effect)(() => (0, import_web$2.className)(_el$2, css.meowContainer));
		(0, import_web$4.runHydrationEvents)();
		return _el$2;
	})();
	node.prepend(meowIcon);
});
function onLoad() {
	injectCss(css);
	console.log("Meow loaded");
}
function onUnload() {
	console.log("Meow unloaded");
	unobserve();
	const meowIcon = document.querySelector("#meow-icon");
	if (meowIcon) meowIcon.remove();
}
(0, import_web$1.delegateEvents)(["click"]);

//#endregion
exports.onLoad = onLoad
exports.onUnload = onUnload
return exports;
})({});