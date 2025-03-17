(function(exports) {

"use strict";

//#region plugins/MessageClickActions/index.js
const { plugin: { store }, flux: { dispatcher, stores: { MessageStore, UserStore, PermissionStore, ChannelStore, SelectedChannelStore } }, observeDom, http } = shelter;
const { getChannel } = ChannelStore;
const { getChannelId } = SelectedChannelStore;
const getCurrentChannel = () => getChannel(getChannelId());
const dontReplyStore = new Set();
let activeChannel = getChannelId();
let replyingToMessage = undefined;
let QRSymbol = Symbol("quickreply_deletePendingReply_int");
let backspace = false;
async function keyDown(keyevent) {
	if (keyevent.key !== "Backspace") return;
	backspace = true;
}
async function keyUp(keyevent) {
	if (keyevent.key !== "Backspace") return;
	backspace = false;
}
function scrollToReplyingMsg() {
	if (!store.scroll) return;
	const messageContainer = document.querySelector("[data-list-id=\"chat-messages\"]");
	const replyingMsg = Array.from(messageContainer.children).find((elem) => elem.firstElementChild?.className?.includes("replying_"));
	replyingMsg?.scrollIntoView({
		behavior: store.scrollSmooth ? "smooth" : undefined,
		block: "center"
	});
}
function channelSelect(data) {
	if (activeChannel !== data.channelId) activeChannel = data.channelId;
}
function createPendingReply(channel, message, shouldMention, showMentionToggle) {
	if (typeof showMentionToggle === "undefined") showMentionToggle = channel.guild_id !== null;
	dispatcher.dispatch({
		type: "CREATE_PENDING_REPLY",
		channel,
		message,
		shouldMention: shouldMention && message.author.id !== UserStore.getCurrentUser().id,
		showMentionToggle
	});
	setTimeout(scrollToReplyingMsg, 100);
}
function deletePendingReply(data) {
	dispatcher.dispatch({
		type: "DELETE_PENDING_REPLY",
		channelId: getChannelId(),
		...data
	});
}
function onCreatePendingReply(data) {
	replyingToMessage = data.message.id;
}
function onDeletePendingReply(data) {
	replyingToMessage = undefined;
}
function MCA(e) {
	const messageEl = e.target.closest(`li[id^="chat-messages"]`);
	if (!messageEl) return;
	const [channelId, id] = messageEl.id.split("-").slice(2);
	if (!channelId || !id) return;
	const message = MessageStore.getMessage(channelId, id);
	if (!message) return;
	const currentUserId = UserStore.getCurrentUser().id;
	if (!backspace) {
		if (e.detail < 2) return;
		if (getCurrentChannel().guild_id && !shelter.flux.stores.PermissionStore.can(2048n, getCurrentChannel())) return;
		if (message.deleted === true) return;
		if (message.author.id !== currentUserId) {
			deletePendingReply({ [QRSymbol]: true });
			createPendingReply(getCurrentChannel(), message, !dontReplyStore.has(getChannelId()));
		} else if (!shelter.flux.stores.EditMessageStore.isEditing(channelId, message.id)) {
			deletePendingReply({ [QRSymbol]: true });
			dispatcher.dispatch({
				type: "MESSAGE_START_EDIT",
				channelId,
				messageId: message.id,
				content: message.content
			});
			e.preventDefault();
		}
	} else {
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
}
function onDispatch(payload) {
	if (payload.type !== "MESSAGE_CREATE" && payload.type !== "LOAD_MESSAGES_SUCCESS") return;
	const unObserve = observeDom(`li[id^="chat-messages"]`, (element) => {
		element.addEventListener("click", MCA);
	});
	setTimeout(unObserve, 500);
}
function onMentionChange({ channelId, shouldMention }) {
	if (shouldMention) dontReplyStore.delete(channelId);
else dontReplyStore.add(channelId);
}
function onLoad() {
	dispatcher.subscribe("MESSAGE_CREATE", onDispatch);
	dispatcher.subscribe("LOAD_MESSAGES_SUCCESS", onDispatch);
	document.addEventListener("click", MCA);
	window.addEventListener("keydown", keyDown);
	window.addEventListener("keyup", keyUp);
	dispatcher.subscribe("CHANNEL_SELECT", channelSelect);
	dispatcher.subscribe("CREATE_PENDING_REPLY", onCreatePendingReply);
	dispatcher.subscribe("DELETE_PENDING_REPLY", onDeletePendingReply);
	dispatcher.subscribe("SET_PENDING_REPLY_SHOULD_MENTION", onMentionChange);
}
function onUnload() {
	dispatcher.unsubscribe("MESSAGE_CREATE", onDispatch);
	dispatcher.unsubscribe("LOAD_MESSAGES_SUCCESS", onDispatch);
	document.removeEventListener("click", MCA);
	window.removeEventListener("keydown", keyDown);
	window.removeEventListener("keyup", keyUp);
	dispatcher.unsubscribe("CHANNEL_SELECT", channelSelect);
	dispatcher.unsubscribe("CREATE_PENDING_REPLY", onCreatePendingReply);
	dispatcher.unsubscribe("DELETE_PENDING_REPLY", onDeletePendingReply);
	dispatcher.unsubscribe("SET_PENDING_REPLY_SHOULD_MENTION", onMentionChange);
	const messageElements = document.querySelectorAll(`li[id^="chat-messages"]`);
	messageElements.forEach((element) => {
		element.removeEventListener("click", MCA);
	});
}

//#endregion
exports.onLoad = onLoad
exports.onUnload = onUnload
return exports;
})({});