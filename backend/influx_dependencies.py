from fastapi import Request

def get_write_api(request: Request):
    return request.app.state.write_api

def get_query_api(request: Request):
    return request.app.state.query_api
