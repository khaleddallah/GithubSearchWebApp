import requests
import json
import sys
from flask import Flask, render_template, request, redirect, url_for, make_response
import socket, random


ACCESS_TOKEN = ""
SERVER_IP = "0.0.0.0"
PORT = 8000


endpoint = "https://api.github.com/graphql"
app = Flask(__name__) 


def GenerateQuery(name, after_cursor=None):
    after_cursor = str("\""+after_cursor+"\"") if after_cursor else "null"
    query = """query x {
    repositoryOwner(login: "%s") {
        id
        repositories(first: 100, privacy: PUBLIC, after: %s) {
        pageInfo {
            endCursor
            hasNextPage
        }
        totalCount
        nodes {
            name
            createdAt
            pushedAt
            updatedAt
            primaryLanguage {
            name
            }
            stargazerCount
            forkCount
            watchers {
            totalCount
            }
            issues {
            totalCount
            }
        }
        }
    }
    }"""%(name, after_cursor)
    print(query)
    return query


def GetRepositories(name):
    auth_header = {'Authorization': 'Token ' + ACCESS_TOKEN}
    hasNextPage = True
    after = None
    results = list()
    while(hasNextPage):
        data = requests.post(endpoint, json={"query": GenerateQuery(name, after)}, headers=auth_header)
        if data.status_code == 200:
            print(data.json())
            results.extend(data.json()["data"]["repositoryOwner"]["repositories"]["nodes"])
            hasNextPage = data.json()["data"]["repositoryOwner"]["repositories"]["pageInfo"]["hasNextPage"]
            after = data.json()["data"]["repositoryOwner"]["repositories"]["pageInfo"]["endCursor"]
        else:
            print(data.json())
            raise Exception(f"Query failed to run with a {data.status_code}.")
            return
    return results


def main():
    app.config["CACHE_TYPE"] = "null"
    app.run(debug=True, host=SERVER_IP, port=PORT) 


@app.route('/')
def index():
    return render_template('index.html', server_ip=SERVER_IP)


@app.route('/test', methods=['POST'])
def reroute():
    name = request.json['value']
    print(name)
    data = GetRepositories(name)
    print(data)
    return {"data":data}


if __name__ == "__main__":
    if(len(ACCESS_TOKEN)==0):
        if(len(sys.argv)<2):
            print("Please set the ACCESS_TOKEN variable in devops3.py")
            exit(1)
        else:
            ACCESS_TOKEN = sys.argv[1]

    main()










