var AIChat = window.AIChat || {};

(function($) {
    
    AIChat.logout = function () {
        //userPool.getCurrentUser().signOut();
        AWS.config.credentials.clearCachedId();
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({});
        window.location='https://ai-customer-service.auth.us-east-1.amazoncognito.com/logout?client_id=38r11ahpid9akcgb4emmffkqfj&logout_uri=https://s3.amazonaws.com/aichat/index.html';
        //window.location = 'https://ai-customer-service.auth.us-east-1.amazoncognito.com/logout?response_type=code&client_id=38r11ahpid9akcgb4emmffkqfj&redirect_uri=https://s3.amazonaws.com/aichat/chat.html&state=STATE&scope=openid+profile+aws.cognito.signin.user.admin';
    };

    AIChat.send = function () {
        var postMessage=$('#message').val();
        var panel = $('<div class="panel">');
        panel.addClass('panel-default');
        panel.append('<div class="panel-body">'+postMessage+'</div>');
                            
        var row = $('<div class="row">');
        var buffer = $('<div class="col-xs-6">');
        var holder = $('<div class="col-xs-6">');
        holder.append(panel);
        
        row.append(holder);
        row.append(buffer);
        $('#chat').append(row);
        
        $('#message').val('').focus();
        window.scrollTo(0, document.body.scrollHeight);
        
        
        var params = {
            
        };

        var body = {
            "messages": [
                {
                    "Message": {
                        "type": "",
                        "UnstructuredMessage": {
                            "id": "",
                            "text": postMessage,
                            "timestamp": ""
                        }
                    }
                }
            ]
        };

        var additionalParams = {
        };
        let clientOptions = {
            accessKey: AWS.config.credentials.accessKeyId,
            secretKey: AWS.config.credentials.secretAccessKey,
            sessionToken: AWS.config.credentials.sessionToken
        }
        console.log("chat bot post");
        console.log(clientOptions)
        var apigClient = apigClientFactory.newClient(clientOptions);

        apigClient.chatbotPost(params, body, additionalParams)
            .then(function (result) {
            console.log("got result")
            console.log(result)
                var panel = $('<div class="panel">');
                panel.addClass('panel-info');
                panel.append('<div class="panel-heading">' + 'ai' + '</div>');
                var body = $('<div class="panel-body">').text(result.data.messages[0].Message.UnstructuredMessage.text);
                panel.append(body);
                
                var row = $('<div class="row">');
                var buffer = $('<div class="col-xs-6">');
                var holder = $('<div class="col-xs-6">');
                holder.append(panel);
                
                row.append(buffer);
                row.append(holder);
                $('#chat').append(row);
                
                window.scrollTo(0, document.body.scrollHeight);
            }).catch((err) => {
            console.log("api client error");
            console.log(err);
        });
    };

}(jQuery));