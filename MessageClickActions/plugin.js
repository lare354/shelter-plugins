(function(exports) {

"use strict";

//#region plugins/MessageClickActions/index.js
const { flux: { dispatcher, stores: { MessageStore, UserStore, PermissionStore, PermissionBits, ChannelStore, SelectedChannelStore } }, observeDom, http } = shelter;
const { getChannel } = ChannelStore;
const { getChannelId } = SelectedChannelStore;
const getCurrentChannel = () => getChannel(getChannelId());
let backspace = false;
async function keyDown(keyevent) {
	if (keyevent.key !== "Backspace") return;
else backspace = true;
	console.log("backspace is set to True");
}
async function keyUp(keyevent) {
	if (keyevent.key !== "Backspace") return;
else backspace = false;
	console.log("backspace is set to False");
}
function deleteMessage(e) {
	if (!backspace) return;
	const messageEl = e.target.closest(`li[id^="chat-messages"]`);
	if (!messageEl) return;
	const [channelId, id] = messageEl.id.split("-").slice(2);
	if (!channelId || !id) return;
	const message = MessageStore.getMessage(channelId, id);
	if (!message) return;
	const currentUserId = UserStore.getCurrentUser().id;
	if (message.author.id !== currentUserId) {
		const hasPermission = shelter.flux.stores.PermissionStore.can(8192n, getCurrentChannel());
		if (!hasPermission) {
			console.log("Cannot delete message");
			return;
		}
	}
	dispatcher.dispatch({
		type: "MESSAGE_DELETE",
		id,
		channelId
	});
	http.del(`/channels/${channelId}/messages/${id}`).then(() => console.log("Message deleted successfully")).catch((err) => console.error("Failed to delete message:", err));
	e.preventDefault();
}
function onDispatch(payload) {
	if (payload.type !== "MESSAGE_CREATE" && payload.type !== "LOAD_MESSAGES_SUCCESS") return;
	const unObserve = observeDom(`li[id^="chat-messages"]`, (element) => {
		element.addEventListener("click", deleteMessage);
	});
	setTimeout(unObserve, 500);
}
function onLoad() {
	console.log("MessageClickActions plugin loaded");
	dispatcher.subscribe("MESSAGE_CREATE", onDispatch);
	dispatcher.subscribe("LOAD_MESSAGES_SUCCESS", onDispatch);
	document.addEventListener("click", deleteMessage);
	window.addEventListener("keydown", keyDown);
	window.addEventListener("keyup", keyUp);
}
function onUnload() {
	console.log("MessageClickActions plugin unloaded");
	dispatcher.unsubscribe("MESSAGE_CREATE", onDispatch);
	dispatcher.unsubscribe("LOAD_MESSAGES_SUCCESS", onDispatch);
	document.removeEventListener("click", deleteMessage);
	window.removeEventListener("keydown", keyDown);
	window.removeEventListener("keyup", keyUp);
	const messageElements = document.querySelectorAll(`li[id^="chat-messages"]`);
	messageElements.forEach((element) => {
		element.removeEventListener("click", deleteMessage);
	});
}

//#endregion
exports.onLoad = onLoad
exports.onUnload = onUnload
return exports;
})({});