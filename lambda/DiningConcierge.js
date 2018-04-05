'use strict';

var QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/793392549132/DiningConcierge';
var AWS = require('aws-sdk');
var sqs = new AWS.SQS({region : 'us-east-1'});

function elicitSlot(sessionAttributes, intentName, slots, slotToElicit, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ElicitSlot',
            intentName,
            slots,
            slotToElicit,
            message,
        },
    };
}

function close(sessionAttributes, fulfillmentState, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message,
        },
    };
}

function delegate(sessionAttributes, slots) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Delegate',
            slots,
        },
    };
}

/*
function parseLocalDate(date) {

    var dateComponents = date.split(/\-/);
    return new Date(dateComponents[0], dateComponents[1] - 1, dateComponents[2]);
}

function isValidDate(date) {
    try {
        return !(isNaN(parseLocalDate(date).getTime()));
    } catch (err) {
        return false;
    }
}

function buildValidationResult(isValid, violatedSlot, messageContent) {
    if (messageContent == null) {
        return {
            isValid,
            violatedSlot,
        };
    }
    return {
        isValid,
        violatedSlot,
        message: { contentType: 'PlainText', content: messageContent },
    };
}

function validateOrderFlowers(flowerType, date, time) {
    var flowerTypes = ['lilies', 'roses', 'tulips'];
    if (flowerType && flowerTypes.indexOf(flowerType.toLowerCase()) === -1) {
        return buildValidationResult(false, 'FlowerType', `We do not have ${flowerType}, would you like a different type of flower?  Our most popular flowers are roses`);
    }
    if (date) {
        if (!isValidDate(date)) {
            return buildValidationResult(false, 'PickupDate', 'I did not understand that, what date would you like to pick the flowers up?');
        }
        if (parseLocalDate(date) < new Date()) {
            return buildValidationResult(false, 'PickupDate', 'You can pick up the flowers from tomorrow onwards.  What day would you like to pick them up?');
        }
    }
    if (time) {
        if (time.length !== 5) {
            // Not a valid time; use a prompt defined on the build-time model.
            return buildValidationResult(false, 'PickupTime', null);
        }
        var hour = parseInt(time.substring(0, 2), 10);
        var minute = parseInt(time.substring(3), 10);
        if (isNaN(hour) || isNaN(minute)) {
            // Not a valid time; use a prompt defined on the build-time model.
            return buildValidationResult(false, 'PickupTime', null);
        }
        if (hour < 10 || hour > 16) {
            // Outside of business hours
            return buildValidationResult(false, 'PickupTime', 'Our business hours are from ten a m. to five p m. Can you specify a time during this range?');
        }
    }
    return buildValidationResult(true, null, null);
}
*/

function diningSuggestions(intentRequest, callback) {
    var location = intentRequest.currentIntent.slots.location;
    var cuisine = intentRequest.currentIntent.slots.cuisine;
    var time = intentRequest.currentIntent.slots.time;
    var number = intentRequest.currentIntent.slots.number;
    var phone = intentRequest.currentIntent.slots.phone;
    var date = intentRequest.currentIntent.slots.date;
    var email = intentRequest.currentIntent.slots.email;
    var source = intentRequest.invocationSource;
/*
    if (source === 'DialogCodeHook') {
        // Perform basic validation on the supplied input slots.  Use the elicitSlot dialog action to re-prompt for the first violation detected.
        const slots = intentRequest.currentIntent.slots;
        const validationResult = validateOrderFlowers(flowerType, date, time);
        if (!validationResult.isValid) {
            slots[`${validationResult.violatedSlot}`] = null;
            callback(elicitSlot(intentRequest.sessionAttributes, intentRequest.currentIntent.name, slots, validationResult.violatedSlot, validationResult.message));
            return;
        }

        // Pass the price of the flowers back through session attributes to be used in various prompts defined on the bot model.
        const outputSessionAttributes = intentRequest.sessionAttributes || {};
        if (flowerType) {
            outputSessionAttributes.Price = flowerType.length * 5; // Elegant pricing model
        }
        callback(delegate(outputSessionAttributes, intentRequest.currentIntent.slots));
        return;
    }
*/
    if (source === 'DialogCodeHook'){
        var outputSessionAttributes = intentRequest.sessionAttributes || {};
        callback(delegate(outputSessionAttributes, intentRequest.currentIntent.slots));
        return;
    }
    var json={
        "location": location,
        "cuisine": cuisine,
        "time": time,
        "number": number,
        "phone": phone,
        "date": date,
        "email": email
    };
    var params = {
        MessageBody: JSON.stringify(json),
        QueueUrl: QUEUE_URL
    };
    sqs.sendMessage(params, function(err,data){
        if(err) {
            console.log('error:',"Fail Send Message" + err);
            //context.done('error', "ERROR Put SQS");  // ERROR with message
        }else{
            console.log('data:',data.MessageId);
            //context.done(null,'');  // SUCCESS 
        }
    });
    callback(close(intentRequest.sessionAttributes, 'Fulfilled',{ contentType: 'PlainText', content: 'You’re all set. Expect my recommendations shortly! Have a good day.' }));
}

function dispatch(intentRequest, callback) {
    console.log(`dispatch userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);

    var intentName = intentRequest.currentIntent.name;

    // Dispatch to your skill's intent handlers
    if (intentName === 'DiningSuggestionsIntent') {
        return diningSuggestions(intentRequest, callback);
    }
    
    if (intentName === 'GreetingIntent') {
        callback(close(intentRequest.sessionAttributes, 'Fulfilled',{ contentType: 'PlainText', content: 'Hi there, how can I help?' }));
    }
    
    if (intentName === 'ThankYouIntent') {
        callback(close(intentRequest.sessionAttributes, 'Fulfilled',{ contentType: 'PlainText', content: 'You’re welcome.' }));
    }
    
    throw new Error(`Intent with name ${intentName} not supported`);
}


exports.handler = (event, context, callback) => {
    try {
        process.env.TZ = 'America/New_York';
        console.log(`event.bot.name=${event.bot.name}`);

        /*
        if (event.bot.name !== 'OrderFlowers') {
             callback('Invalid Bot Name');
        }
        */
        dispatch(event, (response) => callback(null, response));
    } catch (err) {
        callback(err);
    }
};
