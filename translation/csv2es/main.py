from elasticsearch import Elasticsearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth

import csv
import json


# csvfilename = '/Users/sichaoshu/Desktop/chatbot/FILE_3.csv'
# csvfile = open(csvfilename, 'r')
# reader = csv.DictReader(csvfile)
#
# jsonfilename = '/Users/sichaoshu/Desktop/chatbot/FILE_3.json'
# jsonfile = open(jsonfilename, 'w')
#
# fieldnames = ('\xef\xbb\xbfRestaurantID', 'Cuisine', 'Score', 'Label')
#
# output = []
#
# i=0
# for each in reader:
#
#   row = {}
#
#   for field in fieldnames:
#     row[field] = each[field]
#   output.append(row)
#
# json.dump(output, jsonfile, indent=2, sort_keys=False)

AWS_ACCESS_KEY = 'AKIAIVXZRPFNVT7LFT5Q'
AWS_SECRET_KEY = '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'
region = 'us-east-1'
service = 'es'

awsauth = AWS4Auth(AWS_ACCESS_KEY, AWS_SECRET_KEY, region, service)

host = 'search-aichat-6ly4xt7urxm566av5c6jaz2sii.us-east-1.es.amazonaws.com'

es = Elasticsearch(
    hosts = [{'host': host, 'port': 443}],
    http_auth = awsauth,
    use_ssl = True,
    verify_certs = True,
    connection_class = RequestsHttpConnection
)

csvfilename = '/Users/sichaoshu/Desktop/chatbot/FILE_3.csv'
csvfile = open(csvfilename, 'r')
reader = csv.DictReader(csvfile)

fieldnames = ('\xef\xbb\xbfRestaurantID', 'Cuisine', 'Score', 'Label')

# for each in reader:
#   document = {
#     "RestaurantID": each[fieldnames[0]],
#     "Cuisine": each[fieldnames[1]],
#     "Score": each[fieldnames[2]],
#     "Label": each[fieldnames[3]]
#   }
#
#   es.index(index="predictions", doc_type="Prediction", id=each[fieldnames[0]], body=document)

body = {
    "query":{
        "match":{
            "Cuisine":"japanese"
        }
    }
}

print(es.search(index="predictions", doc_type="Prediction", body=body))

# AWS_ACCESS_KEY = 'AKIAIVXZRPFNVT7LFT5Q'
# AWS_SECRET_KEY = 'P9k8hu2jzH/iAzR0WcGWLtjvO75esB+43K6MZEni'
# #AWS_SECRET_KEY = 'azG39No5wW9tdEggfOi2hKqUgFSpx47wdpg/U+7O'
# region = 'us-east-1' # For example, us-east-1
# service = 'es'
#
# awsauth = AWS4Auth(AWS_ACCESS_KEY, AWS_SECRET_KEY, region, service)
#
# host = 'search-aichat-6ly4xt7urxm566av5c6jaz2sii.us-east-1.es.amazonaws.com' # For example, my-test-domain.us-east-1.es.amazonaws.com
#
# es = Elasticsearch(
#     hosts = [{'host': host, 'port': 443}],
#     http_auth = awsauth,
#     use_ssl = True,
#     verify_certs = True,
#     connection_class = RequestsHttpConnection
# )
#
# document = {
#     "title": "Moneyball",
#     "director": "Bennett Miller",
#     "year": "2011"
# }
#
# es.index(index="predictions", doc_type="Prediction", id="5", body=document)
#
#
# *** delete ***
# es.indices.delete(index='movies', ignore=[400, 404])
#
# print(es.get(index="movies", doc_type="movie", id="5"))