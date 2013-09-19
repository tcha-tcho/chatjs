// Activate debug to see some useful logs.









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
            adapter: new XRTMLAdapter(user.Id, "xmpp.wixet.com", "Web", YourAppKey, YourauthToken)
        });
});
*/
 
function XRTMLAdapter(opts) {
    //opts = {user, host, resource, appKey, authToken}

    /// <summary>
    /// Adapter XMPP para ChatJs. In order to use this adapter.. Pass an instance of this 
    /// function to $.chat()
    /// </summary>
    if (!opts) opts = {};

    this.userId     = (opts.user || 0);
    this.host       = (opts.host || "http://ortc-developers.realtime.co/server/2.1");
    this.resource   = (opts.resource || "Chat");
    this.appKey     = (opts.appKey || "");
    this.authToken  = (opts.authToken || "");
    this.metadata   = (opts.metadata || "clientConnMeta");
    this.debug      = (opts.debug || false);
}

XRTMLAdapter.prototype = {
  init: function (chat) {

    /* Local messages for  history */
    var messages = [];

    /* Single string for jid may be used in the future */


    loadOrtcFactory(IbtRealTimeSJType, function (factory, error) {
      if (error != null) {
          alert("Factory error: " + error.message);
      } else {
        if (factory != null) {
          // Create ORTC client
          var ortcClient = factory.createClient();

          // Set ORTC client properties
          ortcClient.setId(this.userId);
          ortcClient.setConnectionMetadata(this.metadata);
          ortcClient.setClusterUrl(this.host);

          ortcClient.onConnected = function (ortc) {
            // Connected
            chat.onReady();
            console.log("Connected")

            ortcClient.subscribe('channel1', true, function (ortc, channel, message) {
              console.log(message)
              var id = message.from.split("@");
              var msg = {
                  UserFrom: {
                      Id: id[0],
                      Name: id[0],
                      // TODO: Profile picture is provided when user vcard is received
                      ProfilePictureUrl: "http://static.wixet.com/images/user.png",
                  },
                  Message: message.body
              }

              /* An array for every chat */
              if (messages[id[0]] == null)
                  messages[id[0]] = []
               messages[id[0]].push(msg)
               chat.client.sendMessage(msg);
               
              // Received message: 'message' - at channel: 'channel');
              ortcClient.unsubscribe(channel);
            });


          };

          ortcClient.presence = function (ortc) {
            /*
             * TODO: Call chat.client.usersListChanged(usersList);
             */
          };

          ortcClient.onDisconnected = function (ortc) {
            // Disconnected
            /*
             * TODO: Do stuff when disconnect
             */
          };



          ortcClient.onSubscribed = function (ortc, channel) {
            // Subscribed to the channel 'channel');
            ortcClient.send(channel, 'Message to the channel');
          };

          ortcClient.onUnsubscribed = function (ortc, channel) {
            // Unsubscribed from the channel 'channel');
            ortcClient.disconnect();
          };

          ortcClient.onException = function (ortc, exception) {
            // Exception occurred: 'exception'
          };

          ortcClient.onReconnecting = function (ortc) {
            // Trying to reconnect
          };

          ortcClient.onReconnected = function (ortc) {
            // Reconnected
          };

          ortcClient.connect('Oe02ud', '3392c192a09842fbbc9f4654beef1a93');
        }
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

            console.log("send message...")
            
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
            
            
            // // Send message to the server
            // $.xmpp.sendMessage({body: messageText, to: otherUserId+"@"+_this.host, resource:_this.resource}, function(data){
            //     chat.client.sendMessage({
            //     UserFrom:{
            //         Id: otherUserId,
            //         Name: otherUserId,
            //     },
            //     Message: messageText,
            //     ClientGuid: clientGuid
            //   });
            // });
            
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
