(function(exports) {

"use strict";

//#region plugins/meow/index.js
const { flux: { dispatcher, stores: { UserStore, PermissionStore, ChannelStore, SelectedChannelStore } }, plugin: { store }, observeDom } = shelter;
const { getChannel } = ChannelStore;
const { getChannelId } = SelectedChannelStore;
let activeChannel = getChannelId();
function onLoad() {
	console.log("Meow loaded");
}
function onUnload() {
	console.log("Meow unloaded");
}

//#endregion
exports.onLoad = onLoad
exports.onUnload = onUnload
return exports;
})({});