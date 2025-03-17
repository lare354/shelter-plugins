const {
    plugin: { store },
    flux: { 
        dispatcher, 
        stores: { MessageStore, UserStore, PermissionStore, ChannelStore, SelectedChannelStore },
    },
    observeDom,
    http,
} = shelter;

// used to get channel object with getCurrentChannel()
const { getChannel } = ChannelStore;
const { getChannelId } = SelectedChannelStore;
const getCurrentChannel = () => getChannel(getChannelId());

const dontReplyStore = new Set();

let activeChannel = getChannelId();
let replyingToMessage = undefined;
let QRSymbol = Symbol("quickreply_deletePendingReply_int");

let clicks = 0;

// sets backspace value depending on if it is currently pressed or not
let backspace = false; 
async function keyDown(keyevent) {
    if (keyevent.key !== "Backspace") return;

    backspace = true;
    //console.log("backspace is set to True");
};

async function keyUp(keyevent) {
    if (keyevent.key !== "Backspace") return;

    backspace = false;
    //console.log("backspace is set to False");
};


function scrollToReplyingMsg() {
	if (!store.scroll) return;

	const messageContainer = document.querySelector(
		'[data-list-id="chat-messages"]',
	);
	const replyingMsg = Array.from(messageContainer.children).find((elem) =>
		elem.firstElementChild?.className?.includes("replying_"),
	);

	replyingMsg?.scrollIntoView({
		behavior: store.scrollSmooth ? "smooth" : undefined,
		block: "center",
	});
}

function channelSelect(data) {
	if (activeChannel !== data.channelId) {
		activeChannel = data.channelId;
	}
}

function createPendingReply(
	channel,
	message,
	shouldMention,
	showMentionToggle,
) {
	if (typeof showMentionToggle === "undefined")
		showMentionToggle = channel.guild_id !== null; // DM channel showMentionToggle = false

	dispatcher.dispatch({
		type: "CREATE_PENDING_REPLY",
		channel,
		message,
		shouldMention:
			shouldMention &&
			message.author.id !== UserStore.getCurrentUser().id,
		showMentionToggle,
	});

	setTimeout(scrollToReplyingMsg, 100);
}

function deletePendingReply(data) {
	dispatcher.dispatch({
		type: "DELETE_PENDING_REPLY",
		channelId: getChannelId(),
		...data,
	});
}


function onCreatePendingReply(data) {
	replyingToMessage = data.message.id;
}

function onDeletePendingReply(data) {
	replyingToMessage = undefined;
}


function MCA(e) {
    
    // Find closest message element
    const messageEl = e.target.closest(`li[id^="chat-messages"]`);
    if (!messageEl) return;

    // Extract channel and message ID from element
    const [channelId, id] = messageEl.id.split("-").slice(2);
    if (!channelId || !id) return;

    // Get the message from the MessageStore
    const message = MessageStore.getMessage(channelId, id);
    if (!message) return;
    
    const currentUserId = UserStore.getCurrentUser().id;
    
    // Check if backspace is pressed
    if (!backspace) {

        if (e.detail < 2) return;

        // if message is sent by user, edit. else reply
        if(getCurrentChannel().guild_id && !shelter.flux.stores.PermissionStore.can(2048n, getCurrentChannel())) return;
        if(message.deleted === true) return;
        
        if(message.author.id !== currentUserId) {
            deletePendingReply({
            	[QRSymbol]: true,
            });
            createPendingReply(
            	getCurrentChannel(),
            	message,
            	!dontReplyStore.has(getChannelId()),
            );
        }
        
        else if ( !EditMessageStore.isEditing(channelId, message.id)){
            dispatcher.dispatch({
                type: "MESSAGE_START_EDIT",
                channelId: channelId,
                messageId: message.id,
                content: message.content,
            });
            e.preventDefault();  
        }
    }    


    else {
        if (message.author.id !== currentUserId) {

            // 8192 === MANAGE_MESSAGES (https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags)
            // Checks if user has permission to delete messages in current channel
            const hasPermission = shelter.flux.stores.PermissionStore.can(8192n, getCurrentChannel());
            if (!hasPermission) {
                console.log("Cannot delete message");
                return;
            }
        }  

        // Send a dispatch DELETE request for the message
        dispatcher.dispatch({
            type: "MESSAGE_DELETE",
            id,
            channelId,
        });

        // Send a DELETE request to delete the message
        http.del(`/channels/${channelId}/messages/${id}`)
            .then(() => console.log("Message deleted successfully"))
            .catch((err) => console.error("Failed to delete message:", err));

        e.preventDefault();
    }
}


function onDispatch(payload) {
    // Ignore events that are not relevant
    if (payload.type !== "MESSAGE_CREATE" && payload.type !== "LOAD_MESSAGES_SUCCESS") return;

    // Observe the DOM for message elements and attach click listeners
    const unObserve = observeDom(`li[id^="chat-messages"]`, (element) => {
        element.addEventListener("click", MCA);
    });

    // Clean up after 500ms to avoid memory leaks
    setTimeout(unObserve, 500);
}

function onMentionChange({ channelId, shouldMention }) {
	if (shouldMention) dontReplyStore.delete(channelId);
	else dontReplyStore.add(channelId);
}

export function onLoad() {
    // Subscribe to relevant Flux events
    dispatcher.subscribe("MESSAGE_CREATE", onDispatch);
    dispatcher.subscribe("LOAD_MESSAGES_SUCCESS", onDispatch);

    // Add a click listener
    document.addEventListener("click", MCA);

    // Add keylisteners
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    dispatcher.subscribe("CHANNEL_SELECT", channelSelect);
    dispatcher.subscribe("CREATE_PENDING_REPLY", onCreatePendingReply);
    dispatcher.subscribe("DELETE_PENDING_REPLY", onDeletePendingReply);
	dispatcher.subscribe("SET_PENDING_REPLY_SHOULD_MENTION", onMentionChange);
}

export function onUnload() {
    // Unsubscribe from Flux events
    dispatcher.unsubscribe("MESSAGE_CREATE", onDispatch);
    dispatcher.unsubscribe("LOAD_MESSAGES_SUCCESS", onDispatch);

    // Remove click listener
    document.removeEventListener("click", MCA);

    // Remove keylisteners
    window.removeEventListener("keydown", keyDown);
    window.removeEventListener("keyup", keyUp);


	dispatcher.unsubscribe("CHANNEL_SELECT", channelSelect);
    dispatcher.unsubscribe("CREATE_PENDING_REPLY", onCreatePendingReply);
    dispatcher.unsubscribe("DELETE_PENDING_REPLY", onDeletePendingReply);
	dispatcher.unsubscribe("SET_PENDING_REPLY_SHOULD_MENTION", onMentionChange);

    // Clean up any remaining event listeners
    const messageElements = document.querySelectorAll(`li[id^="chat-messages"]`);
    messageElements.forEach((element) => {
        element.removeEventListener("click", MCA);
    });
}
