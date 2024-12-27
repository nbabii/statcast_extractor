from google.cloud import storage
import functions_framework
import logging
import json



@functions_framework.http
def extract(request):

    
    return json.dumps({"content": content}), 200