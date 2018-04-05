var AWS = require("aws-sdk");
var https = require("https");

var TASK_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/793392549132/DiningConcierge';
var AWS_REGION = 'us-east-1';

var sqs = new AWS.SQS({region: AWS_REGION});
var sns = new AWS.SNS({region: AWS_REGION});
var ses = new AWS.SES({region: AWS_REGION});

function deleteMessage(receiptHandle, cb) {
  sqs.deleteMessage({
    ReceiptHandle: receiptHandle,
    QueueUrl: TASK_QUEUE_URL
  }, cb);
}

function work(task, cb) {
  console.log(task);
  
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
  var options = {
    host: 'api.yelp.com',
    path: `/v3/businesses/search?limit=1&location=${task.location}&term=${task.cuisine}`,  
    method: 'GET',
    headers:{
      'Authorization':'Bearer r_nnzbDGpT6_jtykd6HrokZJRdIHG7qLoblsrJRaV9DSA_H--0BVPAzpYHnUd11lQdGSLOK8nUqyhPwl-Zj13w0IL65YeFwT6-BCYfVzvCmzG-sM_cCEaAIwgN2pWnYx'
    }
  };
  
  var req = https.request(options, function (res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log(typeof(chunk));
    console.log(chunk);
    var yelp=JSON.parse(chunk);
    
    console.log('BODY: ' + yelp.businesses);
    for(var i=0;i<yelp.businesses.length;i++)
    {
      message += ` ${i+1}. name: ${yelp.businesses[i].name}   location: ${yelp.businesses[i].location.address1}   phone: ${yelp.businesses[i].phone}`
    }
    console.log(message);
    
    var params = {
      Message: message,
      MessageStructure: 'string',
      PhoneNumber: task.phone
    };
    
    sns.publish(params, function(err, data) {
      if (err)
        console.log(err, err.stack);
      else
        console.log(data);
      });
    
    var eParams = {
        Destination: {
            ToAddresses: [task.email]
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
            console.log('EMAIL: ', email);
        }
    });
    
    }); 
  });
  
  req.on('error', function (e) {  
    console.log('problem with request: ' + e.message);  
  });
  
  req.end();
  cb();
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