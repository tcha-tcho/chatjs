// Activate debug to see some useful logs.
xRTML.Config.debug = true;

xRTML.load(function () {
    // At this point, since xRTML is ready, we need to create a connection in order to send messages.
    // To do that we use method "create" of the ConnectionManager module.
    // For more information about the criation of connections and channels visit http://docs.xrtml.org/3-0-0/javascript/xrtml.connectionmanager.htm
    xRTML.ConnectionManager.create({
        // The id of the connection we are about to create.
        id: "myConnection",
        // URL of the ORTC server.
        url: 'http://ortc-developers.realtime.co/server/2.1',
        // The application key you receive when you registered in our site.
        appKey: 'Oe02ud',
        // An authentication token.
        authToken: '3392c192a09842fbbc9f4654beef1a93',
        // The array of channels you want to subscribe.        
        // If we do not subscribe any channel, by opening the console we can see that the messages are only sent.        
        channels: [{name: 'myChannel'}]
    });
    
    // Then we create a Shoutbox tag.    
    // For more information about the Shoutbox tag visit http://docs.xrtml.org/3-0-0/javascript/xrtml.tags.shoutbox.htm
    xRTML.TagManager.create({
        name: 'Shoutbox',
        // id: "myShoutBox",
        // The connections and the channel to send the messages.
        connections: ['myConnection'],                                
        channelId: "myChannel",
        // The trigger of the Shoutbox.
        triggers: ['myTrigger'],
        // The target where the Shoutbox elements will be rendered.
        target: "#myShoutboxContainer"
    });
});









/*
 * This adapter is not finished yet, please dont use it under a production environment
 * To use this adapter you should include http://code.xrtml.org/xrtml-3.0.0.js
 */

/* To use this adapter use the following code

$(document).ready(function(){
            

        var user = {
            Id: "web",
            Name: 'Web',
            ProfilePictureUrl: 'http://static.wixet.com/images/avatar.png'
        };
                
        
        $.chat({
            // your user information
            user: user,
            // text displayed when the other user is typing
            typingText: ' is typing...',
            // the title for the user's list window
            titleText: 'XMPP chat',
            // text displayed when there's no other users in the room
            emptyRoomText: "What loneliest place",
            // the adapter you are using
            adapter: new XMPPAdapter(user.Id, "xmpp.wixet.com", "Web", 123456)
        });
});
*/
 
function XMPPAdapter(user, host, resource, password) {
    /// <summary>
    /// Adapter XMPP para ChatJs. In order to use this adapter.. Pass an instance of this 
    /// function to $.chat()
    /// </summary>
    this.userId = user;
    this.host = host;
    this.resource = resource;
    this.password = password;
}

XMPPAdapter.prototype = {
    userId: 0,
    resource: "Chat",
    host: "",
    password: "",
    init: function (chat) {
/* Local messages for  history */
 var messages = [];
 var url ="/http-bind";
 
 /* Single string for jid may be used in the future */
 $.xmpp.connect({url:url, jid: this.userId+"@"+this.host, password: this.password,
                    onConnect: function(){
                        $.xmpp.setPresence(null);
                        chat.onReady();
                        console.log("Connected")
                    },
                    onPresence: function(presence){
                        
                        /*
                         * TODO: Call chat.client.usersListChanged(usersList);
                         */
                    
                    },
                    onDisconnect: function(){
                        /*
                         * TODO: Do stuff when disconnect
                         */
                        alert("Disconnected");
                    },
                    onMessage: function(message){
                          var id = message.from.split("@");
                          var msg = {
                                UserFrom:{
                                    Id: id[0],
                                    Name: id[0],
                                    // TODO: Profile picture is provided when user vcard is received
                                    ProfilePictureUrl: "http://static.wixet.com/images/user.png",
                                },
                                Message: message.body
                        }
                        
                        /* An array for every chat */
                        if(messages[id[0]] == null)
                            messages[id[0]] = []
                        messages[id[0]].push(msg)
                        chat.client.sendMessage(msg);
                        
                    },onError:function(error){
                        /*
                         * TODO: Do stuff when error
                         */
                        alert(error.error);
                    }
                }); 
        var _this = this;
   
/*
 * TODO: implement this event in the xmpp library
        _this.hub.client.sendTypingSignal = function (otherUser) {
            chat.client.sendTypingSignal(otherUser);
        };

     
*/
/*
 For testing reasons, removed in the future
         setTimeout(function(){
            var usersList = [
                {
                    Id: "prueba",
                    Status: 1,
                    Name: "prueba"
                }
            ]
            chat.client.usersListChanged(usersList);
        },1000);
*/

        
        // These are the methods that ARE CALLED BY THE CLIENT
        // Client functions should call these functions
        _this.server = new Object();

        _this.server.sendMessage = function (otherUserId, messageText, clientGuid, done) {
            /// <summary>Sends a message to server</summary>
            /// <param name="otherUserId" type="Number">The id of the user to which the message is being sent</param>
            /// <param name="messageText" type="String">Message text</param>
            /// <param name="clientGuid" type="String">Message client guid. Each message must have a client id in order for it to be recognized when it comes back from the server</param>
            /// <param name="done" type="Function">Function to be called when this method completes</param>
            
            // Save message in local history
            if(messages[otherUserId] == null)
                messages[otherUserId] = []
            
            messages[otherUserId].push({
                UserFrom:{
                    Id: _this.userId,
                    Name: otherUserId,
                },
                Message: messageText
            })
            
            
            // Send message to the server
            $.xmpp.sendMessage({body: messageText, to: otherUserId+"@"+_this.host, resource:_this.resource}, function(data){
                chat.client.sendMessage({
                UserFrom:{
                    Id: otherUserId,
                    Name: otherUserId,
                },
                Message: messageText,
                ClientGuid: clientGuid
            });
            });
            
        };

        _this.server.sendTypingSignal = function (otherUserId, done) {
            /// <summary>Sends a typing signal to the server</summary>
            /// <param name="otherUserId" type="Number">The id of the user to which the typing signal is being sent</param>
            /// <param name="done" type="Function">Function to be called when this method completes</param>
            
            //TODO
        };

        _this.server.getMessageHistory = function (otherUserId, done) {
            //Create local history
            if(messages[otherUserId] == null)
                messages[otherUserId] = []
                
            done(messages[otherUserId]);
        };

        _this.server.getUserInfo = function (otherUserId, done) {
            /// <summary>Gets information about the user</summary>
            /// <param name="otherUserId" type="Number">The id of the user from which you want the information</param>
            /// <param name="done" type="Function">FUnction to be called when this method completes</param>
            //TODO request vcard
            done();
            /*done({
                Id: "prueba",
                Name: "prueba",
                ProfilePictureUrl: "http://static.wixet.com/images/avatar.png"
            });*/
        };

        
        
        
    }
} 
