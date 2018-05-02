var AWS = require("aws-sdk");
var https = require("https");

var TASK_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/793392549132/DiningConcierge';
var AWS_REGION = 'us-east-1';

var sqs = new AWS.SQS({region: AWS_REGION});
var sns = new AWS.SNS({region: AWS_REGION});
var ses = new AWS.SES({region: AWS_REGION});

var connectionClass = require('http-aws-es');
var elasticsearch = require('elasticsearch');
var es = new elasticsearch.Client({  
    host: 'search-aichat-6ly4xt7urxm566av5c6jaz2sii.us-east-1.es.amazonaws.com',
    log: 'trace',
    connectionClass: connectionClass,
    amazonES: {
      credentials: new AWS.EnvironmentCredentials('AWS')
    }
});

var dynamodb = new AWS.DynamoDB();

function deleteMessage(receiptHandle, cb) {
  sqs.deleteMessage({
    ReceiptHandle: receiptHandle,
    QueueUrl: TASK_QUEUE_URL
  }, cb);
}

function work(task, callback) {
  task.location = task.location.trim().replace(/[ ]/g,"");
  task.cuisine = task.cuisine.trim().replace(/[ ]/g,"");
  task.phone = task.phone.trim().replace(/[ ]/g,"");
  task.email = task.email.trim().replace(/[ ]/g,"");
  
  if(task.phone.substr(0,1) != '+'){
    if(task.phone.substr(0,1)=='1'){
      task.phone = '+' + task.phone;
    }
    else{
      task.phone= '+1' + task.phone;
    }
  }
  
  var message=`Hello! Here are my ${task.cuisine} restaurant suggestions for ${task.number} people, for today at ${task.time}:`;

  es.search({
    index: 'predictions',
    type: 'Prediction',
    body: {
      query: {
        match: {
          Cuisine: task.cuisine
        }
      }
    }
  }).then(function (body) {
    console.log(body.hits);
    var restaurantid = [];
    for (var i in body.hits.hits){
      restaurantid.push({
        "RestaurantID": {
         S: body.hits.hits[i]._id
        }
      })
    }
    var params = {
  RequestItems: {
   "aichat": {
     Keys: restaurantid
    }
  }
 };
 dynamodb.batchGetItem(params, function(err, data) {
   console.log(data.Responses.aichat);
   loadMessages(err, data.Responses.aichat, message, task.phone, task.email, callback);
 });
    // for (var i in body.hits.hits){
    //   dynamo.query({
    //     TableName: 'aichat',
    //     KeyConditionExpression: 'RestaurantID = :id',
    //     ExpressionAttributeValues: {':id': {S: body.hits.hits[i]._id}}, 
    //   }, function (err, data) {
    //     loadMessages(err,data,body.hits.hits[i]._id,[],callback);
    //   });
    // }
  });
}
  
function loadMessages(err, data, message, phone, email, callback) {
    if (err === null) {
      var i=0;
        data.forEach(function (result) {
            message += `\n${i+1}. name: ${result.name.S}   `;
            message += `address: ${result.location.S}   `
            message += `coordinates: latitude :${(JSON.parse(result.coordinates.S)).latitude} longitude :${(JSON.parse(result.coordinates.S)).longitude}   `
            message += `zipcode: ${result.zipCode.S}   `;
            message += `reviews: ${result.reviews.S}   `;
            message += `rating: ${result.rating.S}`;
            i += 1;
        });
        console.log(message);
            var params = {
      Message: message,
      MessageStructure: 'string',
      PhoneNumber: phone
    };
    
    sns.publish(params, function(err, data) {
      if (err)
        console.log(err, err.stack);
      else
        console.log(data);
      });
    
    var eParams = {
        Destination: {
            ToAddresses: [email]
        },
        Message: {
            Body: {
                Text: {
                    Data: message
                }
            },
            Subject: {
                Data: "The suggestions for your dinner"
            }
        },
        Source: "ssc1017@outlook.com"
    };
    
    var email = ses.sendEmail(eParams, function(err, data){
        if(err) console.log(err);
        else {
            console.log("===EMAIL SENT===");
            console.log(data);
            console.log("EMAIL CODE END");
        }
    });
        
        callback(null);
    } else {
        callback(err);
    }
}

exports.handler = function(event, context, callback) {
  console.log(event);
  work(JSON.parse(event.Body), function(err) {
    if (err) {
      callback(err);
    } else {
      deleteMessage(event.ReceiptHandle, callback);
    }
  });
};
