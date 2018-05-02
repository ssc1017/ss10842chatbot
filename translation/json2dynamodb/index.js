var fs = require('fs');
var AWS = require('aws-sdk');

AWS.config.update({
    region: "us-east-1"
})

var dynamo = new AWS.DynamoDB();

var S3 = new AWS.S3();


var results = JSON.parse(fs.readFileSync('/Users/sichaoshu/Desktop/chatbot/output.json', 'utf8'));

for(var i=7000; i<7500 && i < results.length; i++){
    if (results[i].id === '' ||results[i].name===''||results[i].location.display_address[0]===''||results[i].location.zip_code==='' ||JSON.stringify(results[i].coordinates)===''||String(results[i].review_count)===''||String(results[i].rating)===''){
        console.log(results[i].id);
    }
    var zip_code =results[i].location.zip_code;
    if (zip_code === '')
    {
        zip_code='null'
    }

    dynamo.putItem({
        TableName: 'aichat',
        Item: {
            RestaurantID: {S: results[i].id},
            insertedAtTimestamp: {S: "" + new Date().getTime()},
            name: {S: results[i].name},
            location: {S: results[i].location.display_address[0]},
            coordinates: {S: JSON.stringify(results[i].coordinates)},
            reviews: {S: String(results[i].review_count)},
            rating: {S: String(results[i].rating)},
            zipCode: {S: zip_code}
        }
    }, function(err, data) {
        if(err !== null) {
            console.log(err);
        }
    });
}