import json
import subprocess
import time
import urllib.request
import urllib.error

server = subprocess.Popen([
    r'c:/Users/Madhankumar/Downloads/Smart Visitor Management System/.venv/Scripts/python.exe',
    'app.py'
], cwd=r'c:/Users/Madhankumar/Downloads/Smart Visitor Management System/visitor-management/server', stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

try:
    for _ in range(30):
        try:
            with urllib.request.urlopen('http://127.0.0.1:5000/', timeout=1) as response:
                if response.status == 200:
                    break
        except Exception:
            time.sleep(1)
    else:
        raise RuntimeError('server did not start')

    def request(method, path, data=None, token=None):
        headers = {}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        body = None
        if data is not None:
            body = json.dumps(data).encode('utf-8')
            headers['Content-Type'] = 'application/json'
        req = urllib.request.Request('http://127.0.0.1:5000' + path, data=body, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                return response.status, json.loads(response.read().decode('utf-8'))
        except urllib.error.HTTPError as exc:
            return exc.code, json.loads(exc.read().decode('utf-8'))

    status, login_resp = request('POST', '/auth/login', {'email': 'admin@gmail.com', 'password': 'Admin@123'})
    print('LOGIN_STATUS', status)
    print('LOGIN_BODY', json.dumps(login_resp))
    token = login_resp['token']

    status, profile_resp = request('PUT', '/auth/profile', {'full_name': 'Admin Updated', 'email': 'admin@gmail.com'}, token)
    print('PROFILE_STATUS', status)
    print('PROFILE_BODY', json.dumps(profile_resp))

    status, password_resp = request('PUT', '/auth/change-password', {'current_password': 'Admin@123', 'new_password': 'Admin@1234'}, token)
    print('PASSWORD_STATUS', status)
    print('PASSWORD_BODY', json.dumps(password_resp))

    status, login_resp2 = request('POST', '/auth/login', {'email': 'admin@gmail.com', 'password': 'Admin@1234'})
    print('LOGIN2_STATUS', status)
    print('LOGIN2_BODY', json.dumps(login_resp2))
finally:
    server.terminate()
    try:
        server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server.kill()
