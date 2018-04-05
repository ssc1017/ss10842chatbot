'use strict';

var AWS = require('aws-sdk');
var async = require('async');

var TASK_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/793392549132/DiningConcierge';
var WORKER_LAMBDA_NAME = 'DiningConciergeWorker';
var AWS_REGION = 'us-east-1';

var sqs = new AWS.SQS({region: AWS_REGION});
var lambda = new AWS.Lambda({region: AWS_REGION});

function receiveMessages(callback) {
  var params = {
    QueueUrl: TASK_QUEUE_URL,
    MaxNumberOfMessages: 10
  };
  sqs.receiveMessage(params, function(err, data) {
    if (err) {
      console.error(err, err.stack);
      callback(err);
    } else {
      callback(null, data.Messages);
    }
  });
}

function invokeWorkerLambda(task, callback) {
  var params = {
    FunctionName: WORKER_LAMBDA_NAME,
    InvocationType: 'Event',
    Payload: JSON.stringify(task)
  };
  console.log(params)
  lambda.invoke(params, function(err, data) {
    if (err) {
      console.error(err, err.stack);
      callback(err);
    } else {
      callback(null, data);
    }
  });
}

function handleSQSMessages(context, callback) {
  receiveMessages(function(err, messages) {
    if (messages && messages.length > 0) {
      var invocations = [];
      messages.forEach(function(message) {
        invocations.push(function(callback) {
          invokeWorkerLambda(message, callback);
        });
      });
      async.parallel(invocations, function(err) {
        if (err) {
          console.error(err, err.stack);
          callback(err);
        } else {
          if (context.getRemainingTimeInMillis() > 20000) {
            handleSQSMessages(context, callback); 
          } else {
            callback(null, 'PAUSE');
          }         
        }
      });
    } else {
      callback(null, 'DONE');
    }
  });
}

exports.handler = function(event, context, callback) {
  handleSQSMessages(context, callback);
};