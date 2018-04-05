var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

var lexruntime = new AWS.LexRuntime();

exports.handler = function (event, context, callback) {
/*
    var retMessage=[];
    event.messages.forEach(function(message){
        if(message.Message.UnstructuredMessage.text.toLowerCase() === 'hello' || message.Message.UnstructuredMessage.text.toLowerCase() === 'hi'){
            retMessage.push({
                "Message": {
                    "type": "unknown",
                    "UnstructuredMessage": {
                        "id": "unknown",
                        "text": "How can I help you?",
                        "timestamp": "unknown"
                    }
                }
            })
            callback(null,{
                "messages": retMessage
            });
        }
    else{
            retMessage.push({
                "Message": {
                    "type": "unknown",
                    "UnstructuredMessage": {
                        "id": "unknown",
                        "text": "Sorry, I don\'t understand.",
                        "timestamp": "unknown"
                    }
                }
            })
            callback(null,{
                "messages": retMessage
            });
        }
    })
*/

    var retMessage=[];
    
    var params = {
        botAlias: 'Prod', /* required, has to be '$LATEST' */
        botName: 'DiningConcierge', /* required, the name of you bot */
        inputText: event.messages[0].Message.UnstructuredMessage.text, /* required, your text */
        userId: 'USER', /* required, arbitrary identifier */
        sessionAttributes: {}
    };
        
    lexruntime.postText(params, function(err, data) {
        if (err) {
            retMessage.push({
                "Message": {
                    "type": "unknown",
                    "UnstructuredMessage": {
                        "id": "unknown",
                        "text": 'error',
                        "timestamp": "unknown"
                    }
                }
            })
            callback(null,{
                "messages": retMessage
            });
        }
        else{
            retMessage.push({
                "Message": {
                    "type": "unknown",
                    "UnstructuredMessage": {
                        "id": "unknown",
                        "text": data.message,
                        "timestamp": "unknown"
                    }
                }
            })
            callback(null,{
                "messages": retMessage
            });
        }
    });
};