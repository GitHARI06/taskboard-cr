from conftest import sign_up


def make_project(client, headers, name="Launch"):
    r = client.post("/api/projects", json={"name": name}, headers=headers)
    assert r.status_code == 201, r.text
    return r.json()["id"]


def test_login_and_me(client):
    sign_up(client)
    r = client.post("/api/auth/login", json={"email": "ada@example.com", "password": "correct-horse"})
    assert r.status_code == 200
    token = r.json()["access_token"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.json()["name"] == "Ada"


def test_requires_sign_in(client):
    assert client.get("/api/projects").status_code == 401


def test_task_lifecycle(client):
    headers = sign_up(client)
    project_id = make_project(client, headers)
    r = client.post(
        "/api/tasks", json={"project_id": project_id, "title": "Write docs", "description": "Setup guide"}, headers=headers
    )
    assert r.status_code == 201, r.text
    task_id = r.json()["id"]

    assert client.get(f"/api/task/{task_id}", headers=headers).json()["description"] == "Setup guide"
    r = client.patch(f"/api/tasks/{task_id}", json={"status": "done"}, headers=headers)
    assert r.json()["status"] == "done"

    found = client.get("/api/tasks", params={"q": "docs"}, headers=headers).json()
    assert [t["id"] for t in found] == [task_id]

    assert client.delete(f"/api/tasks/{task_id}", headers=headers).status_code == 204


def test_members_and_notifications(client):
    owner = sign_up(client)
    bob = sign_up(client, email="bob@example.com", name="Bob")
    project_id = make_project(client, owner)
    r = client.post(f"/api/projects/{project_id}/members", json={"email": "bob@example.com"}, headers=owner)
    assert r.status_code == 201, r.text
    members = client.get(f"/api/projects/{project_id}/members", headers=bob).json()
    assert {m["name"] for m in members} == {"Ada", "Bob"}

    task = client.post("/api/tasks", json={"project_id": project_id, "title": "Ship"}, headers=owner).json()
    client.patch(f"/api/tasks/{task['id']}", json={"assignee_id": members[1]["user_id"]}, headers=owner)
    client.post(f"/api/tasks/{task['id']}/comments", json={"body": "Any blockers?"}, headers=owner)

    messages = [n["message"] for n in client.get("/api/notifications", headers=bob).json()]
    assert "Ada commented on Ship" in messages
    assert "Ada added you to Launch" in messages


def test_outsiders_cannot_see_projects(client):
    owner = sign_up(client)
    stranger = sign_up(client, email="eve@example.com", name="Eve")
    project_id = make_project(client, owner)
    assert client.get(f"/api/projects/{project_id}/members", headers=stranger).status_code == 404
